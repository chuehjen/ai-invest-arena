# AI 投资竞赛 · AI Invest Arena

> 10 位 AI / 投资大师人格各持 $10,000 虚拟资金，每个美股交易日 21:00 CST 调仓一次，30 天后见真章。
> 看板部署：https://chuehjen.github.io/ai-invest-arena/

## 参赛者（10 位）

| 类别 | 参赛者 | 风格 | 数据源 |
|---|---|---|---|
| 大师（cron 自动） | Serenity | 光互连 · 算力瓶颈集中 | quant-guru-desk skill |
| 大师（cron 自动） | Beth Kindig | 成长型 · 电力主线+软件 | quant-guru-desk skill |
| 大师（cron 自动） | Cathie Wood | 颠覆创新 · 五大平台 | quant-guru-desk skill |
| 外部 AI（人工贴） | ChatGPT / Claude / Gemini ×2 / Grok | 各家风格 | 人工复制提示词到各家网页 |
| 外部 AI（钉钉推） | 豆包 / 千问 | 各家风格 | 钉钉群「大仁哥」每日 20:30 推送 |

## 项目结构

```
ai-invest-arena/
├── public/data/
│   ├── latest.json              ← 前端 fetch 主数据源（CDN: GitHub raw）
│   └── archive/YYYY-MM-DD.json  ← 每日快照归档
├── src/
│   ├── components/              ← React 页面（Dashboard/Leaderboard/Portfolio/...）
│   ├── data/
│   │   ├── usePrices.tsx        ← 三级数据回退（GitHub raw → Supabase → bundled）
│   │   └── snapshot.json        ← bundled 兜底快照
│   ├── services/
│   │   ├── supabaseClient.ts    ← @supabase/supabase-js 直连
│   │   └── snapshotService.ts   ← Supabase 读写
│   └── types/env.d.ts           ← process.env 类型声明
├── automation/
│   ├── scripts/
│   │   ├── daily_run.py         ← orchestrator (prompts / validate / codegen / full)
│   │   ├── fetch_prices.py      ← Twelve Data 收盘价
│   │   ├── generate_prompts.py  ← 生成 5 份提示词
│   │   ├── validate_response.py ← JSON schema + 算术校验
│   │   ├── codegen_data.py      ← 合并 responses → latest.json
│   │   ├── upload_supabase.py   ← 上传快照到 Supabase
│   │   ├── dingbot.py           ← 钉钉 webhook
│   │   └── config.py            ← 集中配置（.env / os.getenv）
│   ├── prompts/{date}/          ← 每日提示词（5 份 md）
│   ├── responses/{date}/        ← 每日回复（10 份 JSON）
│   ├── prices/{date}.json       ← 每日收盘价
│   ├── schema/decision.schema.json
│   └── templates/*.md.tpl       ← 提示词模板（完整版 + 精简版）
├── migrations/
│   └── 001_ai_invest_snapshots.sql   ← Supabase 建表脚本
├── .github/workflows/
│   ├── deploy-pages.yml         ← 推 main 触发前端部署
│   └── daily-prices.yml         ← 每日 20:30 CST 拉价+提示词+钉钉推送
├── .env.example                 ← 环境变量清单模板
├── webpack.config.js            ← 前端构建（子路径部署 + DefinePlugin 注入 env）
└── package.json                 ← React 18 + @supabase/supabase-js
```

## 本地开发

```bash
# 1. 安装前端依赖
npm install

# 2. 配环境变量（首次）
cp .env.example .env
# 编辑 .env 填入 SUPABASE_URL / SUPABASE_ANON_KEY（可选，前端回落 GitHub raw 主源）

# 3. 启动 dev server（端口 3266）
npm run dev
# 访问 http://localhost:3266/

# 4. 类型检查
npm run typecheck
```

> **本地 dev 陷阱**：无 `window.ONEDAY_CONFIG.url_id` 时 SDK 会 throw 中断 bundle。
> 已在 `index.html` 内联脚本处理 localhost 自动注入，无需 `?id=xxx` 参数。

