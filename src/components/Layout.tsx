import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { usePriceContext, useDataContext } from '../data/usePrices';
import { useTheme } from '../data/useTheme';

const navItems = [
  { path: '/dashboard', icon: 'fa-chart-line', label: '总览' },
  { path: '/leaderboard', icon: 'fa-trophy', label: '排行榜' },
  { path: '/portfolio', icon: 'fa-briefcase', label: '持仓明细' },
  { path: '/competition', icon: 'fa-flag-checkered', label: '赛事信息' },
  { path: '/analysis', icon: 'fa-brain', label: 'AI分析' },
];

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const currentNavItem = navItems.find(item => location.pathname.startsWith(item.path));
  const { refresh, loading, error, lastUpdated, progress } = usePriceContext();
  const { reloadData, dataLoading, dataSource, snapshotDate } = useDataContext();
  const { theme, toggleTheme } = useTheme();

  const statusText = lastUpdated
    ? `${lastUpdated.getHours().toString().padStart(2, '0')}:${lastUpdated.getMinutes().toString().padStart(2, '0')} 已更新`
    : '未刷新';

  const sourceLabel: Record<string, string> = {
    jsdelivr: 'CDN',
    supabase: 'Supabase',
    bundled: '本地',
  };
  const snapshotChip = dataSource && snapshotDate
    ? `${snapshotDate} · ${sourceLabel[dataSource] || dataSource}`
    : '加载中';

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <aside
        className={`flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 flex-shrink-0 ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div className="flex items-center h-16 px-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-robot text-white text-sm"></i>
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">AI投资竞赛</div>
                <div className="text-xs text-gray-400 truncate">10 智能体 · $10K</div>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <i className={`fa-solid ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs`}></i>
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg mb-1 transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <i className={`fa-solid ${item.icon} text-sm flex-shrink-0 w-4 text-center`}></i>
              {!sidebarCollapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          {!sidebarCollapsed && (
            <div className="text-xs text-gray-500 text-center">
              <i className="fa-solid fa-calendar-day mr-1"></i>
              建仓日 2026-06-03
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <i className="fa-solid fa-house text-xs"></i>
            <span>/</span>
            <span className="text-white font-medium">{currentNavItem?.label || '总览'}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => reloadData()}
              disabled={dataLoading}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                dataLoading
                  ? 'bg-purple-500/20 text-purple-300 cursor-wait'
                  : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
              }`}
              title={`数据源 ${snapshotChip}，点击重新拉取`}
            >
              <i className={`fa-solid fa-cloud-arrow-down text-xs ${dataLoading ? 'animate-spin' : ''}`}></i>
              <span>{dataLoading ? '加载中...' : `重载快照 · ${snapshotChip}`}</span>
            </button>
            <button
              onClick={refresh}
              disabled={loading}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                loading
                  ? 'bg-blue-500/20 text-blue-300 cursor-wait'
                  : error
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                  : lastUpdated
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20'
                  : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
              }`}
              title={error || '点击刷新最新股价'}
            >
              <i className={`fa-solid fa-arrows-rotate text-xs ${loading ? 'animate-spin' : ''}`}></i>
              <span>{loading ? (progress ? `刷新中 ${progress}` : '刷新中...') : error ? '刷新失败' : lastUpdated ? statusText : '刷新股价'}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-950 p-6">
          <Outlet />
        </main>
      </div>

      <button
        onClick={toggleTheme}
        className="theme-switch-btn"
        title={theme === 'terminal' ? '切换到极简风格' : '切换到深色终端风格'}
        aria-label="切换视觉风格"
      >
        <span className="theme-dot" />
        <span>切换 · {theme === 'terminal' ? '终端 / 暗色' : '极简 / 浅色'}</span>
      </button>
    </div>
  );
};

export default Layout;
