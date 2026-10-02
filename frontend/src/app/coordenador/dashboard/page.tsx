'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CoordinatorDashboard from '@/components/coordinator/CoordinatorDashboard';
import PageBanner from '@/components/layout/PageBanner';
import { LayoutDashboard, FolderKanban } from 'lucide-react';

export default function CoordinatorDashboardPage() {
  const router = useRouter();

  const handleNavigateToDossier = (studentId: string, docId?: string) => {
    router.push(`/coordenador/dossies?student=${studentId}${docId ? `&doc=${docId}` : ''}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header Banner */}
      <PageBanner
        title="Dashboard do Coordenador & RH"
        subtitle="Visão executiva em tempo real de conformidade, pendências críticas e prioridades"
        icon={LayoutDashboard}
        action={{
          label: 'Explorar Dossiês',
          href: '/coordenador/dossies',
          icon: FolderKanban,
        }}
      />

      {/* Main Coordinator Dashboard */}
      <CoordinatorDashboard onNavigateToDossier={handleNavigateToDossier} />
    </div>
  );
}
