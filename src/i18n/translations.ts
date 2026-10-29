export type Language = 'en' | 'ar';

export const translations = {
  en: {
    // App Branding
    appName: 'HR KPI Intelligence Platform',
    appSubtitle: 'Enterprise HR Performance & Analytics Engine',
    poweredByPdf: 'Synchronized with Employee Turnover 2025 Standards',

    // Nav
    navOverview: 'Overview Dashboard',
    navKpiLibrary: 'KPI Library',
    navMyKpis: 'My KPIs',
    navDataEntry: 'Dynamic Data Entry',
    navAnalytics: 'Executive Analytics',
    navReports: 'Automated Reports',
    navAiInsights: 'AI Intelligence Assistant',
    navDepartments: 'Departments',
    navTeam: 'Users & Permissions',
    navImportCenter: 'Import Center',
    navKpiBuilder: 'KPI Builder',
    navSettings: 'Platform Settings',

    // Header & Meta
    organization: 'Organization',
    role: 'Current Role',
    language: 'Language',
    searchPlaceholder: 'Search 37+ HR KPIs by code, name, or category...',
    notifications: 'Notifications',
    activeKpis: 'Active KPIs',
    timezoneRiyadh: 'Asia/Riyadh (AST)',

    // Dashboard Cards
    totalActiveKpis: 'Monitored KPIs',
    kpisOnTrack: 'On Track',
    kpisAtRisk: 'At Risk',
    kpisOffTrack: 'Off Track',
    insufficientData: 'Pending Submissions',
    reportsGenerated: 'Reports Generated',
    workforceHealth: 'Workforce Stability Rate',
    averageTenure: 'Average Company Tenure',

    // KPI Card & Table
    kpiCode: 'Code',
    kpiName: 'Indicator Name',
    category: 'Category',
    frequency: 'Frequency',
    currentValue: 'Current Value',
    target: 'Target',
    variance: 'Variance',
    status: 'Status',
    lastUpdated: 'Last Updated',
    actions: 'Actions',
    viewDetails: 'View Details',
    enterData: 'Enter Data',
    favorite: 'Favorite',

    // Statuses
    statusOnTrack: 'On Track',
    statusAtRisk: 'At Risk',
    statusOffTrack: 'Off Track',
    statusInsufficient: 'Insufficient Data',

    // Details Modal Tabs
    tabOverview: 'Overview & Objectives',
    tabCalculation: 'Formula & Methodology',
    tabDataEntry: 'Live Data Entry',
    tabPerformance: 'Performance Trends',
    tabAiInsights: 'AI Strategic Diagnosis',
    tabReports: 'Audit & Reports',

    // Form & Calculation
    inputVariables: 'Required Operational Variables',
    calculateNow: 'Calculate & Validate',
    submitting: 'Saving...',
    submitData: 'Submit Period Data',
    submissionSuccess: 'Data submitted and recalculated successfully!',
    period: 'Reporting Period',
    formula: 'Calculation Formula',
    unit: 'Unit',
    trendGoodWhen: 'Trend Direction',
    purpose: 'Business Purpose',
    objective: 'Objective Measured',
    exampleCalculation: 'Methodology & Sample Calculation',

    // Reports
    generateReportNow: 'Generate Report Now',
    exportPdf: 'Export Official PDF',
    exportCsv: 'Export CSV / Excel',
    automatedScheduler: 'Automated Background Scheduler',
    schedulerActive: 'Active & Enforced',
    nextRun: 'Next Scheduled Run',
    weeklyCadence: 'Weekly Cycle (Sundays & Thursdays 08:00 AST)',
    monthlyCadence: 'Monthly Calendar Run (1st of Month)',
    executiveSummary: 'Executive Summary',
    recommendations: 'Strategic HR Recommendations',

    // Import Center
    importTitle: 'KPI Library Import Center',
    importSubtitle: 'Extract and validate KPI cards from PDF, Excel, Google Drive, or Word documents',
    uploadDropzone: 'Drag & drop your HR KPI reference documents here, or browse files',
    uploadSupported: 'Supports PDF, XLSX, CSV, DOCX, and Google Sheets links',
    loadSeedPdf: 'Re-Analyze Attached Reference: Employee Turnover 2025 (PDF)',
    extractionSummary: 'Extraction Summary',
    totalDetected: 'Total KPIs Detected',
    approvedKpis: 'Approved & Active',
    requiresReview: 'Requires Human Review',
    duplicateKpis: 'Duplicates Resolved',
    approveAll: 'Approve & Commit All',
    sourceDocument: 'Source Document',

    // Builder
    builderTitle: 'Visual KPI Builder & Formula Sandbox',
    builderSubtitle: 'Define, calibrate, test, and publish custom organizational indicators',
    formulaTester: 'Deterministic Formula Test Bench',
    testFormula: 'Run Formula Test',
    publishKpi: 'Publish Approved KPI',

    // Roles
    roleSuperAdmin: 'Super Admin',
    roleOrgAdmin: 'Organization Admin',
    roleHrManager: 'HR Manager',
    roleDataEntry: 'Data Entry Officer',
    roleExecutiveViewer: 'Executive Viewer',

    // General
    filterAll: 'All Categories',
    allStatuses: 'All Statuses',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save Changes',
    loading: 'Loading intelligence data...',
    quickTour: 'Quick Tour',
    systemStatus: 'System Operational · Formula Engine v2.4 Active',
  },
  ar: {
    // App Branding
    appName: 'منصة ذكاء مؤشرات الموارد البشرية',
    appSubtitle: 'محرك قياس وتحليل أداء رأس المال البشري للمؤسسات',
    poweredByPdf: 'متطابقة مع المعايير المعتمدة في وثيقة دوران الموظفين 2025',

    // Nav
    navOverview: 'لوحة القيادة التنفيذية',
    navKpiLibrary: 'مكتبة المؤشرات (37+)',
    navMyKpis: 'مؤشراتي المعتمدة',
    navDataEntry: 'الإدخال الديناميكي للبيانات',
    navAnalytics: 'التحليلات والمقارنات',
    navReports: 'التقارير المجدولة والآلية',
    navAiInsights: 'المساعد الذكي للأداء (AI)',
    navDepartments: 'الإدارات والأقسام',
    navTeam: 'المستخدمون والصلاحيات',
    navImportCenter: 'مركز الاستيراد والمعالجة',
    navKpiBuilder: 'منشئ المؤشرات المخصص',
    navSettings: 'إعدادات المنصة',

    // Header & Meta
    organization: 'المنظمة الحالية',
    role: 'الدور النشط',
    language: 'اللغة',
    searchPlaceholder: 'ابحث في أكثر من 37 مؤشر أداء بالرمز، الاسم، أو التصنيف...',
    notifications: 'التنبيهات',
    activeKpis: 'المؤشرات النشطة',
    timezoneRiyadh: 'توقيت الرياض (AST)',

    // Dashboard Cards
    totalActiveKpis: 'المؤشرات المراقبة',
    kpisOnTrack: 'ضمن المستهدف',
    kpisAtRisk: 'في منطقة الخطر',
    kpisOffTrack: 'خارج المستهدف',
    insufficientData: 'بيانات غير مكتملة',
    reportsGenerated: 'التقارير المكتملة',
    workforceHealth: 'معدل استقرار القوى العاملة',
    averageTenure: 'متوسط سنوات الخدمة',

    // KPI Card & Table
    kpiCode: 'الرمز',
    kpiName: 'اسم المؤشر',
    category: 'التصنيف',
    frequency: 'دورية القياس',
    currentValue: 'القيمة الحالية',
    target: 'المستهدف',
    variance: 'الانحراف',
    status: 'الحالة',
    lastUpdated: 'آخر تحديث',
    actions: 'الإجراءات',
    viewDetails: 'عرض التفاصيل',
    enterData: 'إدخال البيانات',
    favorite: 'المفضلة',

    // Statuses
    statusOnTrack: 'ضمن المستهدف',
    statusAtRisk: 'في خطر',
    statusOffTrack: 'خارج المستهدف',
    statusInsufficient: 'نقص بيانات',

    // Details Modal Tabs
    tabOverview: 'نظرة عامة والأهداف',
    tabCalculation: 'المعادلة والمنهجية',
    tabDataEntry: 'الإدخال المباشر للبيانات',
    tabPerformance: 'اتجاهات الأداء التاريخي',
    tabAiInsights: 'التشخيص الاستراتيجي الذكي',
    tabReports: 'سجل التدقيق والتقارير',

    // Form & Calculation
    inputVariables: 'المتغيرات التشغيلية المطلوبة للمعادلة',
    calculateNow: 'حساب والتحقق من المعادلة',
    submitting: 'جارٍ الحفظ والاعتماد...',
    submitData: 'اعتماد وإرسال بيانات الفترة',
    submissionSuccess: 'تم احتساب القيمة وتحديث السجلات بنجاح!',
    period: 'فترة التقرير',
    formula: 'المعادلة الرياضية',
    unit: 'وحدة القياس',
    trendGoodWhen: 'الاتجاه المرغوب',
    purpose: 'الهدف والغرض المؤسسي',
    objective: 'الهدف المقاس والارتباط',
    exampleCalculation: 'شرح المنهجية والمثال الحسابي',

    // Reports
    generateReportNow: 'توليد تقرير فوري الآن',
    exportPdf: 'تصدير التقرير الرسمي PDF',
    exportCsv: 'تصدير بصيغة Excel / CSV',
    automatedScheduler: 'المجدول الآلي الخلفي للتقارير',
    schedulerActive: 'نشط ومنفذ وفق الحوكمة',
    nextRun: 'التشغيل الآلي القادم',
    weeklyCadence: 'الدورة الأسبوعية (الأحد والخميس 08:00 صباحاً)',
    monthlyCadence: 'الدورة الشهرية (اليوم الأول من كل شهر)',
    executiveSummary: 'الملخص التنفيذي للإدارة العليا',
    recommendations: 'التوصيات الاستراتيجية للموارد البشرية',

    // Import Center
    importTitle: 'مركز استيراد مكتبة المؤشرات',
    importSubtitle: 'استخراج وتدقيق بطاقات المؤشرات آلياً من ملفات PDF، Excel، Google Drive، أو Word',
    uploadDropzone: 'اسحب وأفلت وثائق المؤشرات المرجعية هنا أو انقر للاستعراض',
    uploadSupported: 'يدعم صيغ PDF، XLSX، CSV، DOCX، وروابط Google Sheets',
    loadSeedPdf: 'إعادة تحليل الملف المرفق: Employee Turnover 2025 (PDF)',
    extractionSummary: 'ملخص معالجة المستند',
    totalDetected: 'إجمالي المؤشرات المكتشفة',
    approvedKpis: 'المؤشرات المعتمدة والنشطة',
    requiresReview: 'مؤشرات تتطلب مراجعة بشرية',
    duplicateKpis: 'المؤشرات المكررة المعالجة',
    approveAll: 'اعتماد ونقل كافة المؤشرات',
    sourceDocument: 'المستند المصدري',

    // Builder
    builderTitle: 'منشئ المؤشرات المرئي ومختبر المعادلات',
    builderSubtitle: 'بناء وتخصيص واختبار معادلات الأداء المؤسسية قبل نشرها',
    formulaTester: 'منصة الاختبار الحسابي المباشر',
    testFormula: 'اختبار صحة المعادلة',
    publishKpi: 'نشر واعتماد المؤشر',

    // Roles
    roleSuperAdmin: 'مدير النظام الأعلى',
    roleOrgAdmin: 'مدير المنظمة',
    roleHrManager: 'مدير الموارد البشرية',
    roleDataEntry: 'مسؤول إدخال البيانات',
    roleExecutiveViewer: 'مطلع تنفيذي (للقراءة فقط)',

    // General
    filterAll: 'كافة التصنيفات',
    allStatuses: 'كافة الحالات',
    close: 'إغلاق',
    cancel: 'إلغاء',
    save: 'حفظ التعديلات',
    loading: 'جارٍ تحميل البيانات الذكية...',
    quickTour: 'جولة تعريفية',
    systemStatus: 'النظام يعمل بكفاءة · محرك المعادلات الرياضية v2.4 نشط',
  },
};
