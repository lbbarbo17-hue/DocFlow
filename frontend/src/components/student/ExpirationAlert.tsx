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
    <div className="h-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-200 gap-4">
      {/* Header do Card */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              urgentDocs.length > 0
                ? 'bg-[#eac652]/20 dark:bg-[#eac652]/20 text-[#8a6e14] dark:text-[#eac652]'
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
          <span className="text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full bg-[#eac652] text-slate-950 shadow-xs shrink-0">
            {urgentDocs.length} {urgentDocs.length === 1 ? 'aviso pendente' : 'avisos pendentes'}
          </span>
        ) : (
          <span className="text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shrink-0">
            Dossiê em dia
          </span>
        )}
      </div>

      {/* Corpo do Card com scroll interno padronizado */}
      <div className="flex-1 max-h-[310px] sm:max-h-[330px] overflow-y-auto pr-1">
        {urgentDocs.length === 0 ? (
          /* Estado Positivo — quando não há avisos */
          <div className="flex flex-col items-center justify-center gap-2.5 py-6 px-4 text-center h-full rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Tudo em ordem! 🎉
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed max-w-xs">
                Nenhum documento exige renovação ou correção imediata. O seu contrato está totalmente regular.
              </p>
            </div>
          </div>
        ) : (
          /* Lista com cada aviso individualmente encapsulado e proporcional */
          <div className="space-y-3">
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
                  className={`p-3.5 rounded-2xl border-2 transition-all shadow-xs space-y-2.5 ${
                    isExpired || isRejected
                      ? 'border-rose-200 dark:border-rose-800/60 bg-gradient-to-br from-rose-50/90 to-rose-100/30 dark:from-rose-950/30 dark:to-slate-900/60'
                      : 'border-[#eac652]/60 dark:border-[#eac652]/40 bg-gradient-to-br from-[#eac652]/15 to-[#eac652]/5 dark:from-[#eac652]/15 dark:to-slate-900/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Ícone com cantos arredondados */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                        isExpired || isRejected
                          ? 'bg-rose-600 text-white'
                          : 'bg-[#eac652] text-slate-950'
                      }`}
                    >
                      {isExpired || isRejected ? (
                        <ShieldAlert className="w-4 h-4 animate-pulse" />
                      ) : (
                        <Clock className="w-4 h-4 animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Título + Badges com bordas arredondadas */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <span
                          className={`text-xs font-black tracking-tight ${
                            isExpired || isRejected
                              ? 'text-rose-950 dark:text-rose-200'
                              : 'text-[#735a0f] dark:text-[#fef08a]'
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
                          className={`text-[9px] font-black px-2 py-0.2 rounded-full uppercase tracking-wider ${
                            isExpired || isRejected
                              ? 'bg-rose-600 text-white'
                              : 'bg-[#eac652] text-slate-950'
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
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-[#065373] dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 flex items-center gap-0.5">
                            <RefreshCw className="w-2.5 h-2.5" />
                            Semestral
                          </span>
                        )}
                      </div>

                      {/* Texto Explicativo */}
                      <p
                        className={`text-[11px] font-medium leading-snug line-clamp-2 ${
                          isExpired || isRejected
                            ? 'text-rose-800 dark:text-rose-300'
                            : 'text-[#735a0f] dark:text-[#fef08a]'
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
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>Prazo: {formatDateBr(doc.validadeAte).split(' ')[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botão de Ação com cantos bem arredondados */}
                  <button
                    type="button"
                    onClick={() => onUploadClick(doc)}
                    className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-98 cursor-pointer ${
                      isExpired || isRejected
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200/50 dark:shadow-none'
                        : 'bg-[#eac652] hover:bg-[#dfba45] text-slate-950 shadow-[#eac652]/30 dark:shadow-none'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                    <span>{actionButtonLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 ml-auto" />
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
