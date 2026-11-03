'use client';

import React from 'react';
import Link from 'next/link';
import { UploadCloud, FileText } from 'lucide-react';
import DocumentChecklist from '@/components/student/DocumentChecklist';

export default function StudentChecklistPage() {
  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Cabeçalho da Página (Estilo Dashboard) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText className="w-6 h-6 text-[#085078] dark:text-cyan-400 shrink-0" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
            Documentos do Aprendiz
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/estudante/enviar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#085078] hover:bg-[#063c5a] text-white dark:bg-[#085078] dark:hover:bg-[#063c5a] dark:text-white transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <UploadCloud className="w-4 h-4 shrink-0" />
            <span>Adicionar Documentos</span>
          </Link>
        </div>
      </div>

      {/* 2. Checklist Completo de Documentos */}
      <DocumentChecklist />
    </div>
  );
}
