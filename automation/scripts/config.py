"""共享配置：API key / 路径 / 30 symbols / agent 元信息"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRICES_DIR = ROOT / "prices"
RESPONSES_DIR = ROOT / "responses"
PROMPTS_DIR = ROOT / "prompts"
LOGS_DIR = ROOT / "logs"
SCHEMA_PATH = ROOT / "schema" / "decision.schema.json"
TEMPLATE_PATH = ROOT / "templates" / "daily_prompt.md.tpl"
DATA_TS_PATH = ROOT.parent / "src" / "data" / "competitionData.ts"

TWELVE_DATA_KEY = "6bc32203d6de416698c9b17a59459f93"
TWELVE_DATA_BASE = "https://api.twelvedata.com"

# 当前竞赛 30 symbols（从 Day6 实测整理，sector 与 Portfolio.tsx 同步）
SYMBOLS = [
    "NVDA", "MRVL", "BE", "XOM", "AAPL", "JPM", "MSFT", "QQQ",
    "TEM", "SHOP", "TSLA", "HOOD", "CRSP", "PLTR", "COIN", "CRCL",
    "GOOGL", "META", "AMZN", "APP", "COHR", "GEV", "GLD", "JNJ",
    "LITE", "SCHD", "V", "VOO", "XLV", "SPY", "AVGO", "TSM",
    "AMD", "MU", "IWM",
]

SECTOR_MAP = {
    "NVDA": "半导体", "MRVL": "半导体", "AVGO": "半导体", "TSM": "半导体", "AMD": "半导体", "MU": "半导体",
    "BE": "电力", "GEV": "电力", "XOM": "能源",
    "AAPL": "消费电子",
    "JPM": "金融", "V": "金融", "HOOD": "金融", "COIN": "金融", "CRCL": "金融",
    "MSFT": "软件", "PLTR": "软件", "APP": "软件",
    "QQQ": "科技ETF", "VOO": "宽基ETF", "SPY": "宽基ETF", "IWM": "宽基ETF", "SCHD": "红利ETF",
    "TEM": "医药", "JNJ": "医药", "XLV": "医药", "CRSP": "生物科技",
    "SHOP": "电商/云", "AMZN": "电商/云",
    "TSLA": "汽车",
    "GOOGL": "互联网",
    "META": "社交媒体",
    "COHR": "光模块", "LITE": "光模块",
    "GLD": "黄金",
}

# 10 个 agent 元信息
AGENTS = [
    {"id": "claude",       "name": "Claude",         "color": "#a78bfa", "style": "均衡型 · 双重对冲",        "position_limit": "30%", "cash_band": "10-25%"},
    {"id": "doubao",       "name": "豆包",           "color": "#f472b6", "style": "均衡分散 · 宽基+防御",     "position_limit": "30%", "cash_band": "5-15%"},
    {"id": "cathie-wood",  "name": "木头姐",         "color": "#818cf8", "style": "颠覆创新 · 五大平台",      "position_limit": "12%", "cash_band": "5-15%"},
    {"id": "gemini-ext",   "name": "Gemini(深度)",   "color": "#60a5fa", "style": "成长型 · 行业集中",         "position_limit": "35%", "cash_band": "0-10%"},
    {"id": "grok",         "name": "Grok",           "color": "#fb923c", "style": "成长型 · AI 主题集中",      "position_limit": "30%", "cash_band": "0-15%"},
    {"id": "gemini-std",   "name": "Gemini(标准)",   "color": "#38bdf8", "style": "成长型 · 三票极简",        "position_limit": "50%", "cash_band": "5-15%"},
    {"id": "chatgpt",      "name": "ChatGPT",        "color": "#4ade80", "style": "成长型 · AI 主线集中",     "position_limit": "30%", "cash_band": "0-10%"},
    {"id": "beth-kindig",  "name": "Beth Kindig",    "color": "#fb7185", "style": "成长型 · 电力主线+软件",    "position_limit": "20%", "cash_band": "10-25%"},
    {"id": "serenity",     "name": "Serenity",       "color": "#2dd4bf", "style": "光互连 · 算力瓶颈集中",     "position_limit": "30%", "cash_band": "5-15%"},
    {"id": "qwen",         "name": "千问",           "color": "#fbbf24", "style": "成长型 · 进攻+防御对冲",   "position_limit": "30%", "cash_band": "10-25%"},
]

# 候选股参考池（用于提示词「候选股参考价」表）
CANDIDATE_POOL = ["NVDA", "MSFT", "GOOGL", "META", "AMZN", "AAPL", "AVGO", "TSM",
                  "PLTR", "COHR", "MRVL", "BE", "APP", "TSLA", "TEM",
                  "SPY", "QQQ", "VOO", "XLV", "GLD", "SCHD", "JNJ", "V"]
