'use client';

import React from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#065373]" />
          <h1 className="text-xl font-bold text-slate-900">
            Painel do Super Administrador — Controle Global
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Gerenciamento de usuários, permissões de acesso, cadastro de turmas e governança de segurança do sistema.
        </p>
      </div>

      {/* Admin Dashboard */}
      <AdminDashboard />
    </div>
  );
}
