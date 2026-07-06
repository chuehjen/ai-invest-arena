#!/usr/bin/env python3
"""
daily_run.py — 一键 orchestrator

完整流程:
  1. fetch_prices.py        拉前一交易日收盘价（Twelve Data）
  2. generate_prompts.py    生成 5 份提示词（3 大师 + 豆包 + 千问，其他人工贴）
  3. push 豆包 + 千问 2 份到钉钉群「大仁哥」（每家 1 条 markdown，共 2 条）
  4. [quant-guru-desk skill 读取 serenity/beth/cathie 3 份 → 三大师调仓 JSON]
  5. [群里 @我 贴 5 份外部 AI 决策 JSON → fetch_group_decisions.py 落 responses/]
  6. validate_response.py + codegen_data.py + supabase upload + 极简通知

日期语义（重要）：
  - target-date = 本次调仓要应用的「未来交易日」（例：周一早上跑 → target=周一）
  - prev-date   = target 的上一个交易日（例：target=周一 → prev=上周五 / 长假前的最后交易日）
                   fetch_prices 拉 prev 的 OHLC，供 generate_prompts 计算持仓市值和板块变动
  - reference-date = daily_run 被触发的日历日；默认 NY 今天，也可 --ref-date 覆盖
                     若 reference 本身就是交易日 → target = reference
                     若 reference 是周末/假期 → target = 下一个交易日

用法:
  python daily_run.py prompts                           # target = NY today or next
  python daily_run.py prompts --target-date 2026-07-06
  python daily_run.py prompts --ref-date 2026-07-05     # 周日跑 → target=周一 2026-07-06
  python daily_run.py codegen --date 2026-06-11         # (兼容旧参数)
  python daily_run.py validate --date 2026-06-11
  python daily_run.py full --target-date 2026-06-11
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


def _ny_today() -> str:
    from datetime import datetime
    try:
        from zoneinfo import ZoneInfo
        return datetime.now(ZoneInfo("America/New_York")).strftime("%Y-%m-%d")
    except Exception:
        return date_cls.today().isoformat()


def prev_trading_day(d_str: str) -> str:
    from holidays import is_market_closed
    d = date_cls.fromisoformat(d_str) - timedelta(days=1)
    while is_market_closed(d.isoformat()):
        d -= timedelta(days=1)
    return d.isoformat()


def resolve_target(ref_date: str) -> str:
    """把参考日历日映射到「应当被处理的交易日」。

    ref 本身开盘 → target = ref
    ref 关门（周末 / 假期）→ target = 下一个交易日
    """
    from holidays import is_market_closed
    d = date_cls.fromisoformat(ref_date)
    while is_market_closed(d.isoformat()):
        d += timedelta(days=1)
    return d.isoformat()


def to_dingtalk_md(text: str) -> str:
    """把标准 Markdown 转成钉钉机器人兼容格式。

    钉钉不支持：表格、围栏代码块、水平线。
    转换策略：
      - 表格 → 每行一个 bullet
      - ```json ... ``` → 缩进纯文本
      - --- → 删除
      - > 引用 → 保留（钉钉部分支持）
    """
    import re
    lines = text.split("\n")
    out = []
    in_code_block = False
    in_table = False
    table_headers = []

    i = 0
    while i < len(lines):
        line = lines[i]

        # Fenced code blocks: ``` ... ```
        if line.strip().startswith("```"):
            if in_code_block:
                in_code_block = False
                i += 1
                continue
            else:
                in_code_block = True
                i += 1
                continue
        if in_code_block:
            # Indent code block content as plain text
            out.append(f"    {line}")
            i += 1
            continue

        # Horizontal rules
        if re.match(r"^\s*---+\s*$", line):
            i += 1
            continue

        # Table detection (| ... |)
        stripped = line.strip()
        if stripped.startswith("|") and stripped.endswith("|"):
            cells = [c.strip() for c in stripped.split("|")[1:-1]]
            # Separator row (|---|---|)
            if all(re.match(r"^[-:]+$", c) for c in cells):
                i += 1
                continue
            if not in_table:
                in_table = True
                table_headers = cells
                i += 1
                continue
            else:
                # Data row → bullet
                parts = []
                for hdr, val in zip(table_headers, cells):
                    if val and val != hdr:
                        parts.append(f"{hdr}: **{val}**")
                out.append(f"- {' · '.join(parts)}")
                i += 1
                continue
        else:
            if in_table:
                in_table = False
                out.append("")  # blank line after table

        out.append(line)
        i += 1

    return "\n".join(out)


def _read_current_day_n() -> int:
    """从 public/data/latest.json 读 day_n（快照对应的已完成天数），下一日 = day_n + 1。"""
    from config import DATA_LATEST_JSON
    import json as _json
    if not DATA_LATEST_JSON.exists():
        return 0
    try:
        snap = _json.loads(DATA_LATEST_JSON.read_text())
        return int(snap.get("day_n", 0))
    except Exception:
        return 0


def push_prompts_to_dingbot(target: str, prev: str):
    """把豆包 + 千问两份提示词推到钉钉群（每家 1 条 markdown，共 2 条）。

    首行加一行提示，说明这是「target 交易日」的调仓、执行价基准是 prev 的收盘。
    钉钉 markdown 单条上限约 5000 字符；minimal 模板通常 2-3 KB，单条发即可。
    超长时自动截断并提示用户查本地文件。
    """
    from config import PROMPTS_DIR
    from dingbot import send_markdown

    day_next = _read_current_day_n() + 1
    banner = (
        f"> 🗓️ **Day{day_next} · {target}** 调仓（{prev} 收盘价为执行基准）\n"
        f"> 复制下方全文粘到对应 AI，收到 JSON 后回贴到「大仁哥」群 @我。\n\n"
    )

    targets = [("doubao", "豆包"), ("qwen", "千问")]
    for agent_id, agent_name in targets:
        path = PROMPTS_DIR / target / f"{agent_id}.md"
        if not path.exists():
            print(f"⚠️  {path} 不存在，跳过")
            continue
        body = banner + path.read_text()
        body = to_dingtalk_md(body)  # 转钉钉兼容格式
        if len(body) > 4500:
            body = body[:4400] + "\n\n... _(已截断，详见本地 automation/prompts/{}/{})_".format(target, f"{agent_id}.md")
        title = f"Day{day_next} · {agent_name} 调仓提示词（{target}）"
        try:
            send_markdown(title=title, text=body)
            print(f"✓ 已推 {agent_name} 提示词到钉钉（1 条消息）")
        except Exception as e:
            print(f"❌ 推 {agent_name} 失败: {e}")


def _prompts_already_generated(target: str) -> bool:
    """幂等检查：target 交易日的 5 份提示词是否都已生成。"""
    from config import PROMPTS_DIR
    dir_ = PROMPTS_DIR / target
    if not dir_.exists():
        return False
    required = {"beth-kindig.md", "cathie-wood.md", "doubao.md", "qwen.md", "serenity.md"}
    existing = {p.name for p in dir_.iterdir()}
    return required.issubset(existing)


def _prices_already_fetched(prev: str) -> bool:
    from config import PRICES_DIR
    return (PRICES_DIR / f"{prev}.json").exists()


def cmd_prompts(target: str, prev: str, *, force: bool = False, skip_push: bool = False):
    # 1) fetch prices（幂等）
    if _prices_already_fetched(prev) and not force:
        print(f"✓ prices/{prev}.json 已存在，跳过 fetch_prices")
    else:
        run([sys.executable, str(HERE / "fetch_prices.py"), "--date", prev])

    # 2) generate prompts（幂等）
    if _prompts_already_generated(target) and not force:
        print(f"✓ prompts/{target}/ 已完整，跳过 generate_prompts")
    else:
        run([sys.executable, str(HERE / "generate_prompts.py"), "--date", target, "--prev", prev])
        print(f"\n✅ 提示词已生成 → automation/prompts/{target}/")

    # 3) push doubao + qwen to DingTalk
    if skip_push:
        print("ℹ 跳过钉钉推送（--skip-push）")
    else:
        push_prompts_to_dingbot(target, prev)

    print("\n📋 下一步: 在群「大仁哥」贴 5 份外部 AI 决策（@我 + ```json）→ python fetch_group_decisions.py {}".format(target))


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


def _resolve_dates(args):
    """把 --target-date / --ref-date / --date 三种参数收敛到 (target, prev)。

    优先级：显式 --target-date > --date (兼容) > --ref-date → target = resolve_target(ref)
    prev 优先取 --prev；否则由 target 反推。
    """
    if args.target_date:
        target = args.target_date
    elif getattr(args, "date", None):
        target = args.date
    else:
        ref = args.ref_date or _ny_today()
        target = resolve_target(ref)
    prev = args.prev or prev_trading_day(target)
    return target, prev


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("step", choices=["prompts", "validate", "codegen", "notify", "full"])
    ap.add_argument("--target-date", default=None,
                    help="本次调仓的目标交易日 YYYY-MM-DD（推荐显式传）")
    ap.add_argument("--ref-date", default=None,
                    help="参考日历日 YYYY-MM-DD（默认 NY today）；将被解析为最近的目标交易日")
    ap.add_argument("--date", default=None,
                    help="[兼容旧参数] 等价于 --target-date")
    ap.add_argument("--prev", default=None,
                    help="上一个交易日 YYYY-MM-DD（默认由 target 反推）")
    ap.add_argument("--force", action="store_true",
                    help="忽略幂等检查，强制重跑")
    ap.add_argument("--skip-push", action="store_true",
                    help="prompts 步骤跳过钉钉推送（本地调试用）")
    args = ap.parse_args()

    target, prev = _resolve_dates(args)
    print(f"➡ target trading day = {target} · prev trading day = {prev}")

    if args.step == "prompts":
        cmd_prompts(target, prev, force=args.force, skip_push=args.skip_push)
    elif args.step == "validate":
        cmd_validate(target)
    elif args.step == "codegen":
        cmd_codegen(target, prev)
    elif args.step == "notify":
        push_summary_to_dingbot(target)
    elif args.step == "full":
        cmd_prompts(target, prev, force=args.force, skip_push=args.skip_push)
        cmd_validate(target)
        cmd_codegen(target, prev)
        push_summary_to_dingbot(target)


if __name__ == "__main__":
    main()
