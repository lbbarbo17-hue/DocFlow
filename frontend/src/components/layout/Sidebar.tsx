'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  UserCheck,
  BarChart3,
  ShieldCheck,
  GraduationCap,
  FolderLock,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentRole, student, studentsList } = useApp();

  // Calculate quick badges
  const pendingStudentDocs = student.documentos.filter(
    (d) => d.status === 'PENDENTE' || d.status === 'RECUSADO'
  ).length;

  const criticalStudents = studentsList.filter(
    (s) => s.nivelRisco === 'CRITICO'
  ).length;

  const navItems = [
    {
      label: 'Portal do Estudante',
      href: '/estudante',
      icon: GraduationCap,
      roles: ['ESTUDANTE', 'COORDENADOR', 'GESTOR_RH', 'DPO'],
      badge: currentRole === 'ESTUDANTE' && pendingStudentDocs > 0 ? `${pendingStudentDocs} pendente${pendingStudentDocs > 1 ? 's' : ''}` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      label: 'Dossiês & Validação',
      href: '/coordenador',
      icon: UserCheck,
      roles: ['COORDENADOR', 'GESTOR_RH', 'DPO'],
      badge: criticalStudents > 0 ? `${criticalStudents} risco` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      label: 'Dashboard Acadêmico',
      href: '/analytics',
      icon: BarChart3,
      roles: ['COORDENADOR', 'GESTOR_RH', 'DPO'],
    },
    {
      label: 'Auditoria LGPD',
      href: '/auditoria',
      icon: ShieldCheck,
      roles: ['DPO', 'COORDENADOR', 'GESTOR_RH'],
      badge: 'Art. 6º',
      badgeColor: 'bg-cyan-100 text-cyan-800',
    },
  ];

  return (
    <aside className="w-64 bg-[#065373] text-white flex flex-col shrink-0 border-r border-[#043c53] shadow-xl z-30 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-[#226a8b]/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3f81a3] to-[#77afd3] flex items-center justify-center shadow-md">
          <FolderLock className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight text-white">DocFlow</span>
            <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-[#3f81a3] text-white font-semibold">
              B2B SaaS
            </span>
          </div>
          <p className="text-xs text-[#77afd3]">Guarda Documental & LGPD</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-[#77afd3] uppercase tracking-wider">
          Módulos do Sistema
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-[#226a8b] to-[#3f81a3] text-white shadow-md border-l-4 border-[#77afd3]'
                  : 'text-[#eef6fa]/80 hover:bg-[#226a8b]/40 hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-transform group-hover:scale-110',
                    isActive ? 'text-[#77afd3]' : 'text-[#77afd3]/80'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide',
                    item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* DDD Lite Architecture Badge Card */}
        <div className="mt-8 px-2">
          <div className="p-3.5 rounded-xl bg-[#043c53]/80 border border-[#226a8b]/60 text-xs text-[#eef6fa]/90 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#77afd3]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Padrão DDD Lite</span>
            </div>
            <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
              Camadas desacopladas: Domínio Puro, Casos de Uso & Guard-rails de Magic Bytes.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono bg-[#065373]/90 px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Storage Privado UUID</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Profile Mini-card */}
      <div className="p-4 border-t border-[#226a8b]/60 bg-[#043c53]/50">
        <div className="flex items-center justify-between text-xs text-[#cbd5e1]">
          <div>
            <span className="block text-white font-medium truncate max-w-[140px]">
              {currentRole === 'ESTUDANTE'
                ? student.nome
                : currentRole === 'COORDENADOR'
                ? 'Coordenação de Curso'
                : currentRole === 'GESTOR_RH'
                ? 'Gestão de RH (Tenant)'
                : 'Oficial DPO / LGPD'}
            </span>
            <span className="text-[11px] text-[#77afd3] font-mono capitalize">
              {currentRole.toLowerCase().replace('_', ' ')}
            </span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" title="Online" />
        </div>
      </div>
    </aside>
  );
}
