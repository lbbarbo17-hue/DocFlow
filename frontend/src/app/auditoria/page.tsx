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
          <h1 className="text-xl font-bold text-slate-900">
            Painel do DPO & Governança LGPD — Trilha Forense
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Rastreabilidade completa de todas as operações de custódia documental com garantias criptográficas de imutabilidade.
        </p>
      </div>

      {/* Audit Table */}
      <AuditTable />
    </div>
  );
}
