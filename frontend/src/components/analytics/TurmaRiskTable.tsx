'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck, GraduationCap, Building2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function TurmaRiskTable() {
  const { turmas } = useApp();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-[1.5px] border-slate-400 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="p-5 border-b border-slate-200/80 dark:border-b dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-slate-950 dark:text-white">
            Monitoramento por Turma
          </h3>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-2xs">
          Total: {turmas.length} Turmas Monitoradas
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200/80 dark:border-b dark:border-slate-800">
              <th className="py-3 px-5">Código / Turma</th>
              <th className="py-3 px-5">Curso Técnico</th>
              <th className="py-3 px-5">Período</th>
              <th className="py-3 px-5 text-center">Aprendizes</th>
              <th className="py-3 px-5">Índice de Conformidade</th>
              <th className="py-3 px-5 text-center">Status de Risco</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
            {turmas.map((turma) => {
              const isGood = turma.conformidadeMedia >= 85;
              const hasCriticalRisk = turma.alunosEmRisco > 0;

              return (
                <tr key={turma.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#065373]/10 dark:bg-cyan-950/60 text-[#065373] dark:text-cyan-400 flex items-center justify-center font-bold font-mono text-xs">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <span className="font-bold font-mono text-slate-950 dark:text-white">{turma.codigo}</span>
                    </div>
                  </td>

                  <td className="py-4 px-5 font-bold text-slate-950 dark:text-white">
                    <div>{turma.nomeCurso}</div>
                    {turma.instituicao && (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        <Building2 className="w-3 h-3 text-[#065373] dark:text-cyan-400 shrink-0" />
                        <span className="truncate max-w-[240px]">{turma.instituicao}</span>
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-5 text-slate-700 dark:text-slate-300 font-semibold font-mono">
                    {turma.periodo}
                  </td>

                  <td className="py-4 px-5 text-center font-black text-slate-950 dark:text-white">
                    {turma.totalAlunos}
                  </td>

                  <td className="py-4 px-5">
                    <div className="space-y-1.5 min-w-[160px]">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-700 dark:text-slate-300 font-semibold">{turma.alunosRegulares} Regulares</span>
                        <span
                          className={`font-black ${
                            isGood ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {turma.conformidadeMedia}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isGood
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${turma.conformidadeMedia}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-5 text-center">
                    {hasCriticalRisk ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>{turma.alunosEmRisco} em risco</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>100% Seguro</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
