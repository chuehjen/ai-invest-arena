#!/usr/bin/env python3
"""
daily_run.py — 一键 orchestrator

完整流程（默认互动确认）:
  1. fetch_prices.py        拉前一交易日收盘价
  2. generate_prompts.py    生成今日 10 份提示词（你复制贴给 6 家 AI）
  3. [人工 / quant-guru cron] 把回复 JSON 落入 responses/{date}/
  4. validate_response.py   批量校验
  5. codegen_data.py        渲染 competitionData.ts
  6. (可选) git commit + push

用法:
  python daily_run.py prompts                # 步骤 1+2: 拉价 + 生成提示词
  python daily_run.py codegen --date 2026-06-11
  python daily_run.py validate --date 2026-06-11
  python daily_run.py full --date 2026-06-11   # 1+2+4+5
"""
import argparse
import subprocess
import sys
from datetime import date as date_cls, timedelta
from pathlib import Path

HERE = Path(__file__).resolve().parent


def run(cmd, **kw):
    print(f"\n$ {' '.join(cmd)}")
    return subprocess.run(cmd, check=True, **kw)


def prev_trading_day(d_str):
    d = date_cls.fromisoformat(d_str) - timedelta(days=1)
    while d.weekday() >= 5:
        d -= timedelta(days=1)
    return d.isoformat()


def cmd_prompts(today, prev):
    run([sys.executable, str(HERE / "fetch_prices.py"), "--date", prev])
    run([sys.executable, str(HERE / "generate_prompts.py"), "--date", today, "--prev", prev])
    print(f"\n✅ 提示词已生成 → automation/prompts/{today}/")
    print("   下一步：把每份提示词贴给对应 AI，回复 JSON 块保存到 automation/responses/{}/{{agent_id}}.json".format(today))


def cmd_validate(today):
    run([sys.executable, str(HERE / "validate_response.py"), str(HERE.parent / "responses" / today)])


def cmd_codegen(today, prev):
    run([sys.executable, str(HERE / "codegen_data.py"), "--date", today, "--prev", prev])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("step", choices=["prompts", "validate", "codegen", "full"])
    ap.add_argument("--date", default=None)
    ap.add_argument("--prev", default=None)
    args = ap.parse_args()

    today = args.date or date_cls.today().isoformat()
    prev = args.prev or prev_trading_day(today)

    if args.step == "prompts":
        cmd_prompts(today, prev)
    elif args.step == "validate":
        cmd_validate(today)
    elif args.step == "codegen":
        cmd_codegen(today, prev)
    elif args.step == "full":
        cmd_prompts(today, prev)
        cmd_validate(today)
        cmd_codegen(today, prev)


if __name__ == "__main__":
    main()
