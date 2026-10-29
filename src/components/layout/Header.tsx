import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEMO_USERS } from '../../data/store';
import { Role } from '../../types';
import {
  Building2,
  UserCheck,
  Globe,
  Clock,
  Search,
  Bell,
  FileText,
  ChevronDown,
  X,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
} from 'lucide-react';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onOpenReportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchChange, searchQuery, onOpenReportModal }) => {
  const { currentOrg, setCurrentOrgId, state, currentUser, setCurrentUserRole, language, setLanguage, t, theme, toggleTheme } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const isLight = theme === 'light';

  const notifications = [
    {
      id: 'notif-1',
      title: language === 'ar' ? 'تشغيل المجدول الآلي للتقارير' : 'Automated Reporting Cycle Triggered',
      desc: language === 'ar' ? 'تم إنشاء تقرير الأداء الأسبوعي بنجاح (توقيت الرياض 08:00)' : 'Weekly workforce digest generated successfully (Asia/Riyadh 08:00)',
      time: '10m ago',
      type: 'success',
    },
    {
      id: 'notif-2',
      title: language === 'ar' ? 'تنبيه تجاوز العتبة الحرجة' : 'Critical Threshold Alert: New Hire Turnover',
      desc: language === 'ar' ? 'سجل دوران التعيينات خلال سنة 13.6% متجاوزاً المستهدف 12%' : 'Turnover of New Hire During 1 Year reached 13.6% (Target: 12.0%)',
      time: '1h ago',
      type: 'warning',
    },
    {
      id: 'notif-3',
      title: language === 'ar' ? 'اكتشاف وتحديث المؤشرات المرجعية' : 'KPI Reference Library Updated',
      desc: language === 'ar' ? 'تم اعتماد 35 مؤشراً من وثيقة دوران الموظفين 2025' : '35 KPIs verified from Employee Turnover 2025 documentation',
      time: '2h ago',
      type: 'info',
    },
  ];

  return (
    <header className={`sticky top-0 z-30 ${isLight ? 'bg-white border-b border-slate-200 text-slate-800' : 'bg-slate-900 border-b border-slate-800 text-slate-100'} transition-colors`}>
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-4">
        {/* Left: Search Bar */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className={`w-full ${
              isLight
                ? 'bg-slate-100/90 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500'
                : 'bg-slate-800/80 border border-slate-700 text-slate-200 placeholder:text-slate-400 focus:border-blue-500'
            } rounded-lg pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Timezone Indicator */}
          <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs ${isLight ? 'text-slate-600 bg-slate-100 border border-slate-200' : 'text-slate-300 bg-slate-800/60 border border-slate-700/60'} rounded-md font-mono`}>
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Asia/Riyadh (AST)</span>
          </div>

          {/* Org Switcher */}
          <div className="relative">
            <label htmlFor="org-select" className="sr-only">Select Organization</label>
            <div className={`flex items-center gap-1.5 ${isLight ? 'bg-slate-100 border border-slate-200 text-slate-800' : 'bg-slate-800 border border-slate-700 text-slate-200'} rounded-lg px-2.5 py-1 text-xs`}>
              <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <select
                id="org-select"
                value={currentOrg.id}
                onChange={e => setCurrentOrgId(e.target.value)}
                className={`bg-transparent text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'} font-semibold focus:outline-none cursor-pointer pr-4 rtl:pr-0 rtl:pl-4`}
              >
                {state.organizations.map(org => (
                  <option key={org.id} value={org.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-200'}>
                    {language === 'ar' ? org.nameAr : org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="relative hidden md:block">
            <label htmlFor="role-select" className="sr-only">Select Role</label>
            <div className={`flex items-center gap-1.5 ${isLight ? 'bg-slate-100 border border-slate-200 text-slate-800' : 'bg-slate-800 border border-slate-700 text-slate-200'} rounded-lg px-2.5 py-1 text-xs`}>
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <select
                id="role-select"
                value={currentUser.role}
                onChange={e => setCurrentUserRole(e.target.value as Role)}
                className={`bg-transparent text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'} font-semibold focus:outline-none cursor-pointer pr-4 rtl:pr-0 rtl:pl-4`}
              >
                {['Super Admin', 'Organization Admin', 'HR Manager', 'Data Entry', 'Executive Viewer'].map(r => (
                  <option key={r} value={r} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-200'}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400'
            }`}
            title={isLight ? 'التبديل إلى الوضع الداكن' : 'Switch to Light Theme'}
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title="تبديل اللغة / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Quick Generate Report Button */}
          <button
            onClick={onOpenReportModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('generateReportNow')}</span>
          </button>

          {/* Notifications Drawer */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-1.5 rounded-lg border relative transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
              }`}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full" />
            </button>

            {showNotifications && (
              <div
                className={`absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 rounded-xl shadow-xl p-4 text-xs z-50 border ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
                }`}
              >
                <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                  <span className="font-bold">{t('notifications')} (3)</span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2.5 pt-3">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg border ${
                        isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-800/80 border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="mt-1 text-slate-500 text-[11px] leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
