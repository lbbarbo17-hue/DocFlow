'use client';

import React from 'react';
import {
  Check,
  Clock,
  AlertTriangle,
  XCircle,
  Upload,
  RefreshCw,
  Eye,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DocumentItem } from '@/lib/types';

interface StudentHealthCardProps {
  onUploadClick?: (doc: DocumentItem) => void;
}

export default function StudentHealthCard({ onUploadClick }: StudentHealthCardProps) {
  const { student } = useApp();

  const documents = student?.documentos || [];
  const totalDocs = documents.length;
  const approvedDocs = documents.filter((d) => d.status === 'APROVADO').length;
  const percent = student?.percentualConformidade ?? (totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0);

  // Ordenação por prioridade de urgência
  const getPriorityScore = (doc: DocumentItem): number => {
    if (doc.status === 'RECUSADO') return 1;
    if (doc.status === 'EXPIRADO') return 2;
    if (doc.status === 'VENCENDO' || (doc.diasParaVencer !== undefined && doc.diasParaVencer <= 30)) return 3;
    if (doc.status === 'PENDENTE') return 4;
    if (doc.status === 'EM_ANALISE') return 5;
    return 6; // APROVADO
  };

  const sortedDocs = [...documents].sort((a, b) => getPriorityScore(a) - getPriorityScore(b));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-colors duration-200 gap-5">
      {/* 1. Topo: Percentual com Destaque Forte + Barra de Progresso com Trilho Escuro */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
              Status da Documentação
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {approvedDocs} de {totalDocs} documentos regularizados
            </p>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {percent}%
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              em dia
            </span>
          </div>
        </div>

        {/* Barra de progresso com cantos totalmente arredondados (rounded-full) e trilho escuro bem definido */}
        <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-3 p-0.5 overflow-hidden border border-slate-300/60 dark:border-slate-800/80 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 transition-all duration-700 ease-out shadow-xs"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* 2. Lista Vertical de Documentos */}
      <div className="space-y-2 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Prioridade de Ação
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            {documents.length} itens
          </span>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {sortedDocs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Nenhum documento cadastrado.</p>
          ) : (
            sortedDocs.map((doc) => {
              const isApproved = doc.status === 'APROVADO';
              const isInReview = doc.status === 'EM_ANALISE';
              const isPending = doc.status === 'PENDENTE';
              const isRejected = doc.status === 'RECUSADO';
              const isExpiring =
                doc.status === 'EXPIRADO' ||
                doc.status === 'VENCENDO' ||
                (doc.diasParaVencer !== undefined && doc.diasParaVencer <= 30);

              // Borda na esquerda (border-l-4) colorida em harmonia com a badge de status de cada documento
              const urgencyBorder = isRejected
                ? 'border-l-4 border-l-rose-500'
                : isExpiring
                ? 'border-l-4 border-l-amber-500'
                : isPending
                ? 'border-l-4 border-l-rose-300 dark:border-l-rose-500/70'
                : isInReview
                ? 'border-l-4 border-l-amber-400 dark:border-l-amber-500'
                : 'border-l-4 border-l-emerald-500';

              return (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800/80 rounded-lg overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-2xs ${urgencyBorder}`}
                >
                  {/* Container flex à esquerda (flex flex-col gap-1) para texto e badge */}
                  <div className="flex flex-col gap-1 min-w-0 flex-1 pr-3">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {doc.nomeExibicao}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Aprovado
                        </span>
                      )}

                      {isInReview && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/50">
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          Em Análise
                        </span>
                      )}

                      {isRejected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300 dark:border-rose-800">
                          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          Recusado
                        </span>
                      )}

                      {isExpiring && !isRejected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-200 border border-orange-200 dark:border-orange-800/50">
                          <AlertTriangle className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                          {doc.diasParaVencer !== undefined && doc.diasParaVencer >= 0
                            ? `Vence em ${doc.diasParaVencer}d`
                            : 'Vencido'}
                        </span>
                      )}

                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/70 dark:border-rose-900/40">
                          Pendente
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botão alinhado perfeitamente à direita */}
                  <div className="shrink-0 flex items-center justify-end">
                    {isRejected && (
                      <button
                        type="button"
                        onClick={() => onUploadClick?.(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-xs shadow-rose-600/25 cursor-pointer"
                        title="Corrigir e reenviar documento"
                      >
                        <span>Corrigir</span>
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isExpiring && !isRejected && (
                      <button
                        type="button"
                        onClick={() => onUploadClick?.(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 active:scale-95 transition-all shadow-xs shadow-amber-600/25 cursor-pointer"
                        title="Renovar documento"
                      >
                        <span>Renovar</span>
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isPending && (
                      <button
                        type="button"
                        onClick={() => onUploadClick?.(doc)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 border border-slate-300/80 dark:border-slate-700/50 active:scale-95 transition-all shadow-2xs cursor-pointer"
                        title="Enviar documento"
                      >
                        <span>Enviar</span>
                        <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                      </button>
                    )}

                    {(isInReview || isApproved) && (
                      <button
                        type="button"
                        onClick={() => onUploadClick?.(doc)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 active:scale-95 shadow-2xs transition-all cursor-pointer"
                        title="Visualizar documento"
                      >
                        <span>Ver</span>
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
