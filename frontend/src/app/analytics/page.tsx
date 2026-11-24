'use client';

import React from 'react';
import Link from 'next/link';
import TurmaRiskTable from '@/components/analytics/TurmaRiskTable';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 mb-6 flex items-center justify-between shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
          Gestão e Monitoramento de Turmas
        </h1>
        <Link
          href="/coordenador/cadastro"
          className="bg-[#085078] hover:bg-[#063f60] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm inline-flex items-center gap-2"
        >
          Cadastrar Turma
        </Link>
      </div>

      {/* Turmas Detailed Comparison & Risk Prevention Table */}
      <TurmaRiskTable />
    </div>
  );
}
