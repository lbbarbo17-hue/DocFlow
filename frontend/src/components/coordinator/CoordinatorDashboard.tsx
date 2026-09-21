'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  AlertOctagon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  ShieldAlert,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

interface CoordinatorDashboardProps {
  onNavigateToDossier: (studentId: string, docId?: string) => void;
}

export default function CoordinatorDashboard({ onNavigateToDossier }: CoordinatorDashboardProps) {
  const { studentsList, turmas } = useApp();

  // 1. Calculate quantities
  let countCriticos = 0;
  let countEmAnalise = 0;
  let countVencendo = 0;
  let countPendentesEnvio = 0;

  studentsList.forEach((s) => {
    s.documentos.forEach((doc) => {
      if (doc.status === 'EXPIRADO' || doc.status === 'RECUSADO') {
        countCriticos += 1;
      } else if (doc.status === 'EM_ANALISE') {
        countEmAnalise += 1;
      } else if (
        doc.recorrente &&
        doc.status === 'APROVADO' &&
        doc.diasParaVencer !== undefined &&
        doc.diasParaVencer <= 30 &&
        doc.diasParaVencer > 0
      ) {
        countVencendo += 1;
      } else if (doc.obrigatorio && doc.status === 'PENDENTE') {
        countPendentesEnvio += 1;
      }
    });
  });

  const totalStudents = studentsList.length;
  const countRegulares = studentsList.filter((s) => s.percentualConformidade === 100).length;
  const avgCompliance = Math.round(
    studentsList.reduce((acc, s) => acc + s.percentualConformidade, 0) / (totalStudents || 1)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Modern High-Impact Urgency Alert Card */}
      {countCriticos > 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-sm transition-all hover:shadow-md">
          {/* Subtle left colored accent strip */}
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-b from-rose-500 to-rose-700" />

          <div className="p-5 sm:p-6 pl-6 sm:pl-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-gradient-to-r from-rose-50/70 via-rose-50/30 to-transparent dark:from-rose-950/40 dark:via-rose-950/20 dark:to-transparent">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-md shadow-rose-600/20 shrink-0 mt-0.5 sm:mt-0">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                    Ação Imediata
                  </span>
                  <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                    Risco de Desconformidade Contratual
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {countCriticos} {countCriticos === 1 ? 'documento em risco crítico' : 'documentos em risco crítico'} (vencidos ou recusados)
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Existem pendências com validade expirada ou recusa formal aguardando regularização pelo aprendiz para evitar quebra de conformidade com a empresa.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => onNavigateToDossier(studentsList[0]?.id || '')}
              className="px-5 py-2.5 bg-slate-900 dark:bg-cyan-700 hover:bg-[#065373] dark:hover:bg-cyan-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 self-start lg:self-center"
            >
              <span>Acessar Dossiês com Risco</span>
              <ArrowRight className="w-4 h-4 text-cyan-300 dark:text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 p-5 shadow-sm flex items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/70 via-emerald-50/20 to-transparent dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Nenhum documento em risco crítico no momento!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Todos os aprendizes ativos estão com a documentação em dia ou dentro dos prazos legais de renovação.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main KPI Cards: Quantidades de Riscos, Pareceres, Vencimentos e Conformidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Risco Crítico / Expirados */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Documentos em Risco Crítico
            </span>
            <div className={`p-2.5 rounded-xl ${countCriticos > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{countCriticos}</span>
              <span className={`text-xs font-bold ${countCriticos > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                {countCriticos > 0 ? 'Exigem ação urgente' : 'Regular'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Documentos expirados ou recusados
            </p>
          </div>
        </div>

        {/* KPI 2: Aguardando Parecer da Coordenação */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Aguardando Parecer
            </span>
            <div className={`p-2.5 rounded-xl ${countEmAnalise > 0 ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{countEmAnalise}</span>
              <span className={`text-xs font-bold ${countEmAnalise > 0 ? 'text-sky-700 dark:text-sky-300' : 'text-slate-400'}`}>
                {countEmAnalise > 0 ? 'Pendentes de validação' : 'Fila zerada'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enviados pelos aprendizes para análise
            </p>
          </div>
        </div>

        {/* KPI 3: Vencendo em breve */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Vencendo em ≤ 30 Dias
            </span>
            <div className={`p-2.5 rounded-xl ${countVencendo > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{countVencendo}</span>
              <span className={`text-xs font-bold ${countVencendo > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-slate-400'}`}>
                {countVencendo > 0 ? 'Alerta preventivo' : 'Nenhum próximo'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Matrículas e laudos periódicos
            </p>
          </div>
        </div>

        {/* KPI 4: Taxa Geral de Conformidade */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Taxa Geral de Conformidade
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{avgCompliance}%</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {countRegulares} de {totalStudents} 100% regulares
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Média consolidada da base ativa
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Pendências Iniciais de Envio</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{countPendentesEnvio} docs</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Documentos obrigatórios não enviados</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Aguardando Aluno
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Total de Aprendizes Ativos</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{totalStudents} alunos</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Monitorados no sistema</p>
          </div>
          <div className="p-2 rounded-xl bg-[#065373]/10 dark:bg-cyan-500/10 text-[#065373] dark:text-cyan-300">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Turmas Acompanhadas</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{turmas.length} turmas</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Em andamento</p>
          </div>
          <button
            onClick={() => onNavigateToDossier(studentsList[0]?.id || '')}
            className="text-xs font-bold text-[#065373] dark:text-cyan-300 hover:underline flex items-center gap-1"
          >
            <span>Ver Dossiês</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Panorama de Riscos por Turma */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#065373] dark:text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Panorama de Riscos e Conformidade por Turma
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {turmas.map((t) => {
            const turmaStudents = studentsList.filter((s) => s.turmaId === t.id);
            const critCount = turmaStudents.filter((s) => s.nivelRisco === 'CRITICO').length;
            const avgComp = turmaStudents.length
              ? Math.round(
                  turmaStudents.reduce((acc, s) => acc + s.percentualConformidade, 0) /
                    turmaStudents.length
                )
              : t.conformidadeMedia;

            return (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{t.codigo}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                      {t.nomeCurso}
                    </p>
                  </div>
                  {critCount > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60">
                      {critCount} em risco
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60">
                      Regular
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500 dark:text-slate-400">Conformidade Média</span>
                    <span className="font-bold text-slate-900 dark:text-white">{avgComp}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        avgComp >= 90
                          ? 'bg-emerald-500'
                          : avgComp >= 70
                          ? 'bg-[#065373] dark:bg-cyan-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${avgComp}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{t.totalAlunos} aprendizes</span>
                  <span className="text-slate-400 dark:text-slate-500 font-mono">{t.periodo.split(' - ')[1]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
