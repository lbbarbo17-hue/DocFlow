'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StudentMasterList from '@/components/coordinator/StudentMasterList';
import PageBanner from '@/components/layout/PageBanner';
import { Loader2, UserCheck, UserPlus } from 'lucide-react';

function DossiesContent() {
  const searchParams = useSearchParams();

  const studentParam = searchParams.get('student') || undefined;
  const docParam = searchParams.get('doc') || undefined;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header Banner */}
      <PageBanner
        title="Aprendizes e Estagiários"
        subtitle="Gestão de dossiês documentais, validação de arquivos e acompanhamento individual"
        icon={UserCheck}
        action={{
          label: 'Novo Cadastro',
          href: '/coordenador/cadastro',
          icon: UserPlus,
        }}
      />

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
          <span className="text-xs">Carregando documentos...</span>
        </div>
      }
    >
      <DossiesContent />
    </Suspense>
  );
}
