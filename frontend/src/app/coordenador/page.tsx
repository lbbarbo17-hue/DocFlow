'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CoordinatorDashboard from '@/components/coordinator/CoordinatorDashboard';

import PageBanner from '@/components/layout/PageBanner';
import { LayoutDashboard, FolderKanban, ShieldCheck } from 'lucide-react';

export default function CoordenadorPage() {
  const router = useRouter();

  const handleNavigateToDossier = (studentId: string, docId?: string) => {
    router.push(`/coordenador/dossies?student=${studentId}${docId ? `&doc=${docId}` : ''}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header Banner */}
      <PageBanner
        title="Dashboard da Coordenação & RH"
        subtitle="Visão executiva em tempo real de conformidade, pendências críticas e prioridades"
        icon={LayoutDashboard}
        badge={{
          label: 'Ambiente da Coordenação',
          icon: ShieldCheck,
        }}
        action={{
          label: 'Explorar Dossiês',
          href: '/coordenador/dossies',
          icon: FolderKanban,
        }}
      />

      <CoordinatorDashboard onNavigateToDossier={handleNavigateToDossier} />
    </div>
  );
}
