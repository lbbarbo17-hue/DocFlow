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
  UserPlus,
  Settings,
} from 'lucide-react';
import { cn, scrollToTop } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const {
    currentRole,
    student,
    studentsList,
    closeSidebar,
    activeInstitution,
    currentUserProfile,
  } = useApp();

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
          label: 'Documentos',
          href: '/estudante/checklist',
          icon: FileCheck,
          hasAlert: pendingStudentDocs > 0,
          alertColor: 'bg-amber-400',
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
          label: 'Dashboard',
          href: '/coordenador',
          icon: LayoutDashboard,
          hasAlert: criticalStudents > 0,
          alertColor: 'bg-rose-400',
        },
        {
          label: 'Aprendizes/Estagiários',
          href: '/coordenador/dossies',
          icon: UserCheck,
        },
        {
          label: 'Turmas',
          href: '/analytics',
          icon: BarChart3,
        },
        {
          label: 'Cadastro',
          href: '/coordenador/cadastro',
          icon: UserPlus,
        },
      ];
    }

    // SUPERADMIN
    return [
      {
        label: 'Controle Global',
        href: '/admin',
        icon: Shield,
      },
      {
        label: 'Cadastrar Coordenador',
        href: '/admin/coordenadores',
        icon: UserPlus,
      },
      {
        label: 'Trilha de Auditoria',
        href: '/auditoria',
        icon: ShieldCheck,
      },
    ];
  };

  const navItems = getNavItemsForRole();

  const userInitials = (currentUserProfile.nome || 'DocFlow')
    .replace(/^(Profª\.|Prof\.|Dr\.|Dra\.)\s*/, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

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
          const isActive =
            pathname === item.href ||
            (item.href === '/coordenador' && pathname === '/coordenador/dashboard');
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => {
                scrollToTop('instant');
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
              {item.hasAlert && (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span
                    className={cn(
                      'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                      item.alertColor || 'bg-rose-400'
                    )}
                  />
                  <span
                    className={cn(
                      'relative inline-flex rounded-full h-2 w-2',
                      item.alertColor || 'bg-rose-500'
                    )}
                  />
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Profile & Logout Button */}
      <div className="p-3.5 border-t border-[#226a8b]/60 bg-[#043c53]/50 space-y-3">
        {/* User Card with Profile Picture Circle - Navigates to /perfil page */}
        <Link
          href="/perfil"
          onClick={() => {
            scrollToTop('instant');
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              closeSidebar();
            }
          }}
          className={cn(
            'w-full flex items-center gap-3 p-2 -m-2 rounded-2xl transition-all text-left group cursor-pointer border',
            pathname === '/perfil'
              ? 'bg-[#226a8b] border-[#77afd3] shadow-md'
              : 'hover:bg-[#226a8b]/60 border-transparent hover:border-[#77afd3]/40'
          )}
          title="Clique para gerenciar seu perfil, alterar dados, senha e foto"
          aria-label="Abrir página de configurações de perfil"
        >
          {/* Foto de Perfil (Avatar Circle) */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#226a8b] via-[#3f81a3] to-[#77afd3] text-white flex items-center justify-center font-black text-xs shadow-md border-2 border-white/20 overflow-hidden group-hover:border-white transition-all">
              {currentUserProfile.avatarUrl ? (
                <img
                  src={currentUserProfile.avatarUrl}
                  alt={currentUserProfile.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                userInitials
              )}
            </div>
            {/* Online status indicator */}
            <div
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#043c53] shadow-xs"
              title="Online"
            />
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span
                className="block text-white font-bold text-xs truncate group-hover:text-cyan-200 transition-colors"
                title={currentUserProfile.nome}
              >
                {currentUserProfile.nome}
              </span>
              <Settings className="w-3.5 h-3.5 text-[#77afd3]/60 group-hover:text-cyan-300 transition-transform group-hover:rotate-45 shrink-0" />
            </div>
            <span
              className="text-[11px] text-[#77afd3] block truncate font-medium"
              title={
                currentRole === 'ESTUDANTE'
                  ? student.instituicao || (student.tipoVinculo === 'APRENDIZ' ? 'Jovem Aprendiz' : 'Estagiário')
                  : currentRole === 'COORDENADOR'
                  ? activeInstitution
                  : 'Escopo Global (Multi-Instituição)'
              }
            >
              {currentRole === 'ESTUDANTE'
                ? student.tipoVinculo === 'APRENDIZ'
                  ? 'Jovem Aprendiz'
                  : 'Estagiário'
                : currentRole === 'COORDENADOR'
                ? activeInstitution
                : 'Escopo Global (Multi-Instituição)'}
            </span>
          </div>
        </Link>

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
