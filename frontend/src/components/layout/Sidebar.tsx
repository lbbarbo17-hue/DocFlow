'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  UserCheck,
  BarChart3,
  Shield,
  LayoutDashboard,
  FileCheck,
  UploadCloud,
  PanelLeftClose,
  UserPlus,
  Settings,
  History,
  HardDrive,
} from 'lucide-react';
import { cn, scrollToTop } from '@/lib/utils';
import { DocFlowLogo } from '@/components/DocFlowLogo';

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

  const pendingStudentDocs = student.documentos.filter(
    (d) => d.status === 'PENDENTE' || d.status === 'RECUSADO'
  ).length;

  const criticalStudents = studentsList.filter(
    (s) => s.nivelRisco === 'CRITICO'
  ).length;

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

    return [
      {
        label: 'Controle Global',
        href: '/admin',
        icon: Shield,
      },
      {
        label: 'Coordenadores & Empresas',
        href: '/admin/coordenadores',
        icon: UserPlus,
      },
      {
        label: 'Arquivos & Conexões',
        href: '/admin/arquivos',
        icon: HardDrive,
      },
      {
        label: 'Histórico de Atividades',
        href: '/auditoria',
        icon: History,
      },
    ];
  };

  const navItems = getNavItemsForRole();

  const userInitials = (currentUserProfile.nome || 'DocFlow')
    .replace(new RegExp('^(Profª\\.|Prof\\.|Dr\\.|Dra\\.)\\s*'), '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <aside className="w-64 bg-[#085078] dark:bg-[#0b132b] text-white flex flex-col shrink-0 border-r border-white/10 dark:border-slate-800/80 shadow-md z-30 min-h-screen transition-colors duration-200">
      {/* Topo com Logo */}
      <div className="p-4 flex items-center justify-between gap-2 border-b border-white/10 dark:border-slate-800/80">
        <Link href="/" className="min-w-0 flex items-center hover:opacity-90 transition-opacity">
          <DocFlowLogo inverted />
        </Link>

        <button
          type="button"
          onClick={closeSidebar}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors shrink-0 cursor-pointer"
          title="Ocultar menu lateral"
          aria-label="Ocultar menu lateral"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Navegação */}
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-white/60 dark:text-slate-400 uppercase tracking-wider truncate">
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
                'group relative flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-r-lg rounded-l-none overflow-hidden text-xs transition-colors duration-150',
                isActive
                  ? 'bg-white/10 dark:bg-slate-800 text-white font-semibold border-l-4 border-blue-400 dark:border-blue-500 shadow-2xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/40 border-l-4 border-transparent'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-transform group-hover:scale-105',
                    isActive
                      ? 'text-blue-300 dark:text-blue-400'
                      : 'text-white/70 group-hover:text-white dark:text-slate-400 dark:group-hover:text-slate-200'
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

      {/* Rodapé do Perfil */}
      <div className="p-3 border-t border-white/10 dark:border-slate-800/80 bg-black/10 dark:bg-slate-950/40">
        <Link
          href="/perfil"
          onClick={() => {
            scrollToTop('instant');
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              closeSidebar();
            }
          }}
          className={cn(
            'w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left group cursor-pointer',
            pathname === '/perfil'
              ? 'bg-white/20 dark:bg-slate-800/60 text-white'
              : 'hover:bg-white/10 dark:hover:bg-slate-800/30 text-white/90 dark:text-slate-300 hover:text-white'
          )}
          title="Clique para gerenciar seu perfil"
          aria-label="Abrir página de configurações de perfil"
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 dark:bg-slate-800 text-white dark:text-slate-200 flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden border border-white/20 dark:border-slate-700">
              {currentUserProfile.avatarUrl ? (
                <Image
                  src={currentUserProfile.avatarUrl}
                  alt={currentUserProfile.nome}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                userInitials
              )}
            </div>
            <div
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#085078] dark:border-[#0b132b]"
              title="Online"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span
                className="block text-white font-medium text-xs truncate group-hover:text-white/90 dark:group-hover:text-blue-300 transition-colors"
                title={currentUserProfile.nome}
              >
                {currentUserProfile.nome}
              </span>
              <Settings className="w-3.5 h-3.5 text-white/70 group-hover:text-white dark:text-slate-400 dark:group-hover:text-slate-200 transition-transform group-hover:rotate-45 shrink-0" />
            </div>
            <span
              className="text-[11px] text-white/70 dark:text-slate-400 block truncate"
              title={
                currentRole === 'ESTUDANTE'
                  ? student.instituicao || (student.tipoVinculo === 'APRENDIZ' ? 'Jovem Aprendiz' : 'Estagiário')
                  : currentRole === 'COORDENADOR'
                  ? activeInstitution
                  : 'Super Administrador (Global)'
              }
            >
              {currentRole === 'ESTUDANTE'
                ? student.tipoVinculo === 'APRENDIZ'
                  ? 'Jovem Aprendiz'
                  : 'Estagiário'
                : currentRole === 'COORDENADOR'
                ? activeInstitution
                : 'Super Administrador (Global)'}
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
