'use client';

import React from 'react';
import { Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import { DocumentItem } from '@/lib/types';

interface ExpirationAlertProps {
  documents: DocumentItem[];
  onUploadClick: (doc: DocumentItem) => void;
}

export default function ExpirationAlert({ documents, onUploadClick }: ExpirationAlertProps) {
  // Find documents expiring in <= 30 days or already expired
  const expiringDocs = documents.filter(
    (d) =>
      d.status === 'EXPIRADO' ||
      (d.diasParaVencer !== undefined && d.diasParaVencer <= 30)
  );

  if (expiringDocs.length === 0) return null;

  return (
    <div className="space-y-3">
      {expiringDocs.map((doc) => {
        const isExpired = doc.status === 'EXPIRADO' || (doc.diasParaVencer !== undefined && doc.diasParaVencer < 0);
        return (
          <div
            key={doc.id}
            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-all ${
              isExpired
                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2.5 rounded-lg shrink-0 ${
                  isExpired ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isExpired ? (
                  <ShieldAlert className="w-5 h-5 animate-bounce" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">
                    {isExpired ? '🚨 Atenção Crítica: Documento Expirado' : '⏳ Alerta de Renovação Semestral'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isExpired ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                    }`}
                  >
                    {isExpired ? 'Vencido' : `Vence em ${doc.diasParaVencer} dias`}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1">
                  O documento <strong className="text-slate-900">{doc.nomeExibicao}</strong> precisa ser regularizado com urgência para evitar a penalização ou anulação do vínculo contratual de estágio/aprendizagem.
                </p>
                {doc.validadeAte && (
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    Data Limite Registrada: {doc.validadeAte}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => onUploadClick(doc)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                isExpired
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              <span>Renovar Agora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
