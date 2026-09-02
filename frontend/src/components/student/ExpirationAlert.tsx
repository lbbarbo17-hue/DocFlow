'use client';

import React from 'react';
import { Clock, ShieldAlert, ArrowRight, AlertTriangle } from 'lucide-react';
import { DocumentItem } from '@/lib/types';

interface ExpirationAlertProps {
  documents: DocumentItem[];
  onUploadClick: (doc: DocumentItem) => void;
}

export default function ExpirationAlert({ documents, onUploadClick }: ExpirationAlertProps) {
  const expiringDocs = documents.filter(
    (d) =>
      d.status === 'EXPIRADO' ||
      (d.diasParaVencer !== undefined && d.diasParaVencer <= 30)
  );

  if (expiringDocs.length === 0) return null;

  return (
    <div className="space-y-3">
      {expiringDocs.map((doc) => {
        const isExpired =
          doc.status === 'EXPIRADO' ||
          (doc.diasParaVencer !== undefined && doc.diasParaVencer < 0);

        return (
          <div
            key={doc.id}
            className={`rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden ${
              isExpired
                ? 'border-rose-400 bg-rose-50'
                : 'border-amber-400 bg-amber-50'
            }`}
          >
            {/* Colored accent strip */}
            <div
              className={`flex-1 p-4 flex items-start sm:items-center gap-4 ${
                isExpired ? 'bg-rose-50' : 'bg-amber-50'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  isExpired
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {isExpired ? (
                  <ShieldAlert className="w-5 h-5 animate-bounce" />
                ) : (
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-extrabold text-sm ${isExpired ? 'text-rose-900' : 'text-amber-900'}`}>
                    {isExpired ? 'Documento Vencido' : 'Renovação Necessária'}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isExpired
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {isExpired ? 'VENCIDO' : `${doc.diasParaVencer} dias`}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 font-medium ${isExpired ? 'text-rose-800' : 'text-amber-800'}`}>
                  <strong>{doc.nomeExibicao}</strong> precisa ser atualizado para não perder o estágio.
                </p>
              </div>
            </div>

            <div className={`sm:pr-4 pb-4 sm:pb-0 px-4 sm:px-0 shrink-0`}>
              <button
                onClick={() => onUploadClick(doc)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 ${
                  isExpired
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Renovar Agora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