## 环境变量清单

| 变量 | 必需 | 用途 | 获取 |
|---|---|---|---|
| `TWELVE_DATA_KEY` | ✅ | 美股收盘价 | https://twelvedata.com |
| `SUPABASE_URL` | ⚠️ 前端可选 | Supabase 项目 URL | https://supabase.com |
| `SUPABASE_ANON_KEY` | ⚠️ 前端可选 | Supabase anon key | Supabase 项目 → Settings → API |
| `SUPABASE_SERVICE_KEY` | ⚠️ 后端可选 | Supabase service_role（上传用） | 同上 |
| `DINGBOT_WEBHOOK` | ⚠️ 可选 | 钉钉机器人 webhook | 钉钉群设置 → 智能群助手 |
| `GITHUB_PAGES` | 仅 CI | `true` 时构建子路径 `/ai-invest-arena/` | GitHub Actions 注入 |

未配置 Supabase 时前端会回落 GitHub raw 主源（`raw.githubusercontent.com/.../latest.json`），看板功能完全可用。

## 每日流水线（L2 模式）

```
[GitHub Actions 20:30 CST]              [QoderWork cron 21:00 CST]
  daily_run.py prompts                    quant-guru-desk skill
  ├─ fetch_prices.py                      └─ 读取 prompts/{date}/{guru}.md
  ├─ generate_prompts.py                  └─ 生成 3 大师调仓 JSON
  │   ├─ serenity.md (完整)
  │   ├─ beth-kindig.md (完整)
  │   ├─ cathie-wood.md (完整)
  │   ├─ doubao.md (精简)
  │   └─ qwen.md (精简)
  └─ dingbot 推豆包 + 千问（2 条消息）
                                           ↓
                                [人工：贴 7 家外部 AI 提示词]
                                           ↓
                                [收集 7 份 JSON 回复]
                                           ↓
                                [QoderWork 会话：取决策]
                                           ↓
                                validate + codegen + push
                                           ↓
                                git push github main
                                           ↓
                          ┌────────────────┴─────────────────┐
                          ↓                                   ↓
                GitHub Actions deploy               前端 fetch latest.json
                → 部署到 gh-pages                              ↓
                                              GitHub Pages 上线
```

## 手动命令

```bash
# 一键：拉价 + 生成 5 份提示词 + 推钉钉（每日 20:30 也可手动触发）
cd automation/scripts
python daily_run.py prompts --date 2026-06-16

# 校验 responses/{date}/*.json
python daily_run.py validate --date 2026-06-16

# 合并 responses → public/data/latest.json + 上传 Supabase
python daily_run.py codegen --date 2026-06-16

# 全流程（prompts + validate + codegen + 钉钉通知）
python daily_run.py full --date 2026-06-16
```

## GitHub Pages 部署（首次配置）

1. 仓库 Settings → Pages → Source: **GitHub Actions**（不是 branch）
2. 仓库 Settings → Actions → General → Workflow permissions → **Read and write permissions**
3. 推任意提交到 `main` 分支，触发 `deploy-pages.yml` workflow
4. Actions 跑完后访问 https://chuehjen.github.io/ai-invest-arena/

## 数据回退机制（前端）

```
usePrices.tsx
  ├─ 1) fetch GitHub raw latest.json  (主源，5min cache)
  ├─ 2) Supabase 取最新行           (二级备份，date >= bundled 才用)
  └─ 3) import './snapshot.json'       (bundled 兜底，最差也是上次 push 的快照)
```

## 技术栈

- **前端**：React 18 + Recharts + Tailwind CSS + TypeScript + Webpack
- **后端**：Python 3.11 + urllib（零依赖）
- **数据**：GitHub Raw CDN（主）+ Supabase（备）
- **部署**：GitHub Pages + GitHub Actions
- **通知**：钉钉自定义机器人 webhook

## 许可证

私有项目，仅供个人使用。
