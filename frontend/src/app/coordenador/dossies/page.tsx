'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import StudentMasterList from '@/components/coordinator/StudentMasterList';
import { UserCheck, LayoutDashboard, Loader2, UserPlus } from 'lucide-react';

function DossiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const studentParam = searchParams.get('student') || undefined;
  const docParam = searchParams.get('doc') || undefined;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#065373] dark:text-cyan-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Gestão de Dossiês dos Aprendizes & Estagiários
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inspeção aprofundada de documentos digitais com conferência de conformidade, hash SHA-256 e emissão de pareceres.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => router.push('/coordenador/cadastro')}
            className="px-4 py-2 bg-gradient-to-r from-[#065373] to-[#226a8b] hover:from-[#0a6d96] hover:to-[#226a8b] text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4 text-cyan-300" />
            <span>Cadastrar Aluno</span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/coordenador')}
            className="px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4 text-[#065373] dark:text-cyan-400" />
            <span>Voltar ao Dashboard</span>
          </button>
        </div>
      </div>

      {/* Master-Detail Student List & Dossier Viewer */}
      <StudentMasterList
        initialStudentId={studentParam}
        initialDocId={docParam}
      />
    </div>
  );
}

export default function DossiesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-2 text-slate-500 dark:text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#065373] dark:text-cyan-400" />
          <span className="text-xs">Carregando dossiês...</span>
        </div>
      }
    >
      <DossiesContent />
    </Suspense>
  );
}
