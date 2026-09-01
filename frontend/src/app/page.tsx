'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  GraduationCap,
  UserCheck,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Lock,
  Cpu,
} from 'lucide-react';

export default function HomePage() {
  const { student, studentsList, turmas, auditLogs } = useApp();

  const criticalCount = studentsList.filter((s) => s.nivelRisco === 'CRITICO').length;

  const modules = [
    {
      title: 'Portal do Estudante',
      desc: 'Checklist dos 5 documentos obrigatórios, alertas semestrais e upload com Magic Bytes.',
      href: '/estudante',
      icon: GraduationCap,
      badge: `${student.percentualConformidade}% Regular`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      action: 'Acessar Checklist',
    },
    {
      title: 'Dossiês & Validação',
      desc: 'Visualizador Master-Detail, aprovação/recusa com justificativa e tarjamento LGPD.',
      href: '/coordenador',
      icon: UserCheck,
      badge: `${studentsList.length} Aprendizes`,
      badgeColor: 'bg-sky-100 text-sky-800',
      action: 'Avaliar Dossiês',
    },
    {
      title: 'Dashboard de Turmas',
      desc: 'Indicadores estratégicos, prevenção de quebra de TCE e monitoramento de riscos.',
      href: '/analytics',
      icon: BarChart3,
      badge: `${turmas.length} Turmas`,
      badgeColor: 'bg-purple-100 text-purple-800',
      action: 'Ver Gráficos',
    },
    {
      title: 'Auditoria Forense LGPD',
      desc: 'Trilha imutável append-only com integridade por hash SHA-256 e UUID.',
      href: '/auditoria',
      icon: ShieldCheck,
      badge: `${auditLogs.length} Registros`,
      badgeColor: 'bg-cyan-100 text-cyan-800',
      action: 'Consultar Logs',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#065373] via-[#226a8b] to-[#3f81a3] text-white p-8 md:p-10 shadow-xl border border-[#226a8b]">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-cyan-200 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Arquitetura DDD Lite • Padrão Corporativo B2B SaaS</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Bem-vindo ao DocFlow Enterprise
          </h1>

          <p className="text-sm text-cyan-100/90 leading-relaxed">
            Plataforma centralizada para gestão, guarda contínua de documentos organizacionais de aprendizes e estagiários, e proteção rigorosa conforme a LGPD (Art. 6º).
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-300" />
              <span>Storage Privado UUID</span>
            </span>
            <span className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-300" />
              <span>Magic Bytes Scanner Ativo</span>
            </span>
          </div>
        </div>

        {/* Decorative background blur shape */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Critical Alert Banner if students in risk */}
      {criticalCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-rose-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-xl text-rose-700">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-xs">
                Atenção: {criticalCount} aprendiz{criticalCount > 1 ? 'es' : ''} com risco de cancelamento de estágio!
              </p>
              <p className="text-[11px] text-rose-700">
                Documentos expirados ou recusados pendentes de renovação antes do prazo semestral.
              </p>
            </div>
          </div>
          <Link
            href="/coordenador"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors whitespace-nowrap"
          >
            Ver no Módulo Coordenador
          </Link>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod, idx) => {
          const Icon = mod.icon;

          return (
            <Link
              key={idx}
              href={mod.href}
              className="group p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#065373] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#065373]/10 text-[#065373] group-hover:bg-[#065373] group-hover:text-white transition-colors flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#065373] transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{mod.desc}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#065373] group-hover:text-[#226a8b]">
                <span>{mod.action}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
