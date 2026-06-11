"""从「大仁哥」群历史拉取外部 6 家 AI 的 ```json``` 决策块，写入 responses/{date}/{agent}.json。

使用流程:
  1. 用户在群里贴 6 段 ```json ... ``` 块（每段以 agent 字段标识身份）
  2. QoderWork 调用 `python fetch_group_decisions.py 2026-06-12`
  3. 脚本走 `dws chat message search-advanced --keyword '```json'` 拉最近含 json 的群消息
  4. 正则切出 ```json ... ``` 体，按 agent 字段分组写文件

预期 JSON 块 schema（与 daily_run.py prompts 模板一致）:
  {
    "agent": "chatgpt" | "gemini-ext" | "gemini-std" | "claude" | "grok" | "doubao" | "qwen",
    "date": "2026-06-12",
    "actions": [{"type": "BUY"|"SELL"|"HOLD", "symbol": "NVDA", "shares": 5, "price": 218.50}],
    "cash_after": 1234.56,
    "holdings": [{"symbol": "NVDA", "shares": 10, "avgCost": 220.0}],
    "total_assets": 9876.54
  }

CLI:
  python fetch_group_decisions.py 2026-06-12
  python fetch_group_decisions.py 2026-06-12 --limit 12
"""
import json
import re
import subprocess
import sys
from pathlib import Path

from config import DINGBOT_GROUP_CID, RESPONSES_DIR

JSON_BLOCK_RE = re.compile(r"```json\s*\n(.*?)\n```", re.DOTALL)
EXPECTED_AGENTS = {
    "chatgpt", "gemini-ext", "gemini-std", "claude", "grok", "doubao", "qwen",
    # 三大师由 cron 内嵌 quant-guru-desk 走，群里通常不出现，但保留兼容
    "cathie-wood", "beth-kindig", "serenity",
}


def fetch_recent_json_messages(limit: int = 12) -> list:
    """调用 dws chat message search-advanced 拉群里最近含 ```json 的消息。"""
    cmd = [
        "dws", "chat", "message", "search-advanced",
        "--conversation-id", DINGBOT_GROUP_CID,
        "--keyword", "```json",
        "--format", "json",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        raise RuntimeError(f"dws 调用失败: {result.stderr}")
    payload = json.loads(result.stdout)
    if not payload.get("success"):
        raise RuntimeError(f"dws 返回失败: {payload.get('errorMsg')}")
    messages = payload.get("result", {}).get("messages", []) or []
    return messages[:limit]


def extract_json_blocks(messages: list) -> list:
    """从消息列表中提取所有 ```json``` 块，解析为 dict 列表。"""
    blocks = []
    for msg in messages:
        # dws 消息体字段名待确认，常见为 content / text / messageContent
        content = msg.get("content") or msg.get("text") or msg.get("messageContent") or ""
        if isinstance(content, dict):
            content = content.get("content") or content.get("text") or json.dumps(content)
        for match in JSON_BLOCK_RE.finditer(content):
            raw = match.group(1).strip()
            try:
                blocks.append(json.loads(raw))
            except json.JSONDecodeError as e:
                print(f"⚠️  跳过非法 JSON 块: {e}", file=sys.stderr)
    return blocks


def write_responses(date: str, blocks: list) -> dict:
    """按 agent 分组写入 responses/{date}/{agent}.json。"""
    out_dir = RESPONSES_DIR / date
    out_dir.mkdir(parents=True, exist_ok=True)
    by_agent = {}
    for block in blocks:
        agent = block.get("agent")
        if agent not in EXPECTED_AGENTS:
            print(f"⚠️  未知 agent 字段: {agent}", file=sys.stderr)
            continue
        if block.get("date") != date:
            print(f"⚠️  跳过日期不符的块: {agent} date={block.get('date')}", file=sys.stderr)
            continue
        # 同一 agent 取最新一条（群里最新消息排在前面）
        if agent in by_agent:
            continue
        by_agent[agent] = block
        path = out_dir / f"{agent}.json"
        path.write_text(json.dumps(block, ensure_ascii=False, indent=2))
        print(f"✓ {agent}.json 已写入")
    return by_agent


def main():
    if len(sys.argv) < 2:
        print("用法: python fetch_group_decisions.py YYYY-MM-DD [--limit N]")
        sys.exit(1)
    date = sys.argv[1]
    limit = 12
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])

    print(f"→ 拉取群「大仁哥」最近 {limit} 条含 ```json 消息...")
    messages = fetch_recent_json_messages(limit=limit)
    print(f"  拿到 {len(messages)} 条消息")

    blocks = extract_json_blocks(messages)
    print(f"  解析出 {len(blocks)} 个 JSON 块")

    written = write_responses(date, blocks)
    expected_external = {"chatgpt", "gemini-ext", "gemini-std", "claude", "grok"}
    missing = expected_external - set(written.keys())
    if missing:
        print(f"\n❌ 还缺这些外部 AI 的决策: {sorted(missing)}", file=sys.stderr)
        sys.exit(2)
    print(f"\n✅ 外部 5 家全部到位: {sorted(written.keys())}")


if __name__ == "__main__":
    main()
