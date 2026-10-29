import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { KPILibrary } from './components/kpi/KPILibrary';
import { KPIDetailModal } from './components/kpi/KPIDetailModal';
import { DynamicDataEntryHub } from './components/data-entry/DynamicDataEntryHub';
import { ExecutiveAnalytics } from './components/analytics/ExecutiveAnalytics';
import { AutomatedReportsCenter } from './components/reports/AutomatedReportsCenter';
import { AIInsightsCenter } from './components/ai/AIInsightsCenter';
import { ImportCenter } from './components/import/ImportCenter';
import { VisualKPIBuilder } from './components/builder/VisualKPIBuilder';
import { DepartmentsAndTeam } from './components/organization/DepartmentsAndTeam';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { KPIDefinition } from './types';

const MainAppContent: React.FC = () => {
  const { kpis, language, t, theme } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKpiForDetail, setSelectedKpiForDetail] = useState<KPIDefinition | null>(null);
  const [preselectedKpiForDataEntry, setPreselectedKpiForDataEntry] = useState<KPIDefinition | null>(null);
  const [showQuickTour, setShowQuickTour] = useState(false);
  const [showReportTriggerModal, setShowReportTriggerModal] = useState(false);

  const handleEnterDataFromCard = (kpi: KPIDefinition) => {
    setPreselectedKpiForDataEntry(kpi);
    setActiveTab('data-entry');
  };

  const handleSelectKpiFromDashboard = (kpi: KPIDefinition) => {
    setSelectedKpiForDetail(kpi);
  };

  const isLight = theme === 'light';

  return (
    <div className={`flex h-screen ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'} font-sans overflow-hidden transition-colors`}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickTour={() => setShowQuickTour(true)}
      />

      {/* Main App Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          searchQuery={searchQuery}
          onSearchChange={q => {
            setSearchQuery(q);
            if (q.trim().length > 0 && activeTab !== 'kpis') {
              setActiveTab('kpis');
            }
          }}
          onOpenReportModal={() => setActiveTab('reports')}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'overview' && (
              <OverviewDashboard
                onSelectKpi={handleSelectKpiFromDashboard}
                onNavigate={setActiveTab}
                onOpenReportModal={() => setActiveTab('reports')}
              />
            )}

            {activeTab === 'kpis' && (
              <KPILibrary
                onSelectKpi={setSelectedKpiForDetail}
                onEnterData={handleEnterDataFromCard}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'my-kpis' && (
              <KPILibrary
                favoritesOnly
                onSelectKpi={setSelectedKpiForDetail}
                onEnterData={handleEnterDataFromCard}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'data-entry' && (
              <DynamicDataEntryHub
                preselectedKpi={preselectedKpiForDataEntry}
                onClearPreselection={() => setPreselectedKpiForDataEntry(null)}
              />
            )}

            {activeTab === 'analytics' && <ExecutiveAnalytics />}

            {activeTab === 'reports' && <AutomatedReportsCenter />}

            {activeTab === 'ai-insights' && <AIInsightsCenter />}

            {activeTab === 'departments' && (
              <DepartmentsAndTeam initialView="departments" />
            )}

            {activeTab === 'team' && (
              <DepartmentsAndTeam initialView="team" />
            )}

            {activeTab === 'import' && <ImportCenter />}

            {activeTab === 'builder' && <VisualKPIBuilder />}

            {activeTab === 'settings' && (
              <DepartmentsAndTeam initialView="settings" />
            )}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selectedKpiForDetail && (
        <KPIDetailModal
          kpi={selectedKpiForDetail}
          onClose={() => setSelectedKpiForDetail(null)}
        />
      )}

      {/* Quick Tour Modal */}
      {showQuickTour && (
        <OnboardingModal onClose={() => setShowQuickTour(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
