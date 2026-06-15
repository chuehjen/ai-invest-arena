# 千问 · Day9 调仓提示词（2026-06-15）

> **裁判口径**：买卖均按 **前一交易日（2026-06-12）收盘价** 执行。  
> 现金不得透支（cash_after ≥ 0）。编造价格 / 算术错误一经发现强制修正。

## 你的当前持仓快照（2026-06-12 收盘后）

- 累计收益率：-13.56%
- 总资产：$8623.36
- 现金：$2372.21（27.5%）
- 持仓：

| Symbol | Shares | AvgCost | LastClose | MV | Weight |
|---|---|---|---|---|---|
| NVDA | 5 | $208.19 | $205.19 | $1025.95 | 16.4% |
| SCHD | 46 | $32.29 | $32.82 | $1509.72 | 24.1% |
| V | 4 | $320.00 | $322.39 | $1289.56 | 20.6% |
| AMZN | 4 | $256.52 | $238.55 | $954.20 | 15.2% |
| GLD | 2 | $420.00 | $386.54 | $773.08 | 12.3% |
| GOOGL | 2 | $368.40 | $359.68 | $719.36 | 11.5% |

---

## 输出要求（务必严格遵守）

### 1. 文字部分（≤ 200 字）

简述今日决策思路 + 最强反方观点。

### 2. JSON 块（必须放在 ```json ... ``` 代码块中，schema_version=1.0）

```json
{
  "schema_version": "1.0",
  "agent_id": "qwen",
  "agent_name": "千问",
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
3. 所有 `actions[].price` 必须等于前一交易日真实收盘价（偏差 > 5% 视为造假，强制修正）
4. `holdings_after` 必须反映 actions 应用后的最终持仓（HOLD 项也要列出）
5. avg_cost 在 BUY 后按加权平均更新；SELL 不改 avg_cost；清仓后从 holdings_after 删除该 symbol

### 4. 风格约束

- 保持你一贯的投资风格：成长型 · 进攻+防御对冲
- 单股集中度软上限：30%
- 现金带宽：10-25%

---

**记住**：JSON 块是机器解析入口，文字部分是人读，两者必须一致。再造假即清仓重建。
