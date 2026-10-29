export type Role = 'Super Admin' | 'Organization Admin' | 'HR Manager' | 'Data Entry' | 'Executive Viewer';

export type KPIType = 'Lagging' | 'Leading';
export type DataCapturePeriod = 'Annually' | 'Quarterly' | 'Monthly' | 'Weekly' | 'Daily';
export type TrendDirection = 'Higher is better' | 'Lower is better' | 'Stable' | 'Target range';
export type KPIStatus = 'On Track' | 'At Risk' | 'Off Track' | 'Insufficient Data';

export interface KPIVariable {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  unit: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  required: boolean;
}

export interface KPIDefinition {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  category: string;
  categoryAr: string;
  subCategory: string;
  subCategoryAr: string;
  kpiType: KPIType;
  dataCapturePeriod: DataCapturePeriod;
  reportingFrequency: string;
  definition: string;
  definitionAr: string;
  calculationFormula: string;
  formulaDisplay: string;
  variables: KPIVariable[];
  unit: string;
  trendGoodWhen: TrendDirection;
  purpose: string;
  purposeAr: string;
  objectiveMeasured: string;
  objectiveMeasuredAr: string;
  targetValue: number;
  warningThreshold: number; // For status determination
  criticalThreshold: number;
  relevantDepartment?: string;
  sourceDoc?: string;
  sourcePage?: number;
  isCustom?: boolean;
  approvalStatus: 'Approved' | 'Requires Review' | 'Draft';
  confidenceScore?: number;
  createdAt: string;
}

export interface KPISubmission {
  id: string;
  kpiId: string;
  orgId: string;
  departmentId: string;
  period: string; // e.g. "2026-Q3", "2026-10", "2026-W43"
  periodType: DataCapturePeriod;
  inputs: Record<string, number>;
  calculatedValue: number;
  targetValue: number;
  status: KPIStatus;
  variance: number;
  submittedBy: string;
  submittedAt: string;
  notes?: string;
  auditTrail: Array<{
    timestamp: string;
    action: string;
    user: string;
    details?: string;
  }>;
}

export interface Department {
  id: string;
  name: string;
  nameAr: string;
  headCount: number;
  managerName: string;
}

export interface Organization {
  id: string;
  name: string;
  nameAr: string;
  industry: string;
  totalEmployees: number;
  defaultTimezone: string;
  weeklyReportDay: 'Sunday' | 'Thursday' | 'Monday';
  reportTime: string;
  departments: Department[];
  activeKpiIds: string[];
}

export interface GeneratedReport {
  id: string;
  orgId: string;
  title: string;
  titleAr: string;
  reportType: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
  period: string;
  generatedAt: string;
  schedulerSource: 'AUTOMATED_CRON' | 'MANUAL_TRIGGER';
  summary: {
    totalMonitored: number;
    onTrack: number;
    atRisk: number;
    offTrack: number;
    insufficientData: number;
    topPerformers: string[];
    criticalAttention: string[];
  };
  executiveSummary: string;
  executiveSummaryAr: string;
  recommendations: string[];
  kpiResults: Array<{
    kpiId: string;
    kpiName: string;
    kpiNameAr: string;
    category: string;
    value: number;
    target: number;
    unit: string;
    status: KPIStatus;
    variance: number;
    trend: 'up' | 'down' | 'neutral';
  }>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  departmentId?: string;
  avatarUrl?: string;
}

export interface ImportSession {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  sourceType: 'PDF' | 'Excel' | 'CSV' | 'Word' | 'Google Drive';
  totalDetected: number;
  approvedCount: number;
  reviewCount: number;
  duplicateCount: number;
  status: 'Processing' | 'Ready for Review' | 'Imported' | 'Cancelled';
  kpis: KPIDefinition[];
}
