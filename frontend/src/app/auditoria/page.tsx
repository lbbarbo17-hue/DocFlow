'use client';

import React from 'react';
import AuditTable from '@/components/audit/AuditTable';
import PageBanner from '@/components/layout/PageBanner';
import { ShieldCheck, LayoutDashboard } from 'lucide-react';

export default function AuditoriaPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header Banner */}
      <PageBanner
        title="Trilha de Auditoria & Registro de Atividades"
        icon={ShieldCheck}
        backHref="/admin"
        backLabel="Voltar ao Painel Principal"
        badge={{
          label: 'Super Administrador',
          icon: ShieldCheck,
        }}
        action={{
          label: 'Ir para Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
        }}
      />

      {/* Audit Table */}
      <AuditTable />
    </div>
  );
}
