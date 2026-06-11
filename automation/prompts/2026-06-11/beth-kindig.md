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
| BE | 10 | $279.52 | $259.61 | $2596.10 | 35.6% |
| PLTR | 12 | $142.20 | $132.07 | $1584.84 | 21.7% |
| APP | 3 | $554.17 | $520.84 | $1562.52 | 21.4% |
| GEV | 1 | $959.36 | $920.15 | $920.15 | 12.6% |
| NVDA | 3 | $214.50 | $208.19 | $624.57 | 8.6% |

## 候选股票参考价（2026-06-10 收盘）

| Symbol | Sector | Close |
|---|---|---|
| NVDA | 半导体 | $208.19 |
| MSFT | 软件 | $403.41 |
| GOOGL | 互联网 | $364.26 |
| META | 社交媒体 | $584.59 |
| AMZN | 电商/云 | $244.19 |
| AAPL | 消费电子 | $290.55 |
| AVGO | 半导体 | $392.16 |
| TSM | 半导体 | $427.92 |
| PLTR | 软件 | $132.07 |
| COHR | 光模块 | $355.94 |
| MRVL | 半导体 | $266.88 |
| BE | 电力 | $259.61 |
| APP | 软件 | $520.84 |
| TSLA | 汽车 | $396.68 |
| TEM | 医药 | $48.82 |
| SPY | 宽基ETF | $737.05 |
| QQQ | 科技ETF | $707.83 |
| VOO | 宽基ETF | $677.70 |
| XLV | 医药 | $154.57 |
| GLD | 黄金 | $390.78 |
| SCHD | 红利ETF | $32.39 |
| JNJ | 医药 | $237.00 |
| V | 金融 | $325.05 |

## 板块当日表现（2026-06-10）

NVDA +0.0% · MRVL +0.0% · BE +0.0% · XOM +0.0% · AAPL +0.0% · JPM +0.0%

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
