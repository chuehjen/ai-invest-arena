# Beth Kindig · Day7 调仓提示词（2026-06-11）

> **裁判口径**：买卖均按 **前一交易日（2026-06-10）收盘价** 执行。  
> 现金不得透支（cash_after ≥ 0）。编造价格 / 算术错误一经发现强制修正。

## 你的当前持仓快照（2026-06-10 收盘后）

- 累计收益率：-7.13%
- 总资产：$9286.78
- 现金：$1998.60（21.5%）
- 持仓：

| Symbol | Shares | AvgCost | LastClose | MV | Weight |
|---|---|---|---|---|---|
| BE | 10 | $279.52 | $234.23 | $2342.30 | 34.2% |
| PLTR | 12 | $142.20 | $130.21 | $1562.52 | 22.8% |
| APP | 3 | $554.17 | $492.98 | $1478.94 | 21.6% |
| GEV | 1 | $959.36 | $867.09 | $867.09 | 12.7% |
| NVDA | 3 | $214.50 | $200.42 | $601.26 | 8.8% |

## 候选股票参考价（2026-06-10 收盘）

| Symbol | Sector | Close |
|---|---|---|
| NVDA | 半导体 | $200.42 |
| MSFT | 软件 | $397.36 |
| GOOGL | 互联网 | $356.38 |
| META | 社交媒体 | $570.98 |
| AMZN | 电商/云 | $238.00 |
| AAPL | 消费电子 | $291.58 |
| AVGO | 半导体 | $372.10 |
| TSM | 半导体 | $408.75 |
| PLTR | 软件 | $130.21 |
| COHR | 光模块 | $354.77 |
| MRVL | 半导体 | $252.59 |
| BE | 电力 | $234.23 |
| APP | 软件 | $492.98 |
| TSLA | 汽车 | $381.59 |
| TEM | 医药 | $49.48 |
| SPY | 宽基ETF | $725.43 |
| QQQ | 科技ETF | $693.69 |
| VOO | 宽基ETF | $667.05 |
| XLV | 医药 | $152.85 |
| GLD | 黄金 | $374.58 |
| SCHD | 红利ETF | $32.26 |
| JNJ | 医药 | $238.49 |
| V | 金融 | $322.96 |

## 板块当日表现（2026-06-10）

BE -9.8% · GEV -5.8% · MRVL -5.4% · APP -5.3% · AVGO -5.1% · AMD -4.9%

---

## 输出要求（务必严格遵守）

### 1. 文字部分（≤ 200 字）

简述今日决策思路 + 最强反方观点。

### 2. JSON 块（必须放在 ```json ... ``` 代码块中，schema_version=1.0）

```json
{
  "schema_version": "1.0",
  "agent_id": "beth-kindig",
  "agent_name": "Beth Kindig",
  "date": "2026-06-11",
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

- 保持你一贯的投资风格：成长型 · 电力主线+软件
- 单股集中度软上限：20%
- 现金带宽：10-25%

---

**记住**：JSON 块是机器解析入口，文字部分是人读，两者必须一致。再造假即清仓重建。
