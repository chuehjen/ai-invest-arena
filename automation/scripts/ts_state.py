"""
ts_state.py — 解析最新竞赛末态（participants 数组）

数据隔离方案 A 后：直接从 public/data/latest.json 读取 snapshot，提供与原 TS 解析等价的字典结构。
保留模块名 / 接口签名以便上游脚本零改动。
"""
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import DATA_LATEST_JSON


def _load_latest(json_path: Path = DATA_LATEST_JSON):
    if not json_path.exists():
        raise FileNotFoundError(f"latest snapshot missing: {json_path}")
    return json.loads(json_path.read_text())


def parse_state(json_path: Path = DATA_LATEST_JSON):
    snap = _load_latest(json_path)
    out = []
    for a in snap.get("participants", []):
        holdings = []
        for h in a.get("holdings", []):
            holdings.append({
                "symbol": h["symbol"],
                "name": h.get("name", h["symbol"]),
                "shares": float(h["shares"]),
                "avg_cost": float(h["avgCost"]),
                "current_price": float(h["currentPrice"]),
                "sector": h.get("sector", "其他"),
            })
        out.append({
            "id": a["id"],
            "total_assets": float(a["totalAssets"]),
            "return_pct": float(a["returnPct"]),
            "cash": float(a["cash"]),
            "cash_pct": float(a["cashPct"]),
            "holdings_count": int(a["holdingsCount"]),
            "style": a.get("style", ""),
            "holdings": holdings,
        })
    return out


def parse_dates(json_path: Path = DATA_LATEST_JSON):
    """从 performanceHistory 提取所有 MM-DD 日期。"""
    snap = _load_latest(json_path)
    return [row["date"] for row in snap.get("performanceHistory", [])]


if __name__ == "__main__":
    agents = parse_state()
    print(f"Parsed {len(agents)} agents")
    for a in agents:
        print(f"  {a['id']:<14} total=${a['total_assets']:>8.2f} cash=${a['cash']:>8.2f} holdings={len(a['holdings'])}")
    print(f"Dates: {parse_dates()}")
