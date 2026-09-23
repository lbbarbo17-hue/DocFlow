'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StudentMasterList from '@/components/coordinator/StudentMasterList';
import { Loader2 } from 'lucide-react';

function DossiesContent() {
  const searchParams = useSearchParams();

  const studentParam = searchParams.get('student') || undefined;
  const docParam = searchParams.get('doc') || undefined;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Title */}
      <div className="flex items-center gap-2.5 pb-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Aprendizes e Estagiários
        </h1>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700">
          Dossiês
        </span>
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
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-2 text-slate-700 dark:text-slate-300 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-[#065373] dark:text-cyan-400" />
          <span className="text-xs">Carregando dossiês...</span>
        </div>
      }
    >
      <DossiesContent />
    </Suspense>
  );
}
