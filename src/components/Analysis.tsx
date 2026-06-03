import React, { useState } from 'react';

const presetQA: Record<string, string> = {
  '当前市场风险如何': '当前市场整体风险偏高，建议适当降低仓位。科技板块估值偏高，可考虑获利了结部分头寸，同时增加防御性资产配置比例。',
  '推荐哪些股票': '基于当前量化模型，重点关注：NVDA（AI算力需求持续旺盛）、MSFT（云业务稳健增长）、AMZN（电商复苏+AWS加速）。建议分批建仓，控制单票仓位不超过20%。',
  '如何优化我的策略': '建议引入动量因子与价值因子的组合策略，同时加入波动率过滤机制。历史回测显示，该组合策略年化收益可提升约8-12%，最大回撤控制在15%以内。',
  '市场什么时候反弹': '基于技术面分析，当前指数处于关键支撑位附近，RSI指标显示超卖信号。预计短期内（1-2周）有反弹概率约65%，但中期趋势仍需观察宏观数据。',
};

const defaultReplies = [
  '根据我的分析模型，当前市场处于震荡整理阶段，建议保持谨慎，等待明确信号后再加仓。',
  '您的问题很有价值！基于历史数据和当前市场环境，我建议关注高质量成长股，同时做好风险对冲。',
  '从量化角度来看，当前市场的夏普比率有所下降，建议优化持仓结构，提高组合的风险调整后收益。',
];

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const Analysis: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: '您好！我是AI投资分析助手。我可以帮您分析市场趋势、评估投资风险、优化投资策略。请问有什么可以帮您？' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userMessage: Message = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const matchedKey = Object.keys(presetQA).find(key => trimmed.includes(key));
      const reply = matchedKey
        ? presetQA[matchedKey]
        : defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
      setMessages(prev => [...prev, { role: 'ai', content: reply }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const strategies = [
    { name: 'LSTM神经网络', accuracy: 72, sharpe: 1.85, drawdown: '-12%', speed: '中', complexity: '高' },
    { name: '强化学习(RL)', accuracy: 68, sharpe: 2.10, drawdown: '-9%', speed: '慢', complexity: '极高' },
    { name: '多因子模型', accuracy: 65, sharpe: 1.62, drawdown: '-8%', speed: '快', complexity: '中' },
    { name: '动量策略', accuracy: 61, sharpe: 1.38, drawdown: '-15%', speed: '极快', complexity: '低' },
  ];

  const riskMetrics = [
    { label: '年化波动率', value: 18.4, max: 40, unit: '%', color: 'bg-yellow-500' },
    { label: 'Beta系数', value: 1.24, max: 2, unit: '', color: 'bg-blue-500' },
    { label: 'VaR (95%)', value: 3.2, max: 10, unit: '%', color: 'bg-red-500' },
    { label: '夏普比率', value: 2.41, max: 4, unit: '', color: 'bg-green-500' },
  ];

  const suggestions = [
    {
      icon: 'fa-arrow-trend-up',
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      title: '增持AI算力板块',
      desc: '英伟达、AMD等AI芯片股受益于大模型训练需求爆发，建议适当增持，目标仓位15-20%。',
      confidence: 88,
    },
    {
      icon: 'fa-shield-halved',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      title: '降低特斯拉仓位',
      desc: '电动车竞争加剧，特斯拉毛利率承压，当前持仓亏损，建议止损或减仓至5%以下。',
      confidence: 76,
    },
    {
      icon: 'fa-rotate',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      title: '板块轮动机会',
      desc: '医疗健康板块估值处于历史低位，AI+医疗赛道具备长期投资价值，可适当配置5-8%。',
      confidence: 71,
    },
    {
      icon: 'fa-umbrella',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      title: '对冲尾部风险',
      desc: '当前市场不确定性较高，建议配置少量黄金ETF或购买保护性看跌期权，降低组合波动。',
      confidence: 65,
    },
  ];

  const fearGreedValue = 72;
  const gaugeRotation = -90 + (fearGreedValue / 100) * 180;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
          <i className="fa-solid fa-brain text-white animate-pulse"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">AI 智能分析</h1>
          <p className="text-sm text-gray-400">基于机器学习模型的实时市场洞察</p>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></div>
          <span className="text-purple-400 text-xs font-medium">模型运行中</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">市场情绪分析</h2>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-24 mb-4">
              <div
                className="absolute inset-0 rounded-t-full border-8 border-gray-700"
                style={{ borderBottomColor: 'transparent', borderBottomWidth: 0 }}
              ></div>
              <div
                className="absolute inset-0 rounded-t-full border-8 border-transparent"
                style={{
                  borderTopColor: fearGreedValue >= 75 ? '#ef4444' : fearGreedValue >= 50 ? '#f59e0b' : '#22c55e',
                  borderLeftColor: fearGreedValue >= 25 ? (fearGreedValue >= 75 ? '#ef4444' : '#f59e0b') : '#22c55e',
                  borderRightColor: 'transparent',
                  borderBottomWidth: 0,
                  clipPath: `polygon(0 0, ${fearGreedValue}% 0, ${fearGreedValue}% 100%, 0 100%)`,
                }}
              ></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div
                  className="w-1 h-16 bg-white rounded-full origin-bottom transition-transform duration-1000"
                  style={{ transform: `rotate(${gaugeRotation}deg)`, transformOrigin: 'bottom center' }}
                ></div>
                <div className="w-3 h-3 rounded-full bg-white mt-1"></div>
              </div>
            </div>
            <div className="text-4xl font-black text-amber-400 mb-1">{fearGreedValue}</div>
            <div className="text-lg font-bold text-amber-300 mb-3">贪婪</div>
            <div className="flex gap-2 text-xs text-gray-500 w-full justify-between px-2">
              <span className="text-green-400">极度恐惧</span>
              <span className="text-yellow-400">中性</span>
              <span className="text-red-400">极度贪婪</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-sm text-amber-300">
              <i className="fa-solid fa-circle-info mr-2"></i>
              当前市场情绪偏向贪婪，历史数据显示此阶段后续1个月内市场回调概率约42%，建议适当控制仓位。
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">风险评估</h2>
          <div className="space-y-4">
            {riskMetrics.map(metric => (
              <div key={metric.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-gray-300">{metric.label}</span>
                  <span className="text-sm font-bold text-white">{metric.value}{metric.unit}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${metric.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${(metric.value / metric.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">组合评级</div>
              <div className="text-lg font-black text-blue-400">A+</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">风险等级</div>
              <div className="text-lg font-black text-yellow-400">中高</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">AI 策略建议</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((item, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <i className={`fa-solid ${item.icon} ${item.color} text-sm`}></i>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white mb-1">{item.title}</div>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">置信度</span>
                  <span className={`text-xs font-bold ${item.color}`}>{item.confidence}%</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color.replace('text-', 'bg-')}`}
                    style={{ width: `${item.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">主流AI策略对比</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['策略名称', '预测准确率', '夏普比率', '最大回撤', '执行速度', '复杂度'].map(col => (
                  <th key={col} className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {strategies.map((s, i) => (
                <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 pr-4 font-medium text-white">{s.name}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.accuracy}%` }}></div>
                      </div>
                      <span className="text-gray-300">{s.accuracy}%</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-green-400 font-medium">{s.sharpe}</td>
                  <td className="py-3 pr-4 text-red-400">{s.drawdown}</td>
                  <td className="py-3 pr-4 text-gray-300">{s.speed}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.complexity === '极高' ? 'bg-red-500/20 text-red-400' :
                      s.complexity === '高' ? 'bg-orange-500/20 text-orange-400' :
                      s.complexity === '中' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>{s.complexity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col" style={{ height: '380px' }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <i className="fa-solid fa-robot text-white text-xs"></i>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI 投资顾问</div>
            <div className="text-xs text-green-400">在线</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                  <i className="fa-solid fa-robot text-white" style={{ fontSize: '9px' }}></i>
                </div>
              )}
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-gray-800 text-gray-200 rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mr-2 flex-shrink-0">
                <i className="fa-solid fa-robot text-white" style={{ fontSize: '9px' }}></i>
              </div>
              <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-800 flex-shrink-0">
          <div className="flex gap-2 mb-2">
            {['当前市场风险如何', '推荐哪些股票', '如何优化我的策略'].map(q => (
              <button
                key={q}
                onClick={() => setInputValue(q)}
                className="text-xs text-gray-400 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full px-3 py-1 transition-colors truncate"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入您的投资问题..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <i className="fa-solid fa-paper-plane text-white text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
