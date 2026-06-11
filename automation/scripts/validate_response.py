#!/usr/bin/env python3
"""
validate_response.py — 校验 AI 回复 JSON

用法:
  python validate_response.py automation/responses/2026-06-11/claude.json
  python validate_response.py automation/responses/2026-06-11/   # 批量

校验项:
  1. JSON schema (jsonschema 库可选；缺失时退化到必需字段检查)
  2. cash_after >= 0
  3. Σ(shares × current_price) + cash ≈ total_assets_after  误差 < $1
  4. actions[].price 与官方收盘价偏差 < 5%
  5. actions 应用到 prev holdings 后 == holdings_after

输出:
  - 控制台分项打印
  - 同目录 {agent}.validation.json 详细报告
  - exit code 0 全过 / 1 有问题
"""
import argparse
import json
import sys
from datetime import date as date_cls, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import PRICES_DIR, SCHEMA_PATH
from ts_state import parse_state


def prev_trading_day(d_str):
    d = date_cls.fromisoformat(d_str) - timedelta(days=1)
    while d.weekday() >= 5:
        d -= timedelta(days=1)
    return d.isoformat()

REQUIRED_FIELDS = ["schema_version", "agent_id", "date", "exec_price_basis",
                   "actions", "holdings_after", "cash_after", "total_assets_after"]


def load_official_prices(date_str):
    p = PRICES_DIR / f"{date_str}.json"
    if not p.exists():
        return {}
    return json.loads(p.read_text())["prices"]


def validate_one(resp_path: Path, prev_state_map: dict) -> dict:
    issues = []
    warnings = []
    try:
        resp = json.loads(resp_path.read_text())
    except json.JSONDecodeError as e:
        return {"file": str(resp_path), "ok": False, "issues": [f"JSON parse error: {e}"], "warnings": []}

    # 1. schema 必需字段
    for field in REQUIRED_FIELDS:
        if field not in resp:
            issues.append(f"missing field: {field}")
    if issues:
        return {"file": str(resp_path), "ok": False, "issues": issues, "warnings": warnings}

    agent_id = resp["agent_id"]
    date_str = resp["date"]
    # 执行价基于 prev_close；如同日 prices 文件存在用同日（dry run），否则回退到 prev
    prev_str = prev_trading_day(date_str)

    # 2. cash >= 0
    if resp["cash_after"] < -0.01:
        issues.append(f"cash_after = ${resp['cash_after']:.2f} < 0 (透支)")

    # 3. 算术：Σ MV + cash ≈ total
    prices = load_official_prices(date_str) or load_official_prices(prev_str)
    holdings_after = resp["holdings_after"]
    mv_sum = 0.0
    for h in holdings_after:
        sym = h["symbol"]
        cur = prices.get(sym)
        if cur is None:
            warnings.append(f"no official price for {sym}, skipping MV check")
            continue
        mv_sum += h["shares"] * cur
    declared_total = resp["total_assets_after"]
    calc_total = mv_sum + resp["cash_after"]
    if abs(calc_total - declared_total) > 1.0:
        issues.append(f"total mismatch: declared=${declared_total:.2f} calc=${calc_total:.2f} diff=${calc_total-declared_total:+.2f}")

    # 4. action price 偏差
    for a in resp["actions"]:
        if a["type"] == "HOLD":
            continue
        sym = a["symbol"]
        official = prices.get(sym)
        if official is None:
            warnings.append(f"action {a['type']} {sym} no official price, skipping")
            continue
        ai_price = a.get("price")
        if ai_price is None:
            issues.append(f"action {a['type']} {sym} missing price")
            continue
        dev = abs(ai_price - official) / official * 100
        if dev > 5.0:
            issues.append(f"action {sym} price=${ai_price:.2f} official=${official:.2f} deviation={dev:.1f}% > 5%")
        elif dev > 2.0:
            warnings.append(f"action {sym} price deviation {dev:.1f}% (within tolerance)")

    # 5. actions 应用到 prev holdings 应等于 holdings_after
    prev = prev_state_map.get(agent_id)
    if prev:
        sim = {h["symbol"]: {"shares": h["shares"], "avg_cost": h["avg_cost"]} for h in prev["holdings"]}
        for a in resp["actions"]:
            if a["type"] == "HOLD":
                continue
            sym = a["symbol"]
            shares = a.get("shares", 0)
            price = a.get("price", 0)
            cur = sim.setdefault(sym, {"shares": 0, "avg_cost": 0})
            if a["type"] == "BUY":
                old_cost = cur["shares"] * cur["avg_cost"]
                new_shares = cur["shares"] + shares
                cur["avg_cost"] = (old_cost + shares * price) / max(new_shares, 1e-9)
                cur["shares"] = new_shares
            elif a["type"] == "SELL":
                cur["shares"] = max(cur["shares"] - shares, 0)
                if cur["shares"] == 0:
                    sim.pop(sym, None)
        # 比对
        decl = {h["symbol"]: h["shares"] for h in holdings_after}
        sim_shares = {s: v["shares"] for s, v in sim.items() if v["shares"] > 0}
        for sym in set(decl) | set(sim_shares):
            d, s = decl.get(sym, 0), sim_shares.get(sym, 0)
            if abs(d - s) > 0.01:
                issues.append(f"holdings mismatch {sym}: declared={d}, simulated={s}")

    return {
        "file": str(resp_path),
        "agent_id": agent_id,
        "date": date_str,
        "ok": len(issues) == 0,
        "issues": issues,
        "warnings": warnings,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path", help="单个 .json 文件或目录")
    args = ap.parse_args()

    p = Path(args.path)
    files = [p] if p.is_file() else sorted(p.glob("*.json"))
    files = [f for f in files if not f.name.endswith(".validation.json")]
    if not files:
        print(f"⚠ No JSON files in {p}")
        sys.exit(1)

    prev_state_map = {a["id"]: a for a in parse_state()}
    print(f"🔍 Validating {len(files)} response(s)...")

    all_ok = True
    summary = []
    for f in files:
        rep = validate_one(f, prev_state_map)
        summary.append(rep)
        flag = "✅" if rep["ok"] else "❌"
        print(f"  {flag} {f.name}")
        for w in rep["warnings"]:
            print(f"      ⚠ {w}")
        for i in rep["issues"]:
            print(f"      ✗ {i}")
            all_ok = False
        # 落盘
        f.with_suffix(".validation.json").write_text(json.dumps(rep, indent=2, ensure_ascii=False))

    print(f"\n{'✅ All passed' if all_ok else '❌ Some failed'}")
    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()
