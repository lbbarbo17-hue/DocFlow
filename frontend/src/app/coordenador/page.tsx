'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CoordinatorDashboard from '@/components/coordinator/CoordinatorDashboard';

export default function CoordenadorPage() {
  const router = useRouter();

  const handleNavigateToDossier = (studentId: string, docId?: string) => {
    router.push(`/coordenador/dossies?student=${studentId}${docId ? `&doc=${docId}` : ''}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <CoordinatorDashboard onNavigateToDossier={handleNavigateToDossier} />
    </div>
  );
}
