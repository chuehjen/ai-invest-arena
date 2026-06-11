"""
ts_state.py — 解析 competitionData.ts 末态（participants 数组）

由于该 TS 文件由 codegen 严格控制结构，我们用正则提取每个 agent 的 holdings + cash + totalAssets。
"""
import re
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import DATA_TS_PATH


_AGENT_RE = re.compile(
    r"id:\s*'([^']+)'.*?"
    r"totalAssets:\s*([\d.]+),\s*returnPct:\s*(-?[\d.]+),\s*"
    r"cash:\s*([\d.]+),\s*cashPct:\s*([\d.]+),\s*holdingsCount:\s*(\d+),\s*"
    r"style:\s*'([^']*)'.*?"
    r"holdings:\s*mkHoldings\(\[(.*?)\],\s*([\d.]+)\)",
    re.DOTALL,
)

_HOLDING_RE = re.compile(
    r"\{\s*symbol:\s*'([^']+)'\s*,\s*name:\s*'([^']*)'\s*,\s*"
    r"shares:\s*([\d.]+)\s*,\s*avgCost:\s*([\d.]+)\s*,\s*"
    r"currentPrice:\s*([\d.]+)\s*,\s*sector:\s*'([^']*)'\s*\}"
)


def parse_state(ts_path: Path = DATA_TS_PATH):
    text = ts_path.read_text()
    agents = []
    for m in _AGENT_RE.finditer(text):
        agent_id, total_assets, return_pct, cash, cash_pct, count, style, holdings_blob, cash2 = m.groups()
        holdings = []
        for hm in _HOLDING_RE.finditer(holdings_blob):
            sym, name, shares, avg, cur, sector = hm.groups()
            holdings.append({
                "symbol": sym,
                "name": name,
                "shares": float(shares),
                "avg_cost": float(avg),
                "current_price": float(cur),
                "sector": sector,
            })
        agents.append({
            "id": agent_id,
            "total_assets": float(total_assets),
            "return_pct": float(return_pct),
            "cash": float(cash),
            "cash_pct": float(cash_pct),
            "holdings_count": int(count),
            "style": style,
            "holdings": holdings,
        })
    return agents


def parse_dates(ts_path: Path = DATA_TS_PATH):
    """提取 performanceHistory 中所有日期（用于推断当前 Day N）"""
    text = ts_path.read_text()
    m = re.search(r"performanceHistory:\s*PerformancePoint\[\]\s*=\s*\[(.*?)\];", text, re.DOTALL)
    if not m:
        return []
    return re.findall(r"date:\s*'(\d{2}-\d{2})'", m.group(1))


if __name__ == "__main__":
    import json
    agents = parse_state()
    print(f"Parsed {len(agents)} agents")
    for a in agents:
        print(f"  {a['id']:<14} total=${a['total_assets']:>8.2f} cash=${a['cash']:>8.2f} holdings={len(a['holdings'])}")
    print(f"Dates: {parse_dates()}")
