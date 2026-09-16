'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import AccessDenied from '@/components/common/AccessDenied';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentRole, isSidebarOpen, closeSidebar } = useApp();

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
    <div className="flex h-screen overflow-hidden bg-[#DDDDDD] dark:bg-slate-950 transition-colors duration-200 relative">
      {/* Mobile/Tablet Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-label="Fechar menu lateral"
        />
      )}

      {/* Sidebar: Mobile Off-canvas Drawer + Desktop Collapsible Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:h-screen lg:shrink-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen
            ? 'translate-x-0 w-64 opacity-100'
            : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main area scrolls independently */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {isDenied ? <AccessDenied requiredRoleName={requiredRoleLabel} /> : children}
        </main>
      </div>
    </div>
  );
}
