"""钉钉自定义机器人 webhook 封装

每条消息必须包含关键词「情报采集」（机器人配置里设置的），否则钉钉服务端会返回 errcode=310000。
本模块自动给所有 send 调用前缀注入关键词，调用方不用关心。

用法:
  from dingbot import send_text, send_markdown
  send_text("Day7 三大师同步完成 ✓")
  send_markdown(title="Day7 战报", text="### Top3\\n- Claude 🥇\\n- 豆包 🥈")

CLI:
  python dingbot.py text "正文"
  python dingbot.py md "标题" "Markdown 正文"
"""
import json
import sys
import urllib.request
from typing import Optional

from config import DINGBOT_WEBHOOK, DINGBOT_KEYWORD


def _post(payload: dict) -> dict:
    """发 POST 请求到 webhook，返回钉钉响应 JSON。"""
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        DINGBOT_WEBHOOK,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode("utf-8")
        return json.loads(body)


def _inject_keyword(text: str) -> str:
    """若正文不含关键词，自动前缀注入。"""
    if DINGBOT_KEYWORD in text:
        return text
    return f"[{DINGBOT_KEYWORD}] {text}"


def send_text(content: str, at_mobiles: Optional[list] = None, at_all: bool = False) -> dict:
    """发文本消息。

    Args:
        content: 正文（自动注入关键词）。
        at_mobiles: @ 的手机号列表。
        at_all: 是否 @ 全员。
    """
    payload = {
        "msgtype": "text",
        "text": {"content": _inject_keyword(content)},
        "at": {"atMobiles": at_mobiles or [], "isAtAll": at_all},
    }
    return _post(payload)


def send_markdown(title: str, text: str, at_mobiles: Optional[list] = None, at_all: bool = False) -> dict:
    """发 Markdown 消息。

    Args:
        title: 通知卡片标题（钉钉对话列表预览用）。
        text: Markdown 正文（自动注入关键词到首行）。
    """
    payload = {
        "msgtype": "markdown",
        "markdown": {
            "title": _inject_keyword(title),
            "text": _inject_keyword(text),
        },
        "at": {"atMobiles": at_mobiles or [], "isAtAll": at_all},
    }
    return _post(payload)


def send_link(title: str, text: str, message_url: str, pic_url: str = "") -> dict:
    """发链接消息（带封面，点击跳看板）。"""
    payload = {
        "msgtype": "link",
        "link": {
            "title": _inject_keyword(title),
            "text": _inject_keyword(text),
            "messageUrl": message_url,
            "picUrl": pic_url,
        },
    }
    return _post(payload)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("用法: python dingbot.py text|md|link <args>")
        sys.exit(1)
    mode = sys.argv[1]
    if mode == "text":
        result = send_text(sys.argv[2])
    elif mode == "md":
        result = send_markdown(sys.argv[2], sys.argv[3])
    elif mode == "link":
        result = send_link(sys.argv[2], sys.argv[3], sys.argv[4])
    else:
        print(f"未知模式: {mode}")
        sys.exit(1)
    print(json.dumps(result, ensure_ascii=False))
