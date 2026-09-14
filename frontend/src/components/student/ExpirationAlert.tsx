'use client';

import React from 'react';
import {
  Clock,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { DocumentItem } from '@/lib/types';
import { formatDateBr } from '@/lib/utils';

interface ExpirationAlertProps {
  documents: DocumentItem[];
  onUploadClick: (doc: DocumentItem) => void;
}

export default function ExpirationAlert({ documents, onUploadClick }: ExpirationAlertProps) {
  // Find documents that need urgent attention (recurring near expiry, expired, or rejected)
  const urgentDocs = documents.filter(
    (d) =>
      d.status === 'EXPIRADO' ||
      d.status === 'RECUSADO' ||
      (d.diasParaVencer !== undefined && d.diasParaVencer <= 30) ||
      (d.recorrente && d.status !== 'APROVADO')
  );

  if (urgentDocs.length === 0) return null;

  return (
    <div className="space-y-3">
      {urgentDocs.map((doc) => {
        const isExpired =
          doc.status === 'EXPIRADO' ||
          (doc.diasParaVencer !== undefined && doc.diasParaVencer < 0);
        const isRejected = doc.status === 'RECUSADO';
        const isRecurring = doc.recorrente;

        // Custom action button text as specifically requested
        const actionButtonLabel = isRecurring
          ? 'Atualizar Matrícula Agora'
          : isRejected
          ? 'Corrigir e Reenviar'
          : isExpired
          ? 'Regularizar Imediatamente'
          : 'Renovar Documento Agora';

        return (
          <div
            key={doc.id}
            className={`rounded-2xl sm:rounded-3xl border-2 shadow-sm transition-all overflow-hidden ${
              isExpired || isRejected
                ? 'border-rose-300 dark:border-rose-800/60 bg-gradient-to-r from-rose-50 via-rose-50/80 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900'
                : 'border-amber-300 dark:border-amber-800/60 bg-gradient-to-r from-amber-50 via-amber-50/80 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900'
            }`}
          >
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left Side: Alert Icon & Information */}
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    isExpired || isRejected
                      ? 'bg-rose-600 text-white shadow-rose-200 dark:shadow-none'
                      : 'bg-amber-500 text-white shadow-amber-200 dark:shadow-none'
                  }`}
                >
                  {isExpired || isRejected ? (
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  ) : (
                    <Clock className="w-6 h-6 animate-pulse" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-black text-xs sm:text-sm tracking-tight ${
                        isExpired || isRejected
                          ? 'text-rose-950 dark:text-rose-200'
                          : 'text-amber-950 dark:text-amber-200'
                      }`}
                    >
                      {isRejected
                        ? 'Correção Solicitada pela Coordenação'
                        : isExpired
                        ? 'Documento Expirado — Ação Imediata Necessária'
                        : isRecurring
                        ? 'Aviso de Renovação Semestral Obrigatória'
                        : 'Prazo de Validade Próximo do Fim'}
                    </span>

                    {/* Badge */}
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isExpired || isRejected
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {isRejected
                        ? 'REPROVADO'
                        : isExpired
                        ? 'VENCIDO'
                        : doc.diasParaVencer !== undefined
                        ? `Vence em ${doc.diasParaVencer} dias`
                        : 'RENOVAÇÃO'}
                    </span>

                    {isRecurring && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-[#065373] dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Semestral
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xs mt-1 font-medium leading-relaxed ${
                      isExpired || isRejected
                        ? 'text-rose-800 dark:text-rose-300'
                        : 'text-amber-900 dark:text-amber-300'
                    }`}
                  >
                    {isRejected ? (
                      <>
                        <strong>{doc.nomeExibicao}</strong>: {doc.justificativaRecusa || 'Requer novo envio corrigido.'}
                      </>
                    ) : isRecurring ? (
                      <>
                        O seu <strong>{doc.nomeExibicao}</strong> precisa ser renovado periodicamente para manter a conformidade do seu contrato de estágio/aprendizagem ativo.
                      </>
                    ) : (
                      <>
                        Envie uma nova via atualizada de <strong>{doc.nomeExibicao}</strong> para evitar pendências no seu contrato.
                      </>
                    )}
                  </p>

                  {doc.validadeAte && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span>Prazo Limite: {formatDateBr(doc.validadeAte).split(' ')[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Direct Action Button */}
              <div className="shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => onUploadClick(doc)}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-md active:scale-95 ${
                    isExpired || isRejected
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                  }`}
                >
                  <RefreshCw className="w-4 h-4 shrink-0" />
                  <span className="truncate">{actionButtonLabel}</span>
                  <ArrowRight className="w-4 h-4 shrink-0 hidden sm:inline" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
