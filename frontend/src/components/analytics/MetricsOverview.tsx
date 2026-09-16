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
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Dossiês 100% Regulares',
      value: `${regularStudents}/${totalStudents}`,
      sub: 'Todos os 5 documentos aprovados',
      icon: ShieldCheck,
      color: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      iconColor: 'text-cyan-600',
    },
    {
      label: 'Riscos Contratuais Críticos',
      value: criticalStudents,
      sub: 'Exigem regularização imediata',
      icon: AlertOctagon,
      color: criticalStudents > 0 ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-slate-50 text-slate-700 border-slate-200',
      iconColor: criticalStudents > 0 ? 'text-rose-600' : 'text-slate-500',
    },
    {
      label: 'Total de Aprendizes Ativos',
      value: totalStudents,
      sub: `Distribuídos em ${turmas.length} turmas ativas`,
      icon: Users,
      color: 'bg-[#065373]/10 text-[#065373] border-[#065373]/20',
      iconColor: 'text-[#065373]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl border shadow-sm ${kpi.color} bg-white flex flex-col justify-between transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {kpi.label}
              </span>
              <div className="p-2 rounded-xl bg-white shadow-xs">
                <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {kpi.value}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
