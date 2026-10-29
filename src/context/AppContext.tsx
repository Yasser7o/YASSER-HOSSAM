import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, getInitialState, saveState, DEMO_USERS } from '../data/store';
import { KPIDefinition, KPISubmission, Organization, GeneratedReport, UserProfile, ImportSession, Role } from '../types';
import { translations, Language } from '../i18n/translations';
import { evaluateFormula, determineKPIStatus } from '../utils/calculator';

export type Theme = 'light' | 'dark';

interface AppContextType {
  state: AppState;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: keyof typeof translations['en']) => string;
  currentOrg: Organization;
  setCurrentOrgId: (id: string) => void;
  currentUser: UserProfile;
  setCurrentUserRole: (role: Role) => void;
  kpis: KPIDefinition[];
  submissions: KPISubmission[];
  reports: GeneratedReport[];
  importSessions: ImportSession[];
  favorites: string[];
  toggleFavorite: (kpiId: string) => void;
  submitKpiData: (kpiId: string, departmentId: string, period: string, inputs: Record<string, number>, notes?: string) => Promise<{ success: boolean; submission?: KPISubmission; error?: string }>;
  generateReport: (type: 'weekly' | 'monthly' | 'custom', period: string) => Promise<GeneratedReport>;
  addOrUpdateKpi: (kpi: KPIDefinition) => void;
  approveExtractedKpi: (kpiId: string) => void;
  importSessionBatch: (session: ImportSession) => void;
  getKpiLatestSubmission: (kpiId: string) => KPISubmission | undefined;
  getKpiHistory: (kpiId: string) => KPISubmission[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(getInitialState);
  const [language, setLanguageState] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('light');

  // Sync RTL / LTR document attributes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const t = (key: keyof typeof translations['en']): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const currentOrg = state.organizations.find(o => o.id === state.currentOrgId) || state.organizations[0];

  const setCurrentOrgId = (id: string) => {
    const next = { ...state, currentOrgId: id };
    setState(next);
    saveState(next);
  };

  const setCurrentUserRole = (role: Role) => {
    const matched = DEMO_USERS.find(u => u.role === role) || {
      ...state.currentUser,
      role,
    };
    const next = { ...state, currentUser: matched };
    setState(next);
    saveState(next);
  };

  const toggleFavorite = (kpiId: string) => {
    const isFav = state.favorites.includes(kpiId);
    const newFavs = isFav ? state.favorites.filter(id => id !== kpiId) : [...state.favorites, kpiId];
    const next = { ...state, favorites: newFavs };
    setState(next);
    saveState(next);
  };

  const getKpiLatestSubmission = (kpiId: string): KPISubmission | undefined => {
    const kpiSubs = state.submissions
      .filter(s => s.kpiId === kpiId && s.orgId === state.currentOrgId)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    return kpiSubs[0];
  };

  const getKpiHistory = (kpiId: string): KPISubmission[] => {
    return state.submissions
      .filter(s => s.kpiId === kpiId && s.orgId === state.currentOrgId)
      .sort((a, b) => a.period.localeCompare(b.period));
  };

  const submitKpiData = async (
    kpiId: string,
    departmentId: string,
    period: string,
    inputs: Record<string, number>,
    notes?: string
  ): Promise<{ success: boolean; submission?: KPISubmission; error?: string }> => {
    const kpi = state.kpiDefinitions.find(k => k.id === kpiId);
    if (!kpi) {
      return { success: false, error: 'KPI definition not found' };
    }

    // Mathematical evaluation using deterministic engine
    const evalRes = evaluateFormula(kpi.calculationFormula, inputs);
    if (evalRes.isError) {
      return { success: false, error: evalRes.errorMessage || 'Formula evaluation error' };
    }

    const calculatedValue = evalRes.value;
    const statusRes = determineKPIStatus(
      calculatedValue,
      kpi.targetValue,
      kpi.trendGoodWhen,
      kpi.warningThreshold,
      kpi.criticalThreshold
    );

    const now = new Date().toISOString();
    const newSubmission: KPISubmission = {
      id: `sub-${kpiId}-${period}-${Date.now()}`,
      kpiId,
      orgId: state.currentOrgId,
      departmentId,
      period,
      periodType: kpi.dataCapturePeriod,
      inputs,
      calculatedValue,
      targetValue: kpi.targetValue,
      status: statusRes.status,
      variance: statusRes.variance,
      submittedBy: state.currentUser.name,
      submittedAt: now,
      notes,
      auditTrail: [
        {
          timestamp: now,
          action: 'Period Data Submission',
          user: state.currentUser.name,
          details: `Computed value: ${calculatedValue} ${kpi.unit} | Target: ${kpi.targetValue}`,
        },
      ],
    };

    // Replace existing submission for same period/dept or append
    const filteredSubs = state.submissions.filter(
      s => !(s.kpiId === kpiId && s.period === period && s.departmentId === departmentId && s.orgId === state.currentOrgId)
    );
    const updatedSubmissions = [newSubmission, ...filteredSubs];

    const next = { ...state, submissions: updatedSubmissions };
    setState(next);
    saveState(next);
    return { success: true, submission: newSubmission };
  };

  const generateReport = async (type: 'weekly' | 'monthly' | 'custom', period: string): Promise<GeneratedReport> => {
    const orgKpis = state.kpiDefinitions.filter(k => currentOrg.activeKpiIds.includes(k.id));
    const kpiResults = orgKpis.map(kpi => {
      const latestSub = getKpiLatestSubmission(kpi.id);
      const val = latestSub ? latestSub.calculatedValue : kpi.targetValue;
      const statusRes = determineKPIStatus(val, kpi.targetValue, kpi.trendGoodWhen, kpi.warningThreshold, kpi.criticalThreshold);
      const isUp = latestSub ? (val >= kpi.targetValue) : true;

      return {
        kpiId: kpi.id,
        kpiName: kpi.name,
        kpiNameAr: kpi.nameAr,
        category: kpi.category,
        value: val,
        target: kpi.targetValue,
        unit: kpi.unit,
        status: statusRes.status,
        variance: statusRes.variance,
        trend: isUp ? ('up' as const) : ('down' as const),
      };
    });

    const onTrack = kpiResults.filter(r => r.status === 'On Track').length;
    const atRisk = kpiResults.filter(r => r.status === 'At Risk').length;
    const offTrack = kpiResults.filter(r => r.status === 'Off Track').length;
    const insufficient = kpiResults.filter(r => r.status === 'Insufficient Data').length;

    const reportId = `rep-${type}-${period}-${Date.now()}`;
    const newReport: GeneratedReport = {
      id: reportId,
      orgId: state.currentOrgId,
      title: `${type === 'weekly' ? 'Weekly HR Compliance & Turnover Digest' : 'Monthly Workforce Performance Analysis'} - ${period}`,
      titleAr: `${type === 'weekly' ? 'التقرير الأسبوعي للامتثال ودوران الكوادر' : 'التقرير الشهري الشامل لتحليل رأس المال البشري'} - ${period}`,
      reportType: type,
      period,
      generatedAt: new Date().toISOString(),
      schedulerSource: 'MANUAL_TRIGGER',
      summary: {
        totalMonitored: kpiResults.length,
        onTrack,
        atRisk,
        offTrack,
        insufficientData: insufficient,
        topPerformers: kpiResults.filter(r => r.status === 'On Track').slice(0, 3).map(r => r.kpiName),
        criticalAttention: kpiResults.filter(r => r.status === 'Off Track' || r.status === 'At Risk').slice(0, 3).map(r => r.kpiName),
      },
      executiveSummary: `Audit of ${kpiResults.length} active indicators for ${period} shows ${onTrack} KPIs operating on target (${Math.round((onTrack / kpiResults.length) * 100)}% compliance). Immediate managerial focus recommended for ${atRisk + offTrack} lagging metrics.`,
      executiveSummaryAr: `أظهر تدقيق ${kpiResults.length} مؤشراً للفترة ${period} أن ${onTrack} مؤشراً تعمل ضمن النطاق المستهدف بنسبة امتثال ${Math.round((onTrack / kpiResults.length) * 100)}%. يُوصى بتركيز الاهتمام التنفيذي على معالجة ${atRisk + offTrack} مؤشراً متأخراً.`,
      recommendations: [
        'Coordinate bi-weekly stay interviews across newly hired cohorts in engineering and operations.',
        'Review compensation parity benchmarks against national energy and tech sector standards.',
        'Rebalance workload distributions in departments reporting elevation in voluntary turnover notice periods.',
      ],
      kpiResults,
    };

    const next = { ...state, reports: [newReport, ...state.reports] };
    setState(next);
    saveState(next);
    return newReport;
  };

  const addOrUpdateKpi = (kpi: KPIDefinition) => {
    const exists = state.kpiDefinitions.some(k => k.id === kpi.id);
    let updatedKpis: KPIDefinition[];
    if (exists) {
      updatedKpis = state.kpiDefinitions.map(k => (k.id === kpi.id ? kpi : k));
    } else {
      updatedKpis = [kpi, ...state.kpiDefinitions];
    }

    // Also ensure it is attached to current Org activeKpiIds
    const updatedOrgs = state.organizations.map(org => {
      if (org.id === state.currentOrgId && !org.activeKpiIds.includes(kpi.id)) {
        return { ...org, activeKpiIds: [...org.activeKpiIds, kpi.id] };
      }
      return org;
    });

    const next = { ...state, kpiDefinitions: updatedKpis, organizations: updatedOrgs };
    setState(next);
    saveState(next);
  };

  const approveExtractedKpi = (kpiId: string) => {
    const updated = state.kpiDefinitions.map(k => (k.id === kpiId ? { ...k, approvalStatus: 'Approved' as const } : k));
    const next = { ...state, kpiDefinitions: updated };
    setState(next);
    saveState(next);
  };

  const importSessionBatch = (session: ImportSession) => {
    const existingIds = new Set(state.kpiDefinitions.map(k => k.id));
    const newKpis = session.kpis.filter(k => !existingIds.has(k.id));
    const mergedKpis = [...state.kpiDefinitions, ...newKpis];
    const updatedSessions = [session, ...state.importSessions];

    const next = { ...state, kpiDefinitions: mergedKpis, importSessions: updatedSessions };
    setState(next);
    saveState(next);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        language,
        setLanguage,
        theme,
        toggleTheme,
        t,
        currentOrg,
        setCurrentOrgId,
        currentUser: state.currentUser,
        setCurrentUserRole,
        kpis: state.kpiDefinitions,
        submissions: state.submissions,
        reports: state.reports,
        importSessions: state.importSessions,
        favorites: state.favorites,
        toggleFavorite,
        submitKpiData,
        generateReport,
        addOrUpdateKpi,
        approveExtractedKpi,
        importSessionBatch,
        getKpiLatestSubmission,
        getKpiHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
