'use client';

import React from 'react';
import Link from 'next/link';
import DocumentChecklist from '@/components/student/DocumentChecklist';

export default function StudentChecklistPage() {
  return (
    <div className="pb-12 animate-fadeIn">
      {/* Card Banner Padrão */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 mb-6 flex items-center justify-between shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
          Documentos do Aprendiz
        </h1>

        <Link
          href="/estudante/enviar"
          className="bg-[#085078] hover:bg-[#063f60] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          + Novo Envio
        </Link>
      </div>

      {/* Checklist Completo de Documentos */}
      <DocumentChecklist />
    </div>
  );
}
