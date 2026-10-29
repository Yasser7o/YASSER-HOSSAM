import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { KPIDefinition } from '../../types';
import { KPICard } from './KPICard';
import {
  Search,
  Grid,
  List,
  Plus,
  UploadCloud,
  Layers,
} from 'lucide-react';

interface KPILibraryProps {
  onSelectKpi: (kpi: KPIDefinition) => void;
  onEnterData: (kpi: KPIDefinition) => void;
  onNavigate: (tab: any) => void;
  favoritesOnly?: boolean;
}

export const KPILibrary: React.FC<KPILibraryProps> = ({
  onSelectKpi,
  onEnterData,
  onNavigate,
  favoritesOnly = false,
}) => {
  const { kpis, language, t, favorites, getKpiLatestSubmission, theme } = useApp();
  const isLight = theme === 'light';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    kpis.forEach(k => cats.add(k.category));
    return ['All', ...Array.from(cats)];
  }, [kpis]);

  // Filter logic
  const filteredKpis = useMemo(() => {
    return kpis.filter(kpi => {
      if (favoritesOnly && !favorites.includes(kpi.id)) return false;

      if (selectedCategory !== 'All' && kpi.category !== selectedCategory) return false;

      const latest = getKpiLatestSubmission(kpi.id);
      const status = latest?.status || 'On Track';
      if (selectedStatus !== 'All' && status !== selectedStatus) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = kpi.name.toLowerCase().includes(q);
        const matchNameAr = kpi.nameAr.toLowerCase().includes(q);
        const matchCode = kpi.code.toLowerCase().includes(q);
        const matchDef = kpi.definition.toLowerCase().includes(q);
        if (!matchName && !matchNameAr && !matchCode && !matchDef) return false;
      }

      return true;
    });
  }, [kpis, search, selectedCategory, selectedStatus, favoritesOnly, favorites, getKpiLatestSubmission]);

  return (
    <div className="space-y-6">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'} tracking-tight`}>
            {favoritesOnly ? t('navMyKpis') : t('navKpiLibrary')}
          </h2>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
            {favoritesOnly
              ? `${filteredKpis.length} ${language === 'ar' ? 'مؤشرات مفضلة مثبتة' : 'pinned indicators'}`
              : `${language === 'ar' ? `استعراض ومراقبة كافة المؤشرات الـ ${kpis.length} المعتمدة` : `Access and monitor all ${kpis.length} documented indicators`}`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('import')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              isLight
                ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('navImportCenter')}</span>
          </button>
          <button
            onClick={() => onNavigate('builder')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'إنشاء مؤشر مخصص' : 'Define New KPI'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Controls (Segmented Tabs & Buttons) */}
      <div className={`${isLight ? 'bg-white border border-slate-200/90 shadow-xs' : 'bg-slate-900 border border-slate-800'} rounded-xl p-3.5 space-y-3`}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className={`w-full ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500'
                  : 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-blue-500'
              } border rounded-lg pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-1.5 text-xs focus:outline-none`}
            />
          </div>

          {/* Status & View Mode */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Status Selector */}
            <div className={`flex items-center gap-1 ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-800 border border-slate-700'} p-1 rounded-lg text-xs`}>
              {['All', 'On Track', 'At Risk', 'Off Track'].map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    selectedStatus === status
                      ? isLight
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'bg-slate-700 text-white shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status === 'All' ? t('allStatuses') : status}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className={`flex items-center ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-800 border border-slate-700'} p-1 rounded-lg`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid'
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid Cards View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'table'
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Table Dense View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Horizontal Pills Filter (Interactive Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
          <span className={`text-[11px] font-bold uppercase tracking-wider shrink-0 mr-1 rtl:mr-0 rtl:ml-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {language === 'ar' ? 'التصنيف:' : 'Category:'}
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {cat === 'All' ? t('filterAll') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Rendering: Grid vs Dense Table */}
      {filteredKpis.length === 0 ? (
        <div className={`p-12 text-center ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} border rounded-xl`}>
          <Layers className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
            {language === 'ar' ? 'لم يتم العثور على مؤشرات مطابقة' : 'No Indicators Found'}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar' ? 'جرب البحث بكلمات أخرى أو إزالة الفلاتر' : 'Try relaxing your search terms or filters.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredKpis.map(kpi => (
            <KPICard
              key={kpi.id}
              kpi={kpi}
              onViewDetails={onSelectKpi}
              onEnterData={onEnterData}
            />
          ))}
        </div>
      ) : (
        /* High Density Table View */
        <div className={`${isLight ? 'bg-white border border-slate-200/90 shadow-xs' : 'bg-slate-900 border border-slate-800 shadow-sm'} rounded-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className={`${isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'} uppercase text-[10px] tracking-wider border-b font-mono font-bold`}>
                <tr>
                  <th className="py-3 px-4">{t('kpiCode')}</th>
                  <th className="py-3 px-4">{t('kpiName')}</th>
                  <th className="py-3 px-4">{t('category')}</th>
                  <th className="py-3 px-4">{t('frequency')}</th>
                  <th className="py-3 px-4 text-right rtl:text-left">{t('currentValue')}</th>
                  <th className="py-3 px-4 text-right rtl:text-left">{t('target')}</th>
                  <th className="py-3 px-4">{t('status')}</th>
                  <th className="py-3 px-4 text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/80 text-slate-300'}`}>
                {filteredKpis.map(kpi => {
                  const latest = getKpiLatestSubmission(kpi.id);
                  const val = latest?.calculatedValue ?? kpi.targetValue;
                  const status = latest?.status || 'On Track';

                  return (
                    <tr
                      key={kpi.id}
                      onClick={() => onSelectKpi(kpi)}
                      className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/50'} cursor-pointer transition-colors`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {kpi.code}
                      </td>
                      <td className="py-3 px-4 font-bold max-w-xs truncate">
                        {language === 'ar' ? kpi.nameAr : kpi.name}
                      </td>
                      <td className={`py-3 px-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {language === 'ar' ? kpi.categoryAr : kpi.category}
                      </td>
                      <td className={`py-3 px-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {kpi.reportingFrequency}
                      </td>
                      <td className="py-3 px-4 text-right rtl:text-left font-mono font-bold">
                        {val} {kpi.unit}
                      </td>
                      <td className={`py-3 px-4 text-right rtl:text-left font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {kpi.targetValue} {kpi.unit}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 font-semibold ${
                            status === 'On Track'
                              ? 'text-emerald-600'
                              : status === 'At Risk'
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              status === 'On Track'
                                ? 'bg-emerald-500'
                                : status === 'At Risk'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onEnterData(kpi)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded ${
                            isLight
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                              : 'bg-slate-800 hover:bg-slate-700 text-blue-400'
                          } transition-colors`}
                        >
                          {t('enterData')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
