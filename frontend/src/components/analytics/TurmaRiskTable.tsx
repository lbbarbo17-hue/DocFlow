'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck, GraduationCap } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function TurmaRiskTable() {
  const { turmas } = useApp();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-slate-900">
            Monitoramento de Conformidade por Turma
          </h3>
          <p className="text-xs text-slate-500">
            Métricas de prevenção de anulação de contratos e regularidade documental acadêmica
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
          Total: {turmas.length} Turmas Monitoradas
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <th className="py-3 px-5">Código / Turma</th>
              <th className="py-3 px-5">Curso Técnico</th>
              <th className="py-3 px-5">Período</th>
              <th className="py-3 px-5 text-center">Aprendizes</th>
              <th className="py-3 px-5">Índice de Conformidade</th>
              <th className="py-3 px-5 text-center">Status de Risco</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {turmas.map((turma) => {
              const isGood = turma.conformidadeMedia >= 85;
              const hasCriticalRisk = turma.alunosEmRisco > 0;

              return (
                <tr key={turma.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#065373]/10 text-[#065373] flex items-center justify-center font-bold font-mono text-xs">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <span className="font-bold font-mono text-slate-900">{turma.codigo}</span>
                    </div>
                  </td>

                  <td className="py-4 px-5 font-semibold text-slate-800">
                    {turma.nomeCurso}
                  </td>

                  <td className="py-4 px-5 text-slate-500 font-mono">
                    {turma.periodo}
                  </td>

                  <td className="py-4 px-5 text-center font-bold text-slate-800">
                    {turma.totalAlunos}
                  </td>

                  <td className="py-4 px-5">
                    <div className="space-y-1.5 min-w-[160px]">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-500">{turma.alunosRegulares} Regulares</span>
                        <span
                          className={`font-bold ${
                            isGood ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {turma.conformidadeMedia}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
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
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{turma.alunosEmRisco} em risco</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5" />
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
