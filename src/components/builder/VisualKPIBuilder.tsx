import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KPIDefinition, KPIVariable, DataCapturePeriod, TrendDirection } from '../../types';
import { evaluateFormula } from '../../utils/calculator';
import {
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  Save,
  Code,
} from 'lucide-react';

export const VisualKPIBuilder: React.FC = () => {
  const { language, t, addOrUpdateKpi, theme } = useApp();
  const isLight = theme === 'light';

  const [code, setCode] = useState('CUSTOM-01');
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [category, setCategory] = useState('Employee Retention');
  const [subCategory, setSubCategory] = useState('Internal Mobility');
  const [unit, setUnit] = useState('%');
  const [dataCapturePeriod, setDataCapturePeriod] = useState<DataCapturePeriod>('Monthly');
  const [trendGoodWhen, setTrendGoodWhen] = useState<TrendDirection>('Higher is better');
  const [targetValue, setTargetValue] = useState<number>(85);
  const [definition, setDefinition] = useState('');
  const [definitionAr, setDefinitionAr] = useState('');
  const [purpose, setPurpose] = useState('');
  const [objectiveMeasured, setObjectiveMeasured] = useState('');

  // Formula & Variables
  const [variables, setVariables] = useState<KPIVariable[]>([
    {
      id: 'Var_A',
      name: 'Promotions Internal',
      nameAr: 'الترقيات الداخلية',
      description: 'Total internal promotions',
      unit: 'Employees',
      defaultValue: 25,
      required: true,
    },
    {
      id: 'Var_B',
      name: 'Total Positions Filled',
      nameAr: 'إجمالي الشواغر المشغولة',
      description: 'Total filled positions in period',
      unit: 'Employees',
      defaultValue: 30,
      required: true,
    },
  ]);

  const [formula, setFormula] = useState('(Var_A / Var_B) * 100');

  // Test bench state
  const [testInputs, setTestInputs] = useState<Record<string, number>>({
    Var_A: 25,
    Var_B: 30,
  });
  const [testResult, setTestResult] = useState<{ value: number; isError: boolean; errorMessage?: string } | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handleAddVariable = () => {
    const nextNum = variables.length + 1;
    const newId = `Var_${String.fromCharCode(64 + nextNum)}`;
    const newVar: KPIVariable = {
      id: newId,
      name: `Variable ${nextNum}`,
      nameAr: `المتغير ${nextNum}`,
      description: 'Operational measurement variable',
      unit: 'Count',
      defaultValue: 10,
      required: true,
    };
    setVariables([...variables, newVar]);
    setTestInputs({ ...testInputs, [newId]: 10 });
  };

  const handleRemoveVariable = (id: string) => {
    setVariables(variables.filter(v => v.id !== id));
    const nextInputs = { ...testInputs };
    delete nextInputs[id];
    setTestInputs(nextInputs);
  };

  const handleRunTest = () => {
    const res = evaluateFormula(formula, testInputs);
    setTestResult(res);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newKpi: KPIDefinition = {
      id: `kpi-custom-${Date.now()}`,
      code: code.trim() || 'CUSTOM-01',
      name,
      nameAr: nameAr || name,
      category,
      categoryAr: category,
      subCategory,
      subCategoryAr: subCategory,
      kpiType: 'Lagging',
      dataCapturePeriod,
      reportingFrequency: dataCapturePeriod,
      definition: definition || 'Custom organizational performance metric.',
      definitionAr: definitionAr || definition || 'مؤشر أداء مخصص للمنظمة.',
      calculationFormula: formula,
      formulaDisplay: formula,
      variables,
      unit,
      trendGoodWhen,
      purpose: purpose || 'Measure departmental productivity.',
      purposeAr: purpose || 'قياس إنتاجية وجودة العمليات.',
      objectiveMeasured: objectiveMeasured || 'Organizational Alignment.',
      objectiveMeasuredAr: objectiveMeasured || 'التوافق المؤسسي.',
      targetValue,
      warningThreshold: 0.15,
      criticalThreshold: 0.30,
      approvalStatus: 'Approved',
      isCustom: true,
      confidenceScore: 1.0,
      createdAt: new Date().toISOString(),
    };

    addOrUpdateKpi(newKpi);
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 4000);
  };

  const cardBg = isLight ? 'bg-white border border-slate-200/90 shadow-xs' : 'bg-slate-900 border border-slate-800 shadow-sm';
  const textPrimary = isLight ? 'text-slate-900' : 'text-slate-100';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';
  const inputBg = isLight ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white' : 'bg-slate-800 border-slate-700 text-slate-200';
  const subBoxBg = isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/40 border border-slate-700/60';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className={`text-xl font-bold ${textPrimary} tracking-tight`}>
          {t('builderTitle')}
        </h2>
        <p className={`text-xs ${textMuted} mt-0.5`}>
          {t('builderSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Form (2 cols) */}
        <div className={`lg:col-span-2 ${cardBg} rounded-xl p-5 sm:p-6 space-y-6`}>
          <form onSubmit={handlePublish} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`block text-xs font-bold ${textPrimary} mb-1`}>KPI Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500`}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className={`block text-xs font-bold ${textPrimary} mb-1`}>
                  {language === 'ar' ? 'اسم المؤشر (بالإنجليزية)' : 'KPI Name (English)'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Internal Promotion Mobility Rate"
                  className={`w-full ${inputBg} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold ${textPrimary} mb-1`}>
                  {language === 'ar' ? 'اسم المؤشر (بالعربية)' : 'KPI Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={e => setNameAr(e.target.value)}
                  placeholder="مثال: معدل الترقية والتنقل الوظيفي الداخلي"
                  className={`w-full ${inputBg} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-xs font-bold ${textPrimary} mb-1`}>{t('category')}</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500`}
                >
                  <option value="Employee Retention">Employee Retention (استبقاء الموظفين)</option>
                  <option value="Employee Turnover">Employee Turnover (دوران الموظفين)</option>
                  <option value="Recruitment & Talent Acquisition">Recruitment & Talent Acquisition (الاستقطاب والتوظيف)</option>
                  <option value="Attendance & Absenteeism">Attendance & Absenteeism (الحضور والغياب)</option>
                  <option value="Workforce Planning">Workforce Planning (تخطيط القوى العاملة)</option>
                </select>
              </div>
            </div>

            {/* Target & Units */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <div>
                <label className={`block text-xs font-medium ${textMuted} mb-1`}>{t('unit')}</label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500`}
                >
                  <option value="%">% (Percentage)</option>
                  <option value="Years">Years (سنوات)</option>
                  <option value="Days">Days (أيام)</option>
                  <option value="Employees">Employees (موظفون)</option>
                  <option value="Ratio">Ratio (نسبة عددية)</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-medium ${textMuted} mb-1`}>{t('target')}</label>
                <input
                  type="number"
                  step="any"
                  value={targetValue}
                  onChange={e => setTargetValue(parseFloat(e.target.value) || 0)}
                  className={`w-full ${inputBg} border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-medium ${textMuted} mb-1`}>{t('trendGoodWhen')}</label>
                <select
                  value={trendGoodWhen}
                  onChange={e => setTrendGoodWhen(e.target.value as TrendDirection)}
                  className={`w-full ${inputBg} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500`}
                >
                  <option value="Higher is better">Higher is better (الأعلى أفضل)</option>
                  <option value="Lower is better">Lower is better (الأقل أفضل)</option>
                  <option value="Stable">Stable (الاستقرار هو الأفضل)</option>
                </select>
              </div>
            </div>

            {/* Variables Management */}
            <div className={`space-y-3 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <label className={`text-xs font-bold uppercase tracking-wider ${textPrimary}`}>
                  {language === 'ar' ? 'متغيرات المعادلة' : 'Formula Variables'} ({variables.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddVariable}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'إضافة متغير' : 'Add Variable'}</span>
                </button>
              </div>

              <div className="space-y-2">
                {variables.map(v => (
                  <div
                    key={v.id}
                    className={`p-3 ${subBoxBg} rounded-lg flex items-center justify-between gap-3 text-xs`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600">{v.id}</span>
                      <input
                        type="text"
                        value={v.name}
                        onChange={e => {
                          const updated = variables.map(item =>
                            item.id === v.id ? { ...item, name: e.target.value } : item
                          );
                          setVariables(updated);
                        }}
                        className={`${inputBg} border rounded px-2 py-1 text-xs`}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={v.unit}
                        onChange={e => {
                          const updated = variables.map(item =>
                            item.id === v.id ? { ...item, unit: e.target.value } : item
                          );
                          setVariables(updated);
                        }}
                        className={`w-20 ${inputBg} border rounded px-2 py-1 text-xs font-mono`}
                      />
                      {variables.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariable(v.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formula Expression */}
            <div>
              <label className={`block text-xs font-bold ${textPrimary} mb-1.5`}>
                {language === 'ar' ? 'صيغة المعادلة الحسابية' : 'Mathematical Formula Expression'}
              </label>
              <div className="flex items-center gap-1.5 mb-2 overflow-x-auto text-[11px]">
                <span className={`${textMuted} font-mono font-semibold`}>Insert:</span>
                {variables.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setFormula(prev => `${prev} ${v.id}`)}
                    className={`px-2 py-0.5 rounded font-mono font-bold ${
                      isLight ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' : 'bg-slate-800 text-blue-300 hover:bg-slate-700'
                    }`}
                  >
                    {v.id}
                  </button>
                ))}
                {['+', '-', '*', '/', '(', ')'].map(op => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setFormula(prev => `${prev} ${op}`)}
                    className={`px-2 py-0.5 rounded font-mono font-bold ${
                      isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={formula}
                onChange={e => setFormula(e.target.value)}
                className={`w-full rounded-lg p-3 text-sm font-mono focus:outline-none ${
                  isLight
                    ? 'bg-blue-50/50 border border-blue-300 text-blue-900 focus:border-blue-600'
                    : 'bg-slate-950 border border-blue-500/40 text-blue-300 focus:border-blue-500'
                }`}
                required
              />
            </div>

            {/* Success alert */}
            {publishSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{language === 'ar' ? 'تم التحقق من المعادلة واعتماد المؤشر بنجاح في المكتبة!' : 'KPI successfully verified and committed to library!'}</span>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t('publishKpi')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Test Bench & Card Preview (1 col) */}
        <div className={`${cardBg} rounded-xl p-5 flex flex-col justify-between space-y-6`}>
          {/* Test Bench */}
          <div>
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-600" />
                <h3 className={`font-bold ${textPrimary} text-xs uppercase tracking-wider`}>
                  {t('formulaTester')}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleRunTest}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-xs"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{t('testFormula')}</span>
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {variables.map(v => (
                <div key={v.id} className="flex items-center justify-between text-xs">
                  <span className={`font-mono font-semibold ${textMuted}`}>{v.id}:</span>
                  <input
                    type="number"
                    value={testInputs[v.id] ?? 0}
                    onChange={e =>
                      setTestInputs({
                        ...testInputs,
                        [v.id]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-24 ${inputBg} border rounded px-2 py-1 text-xs font-mono text-right rtl:text-left`}
                  />
                </div>
              ))}
            </div>

            {testResult && (
              <div className={`mt-4 p-3 rounded-lg text-xs space-y-1 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-950 border border-slate-800'}`}>
                <div className={`${textMuted} text-[10px] uppercase font-semibold`}>
                  {language === 'ar' ? 'الناتج الرياضي المحسوب:' : 'Evaluated Value:'}
                </div>
                <div className={`text-lg font-bold font-mono ${textPrimary}`}>
                  {testResult.isError ? (
                    <span className="text-rose-600 text-xs">{testResult.errorMessage}</span>
                  ) : (
                    <span>{testResult.value} {unit}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Preview Card */}
          <div className={`p-4 rounded-xl space-y-2 text-xs ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-950/70 border border-slate-800'}`}>
            <div className={`text-[10px] ${textMuted} uppercase tracking-wider font-bold`}>
              {language === 'ar' ? 'معاينة بطاقة المؤشر' : 'Live Card Preview'}
            </div>
            <div className="font-mono text-blue-600 font-bold">{code || 'CUSTOM-01'}</div>
            <div className={`text-sm font-bold ${textPrimary}`}>{nameAr || name || 'مؤشر أداء جديد'}</div>
            <div className={`${textMuted} text-[11px] font-mono`}>Target: {targetValue} {unit}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
