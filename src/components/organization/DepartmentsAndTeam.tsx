import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEMO_USERS } from '../../data/store';
import { Role } from '../../types';
import {
  Building,
} from 'lucide-react';

interface DepartmentsAndTeamProps {
  initialView?: 'departments' | 'team' | 'settings';
}

export const DepartmentsAndTeam: React.FC<DepartmentsAndTeamProps> = ({ initialView = 'departments' }) => {
  const { currentOrg, language, t, currentUser, setCurrentUserRole, theme } = useApp();
  const isLight = theme === 'light';
  const [view, setView] = useState<'departments' | 'team' | 'settings'>(initialView);

  const rolesList: Array<{ role: Role; desc: string }> = [
    { role: 'Super Admin', desc: 'Full authority across multi-tenant orgs and KPI master library' },
    { role: 'Organization Admin', desc: 'Manage departments, assign KPIs, configure targets' },
    { role: 'HR Manager', desc: 'Monitor organizational KPIs and review submitted period data' },
    { role: 'Data Entry', desc: 'Enter assigned operational variables with audit log timestamp' },
    { role: 'Executive Viewer', desc: 'Read-only access to executive dashboards and PDF reports' },
  ];

  const cardBg = isLight ? 'bg-white border border-slate-200/90 shadow-xs' : 'bg-slate-900 border border-slate-800 shadow-sm';
  const textPrimary = isLight ? 'text-slate-900' : 'text-slate-100';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="space-y-6">
      {/* Top Toggle Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold ${textPrimary} tracking-tight`}>
            {view === 'departments'
              ? t('navDepartments')
              : view === 'team'
              ? t('navTeam')
              : t('navSettings')}
          </h2>
          <p className={`text-xs ${textMuted} mt-0.5`}>
            {language === 'ar' ? currentOrg.nameAr : currentOrg.name} · {currentOrg.industry} · {currentOrg.totalEmployees} {language === 'ar' ? 'موظف' : 'Employees'}
          </p>
        </div>

        <div className={`flex items-center gap-1 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'} border p-1 rounded-lg text-xs`}>
          <button
            onClick={() => setView('departments')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              view === 'departments'
                ? 'bg-blue-600 text-white shadow-xs'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('navDepartments')}
          </button>
          <button
            onClick={() => setView('team')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              view === 'team'
                ? 'bg-blue-600 text-white shadow-xs'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('navTeam')}
          </button>
          <button
            onClick={() => setView('settings')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              view === 'settings'
                ? 'bg-blue-600 text-white shadow-xs'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('navSettings')}
          </button>
        </div>
      </div>

      {/* VIEW 1: DEPARTMENTS */}
      {view === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentOrg.departments.map(dept => (
            <div
              key={dept.id}
              className={`${cardBg} rounded-xl p-5 space-y-4 hover:border-slate-300 transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-blue-600 font-bold uppercase">
                    Department #{dept.id.replace('dept-', '')}
                  </div>
                  <h3 className={`text-sm font-bold ${textPrimary} mt-0.5`}>
                    {language === 'ar' ? dept.nameAr : dept.name}
                  </h3>
                </div>
                <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'}`}>
                  <Building className="w-4 h-4" />
                </div>
              </div>

              <div className={`grid grid-cols-2 gap-3 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'} text-xs`}>
                <div>
                  <div className={`text-[11px] ${textMuted}`}>Headcount</div>
                  <div className={`text-base font-bold ${textPrimary} font-mono mt-0.5`}>
                    {dept.headCount} <span className={`text-[11px] font-normal ${textMuted}`}>{language === 'ar' ? 'موظف' : 'Staff'}</span>
                  </div>
                </div>
                <div>
                  <div className={`text-[11px] ${textMuted}`}>Retention Est.</div>
                  <div className="text-base font-bold text-emerald-600 font-mono mt-0.5">
                    {92 - (dept.headCount % 7)}%
                  </div>
                </div>
              </div>

              <div className={`pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/60'} text-xs ${textMuted} flex items-center justify-between`}>
                <span>Manager: <strong className={textPrimary}>{dept.managerName}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: TEAM & PERMISSIONS */}
      {view === 'team' && (
        <div className="space-y-6">
          {/* Active User Switcher Banner */}
          <div className={`p-4 ${cardBg} rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
            <div>
              <div className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">
                {language === 'ar' ? 'جلسة المستخدم النشطة' : 'Active Authenticated Session'}
              </div>
              <h3 className={`text-sm font-bold ${textPrimary} mt-0.5`}>
                {currentUser.name} ({currentUser.email})
              </h3>
              <p className={`text-xs ${textMuted}`}>
                {language === 'ar' ? 'الدور الحالي:' : 'Role:'} <strong className="text-emerald-600 font-bold">{currentUser.role}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs ${textMuted}`}>{language === 'ar' ? 'تبديل الدور:' : 'Switch Role:'}</span>
              <select
                value={currentUser.role}
                onChange={e => setCurrentUserRole(e.target.value as Role)}
                className={`border rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-blue-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                {rolesList.map(r => (
                  <option key={r.role} value={r.role}>
                    {r.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User Accounts Table */}
          <div className={`${cardBg} rounded-xl overflow-hidden`}>
            <div className={`px-5 py-3.5 border-b ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} flex items-center justify-between`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${textPrimary}`}>
                {language === 'ar' ? 'مستخدمو المنظمة وصلاحيات الوصول' : 'Organization Users & Roles'}
              </h3>
              <span className={`text-xs ${textMuted} font-mono font-semibold`}>5 Authorized Users</span>
            </div>

            <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/80'}`}>
              {DEMO_USERS.map(usr => (
                <div key={usr.id} className={`p-4 flex items-center justify-between text-xs ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isLight ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}>
                      {usr.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className={`font-bold ${textPrimary}`}>{usr.name}</div>
                      <div className={`text-[11px] ${textMuted} font-mono`}>{usr.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded text-[11px] font-bold border border-emerald-200">
                      {usr.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SETTINGS */}
      {view === 'settings' && (
        <div className={`${cardBg} rounded-xl p-6 space-y-6 max-w-2xl`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider ${textPrimary}`}>
            {language === 'ar' ? 'إعدادات الحوكمة والجدولة الآلية' : 'Automated Reporting & Governance Configuration'}
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className={`block ${textMuted} mb-1 font-semibold`}>
                {language === 'ar' ? 'المنطقة الزمنية المعتمدة للتقارير' : 'Default Scheduled Timezone'}
              </label>
              <input
                type="text"
                disabled
                value="Asia/Riyadh (AST) - UTC+03:00"
                className={`w-full rounded-lg p-2.5 font-mono font-bold ${
                  isLight ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-slate-950 border border-slate-800 text-slate-300'
                }`}
              />
            </div>

            <div>
              <label className={`block ${textMuted} mb-1 font-semibold`}>
                {language === 'ar' ? 'جدولة التقارير الأسبوعية الآلية' : 'Weekly Report Automated Cadence'}
              </label>
              <input
                type="text"
                disabled
                value="Every Sunday & Thursday at 08:00 AM AST"
                className={`w-full rounded-lg p-2.5 font-mono font-bold ${
                  isLight ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-slate-950 border border-slate-800 text-slate-300'
                }`}
              />
            </div>

            <div>
              <label className={`block ${textMuted} mb-1 font-semibold`}>
                {language === 'ar' ? 'جدولة التقرير الشهري التنفيذي' : 'Monthly Calendar Cadence'}
              </label>
              <input
                type="text"
                disabled
                value="1st Day of each calendar month at 00:05 AM AST"
                className={`w-full rounded-lg p-2.5 font-mono font-bold ${
                  isLight ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-slate-950 border border-slate-800 text-slate-300'
                }`}
              />
            </div>

            <div>
              <label className={`block ${textMuted} mb-1 font-semibold`}>
                {language === 'ar' ? 'محرك الحسابات الرياضي الحتمي' : 'Deterministic Mathematical Engine'}
              </label>
              <input
                type="text"
                disabled
                value="AST Recursive Descent Arithmetic Parser v2.4 (No eval)"
                className={`w-full rounded-lg p-2.5 font-mono font-bold ${
                  isLight ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-slate-950 border border-slate-800 text-emerald-400'
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
