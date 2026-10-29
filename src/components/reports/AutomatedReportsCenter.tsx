import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GeneratedReport } from '../../types';
import jsPDF from 'jspdf';
import {
  FileSpreadsheet,
  Download,
  Play,
  Eye,
  X,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AutomatedReportsCenter: React.FC = () => {
  const { reports, generateReport, currentOrg, language, t, theme } = useApp();
  const isLight = theme === 'light';
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);
  const [reportPeriodType, setReportPeriodType] = useState<'weekly' | 'monthly'>('monthly');

  const handleGenerateNow = async () => {
    setIsGenerating(true);
    const now = new Date();
    const periodStr =
      reportPeriodType === 'weekly'
        ? `2026-W${Math.ceil(now.getDate() / 7)}`
        : `2026-${String(now.getMonth() + 1).padStart(2, '0')}`;

    try {
      const rep = await generateReport(reportPeriodType, periodStr);
      setSelectedReport(rep);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export to Real PDF using jsPDF
  const exportPdfReport = (report: GeneratedReport) => {
    const doc = new jsPDF();
    doc.setFillColor(37, 99, 235); // Blue primary
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('HR KPI INTELLIGENCE PLATFORM', 15, 18);

    doc.setFontSize(10);
    doc.setTextColor(224, 231, 255);
    doc.text(`Official Executive Performance Audit · Generated for: ${currentOrg.name}`, 15, 26);
    doc.text(`Period: ${report.period} · Timezone: ${currentOrg.defaultTimezone}`, 15, 33);

    // Summary Box
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(13);
    doc.text('1. Executive Performance Summary', 15, 50);

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const splitSummary = doc.splitTextToSize(report.executiveSummary, 180);
    doc.text(splitSummary, 15, 58);

    // KPI Audit Table
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text('2. Verified Key Performance Indicators', 15, 90);

    let y = 100;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('KPI Name', 15, y);
    doc.text('Category', 90, y);
    doc.text('Actual', 135, y);
    doc.text('Target', 155, y);
    doc.text('Status', 178, y);
    y += 4;
    doc.line(15, y, 195, y);
    y += 6;

    doc.setTextColor(30, 41, 59);
    report.kpiResults.slice(0, 14).forEach(k => {
      doc.text(k.kpiName.slice(0, 42), 15, y);
      doc.text(k.category.slice(0, 22), 90, y);
      doc.text(`${k.value} ${k.unit}`, 135, y);
      doc.text(`${k.target} ${k.unit}`, 155, y);
      doc.text(k.status, 178, y);
      y += 7;
    });

    if (y < 230) {
      y += 8;
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text('3. Strategic HR Interventions', 15, y);
      y += 8;
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      report.recommendations.forEach(rec => {
        doc.text(`• ${rec}`, 15, y);
        y += 6;
      });
    }

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Confidential & Proprietary · Certified Deterministic Calculation · HR KPI Intelligence Platform`,
      15,
      285
    );

    doc.save(`HR_Report_${currentOrg.id}_${report.period}.pdf`);
  };

  const exportCsvReport = (report: GeneratedReport) => {
    const headers = ['KPI ID', 'Name', 'Category', 'Actual Value', 'Target', 'Unit', 'Status', 'Variance'];
    const rows = report.kpiResults.map(k => [
      k.kpiId,
      `"${k.kpiName}"`,
      `"${k.category}"`,
      k.value,
      k.target,
      k.unit,
      k.status,
      k.variance,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HR_Audit_${report.period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cardBg = isLight ? 'bg-white border border-slate-200/90 shadow-xs' : 'bg-slate-900 border border-slate-800 shadow-sm';
  const textPrimary = isLight ? 'text-slate-900' : 'text-slate-100';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="space-y-6">
      {/* Title & Automation Control Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold ${textPrimary} tracking-tight`}>
            {t('navReports')}
          </h2>
          <p className={`text-xs ${textMuted} mt-0.5`}>
            {language === 'ar'
              ? 'نظام التقارير الآلية المجدولة أسبوعياً وشهرياً وفق توقيت الرياض وحفظ الأرشيف الدائم'
              : 'Automated background reporting engine with Asia/Riyadh scheduler, permanent archiving, and PDF export'}
          </p>
        </div>

        {/* Generate Report Controls */}
        <div className="flex items-center gap-2">
          <div className={`${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'} border rounded-lg p-1 flex items-center text-xs`}>
            <button
              onClick={() => setReportPeriodType('weekly')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                reportPeriodType === 'weekly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {language === 'ar' ? 'أسبوعي' : 'Weekly'}
            </button>
            <button
              onClick={() => setReportPeriodType('monthly')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                reportPeriodType === 'monthly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {language === 'ar' ? 'شهري' : 'Monthly'}
            </button>
          </div>

          <button
            onClick={handleGenerateNow}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isGenerating ? (language === 'ar' ? 'جارٍ التوليد...' : 'Synthesizing...') : t('generateReportNow')}</span>
          </button>
        </div>
      </div>

      {/* Scheduler Active Information Card */}
      <div className={`${cardBg} rounded-xl p-5`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-lg shrink-0 ${isLight ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-emerald-950/60 border border-emerald-800 text-emerald-400'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-200">
                <span>{t('automatedScheduler')}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-600 font-mono text-[11px] font-bold">{t('schedulerActive')}</span>
              </div>
              <p className={`text-xs ${textMuted} mt-1 leading-relaxed`}>
                {language === 'ar'
                  ? 'يتم توليد تقرير أسبوعي تلقائياً كل أحد وخميس الساعة 08:00 صباحاً بتوقيت الرياض، وتقرير شهري شامل في أول يوم من كل شهر ميلادي.'
                  : 'Weekly reports generate automatically every Sunday and Thursday at 08:00 AST. Monthly audit digests trigger on the 1st of each calendar month.'}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-4 text-xs font-mono shrink-0 border-t md:border-t-0 md:border-l rtl:md:border-l-0 rtl:md:border-r ${isLight ? 'border-slate-200' : 'border-slate-800'} pt-3 md:pt-0 md:pl-4 rtl:md:pr-4`}>
            <div>
              <div className={`text-[10px] ${textMuted} uppercase`}>{t('nextRun')}</div>
              <div className={`font-bold mt-0.5 ${textPrimary}`}>Sunday 08:00 AST</div>
            </div>
            <div>
              <div className={`text-[10px] ${textMuted} uppercase`}>Cadence</div>
              <div className="text-blue-600 font-bold mt-0.5">Idempotent Cron</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Archive Table */}
      <div className={`${cardBg} rounded-xl overflow-hidden`}>
        <div className={`px-5 py-3.5 border-b ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} flex items-center justify-between`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider ${textPrimary}`}>
            {language === 'ar' ? 'أرشيف التقارير التنفيذية الصادرة' : 'Executive Audit Reports Archive'}
          </h3>
          <span className={`text-[11px] ${textMuted} font-mono font-bold`}>{reports.length} Reports</span>
        </div>

        <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/80'}`}>
          {reports.map(report => (
            <div
              key={report.id}
              className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'} transition-colors`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold">
                  <span className="text-blue-600 uppercase">{report.reportType}</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className={textMuted}>{report.period}</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className={textMuted}>{new Date(report.generatedAt).toLocaleString()}</span>
                </div>
                <h4 className={`text-sm font-bold ${textPrimary}`}>
                  {language === 'ar' ? report.titleAr : report.title}
                </h4>
                <p className={`text-xs ${textMuted} line-clamp-1 max-w-2xl`}>
                  {language === 'ar' ? report.executiveSummaryAr : report.executiveSummary}
                </p>
              </div>

              {/* Status Counters & Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <div className={`flex items-center gap-2 text-xs font-mono ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'} border px-3 py-1.5 rounded-lg font-bold`}>
                  <span className="text-emerald-600">{report.summary.onTrack} On Track</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-amber-600">{report.summary.atRisk} At Risk</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-rose-600">{report.summary.offTrack} Off Track</span>
                </div>

                <button
                  onClick={() => setSelectedReport(report)}
                  className={`p-2 rounded-lg border transition-colors ${
                    isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                  title="View Report Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => exportPdfReport(report)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                  title="Download Official PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => exportCsvReport(report)}
                  className={`p-2 rounded-lg border transition-colors ${
                    isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
                  }`}
                  title="Download CSV"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Report Viewer Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`${isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'} border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} flex items-center justify-between`}>
              <div>
                <div className="text-xs font-mono font-bold text-blue-600 mb-0.5">
                  {selectedReport.period} · {selectedReport.reportType.toUpperCase()}
                </div>
                <h3 className={`text-base font-bold ${textPrimary}`}>
                  {language === 'ar' ? selectedReport.titleAr : selectedReport.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportPdfReport(selectedReport)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('exportPdf')}</span>
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* Executive Summary */}
              <div>
                <h4 className={`font-bold text-xs uppercase tracking-wider mb-2 ${textPrimary}`}>
                  {t('executiveSummary')}
                </h4>
                <div className={`p-4 rounded-xl leading-relaxed ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-slate-800/60 border border-slate-700/60 text-slate-200'}`}>
                  {language === 'ar'
                    ? selectedReport.executiveSummaryAr
                    : selectedReport.executiveSummary}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className={`font-bold text-xs uppercase tracking-wider mb-2 ${textPrimary}`}>
                  {t('recommendations')}
                </h4>
                <div className="space-y-2">
                  {selectedReport.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg flex items-start gap-2.5 ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-slate-800/40 border border-slate-700/50 text-slate-300'}`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPI Results Table */}
              <div>
                <h4 className={`font-bold text-xs uppercase tracking-wider mb-2 ${textPrimary}`}>
                  Verified KPI Breakdown ({selectedReport.kpiResults.length})
                </h4>
                <div className={`border rounded-xl overflow-hidden ${isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'}`}>
                  <table className="w-full text-left rtl:text-right text-xs">
                    <thead className={`${isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'} uppercase text-[10px] tracking-wider border-b font-mono font-bold`}>
                      <tr>
                        <th className="py-2.5 px-3">Indicator</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-right rtl:text-left">Actual</th>
                        <th className="py-2.5 px-3 text-right rtl:text-left">Target</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/80 text-slate-300'}`}>
                      {selectedReport.kpiResults.map(k => (
                        <tr key={k.kpiId} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}>
                          <td className="py-2.5 px-3 font-bold">
                            {language === 'ar' ? k.kpiNameAr : k.kpiName}
                          </td>
                          <td className={`py-2.5 px-3 ${textMuted}`}>{k.category}</td>
                          <td className="py-2.5 px-3 text-right rtl:text-left font-mono font-bold">
                            {k.value} {k.unit}
                          </td>
                          <td className={`py-2.5 px-3 text-right rtl:text-left font-mono ${textMuted}`}>
                            {k.target} {k.unit}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`font-bold ${
                                k.status === 'On Track'
                                  ? 'text-emerald-600'
                                  : k.status === 'At Risk'
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {k.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className={`px-6 py-3 border-t ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} flex justify-end`}>
              <button
                onClick={() => setSelectedReport(null)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
