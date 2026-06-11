#!/usr/bin/env python3
"""
codegen_data.py — 把 responses/{date}/*.json + prev TS state + 收盘价 渲染成新的 competitionData.ts

用法:
  python codegen_data.py --date 2026-06-11

流程:
  1. 解析 prev state 从 src/data/competitionData.ts
  2. 读 responses/{date}/{agent}.json（已通过 validate）
  3. 读 prices/{prev}.json（用于 currentPrice）
  4. 重排 rank（按 returnPct desc）
  5. 渲染整个 TS 文件覆盖
"""
import argparse
import json
import sys
from datetime import date as date_cls, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import AGENTS, DATA_TS_PATH, PRICES_DIR, RESPONSES_DIR, SECTOR_MAP
from ts_state import parse_dates, parse_state

NAME_OVERRIDES = {
    "NVDA": "英伟达", "MRVL": "Marvell", "BE": "Bloom Energy", "XOM": "埃克森美孚",
    "AAPL": "苹果", "JPM": "摩根大通", "MSFT": "微软", "QQQ": "纳指ETF",
    "TEM": "Tempus AI", "SHOP": "Shopify", "TSLA": "特斯拉", "HOOD": "Robinhood",
    "CRSP": "CRISPR", "PLTR": "Palantir", "COIN": "Coinbase", "CRCL": "Circle",
    "GOOGL": "谷歌", "META": "Meta", "AMZN": "亚马逊", "APP": "AppLovin",
    "COHR": "Coherent", "GEV": "GE Vernova", "GLD": "黄金ETF", "JNJ": "强生",
    "LITE": "Lumentum", "SCHD": "红利ETF", "V": "Visa", "VOO": "标普500ETF",
    "XLV": "医疗ETF", "SPY": "标普500ETF", "AVGO": "博通", "TSM": "台积电",
    "AMD": "AMD", "MU": "美光", "IWM": "罗素2000ETF",
}

BADGE_MAP = {0: "gold", 1: "silver", 2: "bronze"}


def short_action_summary(actions):
    """从 actions 提炼 1 行 style 描述（兜底用）"""
    parts = []
    for a in actions:
        if a["type"] in ("BUY", "SELL"):
            parts.append(f"{a['type']} {a['symbol']}")
    return " · ".join(parts[:3]) if parts else "HOLD"


def build_agent_record(meta, response, prev_agent, prices, prev_total_assets):
    """组装一个 agent 的最终态（用于 TS 输出）"""
    holdings_after = response["holdings_after"]
    holdings = []
    for h in holdings_after:
        sym = h["symbol"]
        cur = prices.get(sym)
        if cur is None and prev_agent:
            for ph in prev_agent["holdings"]:
                if ph["symbol"] == sym:
                    cur = ph["current_price"]
                    break
        if cur is None:
            cur = h["avg_cost"]
        holdings.append({
            "symbol": sym,
            "name": NAME_OVERRIDES.get(sym, sym),
            "shares": h["shares"],
            "avg_cost": h["avg_cost"],
            "current_price": cur,
            "sector": SECTOR_MAP.get(sym, "其他"),
        })

    total = response["total_assets_after"]
    cash = response["cash_after"]
    cash_pct = round(cash / max(total, 1) * 100, 1)
    return_pct = round((total - 10000) / 100, 2)

    return {
        "id": meta["id"],
        "name": meta["name"],
        "color": meta["color"],
        "style": meta["style"],
        "totalAssets": total,
        "returnPct": return_pct,
        "cash": cash,
        "cashPct": cash_pct,
        "holdingsCount": len(holdings),
        "holdings": holdings,
        "summary": response.get("summary", "")[:80],
    }


def fmt_holding(h):
    return ("      { symbol: '%s', name: '%s', shares: %g, avgCost: %.2f, "
            "currentPrice: %.2f, sector: '%s' }," % (
                h["symbol"], h["name"], h["shares"], h["avg_cost"], h["current_price"], h["sector"]))


