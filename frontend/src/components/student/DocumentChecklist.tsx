'use client';

import React, { useState } from 'react';
import {
  Upload,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { DocumentItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { getStatusBadgeConfig } from '@/lib/utils';
import UploadModal from './UploadModal';

export default function DocumentChecklist() {
  const { student } = useApp();
  const [activeUploadDoc, setActiveUploadDoc] = useState<DocumentItem | null>(null);

  const approvedCount = student.documentos.filter((d) => d.status === 'APROVADO').length;
  const total = student.documentos.length;

  return (
    <div className="space-y-4">
      {/* Compact progress bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-bold text-slate-700">Progresso do Dossiê</p>
            <p className="text-[11px] text-slate-500">
              {approvedCount} de {total} documentos aprovados
            </p>
          </div>
          <span
            className={`text-2xl font-black ${
              student.percentualConformidade === 100
                ? 'text-emerald-600'
                : student.percentualConformidade >= 60
                ? 'text-[#065373]'
                : 'text-rose-600'
            }`}
          >
            {student.percentualConformidade}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${
              student.percentualConformidade === 100
                ? 'bg-emerald-500'
                : student.percentualConformidade >= 60
                ? 'bg-gradient-to-r from-[#065373] to-[#3f81a3]'
                : 'bg-rose-500'
            }`}
            style={{ width: `${student.percentualConformidade}%` }}
          />
        </div>
      </div>

      {/* Document list */}
      <div className="space-y-2">
        {student.documentos.map((doc) => {
          const badge = getStatusBadgeConfig(doc.status);
          const needsAction =
            doc.status === 'PENDENTE' ||
            doc.status === 'RECUSADO' ||
            doc.status === 'EXPIRADO';

          return (
            <div
              key={doc.id}
              className={`bg-white rounded-2xl p-4 border shadow-sm transition-all ${
                needsAction
                  ? 'border-rose-200 hover:border-rose-400'
                  : doc.status === 'EM_ANALISE'
                  ? 'border-sky-200 hover:border-sky-400'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Status icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    doc.status === 'APROVADO'
                      ? 'bg-emerald-50 text-emerald-600'
                      : doc.status === 'EM_ANALISE'
                      ? 'bg-sky-50 text-sky-600'
                      : needsAction
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {doc.status === 'APROVADO' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : doc.status === 'EM_ANALISE' ? (
                    <Clock className="w-5 h-5" />
                  ) : needsAction ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>

                {/* Doc info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900 truncate">{doc.nomeExibicao}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>

                  {/* Rejection notice */}
                  {doc.justificativaRecusa && (
                    <p className="text-[11px] text-rose-700 font-medium mt-1 truncate">
                      ⚠️ {doc.justificativaRecusa}
                    </p>
                  )}

                  {/* Uploaded filename */}
                  {doc.nomeArquivoOriginal && !doc.justificativaRecusa && (
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      📎 {doc.nomeArquivoOriginal}
                    </p>
                  )}
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => setActiveUploadDoc(doc)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    doc.status === 'APROVADO'
                      ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      : needsAction
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                      : 'bg-[#065373] hover:bg-[#043c53] text-white shadow-sm'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {doc.status === 'APROVADO' ? 'Atualizar' : needsAction ? 'Enviar Agora' : 'Enviar'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 sm:hidden" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {activeUploadDoc && (
        <UploadModal
          document={activeUploadDoc}
          onClose={() => setActiveUploadDoc(null)}
        />
      )}
    </div>
  );
}
