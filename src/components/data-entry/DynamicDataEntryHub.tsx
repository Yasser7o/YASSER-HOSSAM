import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { KPIDefinition } from '../../types';
import { evaluateFormula, determineKPIStatus } from '../../utils/calculator';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  History,
} from 'lucide-react';

interface DynamicDataEntryHubProps {
  preselectedKpi?: KPIDefinition | null;
  onClearPreselection?: () => void;
}

export const DynamicDataEntryHub: React.FC<DynamicDataEntryHubProps> = ({
  preselectedKpi,
  onClearPreselection,
}) => {
  const { kpis, currentOrg, language, t, submitKpiData, submissions, getKpiLatestSubmission, theme } = useApp();
  const isLight = theme === 'light';

  const [selectedKpiId, setSelectedKpiId] = useState<string>(
    preselectedKpi?.id || kpis[0]?.id || ''
  );
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    currentOrg.departments[0]?.id || 'dept-eng'
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-10');
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Current active KPI definition
  const currentKpi = kpis.find(k => k.id === selectedKpiId) || kpis[0];

  useEffect(() => {
    if (preselectedKpi) {
      setSelectedKpiId(preselectedKpi.id);
    }
  }, [preselectedKpi]);

  useEffect(() => {
    if (currentKpi) {
      const latest = getKpiLatestSubmission(currentKpi.id);
      const init: Record<string, number> = {};
      for (const v of currentKpi.variables) {
        init[v.id] = latest?.inputs[v.id] ?? (v.defaultValue ?? 0);
      }
      setInputs(init);
      setFeedback(null);
    }
  }, [selectedKpiId]);

  // Live evaluation
  const preview = currentKpi
    ? evaluateFormula(currentKpi.calculationFormula, inputs)
    : { value: 0, isError: false };

  const previewStatus = currentKpi
    ? determineKPIStatus(
        preview.value,
        currentKpi.targetValue,
        currentKpi.trendGoodWhen,
        currentKpi.warningThreshold,
        currentKpi.criticalThreshold
      )
    : { status: 'On Track' as const, variance: 0, percentageDeviation: 0 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentKpi) return;

    setIsSubmitting(true);
    setFeedback(null);

    const res = await submitKpiData(currentKpi.id, selectedDeptId, selectedPeriod, inputs, notes);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `${language === 'ar' ? 'تم اعتماد القيمة وتحديث المؤشر بنجاح:' : 'Successfully recorded & verified:'} ${preview.value} ${currentKpi.unit}`,
      });
      setNotes('');
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to submit calculation data',
      });
    }
  };

  const recentSubmissions = submissions
    .filter(s => s.orgId === currentOrg.id)
    .slice(0, 8);

  const cardBg = isLight ? 'bg-white border border-slate-200/90 shadow-xs' : 'bg-slate-900 border border-slate-800 shadow-sm';
  const textPrimary = isLight ? 'text-slate-900' : 'text-slate-100';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';
  const inputBg = isLight ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white' : 'bg-slate-800 border-slate-700 text-slate-200';
  const subBoxBg = isLight ? 'bg-slate-50/80 border border-slate-200' : 'bg-slate-800/50 border border-slate-700/60';

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className={`text-xl font-bold ${textPrimary} tracking-tight`}>
          {t('navDataEntry')}
        </h2>
        <p className={`text-xs ${textMuted} mt-0.5`}>
          {language === 'ar'
            ? 'محرك التوليد الديناميكي لنماذج الإدخال وفق المتغيرات الرياضية المعتمدة لكل مؤشر'
            : 'Dynamic variable form generator supporting deterministic formulas, zero-division safety, and audit traceability'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form (2 cols) */}
        <div className={`lg:col-span-2 ${cardBg} rounded-xl p-5 sm:p-6 space-y-6`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* KPI Selection */}
            <div>
              <label htmlFor="select-kpi" className={`block text-xs font-bold uppercase tracking-wider ${textPrimary} mb-1.5`}>
                1. {language === 'ar' ? 'اختر مؤشر الأداء المراد تغذيته' : 'Select Target Performance Indicator'}
              </label>
              <select
                id="select-kpi"
                value={selectedKpiId}
                onChange={e => setSelectedKpiId(e.target.value)}
                className={`w-full ${inputBg} border rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500`}
              >
                {kpis.map(k => (
                  <option key={k.id} value={k.id}>
                    [{k.code}] {language === 'ar' ? k.nameAr : k.name} — ({k.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Scope: Period & Department */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <div>
                <label htmlFor="period-selector" className={`block text-xs font-medium ${textMuted} mb-1.5`}>
                  2. {t('period')}
                </label>
                <select
                  id="period-selector"
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500`}
                >
                  <option value="2026-10">October 2026 (Monthly)</option>
                  <option value="2026-09">September 2026 (Monthly)</option>
                  <option value="2026-Q3">Q3 2026 (Quarterly)</option>
                  <option value="2026-Q2">Q2 2026 (Quarterly)</option>
                  <option value="2026-Annual">2026 Full Calendar Year</option>
                </select>
              </div>

              <div>
                <label htmlFor="dept-selector" className={`block text-xs font-medium ${textMuted} mb-1.5`}>
                  3. {t('navDepartments')}
                </label>
                <select
                  id="dept-selector"
                  value={selectedDeptId}
                  onChange={e => setSelectedDeptId(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500`}
                >
                  {currentOrg.departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {language === 'ar' ? d.nameAr : d.name} ({d.headCount} {language === 'ar' ? 'موظف' : 'Staff'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Formula Reference Banner */}
            {currentKpi && (
              <div className={`p-3 rounded-lg flex items-center justify-between text-xs font-mono ${isLight ? 'bg-blue-50/80 border border-blue-200 text-blue-900' : 'bg-slate-950 border border-slate-800 text-blue-300'}`}>
                <span className={`text-[11px] ${isLight ? 'text-blue-700' : 'text-slate-400'}`}>Formula:</span>
                <span className="font-bold">{currentKpi.formulaDisplay}</span>
              </div>
            )}

            {/* Dynamic Operational Variables */}
            <div className={`space-y-3 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <label className={`text-xs font-bold uppercase tracking-wider ${textPrimary}`}>
                  4. {t('inputVariables')} ({currentKpi?.variables.length || 0})
                </label>
                <span className={`text-[11px] ${textMuted} font-mono`}>Real-time AST parsing</span>
              </div>

              <div className="space-y-3">
                {currentKpi?.variables.map(v => (
                  <div
                    key={v.id}
                    className={`p-3.5 ${subBoxBg} rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                  >
                    <div className="flex-1">
                      <div className={`text-xs font-bold ${textPrimary}`}>
                        {language === 'ar' ? v.nameAr : v.name}
                      </div>
                      <div className={`text-[11px] ${textMuted} mt-0.5`}>{v.description}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        min={v.min ?? 0}
                        max={v.max}
                        value={inputs[v.id] ?? ''}
                        onChange={e =>
                          setInputs({
                            ...inputs,
                            [v.id]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className={`w-32 ${inputBg} border rounded-lg px-3 py-1.5 text-sm font-mono text-right rtl:text-left focus:outline-none focus:border-blue-500`}
                        required={v.required}
                      />
                      <span className={`text-xs font-mono w-14 shrink-0 ${textMuted}`}>{v.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Trail Note */}
            <div>
              <label htmlFor="verification-notes" className={`block text-xs font-medium ${textMuted} mb-1.5`}>
                5. {language === 'ar' ? 'ملاحظات التوثيق والتدقيق' : 'Verification Notes (Audit Log)'}
              </label>
              <input
                id="verification-notes"
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'مصدر البيانات (مثل نظام SAP، Oracle HCM، أو مسيرات الرواتب)...'
                    : 'Data source (e.g., Oracle HCM, SAP SuccessFactors, or Payroll Ledger)...'
                }
                className={`w-full ${inputBg} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500`}
              />
            </div>

            {/* Live Calculation Preview Banner */}
            <div className={`p-4 rounded-xl flex items-center justify-between ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-950 border border-slate-800'}`}>
              <div>
                <div className={`text-[11px] ${textMuted} uppercase tracking-wider font-semibold`}>
                  {language === 'ar' ? 'القيمة المحسوبة فورياً للمعادلة' : 'Computed Result Preview'}
                </div>
                <div className={`text-2xl font-bold ${textPrimary} flex items-baseline gap-1 mt-0.5 font-mono`}>
                  <span>{preview.isError ? '—' : preview.value}</span>
                  <span className="text-xs font-normal text-slate-500 font-sans">{currentKpi?.unit}</span>
                </div>
                {preview.isError && (
                  <div className="text-xs text-rose-600 mt-1">{preview.errorMessage}</div>
                )}
              </div>

              <div className="text-right rtl:text-left">
                <div className={`text-[11px] ${textMuted} uppercase tracking-wider font-semibold`}>{t('status')}</div>
                <div className="text-xs font-bold mt-1 text-emerald-600">
                  {previewStatus.status} (Target: {currentKpi?.targetValue} {currentKpi?.unit})
                </div>
              </div>
            </div>

            {/* Feedback Message */}
            {feedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting || preview.isError}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? t('submitting') : t('submitData')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Audit Submissions Log (1 col) */}
        <div className={`${cardBg} rounded-xl p-5 flex flex-col justify-between`}>
          <div>
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <h3 className={`font-bold ${textPrimary} text-xs uppercase tracking-wider`}>
                  {language === 'ar' ? 'سجل العمليات الأخيرة' : 'Recent Submissions Audit'}
                </h3>
              </div>
              <span className={`text-[10px] ${textMuted} font-mono`}>Immutable</span>
            </div>

            <div className={`mt-3 divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/80'} max-h-[560px] overflow-y-auto`}>
              {recentSubmissions.map(sub => {
                const kpi = kpis.find(k => k.id === sub.kpiId);
                return (
                  <div key={sub.id} className="py-3 text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-blue-600">{kpi?.code || 'KPI'}</span>
                      <span className={`text-[11px] ${textMuted}`}>{sub.period}</span>
                    </div>
                    <div className={`font-semibold ${textPrimary} line-clamp-1`}>
                      {language === 'ar' ? kpi?.nameAr : kpi?.name}
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className={`font-bold font-mono ${textPrimary}`}>
                        {sub.calculatedValue} {kpi?.unit}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          sub.status === 'On Track'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : 'text-amber-700 bg-amber-50 border border-amber-200'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                    <div className={`text-[10px] ${textMuted} flex items-center justify-between pt-0.5`}>
                      <span>by {sub.submittedBy}</span>
                      <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`pt-4 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'} text-[11px] ${textMuted}`}>
            {language === 'ar'
              ? 'تخضع كافة السجلات لمعايير الحوكمة والتدقيق الداخلي.'
              : 'All numerical transactions maintain certified audit trail timestamps.'}
          </div>
        </div>
      </div>
    </div>
  );
};
