import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KPIDefinition, ImportSession } from '../../types';
import { SEED_KPIS } from '../../data/seedKPIs';
import {
  UploadCloud,
  FileText,
  Check,
  Sparkles,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

export const ImportCenter: React.FC = () => {
  const { language, t, importSessions, importSessionBatch, addOrUpdateKpi, theme } = useApp();
  const isLight = theme === 'light';
  const [activeSession, setActiveSession] = useState<ImportSession>(importSessions[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLoadAttachedPdf = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newSession: ImportSession = {
        id: `imp-${Date.now()}`,
        fileName: 'Employee_Turnover_315d467e.pdf',
        fileSize: '1.42 MB',
        uploadedAt: new Date().toISOString(),
        sourceType: 'PDF',
        totalDetected: 35,
        approvedCount: 33,
        reviewCount: 2,
        duplicateCount: 0,
        status: 'Ready for Review',
        kpis: SEED_KPIS.slice(0, 35).map((k, idx) => {
          if (idx === 14 || idx === 25) {
            return {
              ...k,
              approvalStatus: 'Requires Review',
              confidenceScore: 0.88,
            };
          }
          return {
            ...k,
            approvalStatus: 'Approved',
            confidenceScore: 0.99,
          };
        }),
      };
      importSessionBatch(newSession);
      setActiveSession(newSession);
      setIsProcessing(false);
    }, 1200);
  };

  const handleApproveAll = () => {
    const updatedKpis = activeSession.kpis.map(k => ({
      ...k,
      approvalStatus: 'Approved' as const,
    }));
    updatedKpis.forEach(k => addOrUpdateKpi(k));

    setActiveSession({
      ...activeSession,
      approvedCount: activeSession.totalDetected,
      reviewCount: 0,
      status: 'Imported',
      kpis: updatedKpis,
    });
  };

  const handleApproveSingle = (kpi: KPIDefinition) => {
    const approved = { ...kpi, approvalStatus: 'Approved' as const };
    addOrUpdateKpi(approved);
    setActiveSession({
      ...activeSession,
      approvedCount: activeSession.approvedCount + 1,
      reviewCount: Math.max(0, activeSession.reviewCount - 1),
      kpis: activeSession.kpis.map(k => (k.id === kpi.id ? approved : k)),
    });
  };

  const cardBg = isLight ? 'bg-white border border-slate-200/90 shadow-xs' : 'bg-slate-900 border border-slate-800 shadow-sm';
  const textPrimary = isLight ? 'text-slate-900' : 'text-slate-100';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className={`text-xl font-bold ${textPrimary} tracking-tight`}>
          {t('importTitle')}
        </h2>
        <p className={`text-xs ${textMuted} mt-0.5`}>
          {t('importSubtitle')}
        </p>
      </div>

      {/* Upload Dropzone & Preset Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${cardBg} border-2 border-dashed ${isLight ? 'border-slate-300 hover:border-blue-500' : 'border-slate-700 hover:border-blue-500/80'} rounded-2xl p-8 text-center transition-colors flex flex-col items-center justify-center space-y-4`}>
          <div className={`p-4 rounded-full ${isLight ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-blue-950/60 text-blue-400 border border-blue-800/60'}`}>
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${textPrimary}`}>
              {t('uploadDropzone')}
            </h3>
            <p className={`text-xs ${textMuted} mt-1`}>
              {t('uploadSupported')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleLoadAttachedPdf}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'ar' ? 'جارٍ استخراج 35 مؤشراً...' : 'Extracting 35 KPIs...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('loadSeedPdf')}</span>
                </>
              )}
            </button>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors border text-xs font-semibold ${
              isLight ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}>
              <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'ar' ? 'استعراض الملفات المحلية' : 'Browse Local Files'}</span>
              <input type="file" className="hidden" accept=".pdf,.xlsx,.csv,.docx" onChange={handleLoadAttachedPdf} />
            </label>
          </div>
        </div>

        {/* Extraction Audit Summary Card */}
        <div className={`${cardBg} rounded-2xl p-5 flex flex-col justify-between space-y-4`}>
          <div>
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${textPrimary}`}>
                {t('extractionSummary')}
              </h3>
              <span className={`text-[10px] ${textMuted} font-mono font-bold`}>AST Certified</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className={textMuted}>{t('totalDetected')}</span>
                <span className={`font-bold font-mono text-sm ${textPrimary}`}>
                  {activeSession.totalDetected}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-medium">{t('approvedKpis')}</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">
                  {activeSession.approvedCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-600 font-medium">{t('requiresReview')}</span>
                <span className="font-bold text-amber-600 font-mono text-sm">
                  {activeSession.reviewCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={textMuted}>{t('duplicateKpis')}</span>
                <span className={`font-bold font-mono text-sm ${textMuted}`}>
                  {activeSession.duplicateCount}
                </span>
              </div>
            </div>
          </div>

          <div className={`pt-4 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <button
              onClick={handleApproveAll}
              disabled={activeSession.status === 'Imported' || activeSession.reviewCount === 0}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t('approveAll')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Extracted KPI Review Table */}
      <div className={`${cardBg} rounded-xl overflow-hidden`}>
        <div className={`px-5 py-3.5 border-b ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${textPrimary}`}>
              {language === 'ar' ? 'المؤشرات المستخرجة من:' : 'Extracted Indicators from:'} <span className="text-blue-600 font-mono">{activeSession.fileName}</span>
            </h3>
          </div>
          <span className={`text-xs ${textMuted} font-mono font-medium`}>
            Source: Tarek Madkour · 38 Pages
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className={`${isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'} uppercase text-[10px] tracking-wider border-b font-mono font-bold`}>
              <tr>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Indicator Name</th>
                <th className="py-2.5 px-3">Formula Expression</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/80 text-slate-300'}`}>
              {activeSession.kpis.map(kpi => (
                <tr key={kpi.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                    {kpi.code}
                  </td>
                  <td className="py-2.5 px-3 font-semibold max-w-xs">
                    <div>{language === 'ar' ? kpi.nameAr : kpi.name}</div>
                    <div className={`text-[10px] ${textMuted} font-mono`}>Page {kpi.sourcePage}</div>
                  </td>
                  <td className={`py-2.5 px-3 font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'} max-w-sm truncate`}>
                    {kpi.formulaDisplay}
                  </td>
                  <td className={`py-2.5 px-3 font-mono ${textMuted}`}>{kpi.unit}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                    {Math.round((kpi.confidenceScore || 0.95) * 100)}%
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        kpi.approvalStatus === 'Approved'
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : 'text-amber-700 bg-amber-50 border border-amber-200'
                      }`}
                    >
                      {kpi.approvalStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {kpi.approvalStatus === 'Requires Review' ? (
                      <button
                        onClick={() => handleApproveSingle(kpi)}
                        className="px-2.5 py-1 text-[11px] rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-xs"
                      >
                        {language === 'ar' ? 'اعتماد' : 'Approve'}
                      </button>
                    ) : (
                      <span className={`text-[11px] ${textMuted} font-medium`}>
                        {language === 'ar' ? 'معتمد' : 'Verified'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
