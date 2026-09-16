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
  LogOut,
  Shield,
  LayoutDashboard,
  FileCheck,
  UploadCloud,
  PanelLeftClose,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentRole, student, studentsList, turmas, closeSidebar } = useApp();

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
          label: 'Dashboard',
          href: '/estudante',
          icon: LayoutDashboard,
        },
        {
          label: 'Checklist de Documentos',
          href: '/estudante/checklist',
          icon: FileCheck,
          badge: pendingStudentDocs > 0 ? `${pendingStudentDocs} pendente${pendingStudentDocs > 1 ? 's' : ''}` : '100% OK',
          badgeColor: pendingStudentDocs > 0 ? 'bg-[#eac652] text-slate-950 font-black' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold',
        },
        {
          label: 'Adicionar Documentos',
          href: '/estudante/enviar',
          icon: UploadCloud,
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

  const userInitials =
    currentRole === 'ESTUDANTE'
      ? student.nome
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : currentRole === 'COORDENADOR'
      ? 'MA'
      : 'AD';

  return (
    <aside className="w-64 bg-[#065373] text-white flex flex-col shrink-0 border-r border-[#043c53] shadow-xl z-30 min-h-screen">
      {/* Brand Header with official Logo */}
      <div className="p-4 flex items-center justify-between gap-2 border-b border-[#226a8b]/60">
        <div className="flex items-center gap-3 min-w-0">
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

        {/* Hide / Collapse Sidebar Button */}
        <button
          type="button"
          onClick={closeSidebar}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-[#226a8b]/60 transition-colors shrink-0 cursor-pointer"
          title="Ocultar menu lateral"
          aria-label="Ocultar menu lateral"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
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
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  closeSidebar();
                }
              }}
              className={cn(
                'group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-[#226a8b] to-[#3f81a3] text-white shadow-md border-l-4 border-[#77afd3]'
                  : 'text-[#eef6fa]/80 hover:bg-[#226a8b]/40 hover:text-white'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'text-[#77afd3]' : 'text-[#77afd3]/80'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full tracking-wide shrink-0 whitespace-nowrap shadow-xs',
                    item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Profile & Logout Button */}
      <div className="p-3.5 border-t border-[#226a8b]/60 bg-[#043c53]/50 space-y-3">
        {/* User Card with Profile Picture Circle */}
        <div className="flex items-center gap-3">
          {/* Foto de Perfil (Avatar Circle) */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#226a8b] via-[#3f81a3] to-[#77afd3] text-white flex items-center justify-center font-black text-xs shadow-md border-2 border-white/20">
              {userInitials}
            </div>
            {/* Online status indicator */}
            <div
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#043c53] shadow-xs"
              title="Online"
            />
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <span
              className="block text-white font-bold text-xs truncate"
              title={currentRole === 'ESTUDANTE' ? student.nome : undefined}
            >
              {currentRole === 'ESTUDANTE'
                ? student.nome
                : currentRole === 'COORDENADOR'
                ? 'Coordenação / RH'
                : 'Super Administrador'}
            </span>
            <span className="text-[11px] text-[#77afd3] block truncate font-medium">
              {currentRole === 'ESTUDANTE'
                ? student.tipoVinculo === 'APRENDIZ'
                  ? 'Jovem Aprendiz'
                  : 'Estagiário'
                : currentRole === 'COORDENADOR'
                ? 'Coordenador / RH'
                : 'Super Admin'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-bold text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition-colors shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Encerrar Sessão</span>
        </Link>
      </div>
    </aside>
  );
}
