"""把当前 competitionData.ts 的 Day6 数据导出为 JSON（一次性迁移）"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from ts_state import parse_state, parse_dates  # noqa
import re

TS = (ROOT.parent / "src" / "data" / "competitionData.ts").read_text()
PUBLIC_DATA = ROOT.parent / "public" / "data"
PUBLIC_DATA.mkdir(parents=True, exist_ok=True)
(PUBLIC_DATA / "archive").mkdir(exist_ok=True)


def parse_perf():
    m = re.search(r"performanceHistory:\s*PerformancePoint\[\]\s*=\s*\[(.*?)\];", TS, re.DOTALL)
    rows = []
    for line in m.group(1).strip().splitlines():
        line = line.strip().rstrip(",")
        if not line.startswith("{"):
            continue
        ml = re.match(r"\{\s*date:\s*'(\d{2}-\d{2})'\s*,\s*(.*)\s*\}", line)
        if not ml:
            continue
        d, rest = ml.groups()
        row = {"date": d}
        for kv in re.finditer(r"'?([\w-]+)'?\s*:\s*(-?[\d.]+)", rest):
            row[kv.group(1)] = float(kv.group(2))
        rows.append(row)
    return rows


def parse_daily():
    m = re.search(r"dailyReturns:\s*DailyReturn\[\]\s*=\s*\[(.*?)\];", TS, re.DOTALL)
    rows = []
    for line_match in re.finditer(r"\{\s*date:\s*'(\d{4}-\d{2}-\d{2})'\s*,\s*returns:\s*\{(.*?)\}\s*\}", m.group(1)):
        d, body = line_match.groups()
        ret = {}
        for kv in re.finditer(r"'?([\w-]+)'?\s*:\s*(-?[\d.]+)", body):
            ret[kv.group(1)] = float(kv.group(2))
        rows.append({"date": d, "returns": ret})
    return rows


# avatar / badge / rank 从 TS 重新提取
RANK_RE = re.compile(
    r"id:\s*'([^']+)',\s*rank:\s*(\d+),\s*name:\s*'([^']+)',\s*avatar:\s*'([^']+)',[^}]*?badge:\s*(null|'\w+')",
    re.DOTALL,
)
rank_map = {}
for m in RANK_RE.finditer(TS):
    rank_map[m.group(1)] = {
        "rank": int(m.group(2)),
        "name": m.group(3),
        "avatar": m.group(4),
        "badge": (None if m.group(5) == "null" else m.group(5).strip("'")),
    }


# 还要从 TS 拿 color
COLOR_RE = re.compile(r"id:\s*'([^']+)'.*?color:\s*'([^']+)'", re.DOTALL)
color_map = dict(COLOR_RE.findall(TS))


agents_raw = parse_state()
participants = []
for a in agents_raw:
    holdings = []
    for h in a["holdings"]:
        mv = h["shares"] * h["current_price"]
        pnl = (h["current_price"] - h["avg_cost"]) * h["shares"]
        pnl_pct = (pnl / max(h["shares"] * h["avg_cost"], 1e-9)) * 100
        holdings.append({
            "symbol": h["symbol"], "name": h["name"], "shares": h["shares"],
            "avgCost": h["avg_cost"], "currentPrice": h["current_price"],
            "marketValue": round(mv, 2), "pnl": round(pnl, 2),
            "pnlPercent": round(pnl_pct, 2), "weight": 0, "sector": h["sector"],
        })
    total = sum(h["marketValue"] for h in holdings) + a["cash"]
    for h in holdings:
        h["weight"] = round((h["marketValue"] / max(total, 1)) * 1000) / 10

    rinfo = rank_map.get(a["id"], {})
    participants.append({
        "id": a["id"],
        "rank": rinfo.get("rank", 0),
        "name": rinfo.get("name", a["id"]),
        "avatar": rinfo.get("avatar", a["id"][:2].upper()),
        "color": color_map.get(a["id"], "#888"),
        "totalAssets": a["total_assets"],
        "returnPct": a["return_pct"],
        "cash": a["cash"],
        "cashPct": a["cash_pct"],
        "holdingsCount": a["holdings_count"],
        "style": a["style"],
        "badge": rinfo.get("badge"),
        "holdings": holdings,
    })

# 修正 name（rank_map 已含 name）

participants.sort(key=lambda x: x["rank"])

snapshot = {
    "schema_version": "1.0",
    "snapshot_date": "2026-06-10",
    "day_n": 6,
    "competitionInfo": {
        "name": "AI 美股投资竞赛", "season": "S1",
        "startDate": "2026-06-03", "endDate": "2026-07-03",
        "totalParticipants": 10, "initialCapital": 10000,
    },
    "participants": participants,
    "performanceHistory": parse_perf(),
    "dailyReturns": parse_daily(),
}

(PUBLIC_DATA / "latest.json").write_text(json.dumps(snapshot, indent=2, ensure_ascii=False))
(PUBLIC_DATA / "archive" / "2026-06-10.json").write_text(json.dumps(snapshot, indent=2, ensure_ascii=False))
print(f"✅ Exported {len(participants)} participants to public/data/latest.json + archive/")
print(f"   perfRows={len(snapshot['performanceHistory'])} dailyRows={len(snapshot['dailyReturns'])}")
