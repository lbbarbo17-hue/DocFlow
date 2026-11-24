'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import StudentMasterList from '@/components/coordinator/StudentMasterList';
import { Loader2 } from 'lucide-react';

function DossiesContent() {
  const searchParams = useSearchParams();

  const studentParam = searchParams.get('student') || undefined;
  const docParam = searchParams.get('doc') || undefined;
  const turmaParam = searchParams.get('turma') || undefined;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Card Banner Padrão */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 mb-6 flex items-center justify-between shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
          Aprendizes e Estagiários
        </h1>

        <Link
          href="/coordenador/cadastro"
          className="bg-[#085078] hover:bg-[#063f60] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          + Novo Cadastro
        </Link>
      </div>

      {/* Master-Detail Student List & Dossier Viewer */}
      <StudentMasterList
        initialStudentId={studentParam}
        initialDocId={docParam}
        initialTurmaId={turmaParam}
      />
    </div>
  );
}

export default function DossiesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-2 text-slate-700 dark:text-slate-300 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-[#085078] dark:text-cyan-400" />
          <span className="text-xs">Carregando documentos...</span>
        </div>
      }
    >
      <DossiesContent />
    </Suspense>
  );
}
