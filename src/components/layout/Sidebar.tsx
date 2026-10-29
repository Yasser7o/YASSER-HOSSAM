import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Layers,
  Star,
  Calculator,
  LineChart,
  FileSpreadsheet,
  Bot,
  Building,
  Users,
  UploadCloud,
  Sliders,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export type ActiveTab =
  | 'overview'
  | 'kpis'
  | 'my-kpis'
  | 'data-entry'
  | 'analytics'
  | 'reports'
  | 'ai-insights'
  | 'departments'
  | 'team'
  | 'import'
  | 'builder'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickTour: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenQuickTour }) => {
  const { t, language, kpis, favorites, theme } = useApp();
  const isLight = theme === 'light';

  const navItems = [
    { id: 'overview' as ActiveTab, label: t('navOverview'), icon: LayoutDashboard },
    { id: 'kpis' as ActiveTab, label: t('navKpiLibrary'), icon: Layers, badge: `${kpis.length}` },
    { id: 'my-kpis' as ActiveTab, label: t('navMyKpis'), icon: Star, badge: `${favorites.length}` },
    { id: 'data-entry' as ActiveTab, label: t('navDataEntry'), icon: Calculator },
    { id: 'analytics' as ActiveTab, label: t('navAnalytics'), icon: LineChart },
    { id: 'reports' as ActiveTab, label: t('navReports'), icon: FileSpreadsheet },
    { id: 'ai-insights' as ActiveTab, label: t('navAiInsights'), icon: Bot, isAi: true },
    { id: 'departments' as ActiveTab, label: t('navDepartments'), icon: Building },
    { id: 'team' as ActiveTab, label: t('navTeam'), icon: Users },
    { id: 'import' as ActiveTab, label: t('navImportCenter'), icon: UploadCloud },
    { id: 'builder' as ActiveTab, label: t('navKpiBuilder'), icon: Sliders },
    { id: 'settings' as ActiveTab, label: t('navSettings'), icon: Settings },
  ];

  return (
    <aside
      className={`w-64 ${
        isLight
          ? 'bg-white border-r rtl:border-r-0 rtl:border-l border-slate-200 text-slate-700'
          : 'bg-slate-950 border-r rtl:border-r-0 rtl:border-l border-slate-800 text-slate-300'
      } flex flex-col shrink-0 min-h-screen transition-colors`}
    >
      {/* Brand & Logo */}
      <div className={`p-4 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'} flex items-center gap-3`}>
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-sm shrink-0">
          HR
        </div>
        <div className="overflow-hidden">
          <h1 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'} truncate tracking-tight`}>
            {t('appName')}
          </h1>
          <p className="text-[11px] text-slate-500 truncate">
            {t('appSubtitle')}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isLight
                  ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-white'
                      : item.isAi
                      ? 'text-indigo-600'
                      : isLight
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : isLight
                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className={`p-3 border-t ${isLight ? 'border-slate-100 bg-slate-50' : 'border-slate-800 bg-slate-900/60'}`}>
        <div className={`p-2.5 rounded-lg border ${isLight ? 'bg-white border-slate-200/80' : 'bg-slate-800/80 border-slate-700/60'} space-y-2`}>
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>معايير دوران الموظفين 2025</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <button
            onClick={onOpenQuickTour}
            className={`w-full text-center py-1 text-[11px] font-semibold rounded transition-colors ${
              isLight
                ? 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                : 'text-blue-400 hover:text-blue-300 bg-blue-950/40 hover:bg-blue-950/70'
            }`}
          >
            {t('quickTour')}
          </button>
        </div>
      </div>
    </aside>
  );
};
