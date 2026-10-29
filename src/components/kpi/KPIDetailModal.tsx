import React, { useState, useEffect } from 'react';
import { KPIDefinition, KPISubmission, KPIStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { evaluateFormula, determineKPIStatus } from '../../utils/calculator';
import {
  X,
  TrendingUp,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface KPIDetailModalProps {
  kpi: KPIDefinition;
  onClose: () => void;
  initialTab?: 'overview' | 'calculation' | 'dataEntry' | 'performance' | 'aiInsights' | 'reports';
}

export const KPIDetailModal: React.FC<KPIDetailModalProps> = ({ kpi, onClose, initialTab = 'overview' }) => {
  const { language, t, submitKpiData, getKpiLatestSubmission, getKpiHistory, currentOrg, theme } = useApp();
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState(initialTab);

  const latestSub = getKpiLatestSubmission(kpi.id);
  const history = getKpiHistory(kpi.id);

  // Dynamic Form State: initialized with variable default values or latest submission
  const [inputs, setInputs] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const v of kpi.variables) {
      init[v.id] = latestSub?.inputs[v.id] ?? (v.defaultValue ?? 0);
    }
    return init;
  });

  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-10');
  const [selectedDept, setSelectedDept] = useState<string>(currentOrg.departments[0]?.id || 'dept-eng');
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // AI Insights State
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Dynamic Live Preview calculation as inputs change
  const previewCalc = evaluateFormula(kpi.calculationFormula, inputs);
  const previewStatus = determineKPIStatus(
    previewCalc.value,
    kpi.targetValue,
    kpi.trendGoodWhen,
    kpi.warningThreshold,
    kpi.criticalThreshold
  );

  // Load AI Diagnosis when tab is clicked
  useEffect(() => {
    if (activeTab === 'aiInsights' && !aiInsight && !isLoadingAi) {
      loadAiExplanation();
    }
  }, [activeTab]);

  const loadAiExplanation = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kpiName: language === 'ar' ? kpi.nameAr : kpi.name,
          currentValue: latestSub?.calculatedValue ?? kpi.targetValue,
          targetValue: kpi.targetValue,
          department: currentOrg.departments.find(d => d.id === selectedDept)?.name,
          historicalTrend: history.map(h => ({ period: h.period, value: h.calculatedValue })),
          language,
        }),
      });
      const data = await res.json();
      setAiInsight(data.insight);
    } catch (e: any) {
      setAiInsight('Unable to contact AI intelligence engine. Using cached analytical heuristics.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const res = await submitKpiData(kpi.id, selectedDept, selectedPeriod, inputs, submissionNotes);
    setIsSubmitting(false);

    if (res.success) {
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } else {
      setSubmitError(res.error || 'Submission failed');
    }
  };

  const chartData = history.map(h => ({
    period: h.period,
    value: h.calculatedValue,
    target: kpi.targetValue,
  }));

  const displayName = language === 'ar' ? kpi.nameAr : kpi.name;
  const displayCategory = language === 'ar' ? kpi.categoryAr : kpi.category;

  const modalBg = isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-300';
  const headerBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800';
  const tabBg = isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800';
  const subBoxBg = isLight ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-slate-800/40 border border-slate-700/50 text-slate-300';
  const inputBg = isLight ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white' : 'bg-slate-900 border-slate-700 text-slate-100';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className={`${modalBg} border rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-colors`}>
        {/* Modal Header */}
        <div className={`px-6 py-4 ${headerBg} border-b flex items-center justify-between`}>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-blue-600 mb-1">
              <span>{kpi.code}</span>
              <span aria-hidden="true">·</span>
              <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>{displayCategory}</span>
              <span aria-hidden="true">·</span>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{kpi.reportingFrequency}</span>
            </div>
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{displayName}</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${isLight ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Controls */}
        <div className={`px-6 py-2.5 ${tabBg} border-b flex items-center gap-1 overflow-x-auto text-xs`}>
          {[
            { id: 'overview', label: t('tabOverview') },
            { id: 'calculation', label: t('tabCalculation') },
            { id: 'dataEntry', label: t('tabDataEntry') },
            { id: 'performance', label: t('tabPerformance') },
            { id: 'aiInsights', label: t('tabAiInsights'), isAi: true },
            { id: 'reports', label: t('tabReports') },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {tab.isAi && <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} mb-2`}>
                  {language === 'ar' ? 'تعريف المؤشر الرسمي' : 'Official KPI Definition'}
                </h4>
                <p className={`p-4 rounded-xl leading-relaxed ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-slate-800/60 border border-slate-700/60 text-slate-200'}`}>
                  {language === 'ar' ? kpi.definitionAr : kpi.definition}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl space-y-2 ${subBoxBg}`}>
                  <h5 className={`font-bold text-xs flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('purpose')}</span>
                  </h5>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {language === 'ar' ? kpi.purposeAr : kpi.purpose}
                  </p>
                </div>

                <div className={`p-4 rounded-xl space-y-2 ${subBoxBg}`}>
                  <h5 className={`font-bold text-xs flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>{t('objective')}</span>
                  </h5>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {language === 'ar' ? kpi.objectiveMeasuredAr : kpi.objectiveMeasured}
                  </p>
                </div>
              </div>

              {/* Source Reference Block */}
              <div className={`p-3 rounded-lg flex items-center justify-between text-xs ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-600' : 'bg-slate-950/60 border border-slate-800 text-slate-400'}`}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>
                    {language === 'ar' ? 'المستند المرجعي الموثق' : 'Source Document Reference'}: {kpi.sourceDoc}
                  </span>
                </div>
                {kpi.sourcePage && (
                  <span className="font-mono font-semibold">
                    {language === 'ar' ? 'الصفحة' : 'Page'} {kpi.sourcePage}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CALCULATION METHOD */}
          {activeTab === 'calculation' && (
            <div className="space-y-6">
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} mb-2`}>
                  {t('formula')}
                </h4>
                <div className={`p-4 rounded-xl font-mono text-sm overflow-x-auto ${isLight ? 'bg-blue-50/60 border border-blue-200 text-blue-900' : 'bg-slate-950 border border-blue-500/30 text-blue-300'}`}>
                  {kpi.formulaDisplay}
                </div>
              </div>

              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} mb-2`}>
                  {t('inputVariables')} ({kpi.variables.length})
                </h4>
                <div className={`border rounded-xl overflow-hidden divide-y ${isLight ? 'border-slate-200 divide-slate-100 bg-white' : 'border-slate-800 divide-slate-800 bg-slate-900'}`}>
                  {kpi.variables.map(v => (
                    <div key={v.id} className="p-3.5 flex items-start justify-between gap-4">
                      <div>
                        <div className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                          {language === 'ar' ? v.nameAr : v.name}
                        </div>
                        <div className={`text-[11px] mt-0.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          {v.description}
                        </div>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${isLight ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-300'}`}>
                        {v.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded-xl ${subBoxBg}`}>
                <h5 className={`text-xs font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{t('exampleCalculation')}</h5>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {language === 'ar'
                    ? 'يتم تطبيق محرك الحسابات الآمن والخالي من eval لحساب الناتج بدقة، مع فحص حالات القسمة على صفر والتجميع الوزني للبسط والمقام في المؤشرات النسبية.'
                    : 'Evaluated deterministically through a sandboxed arithmetic engine. Aggregates numerators and denominators over multi-period reporting to prevent unweighted ratio errors.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE DATA ENTRY */}
          {activeTab === 'dataEntry' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-period" className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>{t('period')}</label>
                  <select
                    id="modal-period"
                    value={selectedPeriod}
                    onChange={e => setSelectedPeriod(e.target.value)}
                    className={`w-full ${inputBg} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  >
                    <option value="2026-10">October 2026 (Monthly)</option>
                    <option value="2026-09">September 2026 (Monthly)</option>
                    <option value="2026-Q3">Q3 2026 (Quarterly)</option>
                    <option value="2026-Q2">Q2 2026 (Quarterly)</option>
                    <option value="2026-Annual">2026 Full Year (Annual)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="modal-dept" className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>{t('navDepartments')}</label>
                  <select
                    id="modal-dept"
                    value={selectedDept}
                    onChange={e => setSelectedDept(e.target.value)}
                    className={`w-full ${inputBg} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  >
                    {currentOrg.departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {language === 'ar' ? d.nameAr : d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Variable Inputs */}
              <div className="space-y-4">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  {t('inputVariables')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {kpi.variables.map(v => (
                    <div key={v.id} className={`p-3.5 rounded-xl space-y-1.5 ${subBoxBg}`}>
                      <div className="flex items-center justify-between">
                        <label htmlFor={`modal-var-${v.id}`} className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                          {language === 'ar' ? v.nameAr : v.name}
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">{v.unit}</span>
                      </div>
                      <input
                        id={`modal-var-${v.id}`}
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
                        className={`w-full ${inputBg} border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500`}
                        required={v.required}
                      />
                      <p className="text-[10px] text-slate-500 line-clamp-1">{v.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes Input */}
              <div>
                <label htmlFor="modal-notes" className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  {language === 'ar' ? 'ملاحظات التدقيق وتوثيق الفترة' : 'Audit Trail Notes & Source Verification'}
                </label>
                <textarea
                  id="modal-notes"
                  rows={2}
                  value={submissionNotes}
                  onChange={e => setSubmissionNotes(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'أدخل أية تفاصيل خاصة بتسوية البيانات أو مصدر السجلات...'
                      : 'Enter audit notes or ledger documentation details...'
                  }
                  className={`w-full ${inputBg} border rounded-lg p-3 text-xs focus:outline-none focus:border-blue-500`}
                />
              </div>

              {/* Live Preview Box */}
              <div className={`p-4 rounded-xl flex items-center justify-between ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-950 border border-slate-800'}`}>
                <div>
                  <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} font-semibold`}>
                    {language === 'ar' ? 'معاينة القيمة المحسوبة فورياً' : 'Live Deterministic Calculation'}
                  </div>
                  <div className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'} flex items-baseline gap-1 mt-0.5 font-mono`}>
                    <span>{previewCalc.isError ? '—' : previewCalc.value}</span>
                    <span className="text-xs font-normal text-slate-500 font-sans">{kpi.unit}</span>
                  </div>
                  {previewCalc.isError && (
                    <div className="text-xs text-rose-600 mt-1">{previewCalc.errorMessage}</div>
                  )}
                </div>

                <div className="text-right rtl:text-left">
                  <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} font-semibold`}>{t('status')}</div>
                  <div className="text-xs font-bold mt-1 text-blue-600">
                    {previewStatus.status} ({previewStatus.variance > 0 ? `+${previewStatus.variance}` : previewStatus.variance} {kpi.unit})
                  </div>
                </div>
              </div>

              {/* Submission Feedback */}
              {submitSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('submissionSuccess')}</span>
                </div>
              )}
              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || previewCalc.isError}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t('submitting') : t('submitData')}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: PERFORMANCE TRENDS */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  {language === 'ar' ? 'سلسلة التطور الزمني للمؤشر' : 'Historical Period Performance Trend'}
                </h4>
                <div className="text-xs text-slate-500 font-mono">
                  Target: <span className="text-blue-600 font-bold">{kpi.targetValue} {kpi.unit}</span>
                </div>
              </div>

              {/* Recharts Line Chart */}
              <div className={`h-64 w-full rounded-xl p-3 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-950/80 border border-slate-800'}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#334155'} />
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={
                        isLight
                          ? { backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px' }
                          : { backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }
                      }
                    />
                    <ReferenceLine y={kpi.targetValue} stroke="#2563eb" strokeDasharray="4 4" label="Target" />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Historical Submission Records Table */}
              <div>
                <h5 className={`text-xs font-bold mb-2 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  {language === 'ar' ? 'سجلات الإرسال المعتمدة' : 'Verified Submissions Ledger'}
                </h5>
                <div className={`border rounded-xl overflow-hidden divide-y ${isLight ? 'border-slate-200 divide-slate-100 bg-white' : 'border-slate-800 divide-slate-800 bg-slate-900'}`}>
                  {history.map(sub => (
                    <div key={sub.id} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>{sub.period}</span>
                        <span className="text-slate-500">by {sub.submittedBy}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold font-mono ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{sub.calculatedValue} {kpi.unit}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            sub.status === 'On Track'
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : sub.status === 'At Risk'
                              ? 'text-amber-700 bg-amber-50 border border-amber-200'
                              : 'text-rose-700 bg-rose-50 border border-rose-200'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI STRATEGIC DIAGNOSIS */}
          {activeTab === 'aiInsights' && (
            <div className="space-y-4">
              <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h4 className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                    {language === 'ar' ? 'تحليل الذكاء الاصطناعي للأداء والأسباب الجذرية' : 'AI Performance Diagnosis & Root Cause Analysis'}
                  </h4>
                </div>
                <button
                  onClick={loadAiExplanation}
                  disabled={isLoadingAi}
                  className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                    isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  {isLoadingAi ? 'Analyzing...' : 'Refresh AI Diagnosis'}
                </button>
              </div>

              {isLoadingAi ? (
                <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>{language === 'ar' ? 'جارٍ تحليل بيانات الدوران ومقارنة المعايير...' : 'Synthesizing workforce metrics with Gemini...'}</span>
                </div>
              ) : (
                <div className={`p-5 rounded-xl leading-relaxed whitespace-pre-wrap font-sans text-xs ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-slate-950/70 border border-slate-800 text-slate-200'}`}>
                  {aiInsight}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: REPORTS & AUDIT */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                {language === 'ar' ? 'سجل التدقيق والحوكمة' : 'Audit Trail & Compliance History'}
              </h4>
              <div className="space-y-2">
                {history.flatMap(h => h.auditTrail || []).map((log, i) => (
                  <div key={i} className={`p-3 rounded-lg text-xs space-y-1 ${subBoxBg}`}>
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{log.user}</span>
                    </div>
                    <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{log.action}</div>
                    {log.details && <div className="text-[11px] text-slate-500">{log.details}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-3 ${headerBg} border-t flex items-center justify-between`}>
          <div className="text-xs text-slate-500 font-mono">
            ID: {kpi.id} · Target: {kpi.targetValue} {kpi.unit}
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              isLight ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
