'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import DocumentChecklist from '@/components/student/DocumentChecklist';

export default function StudentChecklistPage() {
  return (
    <div className="pb-12 animate-fadeIn">
      {/* Card Banner Padrão */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        {/* Lado Esquerdo (Ícone + Textos) */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-[#085078]/10 dark:bg-[#085078]/30 text-[#085078] dark:text-cyan-400 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Documentos do Aprendiz
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Acompanhe o status de validação e gerencie todos os comprovantes do seu contrato.
            </p>
          </div>
        </div>

        {/* Lado Direito: Botão discreto para "+ Novo Envio" */}
        <div className="shrink-0 flex items-center">
          <Link
            href="/estudante/enviar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#085078] hover:bg-[#063f60] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Envio</span>
          </Link>
        </div>
      </div>

      {/* Checklist Completo de Documentos */}
      <DocumentChecklist />
    </div>
  );
}
