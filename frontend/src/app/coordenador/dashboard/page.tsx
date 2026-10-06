'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CoordinatorDashboard from '@/components/coordinator/CoordinatorDashboard';
import CoordinatorHeader from '@/components/coordinator/CoordinatorHeader';

export default function CoordinatorDashboardPage() {
  const router = useRouter();

  const handleNavigateToDossier = (studentId: string, docId?: string) => {
    router.push(`/coordenador/dossies?student=${studentId}${docId ? `&doc=${docId}` : ''}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Saudação, Perfil & Vínculo */}
      <CoordinatorHeader />

      {/* Main Coordinator Dashboard */}
      <CoordinatorDashboard onNavigateToDossier={handleNavigateToDossier} />
    </div>
  );
}
