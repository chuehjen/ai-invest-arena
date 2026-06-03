import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip,
} from 'recharts';
import { performanceHistory, myHoldings, recentTrades } from '../data/mockData';

const STAT_CARDS = [
  {
    label: '总资产',
    value: '¥1,386,000',
    sub: '+¥386,000',
    icon: 'fa-wallet',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    trend: 'up',
  },
  {
    label: '总收益率',
    value: '+38.6%',
    sub: '自比赛开始',
    icon: 'fa-chart-line',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    trend: 'up',
  },
  {
    label: '今日盈亏',
    value: '+¥12,400',
    sub: '+0.90%',
    icon: 'fa-arrow-trend-up',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    trend: 'up',
  },
  {
    label: '当前排名',
    value: '#1',
    sub: '共 128 人',
    icon: 'fa-trophy',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    trend: 'up',
  },
];

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const chartData = performanceHistory.map(p => ({
  date: p.date.slice(5),
  mine: Math.round((p.value / 1000000 - 1) * 1000) / 10,
  benchmark: Math.round((p.benchmark / 1000000 - 1) * 1000) / 10,
}));

const pieData = myHoldings.map(h => ({ name: h.symbol, value: h.weight }));

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {STAT_CARDS.map(card => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start gap-4 hover:border-gray-700 transition-colors">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center flex-shrink-0`}>
              <i className={`fa-solid ${card.icon} ${card.color} text-sm`}></i>
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-400 mb-1">{card.label}</div>
              <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <i className="fa-solid fa-arrow-up text-green-400 text-xs"></i>
                <span className="text-xs text-gray-400">{card.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-white">资产走势</div>
              <div className="text-xs text-gray-400 mt-0.5">收益率 vs 基准</div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-400 inline-block rounded"></span>我的收益</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-gray-500 inline-block rounded"></span>基准</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(value: number) => [`${value}%`]}
              />
              <Line type="monotone" dataKey="mine" stroke="#3b82f6" strokeWidth={2} dot={false} name="我的收益" />
              <Line type="monotone" dataKey="benchmark" stroke="#6b7280" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="基准" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-sm font-semibold text-white mb-1">持仓分布</div>
          <div className="text-xs text-gray-400 mb-3">按市值权重</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <PieTooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                formatter={(value: number) => [`${value}%`]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                <span className="text-xs text-gray-400 truncate">{item.name}</span>
                <span className="text-xs text-gray-300 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="text-sm font-semibold text-white mb-4">最近交易记录</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-800">
              <th className="text-left pb-3 font-medium">日期</th>
              <th className="text-left pb-3 font-medium">股票</th>
              <th className="text-left pb-3 font-medium">操作</th>
              <th className="text-right pb-3 font-medium">数量</th>
              <th className="text-right pb-3 font-medium">金额</th>
              <th className="text-right pb-3 font-medium">盈亏</th>
            </tr>
          </thead>
          <tbody>
            {recentTrades.map(trade => (
              <tr key={trade.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="py-3 text-gray-400 text-xs">{trade.date}</td>
                <td className="py-3">
                  <div className="font-medium text-white">{trade.symbol}</div>
                  <div className="text-xs text-gray-400">{trade.name}</div>
                </td>
                <td className="py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    trade.action === 'buy'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    <i className={`fa-solid ${trade.action === 'buy' ? 'fa-arrow-down' : 'fa-arrow-up'} text-xs`}></i>
                    {trade.action === 'buy' ? '买入' : '卖出'}
                  </span>
                </td>
                <td className="py-3 text-right text-gray-300">{trade.shares}</td>
                <td className="py-3 text-right text-gray-300">¥{trade.amount.toLocaleString()}</td>
                <td className="py-3 text-right">
                  {trade.pnl === null ? (
                    <span className="text-gray-500 text-xs">持仓中</span>
                  ) : (
                    <span className={trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {trade.pnl >= 0 ? '+' : ''}¥{trade.pnl.toLocaleString()}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
