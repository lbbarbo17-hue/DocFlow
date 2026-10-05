'use client';

import React from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import PageBanner from '@/components/layout/PageBanner';
import { Shield, ShieldCheck } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header Banner */}
      <PageBanner
        title="Painel do Super Administrador"
        subtitle="Gerenciamento de usuários, permissões globais e governança de segurança"
        icon={Shield}
        badge={{
          label: 'Super Administrador',
          icon: ShieldCheck,
        }}
        action={{
          label: 'Trilha de Auditoria',
          href: '/auditoria',
          icon: ShieldCheck,
        }}
      />

      {/* Admin Dashboard */}
      <AdminDashboard />
    </div>
  );
}
