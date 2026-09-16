'use client';

import React from 'react';
import {
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function StudentHealthCard() {
  const { student } = useApp();

  const totalDocs = student.documentos.length;
  const approvedDocs = student.documentos.filter((d) => d.status === 'APROVADO').length;
  const inReviewDocs = student.documentos.filter((d) => d.status === 'EM_ANALISE').length;
  const rejectedDocs = student.documentos.filter((d) => d.status === 'RECUSADO').length;
  const pendingDocs = student.documentos.filter((d) => d.status === 'PENDENTE').length;
  const expiringDocs = student.documentos.filter(
    (d) =>
      d.status === 'EXPIRADO' ||
      d.status === 'VENCENDO' ||
      (d.diasParaVencer !== undefined && d.diasParaVencer <= 30)
  ).length;

  const percent = student.percentualConformidade;
  const isComplete = percent === 100;
  const isWarning = percent >= 60 && percent < 100;

  return (
    <div className="h-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-200 gap-5">
      {/* Top Section: Title & Conformity Score */}
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isComplete
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : isWarning
                  ? 'bg-[#eac652]/20 dark:bg-[#eac652]/20 text-[#8a6e14] dark:text-[#eac652]'
                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
              }`}
            >
              {isComplete ? (
                <ShieldCheck className="w-5 h-5" />
              ) : isWarning ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Saúde do Dossiê de Documentos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Conformidade contínua do contrato
              </p>
            </div>
          </div>

          {/* Percentage Big Badge */}
          <div className="text-right shrink-0">
            <div className="flex items-baseline gap-1 justify-end">
              <span
                className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  isComplete
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isWarning
                    ? 'text-[#8a6e14] dark:text-[#eac652]'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {percent}%
              </span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">em dia</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 p-0.5 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                isComplete
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-sm'
                  : isWarning
                  ? 'bg-gradient-to-r from-[#eac652] via-[#dfba45] to-[#c79e27] shadow-sm'
                  : 'bg-gradient-to-r from-rose-500 to-red-600 shadow-sm'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Explanatory text */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="truncate pr-2">
              {isComplete
                ? '🎉 100% da documentação regularizada.'
                : isWarning
                ? `👍 ${percent}% regular (${approvedDocs} de ${totalDocs} itens).`
                : `⚠️ Atenção: Apenas ${percent}% regular (${approvedDocs} de ${totalDocs} itens).`}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono shrink-0">
              {approvedDocs}/{totalDocs} itens
            </span>
          </div>
        </div>

        {/* Status Summary Banner */}
        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isComplete ? 'bg-emerald-500' : isWarning ? 'bg-[#eac652]' : 'bg-rose-500'}`} />
            Status do Contrato:
          </span>
          <span className={`font-extrabold uppercase text-[10px] tracking-wider px-2.5 py-0.5 rounded-full ${
            isComplete
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : isWarning
              ? 'bg-[#eac652]/20 text-[#8a6e14] dark:text-[#eac652]'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
          }`}>
            {isComplete ? 'Regular' : isWarning ? 'Atenção' : 'Ação Necessária'}
          </span>
        </div>
      </div>

      {/* Bottom Section: 4 Metric Cards in 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Approved Card */}
        <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider leading-none truncate">
              Aprovados
            </p>
            <p className="text-lg font-black text-emerald-900 dark:text-emerald-100 mt-0.5">
              {approvedDocs}
            </p>
          </div>
        </div>

        {/* In Review Card */}
        <div className="p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/50 flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider leading-none truncate">
              Em Análise
            </p>
            <p className="text-lg font-black text-orange-900 dark:text-orange-100 mt-0.5">
              {inReviewDocs}
            </p>
          </div>
        </div>

        {/* Expiring / Renewal Card */}
        <div className="p-3 rounded-2xl bg-[#eac652]/10 dark:bg-[#eac652]/15 border border-[#eac652]/40 dark:border-[#eac652]/30 flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="w-8 h-8 rounded-xl bg-[#eac652] text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#8a6e14] dark:text-[#eac652] uppercase tracking-wider leading-none truncate">
              Vencendo
            </p>
            <p className="text-lg font-black text-[#5c490a] dark:text-[#fef08a] mt-0.5">
              {expiringDocs}
            </p>
          </div>
        </div>

        {/* Pending / Correction Card */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="w-8 h-8 rounded-xl bg-slate-400 dark:bg-slate-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider leading-none truncate">
              A Enviar
            </p>
            <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {pendingDocs + rejectedDocs}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
