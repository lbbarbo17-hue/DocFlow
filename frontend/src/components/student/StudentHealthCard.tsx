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
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Score & Health gauge */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
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
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Saúde do Dossiê de Documentos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Conformidade contínua do contrato
                </p>
              </div>
            </div>

            {/* Percentage Display */}
            <div className="text-right">
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

          {/* Visual Progress Bar with animated fill */}
          <div className="space-y-1.5">
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
                  ? `👍 ${percent}% da sua documentação está em dia (${approvedDocs} de ${totalDocs} documentos regulares).`
                  : `⚠️ Atenção: Apenas ${percent}% da documentação está regular. Envie os itens pendentes.`}
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
                {approvedDocs}/{totalDocs} itens
              </span>
            </p>
          </div>
        </div>

        {/* Right Side: Quick Status Indicators Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          {/* Approved Chip */}
          <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase leading-none">Aprovados</p>
              <p className="text-base font-black text-emerald-900 dark:text-emerald-100 mt-0.5">{approvedDocs}</p>
            </div>
          </div>

          {/* In Review Chip */}
          <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/50 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-orange-800 dark:text-orange-300 uppercase leading-none">Em Análise</p>
              <p className="text-base font-black text-orange-900 dark:text-orange-100 mt-0.5">{inReviewDocs}</p>
            </div>
          </div>

          {/* Expiring/Renewal Chip */}
          <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase leading-none">Vencendo</p>
              <p className="text-base font-black text-amber-950 dark:text-amber-100 mt-0.5">{expiringDocs}</p>
            </div>
          </div>

          {/* Pending / Correction Chip */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-400 dark:bg-slate-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase leading-none">A Enviar</p>
              <p className="text-base font-black text-slate-800 dark:text-slate-100 mt-0.5">{pendingDocs + rejectedDocs}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
