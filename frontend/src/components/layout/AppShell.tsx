'use client';

import React, { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import AccessDenied from '@/components/common/AccessDenied';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentRole } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/' ||
    pathname === '/landing' ||
    pathname === '/esqueceu-senha';

  if (isAuthPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  const isEstudanteRoute = pathname.startsWith('/estudante');
  const isCoordenadorRoute = pathname.startsWith('/coordenador') || pathname.startsWith('/analytics');
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/auditoria');

  const isDenied =
    (isEstudanteRoute && currentRole !== 'ESTUDANTE' && currentRole !== 'SUPERADMIN') ||
    (isCoordenadorRoute && currentRole !== 'COORDENADOR' && currentRole !== 'SUPERADMIN') ||
    (isAdminRoute && currentRole !== 'SUPERADMIN');

  const requiredRoleLabel = isEstudanteRoute
    ? 'Aprendiz / Estudante'
    : isCoordenadorRoute
    ? 'Coordenador de Curso / RH'
    : 'Super Administrador';

  return (
    <div
      id="main-scroll-container"
      ref={scrollContainerRef}
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200"
    >
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-6 pb-24 md:pb-8">
        {isDenied ? <AccessDenied requiredRoleName={requiredRoleLabel} /> : children}
      </main>
      <BottomNav />
    </div>
  );
}
