import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const { language, theme } = useApp();
  const isLight = theme === 'light';
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      title: language === 'ar' ? '1. ملف المنظمة والقطاع' : '1. Organization Profile & Scope',
      desc:
        language === 'ar'
          ? 'تم تهيئة المنظمة (حلول أرامكو التقنية) بإجمالي 650 موظفاً وتوقيت آسيا/الرياض.'
          : 'Configured for Aramco Tech Solutions with 650 active employees under Asia/Riyadh AST.',
    },
    {
      title: language === 'ar' ? '2. هيكل الإدارات التخصصية' : '2. Departmental Architecture',
      desc:
        language === 'ar'
          ? 'تفعيل 5 إدارات رئيسية: هندسة البرمجيات، العمليات الميدانية، الموارد البشرية، المالية، ونجاح العملاء.'
          : '5 operating business units active with designated operational headcount and managers.',
    },
    {
      title: language === 'ar' ? '3. مكتبة المؤشرات المعتمدة (35 مؤشر)' : '3. Master KPI Library (35 KPIs)',
      desc:
        language === 'ar'
          ? 'تم اعتماد واستخراج كافة مؤشرات وثيقة "دوران الموظفين 2025" للأستاذ طارق مدكور.'
          : 'Synchronized with all 35 authentic indicators from Tarek Madkour’s Employee Turnover 2025 publication.',
    },
    {
      title: language === 'ar' ? '4. محرك الحسابات والمعادلات الرياضية' : '4. Deterministic Calculation Engine',
      desc:
        language === 'ar'
          ? 'معادلات حتمية خالية من أخطاء القسمة على صفر مع تجميع دقيق للبسط والمقام في النسب.'
          : 'Deterministic arithmetic parser with zero-division protection and proper ratio aggregation.',
    },
    {
      title: language === 'ar' ? '5. المجدول الآلي للتقارير والذكاء الاصطناعي' : '5. Automated Scheduling & Gemini AI',
      desc:
        language === 'ar'
          ? 'تقارير أسبوعية وشهرية مجدولة تلقائياً مع تشخيص استراتيجي فوري بدعم من Gemini 3.8 Flash.'
          : 'Weekly (Sun/Thu 08:00 AST) and monthly automated digests coupled with Gemini-powered root cause analysis.',
    },
  ];

  const modalBg = isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200';
  const textPrimary = isLight ? 'text-slate-900' : 'text-slate-100';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`${modalBg} border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6`}>
        <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className={`font-bold ${textPrimary} text-sm`}>
              {language === 'ar' ? 'جولة تعريفية بمنصة مؤشرات الأداء' : 'Enterprise Platform Tour'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i + 1 <= currentStep ? 'bg-blue-600' : isLight ? 'bg-slate-200' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Current Step Content */}
        <div className={`p-5 rounded-xl space-y-2 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-950 border border-slate-800'}`}>
          <h4 className="text-sm font-bold text-blue-600">
            {steps[currentStep - 1].title}
          </h4>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
            {steps[currentStep - 1].desc}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30 font-semibold"
          >
            {language === 'ar' ? 'السابق' : 'Previous'}
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
            >
              <span>{language === 'ar' ? 'التالي' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'ابدأ الآن' : 'Get Started'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
