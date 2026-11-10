'use client';

import React from 'react';
import DocumentChecklist from '@/components/student/DocumentChecklist';

export default function StudentChecklistPage() {
  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Título Direto na Página (Tipografia Limpa) */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Documentos do Aprendiz
        </h1>
      </div>

      {/* Checklist Completo de Documentos */}
      <DocumentChecklist />
    </div>
  );
}
