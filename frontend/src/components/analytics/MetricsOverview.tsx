'use client';

import React from 'react';
import { ShieldCheck, AlertOctagon, Users, TrendingUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function MetricsOverview() {
  const { studentsList, turmas } = useApp();

  const totalStudents = studentsList.length;
  const regularStudents = studentsList.filter((s) => s.percentualConformidade === 100).length;
  const criticalStudents = studentsList.filter((s) => s.nivelRisco === 'CRITICO').length;

  const avgCompliance = Math.round(
    studentsList.reduce((acc, s) => acc + s.percentualConformidade, 0) / (totalStudents || 1)
  );

  const kpis = [
    {
      label: 'Taxa Geral de Conformidade',
      value: `${avgCompliance}%`,
      sub: 'Média ponderada dos dossiês ativos',
      icon: TrendingUp,
      iconColor: 'text-emerald-700 dark:text-emerald-300',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    },
    {
      label: 'Dossiês 100% Regulares',
      value: `${regularStudents}/${totalStudents}`,
      sub: 'Todos os 5 documentos aprovados',
      icon: ShieldCheck,
      iconColor: 'text-cyan-700 dark:text-cyan-300',
      iconBg: 'bg-cyan-100 dark:bg-cyan-950/60',
    },
    {
      label: 'Riscos Contratuais Críticos',
      value: criticalStudents,
      sub: 'Exigem regularização imediata',
      icon: AlertOctagon,
      iconColor: criticalStudents > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-slate-700 dark:text-slate-300',
      iconBg: criticalStudents > 0 ? 'bg-rose-100 dark:bg-rose-950/60' : 'bg-slate-100 dark:bg-slate-800',
    },
    {
      label: 'Total de Aprendizes Ativos',
      value: totalStudents,
      sub: `Distribuídos em ${turmas.length} turmas ativas`,
      icon: Users,
      iconColor: 'text-[#065373] dark:text-cyan-400',
      iconBg: 'bg-[#065373]/10 dark:bg-cyan-950/60',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl border-2 border-slate-400 dark:border dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 flex flex-col justify-between transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {kpi.label}
              </span>
              <div className={`p-2 rounded-xl ${kpi.iconBg} shadow-xs`}>
                <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                {kpi.value}
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{kpi.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
