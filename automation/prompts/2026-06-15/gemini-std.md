# Gemini(标准) · Day9 调仓提示词（2026-06-15）

> **裁判口径**：买卖均按 **前一交易日（2026-06-12）收盘价** 执行。  
> 现金不得透支（cash_after ≥ 0）。编造价格 / 算术错误一经发现强制修正。

## 你的当前持仓快照（2026-06-12 收盘后）

- 累计收益率：-6.91%
- 总资产：$9286.16
- 现金：$227.42（2.4%）
- 持仓：

| Symbol | Shares | AvgCost | LastClose | MV | Weight |
|---|---|---|---|---|---|
| NVDA | 28 | $216.86 | $205.19 | $5745.32 | 63.3% |
| QQQ | 3 | $746.00 | $721.34 | $2164.02 | 23.8% |
| MSFT | 3 | $441.00 | $390.74 | $1172.22 | 12.9% |

## 候选股票参考价（2026-06-12 收盘）

| Symbol | Sector | Close |
|---|---|---|
| NVDA | 半导体 | $205.19 |
| MSFT | 软件 | $390.74 |
| GOOGL | 互联网 | $359.68 |
| META | 社交媒体 | $566.98 |
| AMZN | 电商/云 | $238.55 |
| AAPL | 消费电子 | $291.13 |
| AVGO | 半导体 | $382.07 |
| TSM | 半导体 | $423.93 |
| PLTR | 软件 | $127.99 |
| COHR | 光模块 | $385.03 |
| MRVL | 半导体 | $279.70 |
| BE | 电力 | $260.22 |
| APP | 软件 | $496.77 |
| TSLA | 汽车 | $406.43 |
| TEM | 医药 | $47.82 |
| SPY | 宽基ETF | $741.75 |
| QQQ | 科技ETF | $721.34 |
| VOO | 宽基ETF | $681.95 |
| XLV | 医药 | $153.81 |
| GLD | 黄金 | $386.54 |
| SCHD | 红利ETF | $32.82 |
| JNJ | 医药 | $240.87 |
| V | 金融 | $322.39 |

## 板块当日表现（2026-06-12）

COHR +5.9% · CRCL -5.8% · AMD +4.7% · BE +4.6% · APP +3.8% · GEV +3.7%

---

## 输出要求（务必严格遵守）

### 1. 文字部分（≤ 200 字）

简述今日决策思路 + 最强反方观点。

### 2. JSON 块（必须放在 ```json ... ``` 代码块中，schema_version=1.0）

```json
{
  "schema_version": "1.0",
  "agent_id": "gemini-std",
  "agent_name": "Gemini(标准)",
  "date": "2026-06-15",
  "exec_price_basis": "previous_close",
  "actions": [
    {"type": "BUY|SELL|HOLD", "symbol": "XXX", "shares": 0, "price": 0.00, "rationale": "≤50字"}
  ],
  "holdings_after": [
    {"symbol": "XXX", "shares": 0, "avg_cost": 0.00}
  ],
  "cash_after": 0.00,
  "total_assets_after": 0.00,
  "return_pct_cumulative": 0.00,
  "summary": "≤200字投资逻辑",
  "confidence": "low|medium|high",
  "strongest_bear_case": "≤200字最强反方"
}
```

### 3. 算术约束（裁判将逐条核对）

1. `Σ(shares × current_price for each holding) + cash_after ≈ total_assets_after`（误差 < $1）
2. `cash_after ≥ 0`
3. 所有 `actions[].price` 必须等于参考价表中的收盘价（偏差 > 5% 视为造假，强制修正）
4. `holdings_after` 必须反映 actions 应用后的最终持仓（HOLD 项也要列出）
5. avg_cost 在 BUY 后按加权平均更新；SELL 不改 avg_cost；清仓后从 holdings_after 删除该 symbol

### 4. 风格约束

- 保持你一贯的投资风格：成长型 · 三票极简
- 单股集中度软上限：50%
- 现金带宽：5-15%

---

**记住**：JSON 块是机器解析入口，文字部分是人读，两者必须一致。再造假即清仓重建。
