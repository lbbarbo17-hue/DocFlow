'use client';

import React from 'react';
import AuditTable from '@/components/audit/AuditTable';
import { ShieldCheck } from 'lucide-react';

export default function AuditoriaPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#065373]" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Trilha de Auditoria & Registro de Atividades
          </h1>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300">
          Rastreabilidade completa de todas as operações e validações de documentos realizadas no sistema.
        </p>
      </div>

      {/* Audit Table */}
      <AuditTable />
    </div>
  );
}
