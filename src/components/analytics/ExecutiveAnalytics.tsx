import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ResponsiveContainer,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import {
  Building,
} from 'lucide-react';

export const ExecutiveAnalytics: React.FC = () => {
  const { currentOrg, language, t, theme } = useApp();
  const isLight = theme === 'light';
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Trend data across quarters
  const quarterlyTrendData = [
    { period: '2025-Q4', totalTurnover: 13.8, voluntary: 10.2, involuntary: 3.6, target: 10.0 },
    { period: '2026-Q1', totalTurnover: 12.4, voluntary: 9.1, involuntary: 3.3, target: 10.0 },
    { period: '2026-Q2', totalTurnover: 11.2, voluntary: 8.5, involuntary: 2.7, target: 10.0 },
    { period: '2026-Q3', totalTurnover: 10.6, voluntary: 8.2, involuntary: 2.4, target: 10.0 },
    { period: '2026-10 (Current)', totalTurnover: 10.3, voluntary: 7.9, involuntary: 2.4, target: 10.0 },
  ];

  // Tenure cohort distribution data (From the 35 KPIs: 1-2 yrs, 2-5 yrs, 5-10 yrs, 10-20 yrs)
  const tenureCohortData = [
    { cohort: language === 'ar' ? 'أقل من سنة' : '< 1 Year', exits: 16, risk: 'High' },
    { cohort: language === 'ar' ? '1 إلى 2 سنة' : '1 - 2 Years', exits: 18, risk: 'Critical' },
    { cohort: language === 'ar' ? '2 إلى 5 سنوات' : '2 - 5 Years', exits: 22, risk: 'Moderate' },
    { cohort: language === 'ar' ? '5 إلى 10 سنوات' : '5 - 10 Years', exits: 11, risk: 'Low' },
    { cohort: language === 'ar' ? '10 إلى 20 سنة' : '10 - 20 Years', exits: 6, risk: 'Low' },
  ];

  // Actual vs Target Comparison for key indicators
  const actualVsTargetData = [
    { kpi: 'Retention Rate (%)', actual: 90.3, target: 90.0 },
    { kpi: 'Personnel Turnover (%)', actual: 9.7, target: 9.5 },
    { kpi: 'New Hire 1-Yr Turnover (%)', actual: 13.6, target: 12.0 },
    { kpi: 'Tech Staff Turnover (%)', actual: 7.8, target: 8.0 },
    { kpi: 'Admin Staff Turnover (%)', actual: 8.2, target: 7.0 },
    { kpi: 'Notice Period Rate (%)', actual: 86.2, target: 90.0 },
  ];

  const cardBg = isLight ? 'bg-white border border-slate-200/90 shadow-xs' : 'bg-slate-900 border border-slate-800 shadow-sm';
  const textPrimary = isLight ? 'text-slate-900' : 'text-slate-100';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';
  const gridStroke = isLight ? '#f1f5f9' : '#334155';
  const tooltipStyle = isLight
    ? { backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }
    : { backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' };

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold ${textPrimary} tracking-tight`}>
            {t('navAnalytics')}
          </h2>
          <p className={`text-xs ${textMuted} mt-0.5`}>
            {language === 'ar'
              ? 'تحليل الاتجاهات الزمنية، التوزيع الديموغرافي لفترات الخدمة، والمقارنة بالمستهدفات'
              : 'Multi-period time series analysis, tenure cohort risk models, and target variance benchmarking'}
          </p>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="analytics-dept-filter" className="sr-only">Filter by Department</label>
          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            id="analytics-dept-filter"
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className={`border rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500 ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <option value="all">
              {language === 'ar' ? 'كافة الإدارات (على مستوى الشركة)' : 'All Departments (Company-wide)'}
            </option>
            {currentOrg.departments.map(d => (
              <option key={d.id} value={d.id}>
                {language === 'ar' ? d.nameAr : d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Multi-Period Trend Chart */}
      <div className={`${cardBg} rounded-xl p-5 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${textPrimary}`}>
              {language === 'ar' ? 'مسار انخفاض دوران الموظفين الفصلي (%)' : 'Quarterly Workforce Turnover Dynamics (%)'}
            </h3>
            <p className={`text-xs ${textMuted} mt-0.5`}>
              {language === 'ar' ? 'تراجع تاريخي لمعدل الدوران من 13.8% إلى 10.3%' : 'Historical reduction from 13.8% to 10.3% across exits'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono font-medium">
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Total Turnover
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Voluntary Exits
            </span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Target (10.0%)
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={quarterlyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 16]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="totalTurnover"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
              <Area
                type="monotone"
                dataKey="voluntary"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVol)"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Tenure Cohort Risk vs Actual vs Target */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenure Cohort Distribution */}
        <div className={`${cardBg} rounded-xl p-5 space-y-3`}>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${textPrimary}`}>
              {language === 'ar' ? 'توزيع المغادرات حسب فئات سنوات الخدمة' : 'Departures Breakdown by Tenure Bracket'}
            </h3>
            <p className={`text-xs ${textMuted} mt-0.5`}>
              {language === 'ar' ? 'كشف مواطن الخلل بين الكوادر الحديثة والمتقدمة' : 'Vulnerability distribution by tenure cohorts'}
            </p>
          </div>

          <div className="h-60 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tenureCohortData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="cohort" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="exits" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`text-[11px] ${textMuted} pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'} flex items-center justify-between`}>
            <span>{language === 'ar' ? 'الفئة الأكثر حساسية: من 1 إلى 2 سنة (18 مغادرة)' : 'Critical bracket: 1 - 2 Years (18 Exits)'}</span>
            <span className="text-amber-600 font-bold">{language === 'ar' ? 'تدخل ذو أولوية' : 'Priority Intervention'}</span>
          </div>
        </div>

        {/* Actual vs Target Variance */}
        <div className={`${cardBg} rounded-xl p-5 space-y-3`}>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${textPrimary}`}>
              {language === 'ar' ? 'مقارنة القيم الفعلية بالمستهدفات الرسمية' : 'Actual vs Target Benchmark Variance'}
            </h3>
            <p className={`text-xs ${textMuted} mt-0.5`}>
              {language === 'ar' ? 'عتبات التحذير محددة عند ±15%' : 'Tolerance boundaries evaluated at ±15% threshold'}
            </p>
          </div>

          <div className="h-60 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={actualVsTargetData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="kpi" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="actual" fill="#2563eb" radius={[0, 4, 4, 0]} />
                <Bar dataKey="target" fill={isLight ? '#94a3b8' : '#64748b'} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`text-[11px] ${textMuted} pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'} flex items-center justify-between`}>
            <span>{language === 'ar' ? 'الأزرق = الفعلي · الرمادي = المستهدف' : 'Blue = Actual Result · Slate = Target Benchmark'}</span>
            <span className="text-emerald-600 font-bold">4 / 6 {language === 'ar' ? 'ضمن النطاق' : 'Within Range'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
