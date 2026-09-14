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
    <div className="h-full bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-200">
      {/* Top Section: Title & Conformity Score */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isComplete
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : isWarning
                  ? 'bg-sky-100 dark:bg-cyan-950/60 text-[#065373] dark:text-cyan-300'
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
                    ? 'text-[#065373] dark:text-cyan-400'
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
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 p-0.5 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                isComplete
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-sm'
                  : isWarning
                  ? 'bg-gradient-to-r from-[#065373] via-[#226a8b] to-[#3f81a3] dark:from-cyan-500 dark:to-teal-400 shadow-sm'
                  : 'bg-gradient-to-r from-rose-500 to-red-600 shadow-sm'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Explanatory text */}
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>
              {isComplete
                ? '🎉 Parabéns! 100% da sua documentação está regularizada.'
                : isWarning
                ? `👍 ${percent}% da documentação regularizada (${approvedDocs} de ${totalDocs} itens).`
                : `⚠️ Atenção: Apenas ${percent}% da documentação está regular. Envie os itens pendentes.`}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
              {approvedDocs}/{totalDocs} itens
            </span>
          </p>
        </div>
      </div>

      {/* Bottom Section: 4 Metric Cards in 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6">
        {/* Approved Card */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider leading-none">
              Aprovados
            </p>
            <p className="text-xl font-black text-emerald-900 dark:text-emerald-100 mt-1">
              {approvedDocs}
            </p>
          </div>
        </div>

        {/* In Review Card */}
        <div className="p-3.5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/50 flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider leading-none">
              Em Análise
            </p>
            <p className="text-xl font-black text-orange-900 dark:text-orange-100 mt-1">
              {inReviewDocs}
            </p>
          </div>
        </div>

        {/* Expiring / Renewal Card */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider leading-none">
              Vencendo
            </p>
            <p className="text-xl font-black text-amber-950 dark:text-amber-100 mt-1">
              {expiringDocs}
            </p>
          </div>
        </div>

        {/* Pending / Correction Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <div className="w-9 h-9 rounded-xl bg-slate-400 dark:bg-slate-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider leading-none">
              A Enviar
            </p>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">
              {pendingDocs + rejectedDocs}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
