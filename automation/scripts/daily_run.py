#!/usr/bin/env python3
"""
daily_run.py — 一键 orchestrator

完整流程:
  1. fetch_prices.py        拉前一交易日收盘价
  2. generate_prompts.py    生成今日 10 份提示词
  3. push 豆包+千问 2 份到钉钉群「大仁哥」（其他 5 家外部 AI 用户自行复制）
  4. [群里 @我 贴 5 份 JSON → fetch_group_decisions.py] 落 responses/
  5. validate_response.py + codegen_data.py + supabase upload + 极简通知

用法:
  python daily_run.py prompts                # 步骤 1+2+3
  python daily_run.py codegen --date 2026-06-11
  python daily_run.py validate --date 2026-06-11
  python daily_run.py full --date 2026-06-11
"""
import argparse
import subprocess
import sys
from datetime import date as date_cls, timedelta
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))


def run(cmd, **kw):
    print(f"\n$ {' '.join(cmd)}")
    return subprocess.run(cmd, check=True, **kw)


def prev_trading_day(d_str):
    d = date_cls.fromisoformat(d_str) - timedelta(days=1)
    while d.weekday() >= 5:
        d -= timedelta(days=1)
    return d.isoformat()


def push_prompts_to_dingbot(today: str):
    """把豆包 + 千问两份提示词推到钉钉群（每份一条 markdown）。"""
    from config import PROMPTS_DIR
    from dingbot import send_markdown

    targets = [("doubao", "豆包"), ("qwen", "千问")]
    for agent_id, agent_name in targets:
        path = PROMPTS_DIR / today / f"{agent_id}.md"
        if not path.exists():
            print(f"⚠️  {path} 不存在，跳过")
            continue
        body = path.read_text()
        # 钉钉 markdown 单条限制约 5000 字符；超长截断并提示
        if len(body) > 4500:
            body = body[:4400] + "\n\n... _(已截断，详见本地文件)_"
        title = f"Day {today} · {agent_name} 调仓提示词"
        try:
            send_markdown(title=title, text=body)
            print(f"✓ 已推 {agent_name} 提示词到钉钉")
        except Exception as e:
            print(f"❌ 推 {agent_name} 失败: {e}")


def cmd_prompts(today, prev):
    run([sys.executable, str(HERE / "fetch_prices.py"), "--date", prev])
    run([sys.executable, str(HERE / "generate_prompts.py"), "--date", today, "--prev", prev])
    print(f"\n✅ 提示词已生成 → automation/prompts/{today}/")
    push_prompts_to_dingbot(today)
    print("\n📋 下一步: 在群「大仁哥」贴 5 份外部 AI 决策（@我 + ```json）→ python fetch_group_decisions.py {}".format(today))


def cmd_validate(today):
    run([sys.executable, str(HERE / "validate_response.py"), str(HERE.parent / "responses" / today)])


def cmd_codegen(today, prev):
    run([sys.executable, str(HERE / "codegen_data.py"), "--date", today, "--prev", prev])
    # codegen 写入 public/data/latest.json 后，尝试上传 supabase（无 keys 则跳过）
    try:
        upload_path = HERE / "upload_supabase.py"
        if upload_path.exists():
            run([sys.executable, str(upload_path), "--date", today])
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Supabase 上传失败（不影响 latest.json 落地）: {e}")


def push_summary_to_dingbot(today: str):
    """codegen 后推一条极简一行 + 看板链接。"""
    from dingbot import send_markdown
    from config import DATA_LATEST_JSON
    import json as _json
    if not DATA_LATEST_JSON.exists():
        return
    snap = _json.loads(DATA_LATEST_JSON.read_text())
    parts = snap.get("participants", [])
    parts_sorted = sorted(parts, key=lambda p: -p.get("totalReturn", -999))
    top3 = parts_sorted[:3]
    line = " · ".join(f"{i+1}. {p.get('name','?')} {p.get('totalReturn',0):+.2f}%" for i, p in enumerate(top3))
    text = (
        f"### Day {today} 已同步 ✓\n\n"
        f"**Top3**: {line}\n\n"
        f"[👉 看板](https://github.com/chuehjen/ai-invest-arena)"
    )
    try:
        send_markdown(title=f"Day {today} 同步完成", text=text)
        print("✓ 极简通知已推钉钉")
    except Exception as e:
        print(f"⚠️  钉钉推送失败: {e}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("step", choices=["prompts", "validate", "codegen", "notify", "full"])
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
    elif args.step == "notify":
        push_summary_to_dingbot(today)
    elif args.step == "full":
        cmd_prompts(today, prev)
        cmd_validate(today)
        cmd_codegen(today, prev)
        push_summary_to_dingbot(today)


if __name__ == "__main__":
    main()