def render_agent_block(rank, a, badge):
    avatar_map = {"claude": "CL", "doubao": "DB", "cathie-wood": "CW", "gemini-ext": "GE",
                  "grok": "GK", "gemini-std": "GS", "chatgpt": "CG", "beth-kindig": "BK",
                  "serenity": "SE", "qwen": "QW"}
    avatar = avatar_map.get(a["id"], a["id"][:2].upper())
    badge_str = f"'{badge}'" if badge else "null"
    holdings_lines = "\n".join(fmt_holding(h) for h in a["holdings"])
    return (
        f"  {{\n"
        f"    id: '{a['id']}', rank: {rank}, name: '{a['name']}', avatar: '{avatar}', color: '{a['color']}',\n"
        f"    totalAssets: {a['totalAssets']:.2f}, returnPct: {a['returnPct']:.2f}, "
        f"cash: {a['cash']:.2f}, cashPct: {a['cashPct']:.1f}, holdingsCount: {a['holdingsCount']},\n"
        f"    style: '{a['style']}', badge: {badge_str},\n"
        f"    holdings: mkHoldings([\n{holdings_lines}\n    ], {a['cash']:.2f}),\n"
        f"  }},"
    )


def render_perf_history(history):
    lines = []
    for row in history:
        kvs = ", ".join(f"'{k}': {v}" if "-" in k else f"{k}: {v}" for k, v in row.items() if k != "date")
        lines.append(f"  {{ date: '{row['date']}', {kvs} }},")
    return "\n".join(lines)


def render_daily_returns(daily):
    lines = []
    for row in daily:
        kvs = ", ".join(f"'{k}': {v}" if "-" in k else f"{k}: {v}" for k, v in row["returns"].items())
        lines.append(f"  {{ date: '{row['date']}', returns: {{ {kvs} }} }},")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", required=True, help="今日 YYYY-MM-DD")
    ap.add_argument("--prev", default=None)
    ap.add_argument("--out", default=str(DATA_TS_PATH))
    args = ap.parse_args()

    today = args.date
    prev = args.prev or _prev_trading_day(today)
    today_short = today[5:]  # MM-DD

    prices_path = PRICES_DIR / f"{prev}.json"
    if not prices_path.exists():
        print(f"❌ Missing {prices_path}")
        sys.exit(1)
    prices = json.loads(prices_path.read_text())["prices"]

    resp_dir = RESPONSES_DIR / today
    if not resp_dir.is_dir():
        print(f"❌ Missing {resp_dir}")
        sys.exit(1)

    prev_state = {a["id"]: a for a in parse_state()}
    existing_dates = parse_dates()
    # perf history 总是从 source TS 读取（即使 out 写到别处做 dry run）
    existing_text = DATA_TS_PATH.read_text()

    # 提取已有 performanceHistory 解析为 list
    perf_rows = _extract_perf(existing_text)
    daily_rows = _extract_daily(existing_text)

    # 组装 10 agent
    agents_data = []
    for meta in AGENTS:
        rp = resp_dir / f"{meta['id']}.json"
        if not rp.exists():
            print(f"⚠ {meta['id']} response missing, reusing prev state")
            prev_a = prev_state[meta["id"]]
            agents_data.append({
                "id": meta["id"], "name": meta["name"], "color": meta["color"],
                "style": meta["style"], "totalAssets": prev_a["total_assets"],
                "returnPct": prev_a["return_pct"], "cash": prev_a["cash"],
                "cashPct": prev_a["cash_pct"], "holdingsCount": len(prev_a["holdings"]),
                "holdings": [{
                    "symbol": h["symbol"], "name": NAME_OVERRIDES.get(h["symbol"], h["symbol"]),
                    "shares": h["shares"], "avg_cost": h["avg_cost"],
                    "current_price": prices.get(h["symbol"], h["current_price"]),
                    "sector": h["sector"],
                } for h in prev_a["holdings"]],
            })
            continue
        resp = json.loads(rp.read_text())
        a = build_agent_record(meta, resp, prev_state.get(meta["id"]), prices,
                               prev_state.get(meta["id"], {}).get("total_assets", 10000))
        agents_data.append(a)

    # 排名按 returnPct desc
    agents_data.sort(key=lambda x: -x["returnPct"])

    # 添加今日 perf 行
    new_perf = {"date": today_short}
    new_daily = {"date": today, "returns": {}}
    for a in agents_data:
        new_perf[a["id"]] = a["returnPct"]
        new_daily["returns"][a["id"]] = a["returnPct"]
    if not perf_rows or perf_rows[-1].get("date") != today_short:
        perf_rows.append(new_perf)
        daily_rows.append(new_daily)
    else:
        perf_rows[-1] = new_perf
        daily_rows[-1] = new_daily

    # 渲染整个 TS
    ts_out = _render_full_ts(agents_data, perf_rows, daily_rows)
    Path(args.out).write_text(ts_out)
    print(f"✅ Wrote {args.out}")
    print("Rank:")
    for i, a in enumerate(agents_data, 1):
        print(f"  {i:>2}. {a['name']:<14} {a['returnPct']:>+6.2f}%  ${a['totalAssets']:.2f}")


