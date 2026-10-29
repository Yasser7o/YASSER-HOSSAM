import React from 'react';
import { KPIDefinition } from '../../types';
import { useApp } from '../../context/AppContext';
import { Star, ArrowRight, Calculator } from 'lucide-react';

interface KPICardProps {
  kpi: KPIDefinition;
  onViewDetails: (kpi: KPIDefinition) => void;
  onEnterData: (kpi: KPIDefinition) => void;
}

export const KPICard: React.FC<KPICardProps> = ({ kpi, onViewDetails, onEnterData }) => {
  const { language, t, favorites, toggleFavorite, getKpiLatestSubmission, theme } = useApp();
  const isLight = theme === 'light';
  const isFav = favorites.includes(kpi.id);
  const latestSub = getKpiLatestSubmission(kpi.id);

  const currentValue = latestSub ? latestSub.calculatedValue : kpi.targetValue;
  const status = latestSub ? latestSub.status : 'On Track';
  const variance = latestSub ? latestSub.variance : 0;

  // Status visual mapping (accent line + subtle text, no rounded candy pills)
  const statusStyles = {
    'On Track': {
      border: 'border-l-4 rtl:border-l-0 rtl:border-r-4 border-emerald-500',
      text: 'text-emerald-600',
      dot: 'bg-emerald-500',
      label: t('statusOnTrack'),
    },
    'At Risk': {
      border: 'border-l-4 rtl:border-l-0 rtl:border-r-4 border-amber-500',
      text: 'text-amber-600',
      dot: 'bg-amber-500',
      label: t('statusAtRisk'),
    },
    'Off Track': {
      border: 'border-l-4 rtl:border-l-0 rtl:border-r-4 border-rose-500',
      text: 'text-rose-600',
      dot: 'bg-rose-500',
      label: t('statusOffTrack'),
    },
    'Insufficient Data': {
      border: 'border-l-4 rtl:border-l-0 rtl:border-r-4 border-slate-400',
      text: 'text-slate-500',
      dot: 'bg-slate-400',
      label: t('statusInsufficient'),
    },
  }[status] || {
    border: 'border-l-4 rtl:border-l-0 rtl:border-r-4 border-slate-400',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
    label: status,
  };

  const displayName = language === 'ar' ? kpi.nameAr : kpi.name;
  const displayCategory = language === 'ar' ? kpi.categoryAr : kpi.category;
  const displayDefinition = language === 'ar' ? kpi.definitionAr : kpi.definition;

  return (
    <div
      className={`${
        isLight
          ? 'bg-white border border-slate-200/90 text-slate-800 hover:border-slate-300 shadow-xs'
          : 'bg-slate-900 border border-slate-800 text-slate-100 hover:border-slate-700 shadow-sm'
      } rounded-xl p-4 flex flex-col justify-between transition-all group ${statusStyles.border}`}
    >
      <div>
        {/* Unboxed Metadata Kicker (Anti-slop zero pill discipline) */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className={`font-bold ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>{kpi.code}</span>
            <span aria-hidden="true">·</span>
            <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>{displayCategory}</span>
            <span aria-hidden="true">·</span>
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{kpi.reportingFrequency}</span>
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              toggleFavorite(kpi.id);
            }}
            className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
            title={t('favorite')}
          >
            <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Card Title */}
        <h3
          onClick={() => onViewDetails(kpi)}
          className={`text-sm font-bold ${
            isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-slate-100 group-hover:text-blue-400'
          } cursor-pointer line-clamp-2 transition-colors leading-snug`}
        >
          {displayName}
        </h3>

        {/* Short Definition */}
        <p className={`mt-1.5 text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} line-clamp-2 leading-relaxed`}>
          {displayDefinition}
        </p>

        {/* Numeric Values Row */}
        <div className={`mt-4 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/80'} grid grid-cols-2 gap-3`}>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">{t('currentValue')}</div>
            <div className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'} flex items-baseline gap-1 mt-0.5 font-mono`}>
              <span>{currentValue}</span>
              <span className="text-xs font-normal text-slate-500 font-sans">{kpi.unit}</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">{t('target')}</div>
            <div className={`text-lg font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'} flex items-baseline gap-1 mt-0.5 font-mono`}>
              <span>{kpi.targetValue}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">{kpi.unit}</span>
            </div>
          </div>
        </div>

        {/* Status & Variance Line */}
        <div className={`mt-3 flex items-center justify-between text-xs pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/50'}`}>
          <div className="flex items-center gap-1.5 font-semibold">
            <span className={`w-2 h-2 rounded-full ${statusStyles.dot}`} />
            <span className={statusStyles.text}>{statusStyles.label}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {variance > 0 ? `+${variance}` : variance} {kpi.unit} vs target
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className={`mt-4 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'} flex items-center gap-2`}>
        <button
          onClick={() => onEnterData(kpi)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          } transition-colors`}
        >
          <Calculator className="w-3.5 h-3.5 text-blue-600" />
          <span>{t('enterData')}</span>
        </button>
        <button
          onClick={() => onViewDetails(kpi)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg ${
            isLight
              ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20'
          } transition-colors`}
        >
          <span>{t('viewDetails')}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};
