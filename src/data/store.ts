import { KPIDefinition, KPISubmission, Organization, GeneratedReport, UserProfile, ImportSession } from '../types';
import { SEED_KPIS } from './seedKPIs';
import { evaluateFormula, determineKPIStatus } from '../utils/calculator';

const STORAGE_KEY = 'HR_KPI_PLATFORM_V1';

export interface AppState {
  organizations: Organization[];
  currentOrgId: string;
  currentUser: UserProfile;
  kpiDefinitions: KPIDefinition[];
  submissions: KPISubmission[];
  reports: GeneratedReport[];
  importSessions: ImportSession[];
  favorites: string[];
}

export const INITIAL_ORGS: Organization[] = [
  {
    id: 'org-aramco-tech',
    name: 'Aramco Tech Solutions',
    nameAr: 'حلول أرامكو التقنية',
    industry: 'Energy & Digital Transformation',
    totalEmployees: 650,
    defaultTimezone: 'Asia/Riyadh',
    weeklyReportDay: 'Sunday',
    reportTime: '08:00',
    departments: [
      { id: 'dept-eng', name: 'Software & Cloud Engineering', nameAr: 'هندسة البرمجيات والسحابة', headCount: 220, managerName: 'Eng. Khalid Al-Otaibi' },
      { id: 'dept-ops', name: 'Field Operations & Energy', nameAr: 'العمليات الميدانية والطاقة', headCount: 190, managerName: 'Sarah Al-Ghamdi' },
      { id: 'dept-hr', name: 'People, Culture & Talent', nameAr: 'الموارد البشرية والمواهب', headCount: 35, managerName: 'Tarek Madkour' },
      { id: 'dept-fin', name: 'Finance, Legal & Governance', nameAr: 'المالية والقانون والحوكمة', headCount: 85, managerName: 'Fahad Al-Shehri' },
      { id: 'dept-cs', name: 'Client Success & Enterprise Sales', nameAr: 'نجاح العملاء والمبيعات', headCount: 120, managerName: 'Reem Al-Zahrani' },
    ],
    activeKpiIds: SEED_KPIS.map(k => k.id),
  },
  {
    id: 'org-al-madar',
    name: 'Al-Madar Enterprise Logistics',
    nameAr: 'شركة المدار اللوجستية',
    industry: 'Logistics & Supply Chain',
    totalEmployees: 1240,
    defaultTimezone: 'Asia/Riyadh',
    weeklyReportDay: 'Thursday',
    reportTime: '16:00',
    departments: [
      { id: 'dept-m-ops', name: 'Fleet Operations', nameAr: 'عمليات الأسطول', headCount: 750, managerName: 'Sultan Al-Harbi' },
      { id: 'dept-m-hr', name: 'Human Capital', nameAr: 'رأس المال البشري', headCount: 40, managerName: 'Noura Al-Mutairi' },
      { id: 'dept-m-tech', name: 'IT Infrastructure', nameAr: 'البنية التقنية', headCount: 110, managerName: 'Waleed Al-Dosari' },
    ],
    activeKpiIds: ['kpi-01-employee-tenure', 'kpi-06-involuntary-terminations-pct', 'kpi-08-voluntary-terminations-pct', 'kpi-24-employee-retention'],
  },
];

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Tarek Madkour',
    email: 'tarek.madkour@aramcotech.sa',
    role: 'Super Admin',
    organizationId: 'org-aramco-tech',
  },
  {
    id: 'usr-2',
    name: 'Amira Al-Mansour',
    email: 'amira.mansour@aramcotech.sa',
    role: 'Organization Admin',
    organizationId: 'org-aramco-tech',
  },
  {
    id: 'usr-3',
    name: 'Dr. Faisal Al-Sabah',
    email: 'faisal.sabah@aramcotech.sa',
    role: 'HR Manager',
    organizationId: 'org-aramco-tech',
  },
  {
    id: 'usr-4',
    name: 'Lina Al-Hassan',
    email: 'lina.hassan@aramcotech.sa',
    role: 'Data Entry',
    organizationId: 'org-aramco-tech',
    departmentId: 'dept-eng',
  },
  {
    id: 'usr-5',
    name: 'Board Executive Member',
    email: 'executive.viewer@aramcotech.sa',
    role: 'Executive Viewer',
    organizationId: 'org-aramco-tech',
  },
];

// Generate realistic historical submissions for seed KPIs
function generateSeedSubmissions(): KPISubmission[] {
  const submissions: KPISubmission[] = [];
  const periods = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-10'];

  for (const kpi of SEED_KPIS) {
    // Determine base values
    const baseVarInputs: Record<string, number> = {};
    for (const v of kpi.variables) {
      baseVarInputs[v.id] = v.defaultValue ?? 10;
    }

    periods.forEach((period, idx) => {
      // Add slight period variations
      const periodInputs: Record<string, number> = {};
      for (const key of Object.keys(baseVarInputs)) {
        const factor = 1 + (idx - 1) * 0.04;
        periodInputs[key] = Math.max(1, Math.round(baseVarInputs[key] * factor));
      }

      const evalRes = evaluateFormula(kpi.calculationFormula, periodInputs);
      const val = evalRes.isError ? kpi.targetValue : evalRes.value;
      const statusRes = determineKPIStatus(val, kpi.targetValue, kpi.trendGoodWhen, kpi.warningThreshold, kpi.criticalThreshold);

      submissions.push({
        id: `sub-${kpi.id}-${period}`,
        kpiId: kpi.id,
        orgId: 'org-aramco-tech',
        departmentId: 'dept-eng',
        period,
        periodType: kpi.dataCapturePeriod,
        inputs: periodInputs,
        calculatedValue: val,
        targetValue: kpi.targetValue,
        status: statusRes.status,
        variance: statusRes.variance,
        submittedBy: 'Tarek Madkour',
        submittedAt: `2026-10-${10 + idx}T14:30:00Z`,
        notes: `Validated period submissions for ${period}. Audit certified.`,
        auditTrail: [
          {
            timestamp: `2026-10-${10 + idx}T14:30:00Z`,
            action: 'Initial Submission and Automated Recalculation',
            user: 'Tarek Madkour',
            details: `Calculated value: ${val} ${kpi.unit}`,
          },
        ],
      });
    });
  }

  return submissions;
}

