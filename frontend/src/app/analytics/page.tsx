'use client';

import React from 'react';
import MetricsOverview from '@/components/analytics/MetricsOverview';
import TurmaRiskTable from '@/components/analytics/TurmaRiskTable';
import PageBanner from '@/components/layout/PageBanner';
import { BarChart3, FolderPlus } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header Banner */}
      <PageBanner
        title="Gestão e Monitoramento de Turmas"
        subtitle="Indicadores de conformidade geral, análise de risco e comparativo analítico"
        icon={BarChart3}
        action={{
          label: 'Cadastrar Turma',
          href: '/coordenador/cadastro',
          icon: FolderPlus,
        }}
      />

      {/* Strategic KPIs Overview */}
      <MetricsOverview />

      {/* Turmas Detailed Comparison & Risk Prevention Table */}
      <TurmaRiskTable />
    </div>
  );
}
