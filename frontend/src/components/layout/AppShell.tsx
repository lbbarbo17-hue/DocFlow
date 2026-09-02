'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import AccessDenied from '@/components/common/AccessDenied';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentRole } = useApp();

  const isAuthPage = pathname === '/login';

  if (isAuthPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  // Strict Interface Access Validation
  const isEstudanteRoute = pathname.startsWith('/estudante');
  const isCoordenadorRoute = pathname.startsWith('/coordenador') || pathname.startsWith('/analytics');
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/auditoria');

  const isDenied =
    (isEstudanteRoute && currentRole !== 'ESTUDANTE') ||
    (isCoordenadorRoute && currentRole !== 'COORDENADOR') ||
    (isAdminRoute && currentRole !== 'SUPERADMIN');

  const requiredRoleLabel = isEstudanteRoute
    ? 'Aprendiz / Estudante'
    : isCoordenadorRoute
    ? 'Coordenador de Curso / RH'
    : 'Super Administrador';

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar: fixed height, does not scroll with content */}
      <div className="h-screen sticky top-0 shrink-0">
        <Sidebar />
      </div>
      {/* Main area scrolls independently */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {isDenied ? <AccessDenied requiredRoleName={requiredRoleLabel} /> : children}
        </main>
      </div>
    </div>
  );
}
