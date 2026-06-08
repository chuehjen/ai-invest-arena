import React from 'react';
import { dailyReturns } from '../data/competitionData';
import { useComputedParticipants } from '../data/usePrices';

const Analysis: React.FC = () => {
  const participants = useComputedParticipants();
  const allSymbols = new Map<string, { count: number; agents: string[] }>();
  participants.forEach(p => {
    p.holdings.forEach(h => {
      const existing = allSymbols.get(h.symbol) || { count: 0, agents: [] };
      existing.count += 1;
      existing.agents.push(p.name);
      allSymbols.set(h.symbol, existing);
    });
  });
  const topSymbols = [...allSymbols.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 10);

  const riskMetrics = participants.map(p => ({
    ...p,
    riskLevel: p.cashPct > 10 ? '低' : p.cashPct > 5 ? '中' : '高',
    riskColor: p.cashPct > 10 ? 'text-green-400' : p.cashPct > 5 ? 'text-amber-400' : 'text-red-400',
    concentration: Math.max(...p.holdings.map(h => h.weight)),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
          <i className="fa-solid fa-brain text-white animate-pulse"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">AI 策略分析</h1>
          <p className="text-sm text-gray-400">{participants.length} 个智能体的持仓对比与投资洞察</p>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></div>
          <span className="text-purple-400 text-xs font-medium">Day {dailyReturns.length} · 竞赛进行中</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">共识持仓 Top 10</h2>
          <div className="space-y-2">
            {topSymbols.map(([symbol, data]) => {
              const pct = (data.count / participants.length) * 100;
              return (
                <div key={symbol} className="flex items-center gap-3">
                  <span className="text-sm font-mono text-white w-14">{symbol}</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-400 w-16 text-right">{data.count}/{participants.length} 持有</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">风险评估</h2>
          <div className="space-y-3">
            {riskMetrics.map(p => (
              <div key={p.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                  <span className="text-sm text-white">{p.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">集中度{p.concentration.toFixed(0)}%</span>
                  <span className={`text-xs font-medium ${p.riskColor}`}>{p.riskLevel}风险</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-sm text-amber-300">
              <i className="fa-solid fa-circle-info mr-2"></i>
              {topSymbols[0][0]} 是持有最广的股票，被 {topSymbols[0][1].count}/{participants.length} 个智能体持有；{topSymbols[1][0]} 被 {topSymbols[1][1].count} 个持有。
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">策略特征</h2>
          <div className="space-y-3">
            {[
              { label: '最分散', agent: 'ChatGPT', desc: '8只股票，含金融股防守', icon: 'fa-layer-group', color: 'text-blue-400' },
              { label: '最集中', agent: 'Gemini(标准)', desc: '仅3只，NVDA重仓43%', icon: 'fa-crosshairs', color: 'text-red-400' },
              { label: '最防御', agent: '豆包', desc: 'VOO+红利ETF+医药', icon: 'fa-shield-halved', color: 'text-green-400' },
              { label: '最独特', agent: 'Claude', desc: '唯一配黄金+能源', icon: 'fa-gem', color: 'text-purple-400' },
              { label: '最激进', agent: '千问', desc: '现金透支-$629，GOOGL造假', icon: 'fa-fire', color: 'text-amber-400' },
              { label: '光互连主题', agent: 'Serenity', desc: 'LITE+COHR光模块重仓', icon: 'fa-network-wired', color: 'text-teal-400' },
              { label: '电力主线', agent: 'Beth Kindig', desc: 'BE+GEV押AI电力瓶颈', icon: 'fa-bolt', color: 'text-rose-400' },
              { label: '颠覆创新', agent: '木头姐', desc: '基因+公链+机器人收敛', icon: 'fa-dna', color: 'text-indigo-400' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 py-1.5">
                <i className={`fa-solid ${item.icon} ${item.color} text-sm mt-0.5 w-4 text-center`}></i>
                <div>
                  <span className="text-sm text-white font-medium">{item.agent}</span>
                  <span className="text-xs text-gray-500 ml-2">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">每日收益率矩阵</h2>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4 sticky left-0 bg-gray-900 z-10">智能体</th>
                {dailyReturns.map(d => (
                  <th key={d.date} className="text-right text-xs text-gray-500 font-medium pb-3 pr-4">{d.date.slice(5)}</th>
                ))}
                <th className="text-right text-xs text-gray-500 font-medium pb-3">累计</th>
              </tr>
            </thead>
            <tbody>
              {participants.map(p => (
                <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-3 pr-4 sticky left-0 bg-gray-900 z-10">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                      <span className="text-white font-medium">{p.name}</span>
                    </div>
                  </td>
                  {dailyReturns.map(d => {
                    const v = d.returns[p.id] ?? 0;
                    return (
                      <td key={d.date} className={`py-3 pr-4 text-right font-mono ${v > 0 ? 'text-green-400' : v < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {v > 0 ? '+' : ''}{v.toFixed(2)}%
                      </td>
                    );
                  })}
                  <td className={`py-3 text-right font-mono font-medium ${p.returnPct > 0 ? 'text-green-400' : p.returnPct < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                    {p.returnPct > 0 ? '+' : ''}{p.returnPct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
