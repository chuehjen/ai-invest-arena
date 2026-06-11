# AI Invest Arena · Automation

每日竞赛流水线脚本。把"读语雀+人肉算账+手写 TS"压缩成 3 行命令。

## 流程总览

```
[T+0 21:00 调仓时刻]
  ├─ fetch_prices.py   →  prices/{prev}.json   (Twelve Data 收盘价)
  ├─ generate_prompts.py → prompts/{today}/{agent}.md  (10 份)
  ↓ [人工：贴提示词给 6 家外部 AI；3 大师走 quant-guru cron]
  ├─ responses/{today}/{agent}.json  (AI 回复 JSON 块)
  ├─ validate_response.py  →  *.validation.json + 控制台报告
  ├─ codegen_data.py   →  src/data/competitionData.ts
  └─ [人工或 CI] git commit + push
```

## 一键命令

```bash
# 21:00 之前：拉价 + 生成提示词
python automation/scripts/daily_run.py prompts --date 2026-06-11

# AI 回复落盘后：校验 + 写 TS
python automation/scripts/daily_run.py validate --date 2026-06-11
python automation/scripts/daily_run.py codegen  --date 2026-06-11

# 跨步骤一锅炒
python automation/scripts/daily_run.py full     --date 2026-06-11
```

## JSON 输出协议

每个 AI 在每日提示词末尾必须输出 ```json``` 块：

```json
{
  "schema_version": "1.0",
  "agent_id": "claude",
  "date": "2026-06-11",
  "exec_price_basis": "previous_close",
  "actions": [
    {"type": "BUY", "symbol": "XLV", "shares": 3, "price": 154.57, "rationale": "防御加仓"}
  ],
  "holdings_after": [
    {"symbol": "GOOGL", "shares": 6, "avg_cost": 365.51}
  ],
  "cash_after": 1597.64,
  "total_assets_after": 9755.52,
  "return_pct_cumulative": -2.44,
  "summary": "200 字内投资逻辑",
  "confidence": "medium",
  "strongest_bear_case": "200 字内最强反方"
}
```

完整 schema：`automation/schema/decision.schema.json`

## 校验规则

`validate_response.py` 检查：

1. **Schema** — 必需字段齐全
2. **Cash ≥ 0** — 透支视为违规
3. **算术** — `Σ(shares × current_price) + cash ≈ total_assets`，误差 < $1
4. **价格偏差** — `actions[].price` 与官方收盘偏差 > 5% 视为造假强制修正
5. **持仓一致性** — actions 应用后是否等于 holdings_after

任一项失败 → 退出码 1 → orchestrator 停在该步。

## 目录结构

```
automation/
├── README.md
├── schema/decision.schema.json
├── templates/daily_prompt.md.tpl
├── scripts/
│   ├── config.py            # 共享：API key / 30 symbols / agent 元
│   ├── ts_state.py          # 解析 competitionData.ts 末态
│   ├── fetch_prices.py      # Twelve Data 拉价
│   ├── generate_prompts.py  # 生成 10 份提示词
│   ├── validate_response.py # 校验 JSON
│   ├── codegen_data.py      # 渲染 competitionData.ts
│   └── daily_run.py         # orchestrator
├── prices/{date}.json       # 收盘价快照
├── prompts/{date}/{id}.md   # 当日提示词
├── responses/{date}/{id}.json  # AI 回复 + .validation.json
└── logs/                    # 运行日志
```

## 后续 P1+ 待办

- [ ] `submit_decisions.py` — 千问/豆包/Gemini API 自动投递
- [ ] `.github/workflows/daily.yml` — GitHub Actions 替代本地 cron
- [ ] 钉钉机器人推送日报（排行 + alpha vs SPY）
- [ ] HOLD prior_action_id 与 SPY benchmark 接入
