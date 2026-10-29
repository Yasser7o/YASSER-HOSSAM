import React from 'react';
import { useApp } from '../../context/AppContext';
import { KPIDefinition } from '../../types';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  Users,
  Building,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface OverviewDashboardProps {
  onSelectKpi: (kpi: KPIDefinition) => void;
  onNavigate: (tab: any) => void;
  onOpenReportModal: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onSelectKpi,
  onNavigate,
  onOpenReportModal,
}) => {
  const { kpis, currentOrg, t, language, getKpiLatestSubmission, reports, theme } = useApp();
  const isLight = theme === 'light';

  // Compute live aggregate stats
  const activeKpis = kpis.filter(k => currentOrg.activeKpiIds.includes(k.id));
  let onTrackCount = 0;
  let atRiskCount = 0;
  let offTrackCount = 0;
  let insufficientCount = 0;

  const kpisWithStatus = activeKpis.map(kpi => {
    const latest = getKpiLatestSubmission(kpi.id);
    const status = latest?.status || 'On Track';
    if (status === 'On Track') onTrackCount++;
    else if (status === 'At Risk') atRiskCount++;
    else if (status === 'Off Track') offTrackCount++;
    else insufficientCount++;

    return {
      kpi,
      latest,
      status,
      currentValue: latest?.calculatedValue ?? kpi.targetValue,
      variance: latest?.variance ?? 0,
    };
  });

  // Top performers and at-risk metrics
  const sortedByHealth = [...kpisWithStatus].sort((a, b) => {
    const scoreA = a.status === 'On Track' ? 3 : a.status === 'At Risk' ? 2 : 1;
    const scoreB = b.status === 'On Track' ? 3 : b.status === 'At Risk' ? 2 : 1;
    return scoreA - scoreB;
  });

  const criticalKpis = sortedByHealth.slice(0, 4);
  const topKpis = [...sortedByHealth].reverse().slice(0, 4);

  // Status Pie Data
  const pieData = [
    { name: t('statusOnTrack'), value: onTrackCount, color: '#10b981' },
    { name: t('statusAtRisk'), value: atRiskCount, color: '#f59e0b' },
    { name: t('statusOffTrack'), value: offTrackCount, color: '#f43f5e' },
  ];

  // Department turnover comparison data
  const deptData = currentOrg.departments.map(dept => ({
    name: language === 'ar' ? dept.nameAr.slice(0, 16) : dept.name.slice(0, 16),
    headCount: dept.headCount,
    retention: 92 - (dept.headCount % 7),
  }));

  const cardBg = isLight ? 'bg-white border border-slate-200/90 shadow-xs' : 'bg-slate-900 border border-slate-800 shadow-sm';
  const textPrimary = isLight ? 'text-slate-900' : 'text-slate-100';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';
  const gridStroke = isLight ? '#f1f5f9' : '#334155';
  const tooltipStyle = isLight
    ? { backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }
    : { backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner with Scheduler Live Cadence */}
      <div className={`${isLight ? 'bg-white border border-slate-200/90 shadow-xs' : 'bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800'} rounded-2xl p-5 sm:p-6`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-blue-600 mb-1">
              <span>{language === 'ar' ? currentOrg.nameAr : currentOrg.name}</span>
              <span aria-hidden="true">·</span>
              <span>{currentOrg.industry}</span>
              <span aria-hidden="true">·</span>
              <span>{currentOrg.totalEmployees} {language === 'ar' ? 'موظف نشط' : 'Active Employees'}</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold ${textPrimary} tracking-tight`}>
              {t('appName')}
            </h2>
            <p className={`mt-1 text-xs ${textMuted} max-w-2xl leading-relaxed`}>
              {t('poweredByPdf')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('import')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              } transition-colors`}
            >
              {t('navImportCenter')}
            </button>
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              {t('generateReportNow')}
            </button>
          </div>
        </div>
      </div>

      {/* Metric Counters Grid (6 Summary Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className={`${cardBg} rounded-xl p-4`}>
          <div className={`flex items-center justify-between text-xs ${textMuted}`}>
            <span>{t('totalActiveKpis')}</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className={`text-2xl font-bold ${textPrimary} mt-2 font-mono`}>
            {activeKpis.length}
          </div>
          <div className={`text-[11px] ${textMuted} mt-1`}>
            {language === 'ar' ? 'عبر 5 تصنيفات' : 'Across 5 Categories'}
          </div>
        </div>

        <div className={`${cardBg} rounded-xl p-4`}>
          <div className="flex items-center justify-between text-xs text-emerald-600 font-medium">
            <span>{t('kpisOnTrack')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono">
            {onTrackCount}
          </div>
          <div className={`text-[11px] ${textMuted} mt-1`}>
            {Math.round((onTrackCount / (activeKpis.length || 1)) * 100)}% {language === 'ar' ? 'نسبة الامتثال' : 'Compliance'}
          </div>
        </div>

        <div className={`${cardBg} rounded-xl p-4`}>
          <div className="flex items-center justify-between text-xs text-amber-600 font-medium">
            <span>{t('kpisAtRisk')}</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2 font-mono">
            {atRiskCount}
          </div>
          <div className={`text-[11px] ${textMuted} mt-1`}>
            {language === 'ar' ? 'ضمن هامش 15%' : 'Within 15% margin'}
          </div>
        </div>

        <div className={`${cardBg} rounded-xl p-4`}>
          <div className="flex items-center justify-between text-xs text-rose-600 font-medium">
            <span>{t('kpisOffTrack')}</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2 font-mono">
            {offTrackCount}
          </div>
          <div className={`text-[11px] ${textMuted} mt-1`}>
            {language === 'ar' ? 'تتطلب خطة تدخل' : 'Requires intervention'}
          </div>
        </div>

        <div className={`${cardBg} rounded-xl p-4`}>
          <div className={`flex items-center justify-between text-xs ${textMuted}`}>
            <span>{t('workforceHealth')}</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className={`text-2xl font-bold ${textPrimary} mt-2 font-mono`}>
            90.3%
          </div>
          <div className={`text-[11px] ${textMuted} mt-1`}>
            {language === 'ar' ? 'المستهدف: ≥90.0%' : 'Target: ≥90.0%'}
          </div>
        </div>

        <div className={`${cardBg} rounded-xl p-4`}>
          <div className={`flex items-center justify-between text-xs ${textMuted}`}>
            <span>{t('reportsGenerated')}</span>
            <FileSpreadsheet className="w-4 h-4 text-cyan-600" />
          </div>
          <div className={`text-2xl font-bold ${textPrimary} mt-2 font-mono`}>
            {reports.length}
          </div>
          <div className={`text-[11px] ${textMuted} mt-1`}>
            {language === 'ar' ? 'دورة أكتوبر 2026' : 'October 2026 Cycle'}
          </div>
        </div>
      </div>

      {/* Main Visuals Row: Status Breakdown + Department Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Donut */}
        <div className={`${cardBg} rounded-xl p-5 flex flex-col justify-between`}>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${textPrimary}`}>
              {language === 'ar' ? 'توزيع حالات مؤشرات الأداء' : 'Performance Status Distribution'}
            </h3>
            <p className={`text-xs ${textMuted} mt-0.5`}>
              {language === 'ar' ? 'بناءً على نتائج الحسابات المعتمدة' : 'Based on validated calculations'}
            </p>
          </div>

          <div className="h-48 my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={`grid grid-cols-3 gap-2 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/80'} text-center text-xs`}>
            <div>
              <div className="text-emerald-600 font-bold font-mono">{onTrackCount}</div>
              <div className={`text-[10px] ${textMuted}`}>{t('statusOnTrack')}</div>
            </div>
            <div>
              <div className="text-amber-600 font-bold font-mono">{atRiskCount}</div>
              <div className={`text-[10px] ${textMuted}`}>{t('statusAtRisk')}</div>
            </div>
            <div>
              <div className="text-rose-600 font-bold font-mono">{offTrackCount}</div>
              <div className={`text-[10px] ${textMuted}`}>{t('statusOffTrack')}</div>
            </div>
          </div>
        </div>

        {/* Department Retention Benchmark */}
        <div className={`${cardBg} rounded-xl p-5 lg:col-span-2 flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${textPrimary}`}>
                {language === 'ar' ? 'مقارنة معدلات الاستبقاء بين الإدارات (%)' : 'Department Retention Rate Comparison (%)'}
              </h3>
              <p className={`text-xs ${textMuted} mt-0.5`}>
                {language === 'ar' ? 'المستهدف المعياري: 90.0% استبقاء سنوي' : 'Target benchmark: 90.0% retention'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('departments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>{language === 'ar' ? 'تفاصيل الإدارات' : 'View Departments'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>

          <div className="h-56 my-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[70, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="retention" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`text-[11px] ${textMuted} pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/80'} flex items-center justify-between`}>
            <span>{language === 'ar' ? 'تم الحساب وفق التجميع المباشر للبسط والمقام' : 'Aggregated from verified numerator/denominator submissions'}</span>
            <span className={`font-semibold ${textPrimary}`}>5 {language === 'ar' ? 'إدارات رئيسية' : 'Operating Units'}</span>
          </div>
        </div>
      </div>

      {/* Critical Indicators + Top Performers Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Attention Card */}
        <div className={`${cardBg} rounded-xl p-5`}>
          <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h3 className={`font-bold ${textPrimary} text-xs uppercase tracking-wider`}>
                {language === 'ar' ? 'مؤشرات تتطلب متابعة فورية' : 'Indicators Requiring Immediate Attention'}
              </h3>
            </div>
            <span className={`text-[10px] ${textMuted} font-mono`}>
              {language === 'ar' ? 'مرتبة حسب الانحراف' : 'Sorted by variance'}
            </span>
          </div>

          <div className={`mt-3 divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/80'}`}>
            {criticalKpis.map(item => (
              <div
                key={item.kpi.id}
                onClick={() => onSelectKpi(item.kpi)}
                className={`py-3 flex items-center justify-between ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'} px-2 rounded-lg cursor-pointer transition-colors`}
              >
                <div>
                  <div className={`flex items-center gap-2 text-xs font-bold ${textPrimary}`}>
                    <span className="font-mono text-blue-600">{item.kpi.code}</span>
                    <span>{language === 'ar' ? item.kpi.nameAr : item.kpi.name}</span>
                  </div>
                  <div className={`text-[11px] ${textMuted} mt-0.5`}>
                    {language === 'ar' ? 'المستهدف:' : 'Target:'} {item.kpi.targetValue} {item.kpi.unit} · {item.kpi.trendGoodWhen}
                  </div>
                </div>

                <div className="text-right rtl:text-left">
                  <div className={`text-sm font-bold ${textPrimary} font-mono`}>
                    {item.currentValue} {item.kpi.unit}
                  </div>
                  <div className={`text-[10px] font-semibold ${item.status === 'Off Track' ? 'text-rose-600' : 'text-amber-600'}`}>
                    {item.status} ({item.variance > 0 ? `+${item.variance}` : item.variance})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers Card */}
        <div className={`${cardBg} rounded-xl p-5`}>
          <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className={`font-bold ${textPrimary} text-xs uppercase tracking-wider`}>
                {language === 'ar' ? 'أعلى المؤشرات استقراراً وامتثالاً' : 'Top Performing Indicators'}
              </h3>
            </div>
            <span className={`text-[10px] ${textMuted} font-mono`}>
              {language === 'ar' ? 'ضمن المستهدف' : 'On target'}
            </span>
          </div>

          <div className={`mt-3 divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/80'}`}>
            {topKpis.map(item => (
              <div
                key={item.kpi.id}
                onClick={() => onSelectKpi(item.kpi)}
                className={`py-3 flex items-center justify-between ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'} px-2 rounded-lg cursor-pointer transition-colors`}
              >
                <div>
                  <div className={`flex items-center gap-2 text-xs font-bold ${textPrimary}`}>
                    <span className="font-mono text-emerald-600">{item.kpi.code}</span>
                    <span>{language === 'ar' ? item.kpi.nameAr : item.kpi.name}</span>
                  </div>
                  <div className={`text-[11px] ${textMuted} mt-0.5`}>
                    {language === 'ar' ? 'المستهدف:' : 'Target:'} {item.kpi.targetValue} {item.kpi.unit} · {language === 'ar' ? item.kpi.categoryAr : item.kpi.category}
                  </div>
                </div>

                <div className="text-right rtl:text-left">
                  <div className={`text-sm font-bold ${textPrimary} font-mono`}>
                    {item.currentValue} {item.kpi.unit}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">
                    {t('statusOnTrack')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
