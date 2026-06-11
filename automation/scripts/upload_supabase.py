"""upload_supabase.py — 把 latest.json 和当日 archive 上传到 Supabase ai_invest_snapshots 表

读取本地 ~/.qoderwork/secrets/supabase.json:
  {
    "url": "https://xxx.supabase.co",
    "anon_key": "eyJ...",
    "service_key": "eyJ..."
  }

如果 secrets 文件不存在，脚本以 exit 0 优雅跳过（cron 能继续跑），latest.json 仍是兜底数据源。

upsert 行为: snapshot_date 作 PK，重复跑会覆盖当日记录（裁判修正后再跑也安全）。

CLI:
  python upload_supabase.py --date 2026-06-12
  python upload_supabase.py  # 默认用 latest.json 内的 lastUpdated 推断日期
"""
import argparse
import json
import sys
import urllib.request
import urllib.error
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import (
    DATA_LATEST_JSON, DATA_ARCHIVE_DIR, SUPABASE_TABLE, load_supabase_secrets,
)


def _today_cn():
    return datetime.now(timezone(timedelta(hours=8))).date().isoformat()


def upsert_snapshot(secrets: dict, snapshot_date: str, day_n: int, payload: dict):
    """通过 Supabase REST API upsert 一行。"""
    url = f"{secrets['url'].rstrip('/')}/rest/v1/{SUPABASE_TABLE}"
    body = json.dumps([{
        "snapshot_date": snapshot_date,
        "day_n": day_n,
        "payload": payload,
    }]).encode("utf-8")
    headers = {
        "apikey": secrets["service_key"],
        "Authorization": f"Bearer {secrets['service_key']}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        msg = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Supabase upsert 失败 ({e.code}): {msg}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=None, help="snapshot_date (默认从 latest.json 推断)")
    args = ap.parse_args()

    secrets = load_supabase_secrets()
    if not secrets:
        print("ℹ️  ~/.qoderwork/secrets/supabase.json 不存在，跳过 Supabase 上传（latest.json 仍可用）")
        sys.exit(0)
    if not all(k in secrets for k in ("url", "service_key")):
        print("❌ secrets 缺少 url 或 service_key 字段")
        sys.exit(1)

    if not DATA_LATEST_JSON.exists():
        print(f"❌ {DATA_LATEST_JSON} 不存在，先跑 codegen_data.py")
        sys.exit(1)

    payload = json.loads(DATA_LATEST_JSON.read_text())
    snapshot_date = args.date or payload.get("lastUpdated", _today_cn())[:10]
    day_n = payload.get("dayN") or len(payload.get("performanceHistory", []))

    print(f"→ Upserting snapshot_date={snapshot_date} day_n={day_n} ({len(payload.get('participants',[]))} agents)")
    status = upsert_snapshot(secrets, snapshot_date, day_n, payload)
    print(f"✓ Supabase upsert ok (status {status})")


if __name__ == "__main__":
    main()