def _extract_perf(text):
    import re
    m = re.search(r"performanceHistory:\s*PerformancePoint\[\]\s*=\s*\[(.*?)\];", text, re.DOTALL)
    if not m:
        return []
    rows = []
    for line in m.group(1).strip().splitlines():
        line = line.strip().rstrip(",")
        if not line.startswith("{"):
            continue
        # 简易解析  { date: '06-03', chatgpt: 0, 'gemini-ext': 0, ... }
        ml = re.match(r"\{\s*date:\s*'(\d{2}-\d{2})'\s*,\s*(.*)\s*\}", line)
        if not ml:
            continue
        d, rest = ml.groups()
        row = {"date": d}
        for kv in re.finditer(r"'?([\w-]+)'?\s*:\s*(-?[\d.]+)", rest):
            row[kv.group(1)] = float(kv.group(2))
        rows.append(row)
    return rows


def _extract_daily(text):
    import re
    m = re.search(r"dailyReturns:\s*DailyReturn\[\]\s*=\s*\[(.*?)\];", text, re.DOTALL)
    if not m:
        return []
    rows = []
    for line_match in re.finditer(r"\{\s*date:\s*'(\d{4}-\d{2}-\d{2})'\s*,\s*returns:\s*\{(.*?)\}\s*\}", m.group(1)):
        d, body = line_match.groups()
        ret = {}
        for kv in re.finditer(r"'?([\w-]+)'?\s*:\s*(-?[\d.]+)", body):
            ret[kv.group(1)] = float(kv.group(2))
        rows.append({"date": d, "returns": ret})
    return rows


def _prev_trading_day(d_str):
    d = date_cls.fromisoformat(d_str) - timedelta(days=1)
    while d.weekday() >= 5:
        d -= timedelta(days=1)
    return d.isoformat()


def _render_full_ts(agents_data, perf_rows, daily_rows):
    blocks = []
    for i, a in enumerate(agents_data):
        badge = BADGE_MAP.get(i)
        blocks.append(render_agent_block(i + 1, a, badge))
    participants_block = "\n".join(blocks)

    perf_block = render_perf_history(perf_rows)
    daily_block = render_daily_returns(daily_rows)

    return f"""export interface Agent {{
  id: string;
  rank: number;
  name: string;
  avatar: string;
  color: string;
  totalAssets: number;
  returnPct: number;
  cash: number;
  cashPct: number;
  holdingsCount: number;
  style: string;
  badge: 'gold' | 'silver' | 'bronze' | null;
  holdings: HoldingItem[];
}}

export interface HoldingItem {{
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  pnl: number;
  pnlPercent: number;
  weight: number;
  sector: string;
}}

export interface PerformancePoint {{
  date: string;
  [agentId: string]: string | number;
}}

export interface DailyReturn {{
  date: string;
  returns: {{ [agentId: string]: number }};
}}

const mkHoldings = (items: Omit<HoldingItem, 'marketValue' | 'pnl' | 'pnlPercent' | 'weight'>[], cash: number): HoldingItem[] => {{
  const stockVal = items.reduce((s, h) => s + h.shares * h.currentPrice, 0);
  const total = stockVal + cash;
  return items.map(h => {{
    const mv = h.shares * h.currentPrice;
    const pnl = (h.currentPrice - h.avgCost) * h.shares;
    const pnlPct = h.avgCost > 0 ? ((h.currentPrice - h.avgCost) / h.avgCost) * 100 : 0;
    return {{ ...h, marketValue: mv, pnl, pnlPercent: pnlPct, weight: Math.round((mv / total) * 1000) / 10 }};
  }});
}};

export const participants: Agent[] = [
{participants_block}
];

export const performanceHistory: PerformancePoint[] = [
{perf_block}
];

export const dailyReturns: DailyReturn[] = [
{daily_block}
];

export const competitionInfo = {{
  name: 'AI 美股投资竞赛',
  season: 'S1',
  startDate: '2026-06-03',
  endDate: '2026-07-03',
  totalParticipants: 10,
  initialCapital: 10000,
}};
"""


if __name__ == "__main__":
    main()
