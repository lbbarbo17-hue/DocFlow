'use client';

import React from 'react';
import DocumentChecklist from '@/components/student/DocumentChecklist';
import PageBanner from '@/components/layout/PageBanner';
import { FileCheck, UploadCloud, ShieldCheck } from 'lucide-react';

export default function StudentChecklistPage() {
  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Page Header Banner Padronizado */}
      <PageBanner
        title="Meus Documentos & Checklist"
        icon={FileCheck}
        backHref="/estudante"
        backLabel="Voltar ao Painel Principal"
        badge={{
          label: 'Ambiente do Aluno',
          icon: ShieldCheck,
        }}
        action={{
          label: 'Adicionar Documentos',
          href: '/estudante/enviar',
          icon: UploadCloud,
        }}
      />

      {/* Checklist Completo de Documentos */}
      <DocumentChecklist />
    </div>
  );
}
