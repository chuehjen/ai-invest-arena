#!/usr/bin/env python3
"""
generate_prompts.py — 从上一日末态 + 收盘价生成今日 10 份提示词

用法:
  python generate_prompts.py --date 2026-06-11 --prev 2026-06-10
  python generate_prompts.py  # 自动推断今日 / 上个交易日

输出: automation/prompts/{date}/{agent_id}.md
"""
import argparse
import json
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import (
    AGENTS, CANDIDATE_POOL, PRICES_DIR, PROMPTS_DIR, SECTOR_MAP, TEMPLATE_PATH,
)
from ts_state import parse_dates, parse_state


def _close(p):
    """兼容旧格式 (number) 和新 OHLC 格式 (dict) → 返回 close price"""
    if isinstance(p, dict):
        return p.get("close", 0)
    return p


def _ohlc(p):
    """兼容旧格式 → 返回 {open, high, low, close} dict"""
    if isinstance(p, dict):
        return p
    return {"open": p, "high": p, "low": p, "close": p}


def fmt_holdings_table(holdings, prices=None):
    if not holdings:
        return "_(空仓)_"
    lines = ["| Symbol | Shares | AvgCost | LastClose | MV | Weight |", "|---|---|---|---|---|---|"]
    total_mv = sum(h["shares"] * h["current_price"] for h in holdings)
    for h in holdings:
        mv = h["shares"] * h["current_price"]
        w = mv / max(total_mv, 1) * 100
        lines.append(f"| {h['symbol']} | {h['shares']:g} | ${h['avg_cost']:.2f} | ${h['current_price']:.2f} | ${mv:.2f} | {w:.1f}% |")
    return "\n".join(lines)


def fmt_candidates(prices, pool):
    rows = ["| Symbol | Sector | Open | High | Low | Close |", "|---|---|---|---|---|---|"]
    for sym in pool:
        if sym not in prices:
            continue
        o = _ohlc(prices[sym])
        rows.append(f"| {sym} | {SECTOR_MAP.get(sym, '-')} | ${o['open']:.2f} | ${o['high']:.2f} | ${o['low']:.2f} | ${o['close']:.2f} |")
    return "\n".join(rows)


def fmt_sector_moves(prices_today, prices_prev):
    """简易：列出 |涨跌| 排前 6 的 symbol"""
    if not prices_prev:
        return "_(首日，无对比)_"
    moves = []
    for sym, p in prices_today.items():
        prev = prices_prev.get(sym)
        if prev:
            cur_close = _close(p)
            prev_close = _close(prev)
            if prev_close > 0:
                pct = (cur_close - prev_close) / prev_close * 100
                moves.append((sym, pct))
    moves.sort(key=lambda x: abs(x[1]), reverse=True)
    top = moves[:6]
    parts = [f"{s} {('+' if pct>=0 else '')}{pct:.1f}%" for s, pct in top]
    return " · ".join(parts)


def fill_template(tpl: str, mapping: dict) -> str:
    out = tpl
    for k, v in mapping.items():
        out = out.replace("{{" + k + "}}", str(v))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=None, help="今日 YYYY-MM-DD")
    ap.add_argument("--prev", default=None, help="上个交易日 YYYY-MM-DD（用于读 prices/{prev}.json）")
    args = ap.parse_args()

    today = args.date or _today_str()
    prev = args.prev or _prev_trading_day(today)

    prices_path = PRICES_DIR / f"{prev}.json"
    if not prices_path.exists():
        print(f"❌ Missing prices file {prices_path}. Run fetch_prices.py first.")
        sys.exit(1)
    prev_prices = json.loads(prices_path.read_text())["prices"]

    # 找前前一天作板块对比
    prev_prev = _prev_trading_day(prev)
    prev_prev_prices = {}
    pp_path = PRICES_DIR / f"{prev_prev}.json"
    if pp_path.exists():
        prev_prev_prices = json.loads(pp_path.read_text())["prices"]

    state = {a["id"]: a for a in parse_state()}
    dates = parse_dates()
    day_n = len(dates) + 1

    out_dir = PROMPTS_DIR / today
    out_dir.mkdir(parents=True, exist_ok=True)
    tpl = TEMPLATE_PATH.read_text()
    minimal_tpl_path = TEMPLATE_PATH.parent / "daily_prompt_minimal.md.tpl"
    minimal_tpl = minimal_tpl_path.read_text() if minimal_tpl_path.exists() else tpl

    # 生成范围（白名单）：
    #   GURU_AGENTS    → 3 位大师完整版 md，供 quant-guru-desk skill 读取
    #   MINIMAL_AGENTS → 豆包 + 千问精简版 md，供钉钉推送
    # 不再为 chatgpt/claude/gemini/grok 生成（人工贴各家网页）
    GURU_AGENTS = {"serenity", "beth-kindig", "cathie-wood"}
    MINIMAL_AGENTS = {"qwen", "doubao"}
    TARGET_AGENTS = GURU_AGENTS | MINIMAL_AGENTS

    candidates_md = fmt_candidates(prev_prices, CANDIDATE_POOL)
    sector_md = fmt_sector_moves(prev_prices, prev_prev_prices)

    written = 0
    for meta in AGENTS:
        agent_id = meta["id"]
        if agent_id not in TARGET_AGENTS:
            continue
        s = state.get(agent_id)
        if not s:
            print(f"⚠ {agent_id} not found in TS state, skipping")
            continue
        # holdings table 用最新 close 作 currentPrice 重算 MV
        for h in s["holdings"]:
            if h["symbol"] in prev_prices:
                h["current_price"] = _close(prev_prices[h["symbol"]])

        mapping = {
            "AGENT_ID": agent_id,
            "AGENT_NAME": meta["name"],
            "DAY_N": day_n,
            "DATE": today,
            "PREV_TRADING_DATE": prev,
            "PREV_RETURN_PCT": f"{s['return_pct']:.2f}",
            "PREV_TOTAL_ASSETS": f"{s['total_assets']:.2f}",
            "PREV_CASH": f"{s['cash']:.2f}",
            "PREV_CASH_PCT": f"{s['cash_pct']:.1f}",
            "HOLDINGS_TABLE": fmt_holdings_table(s["holdings"]),
            "CANDIDATE_PRICES_TABLE": candidates_md,
            "SECTOR_MOVES": sector_md,
            "STYLE": meta["style"],
            "POSITION_LIMIT": meta["position_limit"],
            "CASH_BAND": meta["cash_band"],
        }
        prompt = fill_template(minimal_tpl if agent_id in MINIMAL_AGENTS else tpl, mapping)
        out_path = out_dir / f"{agent_id}.md"
        out_path.write_text(prompt)
        written += 1
    print(f"✅ Wrote {written}/{len(TARGET_AGENTS)} prompts → {out_dir}")
    print(f"   大师（完整版）: {sorted(GURU_AGENTS)}")
    print(f"   钉钉（精简版）: {sorted(MINIMAL_AGENTS)}")


def _today_str():
    return datetime.now(timezone(timedelta(hours=8))).date().isoformat()


def _prev_trading_day(d_str):
    d = date.fromisoformat(d_str) - timedelta(days=1)
    while d.weekday() >= 5:
        d -= timedelta(days=1)
    return d.isoformat()


if __name__ == "__main__":
    main()