// Seed initial reports
const INITIAL_REPORTS: GeneratedReport[] = [
  {
    id: 'rep-monthly-2026-10',
    orgId: 'org-aramco-tech',
    title: 'Monthly Executive Workforce Digest - October 2026',
    titleAr: 'التقرير التنفيذي الشهري لدوران واستبقاء الكوادر - أكتوبر 2026',
    reportType: 'monthly',
    period: '2026-10',
    generatedAt: '2026-10-28T00:05:00+03:00',
    schedulerSource: 'AUTOMATED_CRON',
    summary: {
      totalMonitored: 37,
      onTrack: 26,
      atRisk: 8,
      offTrack: 3,
      insufficientData: 0,
      topPerformers: ['Employee Retention', 'Turnover in Administrative Staff', 'Average Age of Employees That Retire'],
      criticalAttention: ['Turnover of New Hire During 1 Year', 'Number of Employees Leaving with Service Time Between 1 to 2 Years'],
    },
    executiveSummary: 'Workforce stability remains resilient with a company-wide retention rate of 90.3%. However, new hire attrition within the first 12-24 months has ticked up to 13.6% (target: 12.0%), necessitating focused onboarding intervention across Cloud & Engineering teams.',
    executiveSummaryAr: 'استقر أداء القوى العاملة بشكل مرن بنسبة استبقاء عامة بلغت 90.3%، غير أن مؤشر دوران التعيينات الجديدة في سنتهم الأولى ارتفع إلى 13.6% (المستهدف: 12.0%)، ما يتطلب تدخلاً عاجلاً في برامج التهيئة لإدارات الهندسة السحابية.',
    recommendations: [
      'Revamp the 90-day technical onboarding mentoring program for Engineering hires.',
      'Conduct retention pulse surveys across staff with 1-2 years tenure before bonus cycles.',
      'Deploy succession planning workshops for senior staff reaching 10+ years tenure.',
    ],
    kpiResults: [
      {
        kpiId: 'kpi-24-employee-retention',
        kpiName: 'Employee Retention',
        kpiNameAr: 'معدل استبقاء الموظفين',
        category: 'Employee Retention',
        value: 90.3,
        target: 90.0,
        unit: '%',
        status: 'On Track',
        variance: 0.3,
        trend: 'up',
      },
      {
        kpiId: 'kpi-07-total-terminations-pct',
        kpiName: 'Total Terminations Annually as a % of Average Headcount',
        kpiNameAr: 'إجمالي نسبة إنهاء الخدمات السنوية',
        category: 'Employee Turnover',
        value: 10.6,
        target: 10.0,
        unit: '%',
        status: 'At Risk',
        variance: 0.6,
        trend: 'down',
      },
      {
        kpiId: 'kpi-31-turnover-new-hire-1-year',
        kpiName: 'Turnover of New Hire During 1 Year',
        kpiNameAr: 'معدل دوران التعيينات الجديدة خلال سنة',
        category: 'Employee Turnover',
        value: 13.6,
        target: 12.0,
        unit: '%',
        status: 'At Risk',
        variance: 1.6,
        trend: 'down',
      },
      {
        kpiId: 'kpi-01-employee-tenure',
        kpiName: 'Employee Tenure',
        kpiNameAr: 'متوسط سنوات خدمة الموظفين',
        category: 'Employee Turnover',
        value: 4.6,
        target: 4.5,
        unit: 'Years',
        status: 'On Track',
        variance: 0.1,
        trend: 'up',
      },
      {
        kpiId: 'kpi-36-absenteeism-rate',
        kpiName: 'Absenteeism Rate',
        kpiNameAr: 'معدل الغياب الوظيفي',
        category: 'Attendance & Absenteeism',
        value: 2.76,
        target: 2.5,
        unit: '%',
        status: 'At Risk',
        variance: 0.26,
        trend: 'down',
      },
    ],
  },
];

// Initial Import Session with the attached PDF
const INITIAL_IMPORT_SESSIONS: ImportSession[] = [
  {
    id: 'imp-turnover-2025',
    fileName: 'Employee_Turnover_315d467e.pdf',
    fileSize: '1.42 MB',
    uploadedAt: '2026-10-29T03:30:00Z',
    sourceType: 'PDF',
    totalDetected: 35,
    approvedCount: 35,
    reviewCount: 0,
    duplicateCount: 0,
    status: 'Imported',
    kpis: SEED_KPIS.slice(0, 35),
  },
];

export function getInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validate that it has at least the seed KPIs
      if (parsed.kpiDefinitions && parsed.kpiDefinitions.length >= 35) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read from localStorage, using fresh initial state');
  }

  const freshState: AppState = {
    organizations: INITIAL_ORGS,
    currentOrgId: 'org-aramco-tech',
    currentUser: DEMO_USERS[0],
    kpiDefinitions: SEED_KPIS,
    submissions: generateSeedSubmissions(),
    reports: INITIAL_REPORTS,
    importSessions: INITIAL_IMPORT_SESSIONS,
    favorites: ['kpi-01-employee-tenure', 'kpi-07-total-terminations-pct', 'kpi-24-employee-retention'],
  };

  saveState(freshState);
  return freshState;
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}
