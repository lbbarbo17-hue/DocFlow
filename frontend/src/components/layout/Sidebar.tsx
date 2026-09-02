'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  UserCheck,
  BarChart3,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  LogOut,
  Clock,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentRole, student, studentsList, turmas } = useApp();

  // Pending docs for student
  const pendingStudentDocs = student.documentos.filter(
    (d) => d.status === 'PENDENTE' || d.status === 'RECUSADO'
  ).length;

  // Critical risk count for coordinator
  const criticalStudents = studentsList.filter(
    (s) => s.nivelRisco === 'CRITICO'
  ).length;

  // Strict isolated navigation items per role
  const getNavItemsForRole = () => {
    if (currentRole === 'ESTUDANTE') {
      return [
        {
          label: 'Meu Checklist',
          href: '/estudante',
          icon: GraduationCap,
          badge: pendingStudentDocs > 0 ? `${pendingStudentDocs} pendente${pendingStudentDocs > 1 ? 's' : ''}` : '100% OK',
          badgeColor: pendingStudentDocs > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
        },
        {
          label: 'Prazos & Alertas',
          href: '/estudante',
          icon: Clock,
        },
      ];
    }

    if (currentRole === 'COORDENADOR') {
      return [
        {
          label: 'Dossiês de Aprendizes',
          href: '/coordenador',
          icon: UserCheck,
          badge: criticalStudents > 0 ? `${criticalStudents} em risco` : `${studentsList.length} alunos`,
          badgeColor: criticalStudents > 0 ? 'bg-rose-100 text-rose-800' : 'bg-cyan-100 text-cyan-800',
        },
        {
          label: 'Dashboard de Turmas',
          href: '/analytics',
          icon: BarChart3,
          badge: `${turmas.length} turmas`,
          badgeColor: 'bg-purple-100 text-purple-800',
        },
      ];
    }

    // SUPERADMIN
    return [
      {
        label: 'Controle Global',
        href: '/admin',
        icon: Shield,
        badge: 'Admin',
        badgeColor: 'bg-purple-100 text-purple-800',
      },
      {
        label: 'Trilha de Auditoria',
        href: '/auditoria',
        icon: ShieldCheck,
        badge: 'Forense',
        badgeColor: 'bg-emerald-100 text-emerald-800',
      },
    ];
  };

  const navItems = getNavItemsForRole();

  const interfaceTitle =
    currentRole === 'ESTUDANTE'
      ? 'Portal do Aprendiz'
      : currentRole === 'COORDENADOR'
      ? 'Portal da Coordenação & RH'
      : 'Painel do Super Admin';

  return (
    <aside className="w-64 bg-[#065373] text-white flex flex-col shrink-0 border-r border-[#043c53] shadow-xl z-30 min-h-screen">
      {/* Brand Header with official Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-[#226a8b]/60">
        <div className="w-10 h-10 relative rounded-xl overflow-hidden bg-white flex items-center justify-center p-1 shadow-md shrink-0">
          <Image
            src="/logo.png"
            alt="DocFlow Logo"
            width={36}
            height={36}
            className="object-contain"
            priority
          />
        </div>
        <div className="truncate">
          <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
            DocFlow
          </span>
          <p className="text-[11px] text-[#77afd3] truncate">{interfaceTitle}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-[#77afd3] uppercase tracking-wider truncate">
          Menu de Navegação
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
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

        {/* Security / System isolation badge */}
        <div className="mt-8 px-2">
          <div className="p-3.5 rounded-xl bg-[#043c53]/80 border border-[#226a8b]/60 text-xs text-[#eef6fa]/90 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#77afd3]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sessão Isolada</span>
            </div>
            <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
              Você está autenticado em uma interface segura com permissões exclusivas.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono bg-[#065373]/90 px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Acesso Autorizado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Profile & Logout Button */}
      <div className="p-4 border-t border-[#226a8b]/60 bg-[#043c53]/50 space-y-2">
        <div className="flex items-center justify-between text-xs text-[#cbd5e1]">
          <div>
            <span className="block text-white font-medium truncate max-w-[130px]">
              {currentRole === 'ESTUDANTE'
                ? student.nome
                : currentRole === 'COORDENADOR'
                ? 'Coordenação / RH'
                : 'Super Administrador'}
            </span>
            <span className="text-[11px] text-[#77afd3] font-mono capitalize">
              {currentRole === 'ESTUDANTE'
                ? 'Aprendiz / Estagiário'
                : currentRole === 'COORDENADOR'
                ? 'Coordenador de Curso / RH'
                : 'Super Admin'}
            </span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" title="Online" />
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[11px] font-semibold text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition-colors"
        >
          <LogOut className="w-3 h-3 text-rose-400" />
          <span>Encerrar Sessão</span>
        </Link>
      </div>
    </aside>
  );
}
