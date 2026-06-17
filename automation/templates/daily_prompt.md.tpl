# {{AGENT_NAME}} · Day{{DAY_N}} 调仓提示词（{{DATE}}）

> **裁判口径**：**买入**按前一交易日（{{PREV_TRADING_DATE}}）**收盘价**执行；**卖出**可按前一交易日 **O/H/L/C 任一价格**执行。
> 现金不得透支（cash_after ≥ 0）。编造价格 / 算术错误一经发现强制修正。

## 你的当前持仓快照（{{PREV_TRADING_DATE}} 收盘后）

- 累计收益率：{{PREV_RETURN_PCT}}%
- 总资产：${{PREV_TOTAL_ASSETS}}
- 现金：${{PREV_CASH}}（{{PREV_CASH_PCT}}%）
- 持仓：

{{HOLDINGS_TABLE}}

## 候选股票参考价（{{PREV_TRADING_DATE}} OHLC）

{{CANDIDATE_PRICES_TABLE}}

## 板块当日表现（{{PREV_TRADING_DATE}}）

{{SECTOR_MOVES}}

---

## 输出要求（务必严格遵守）

### 1. 文字部分（≤ 200 字）

简述今日决策思路 + 最强反方观点。

### 2. JSON 块（必须放在 ```json ... ``` 代码块中，schema_version=1.0）

```json
{
  "schema_version": "1.0",
  "agent_id": "{{AGENT_ID}}",
  "agent_name": "{{AGENT_NAME}}",
  "date": "{{DATE}}",
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
3. **BUY** `actions[].price` 必须等于参考价表中的收盘价（偏差 > 5% 视为造假，强制修正）；**SELL** `actions[].price` 必须是参考价表中 O/H/L/C 之一（偏差 > 5% 视为造假）
4. `holdings_after` 必须反映 actions 应用后的最终持仓（HOLD 项也要列出）
5. avg_cost 在 BUY 后按加权平均更新；SELL 不改 avg_cost；清仓后从 holdings_after 删除该 symbol

### 4. 风格约束

- 保持你一贯的投资风格：{{STYLE}}
- 单股集中度软上限：{{POSITION_LIMIT}}
- 现金带宽：{{CASH_BAND}}

---

**记住**：JSON 块是机器解析入口，文字部分是人读，两者必须一致。再造假即清仓重建。
