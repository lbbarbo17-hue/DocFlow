'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CoordinatorDashboard from '@/components/coordinator/CoordinatorDashboard';
import { LayoutDashboard, FolderKanban } from 'lucide-react';

export default function CoordinatorDashboardPage() {
  const router = useRouter();

  const handleNavigateToDossier = (studentId: string, docId?: string) => {
    router.push(`/coordenador/dossies?student=${studentId}${docId ? `&doc=${docId}` : ''}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-[#065373] dark:text-cyan-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Dashboard do Coordenador & RH — Urgências e Priorização
            </h1>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
            Visão executiva em tempo real das pendências documentais críticas, documentos aguardando análise e fila de prioridades.
          </p>
        </div>

        <button
          onClick={() => router.push('/coordenador/dossies')}
          className="px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 border-2 border-slate-400 dark:border dark:border-slate-800 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <FolderKanban className="w-4 h-4 text-[#065373] dark:text-cyan-400" />
          <span>Explorar Dossiês Completos</span>
        </button>
      </div>

      {/* Main Coordinator Dashboard */}
      <CoordinatorDashboard onNavigateToDossier={handleNavigateToDossier} />
    </div>
  );
}
