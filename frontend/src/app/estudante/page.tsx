'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import DocumentChecklist from '@/components/student/DocumentChecklist';
import ExpirationAlert from '@/components/student/ExpirationAlert';
import UploadModal from '@/components/student/UploadModal';
import { DocumentItem } from '@/lib/types';
import { User, Building2, BookOpen } from 'lucide-react';

export default function EstudantePage() {
  const { student } = useApp();
  const [activeUploadDoc, setActiveUploadDoc] = useState<DocumentItem | null>(null);

  return (
    <div className="space-y-5">
      {/* Student identity card - clean and compact */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-2xl bg-[#065373]/10 text-[#065373] flex items-center justify-center shrink-0">
          <User className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-base font-extrabold text-slate-900 truncate">{student.nome}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <BookOpen className="w-3.5 h-3.5" />
              {student.curso}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Building2 className="w-3.5 h-3.5" />
              {student.empresa}
            </span>
          </div>
        </div>

        {/* Status chip */}
        <div
          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border ${
            student.statusGeral === 'REGULAR'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : student.statusGeral === 'ALERTA_CRITICO'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {student.statusGeral === 'REGULAR'
            ? '✅ Situação Regular'
            : student.statusGeral === 'ALERTA_CRITICO'
            ? '🚨 Atenção Crítica'
            : '⏳ Pendências'}
        </div>
      </div>

      {/* Renewal alerts — displayed prominently */}
      <ExpirationAlert
        documents={student.documentos}
        onUploadClick={(doc) => setActiveUploadDoc(doc)}
      />

      {/* Document checklist */}
      <DocumentChecklist />

      {/* Upload modal */}
      {activeUploadDoc && (
        <UploadModal
          document={activeUploadDoc}
          onClose={() => setActiveUploadDoc(null)}
        />
      )}
    </div>
  );
}
