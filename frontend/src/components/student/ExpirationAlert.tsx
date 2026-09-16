'use client';

import React from 'react';
import {
  Clock,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Calendar,
  BellRing,
  CheckCircle2,
} from 'lucide-react';
import { DocumentItem } from '@/lib/types';
import { formatDateBr } from '@/lib/utils';

interface ExpirationAlertProps {
  documents: DocumentItem[];
  onUploadClick: (doc: DocumentItem) => void;
}

export default function ExpirationAlert({ documents, onUploadClick }: ExpirationAlertProps) {
  const urgentDocs = documents.filter(
    (d) =>
      d.status === 'EXPIRADO' ||
      d.status === 'RECUSADO' ||
      (d.diasParaVencer !== undefined && d.diasParaVencer <= 30) ||
      (d.recorrente && d.status !== 'APROVADO')
  );

  return (
    <div className="h-full bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-200">
      {/* Header do Card */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              urgentDocs.length > 0
                ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              Central de Avisos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Renovações e atenções importantes
            </p>
          </div>
        </div>

        {urgentDocs.length > 0 ? (
          <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-xs shrink-0">
            {urgentDocs.length} {urgentDocs.length === 1 ? 'aviso pendente' : 'avisos pendentes'}
          </span>
        ) : (
          <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shrink-0">
            Dossiê em dia
          </span>
        )}
      </div>

      {/* Corpo do Card com scroll interno caso hajam múltiplos itens */}
      <div className="flex-1 overflow-y-auto mt-4 pr-0.5">
        {urgentDocs.length === 0 ? (
          /* Estado Positivo — quando não há avisos */
          <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 text-center h-full rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Tudo em ordem! 🎉
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-xs">
                Nenhum documento exige renovação ou correção imediata. O seu contrato está totalmente regular.
              </p>
            </div>
          </div>
        ) : (
          /* Lista com cada aviso individualmente encapsulado e arredondado */
          <div className="space-y-3.5">
            {urgentDocs.map((doc) => {
              const isExpired =
                doc.status === 'EXPIRADO' ||
                (doc.diasParaVencer !== undefined && doc.diasParaVencer < 0);
              const isRejected = doc.status === 'RECUSADO';
              const isRecurring = doc.recorrente;

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
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all shadow-xs ${
                    isExpired || isRejected
                      ? 'border-rose-200 dark:border-rose-800/60 bg-gradient-to-br from-rose-50/90 to-rose-100/30 dark:from-rose-950/30 dark:to-slate-900/60'
                      : 'border-amber-200 dark:border-amber-800/60 bg-gradient-to-br from-amber-50/90 to-amber-100/30 dark:from-amber-950/30 dark:to-slate-900/60'
                  }`}
                >
                  <div className="flex items-start gap-3.5 mb-3.5">
                    {/* Ícone com cantos arredondados */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        isExpired || isRejected
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {isExpired || isRejected ? (
                        <ShieldAlert className="w-5 h-5 animate-pulse" />
                      ) : (
                        <Clock className="w-5 h-5 animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Título + Badges com bordas arredondadas */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span
                          className={`text-xs font-black tracking-tight ${
                            isExpired || isRejected
                              ? 'text-rose-950 dark:text-rose-200'
                              : 'text-amber-950 dark:text-amber-200'
                          }`}
                        >
                          {isRejected
                            ? 'Correção Solicitada'
                            : isExpired
                            ? 'Documento Expirado'
                            : isRecurring
                            ? 'Renovação Semestral Obrigatória'
                            : 'Prazo Próximo do Fim'}
                        </span>

                        {/* Badge de prazo */}
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
                            ? `VENCE EM ${doc.diasParaVencer} DIAS`
                            : 'RENOVAÇÃO'}
                        </span>

                        {isRecurring && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-[#065373] dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            Semestral
                          </span>
                        )}
                      </div>

                      {/* Texto Explicativo */}
                      <p
                        className={`text-xs font-medium leading-relaxed ${
                          isExpired || isRejected
                            ? 'text-rose-800 dark:text-rose-300'
                            : 'text-amber-900 dark:text-amber-300'
                        }`}
                      >
                        {isRejected ? (
                          <>
                            <strong>{doc.nomeExibicao}</strong>:{' '}
                            {doc.justificativaRecusa || 'Requer novo envio corrigido pela coordenação.'}
                          </>
                        ) : isRecurring ? (
                          <>
                            O seu <strong>{doc.nomeExibicao}</strong> precisa ser renovado
                            periodicamente para manter a conformidade do seu contrato ativa.
                          </>
                        ) : (
                          <>
                            Envie uma nova via de <strong>{doc.nomeExibicao}</strong> para evitar
                            pendências no contrato.
                          </>
                        )}
                      </p>

                      {/* Prazo Limite */}
                      {doc.validadeAte && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>Prazo Limite: {formatDateBr(doc.validadeAte).split(' ')[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botão de Ação com cantos bem arredondados */}
                  <button
                    type="button"
                    onClick={() => onUploadClick(doc)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-sm active:scale-98 ${
                      isExpired || isRejected
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200/50 dark:shadow-none'
                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200/50 dark:shadow-none'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4 shrink-0" />
                    <span>{actionButtonLabel}</span>
                    <ArrowRight className="w-4 h-4 shrink-0 ml-auto" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
