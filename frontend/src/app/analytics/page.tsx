'use client';

import React from 'react';
import MetricsOverview from '@/components/analytics/MetricsOverview';
import TurmaRiskTable from '@/components/analytics/TurmaRiskTable';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#065373]" />
          <h1 className="text-xl font-bold text-slate-900">
            Dashboard de Encaminhamento & Conformidade por Turma
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Visão consolidada da regularidade documental de todas as turmas ativas para prevenção de penalidades e cancelamento de estágios.
        </p>
      </div>

      {/* Strategic KPIs Overview */}
      <MetricsOverview />

      {/* Turmas Detailed Comparison & Risk Prevention Table */}
      <TurmaRiskTable />
    </div>
  );
}
