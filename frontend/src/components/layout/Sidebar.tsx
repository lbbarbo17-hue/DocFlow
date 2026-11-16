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
  PanelLeftOpen,
  UserPlus,
  Settings,
  History,
  HardDrive,
} from 'lucide-react';
import { cn, scrollToTop } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const {
    currentRole,
    student,
    studentsList,
    closeSidebar,
    toggleSidebar,
    isSidebarOpen,
    activeInstitution,
    currentUserProfile,
  } = useApp();

  const homeRoute =
    currentRole === 'ESTUDANTE'
      ? '/estudante'
      : currentRole === 'COORDENADOR'
      ? '/coordenador'
      : '/admin';

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
    <aside
      className={cn(
        'bg-[#085078] dark:bg-[#0b192c] text-white flex flex-col shrink-0 border-r border-white/10 dark:border-slate-800 shadow-md z-30 min-h-screen transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Topo: Logo Oficial e Botão de Recolher/Expandir */}
      {isSidebarOpen ? (
        <div className="p-4 flex items-center justify-between gap-2 border-b border-white/10 dark:border-slate-800 min-h-[65px]">
          <Link
            href={homeRoute}
            className="min-w-0 flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            title="Ir para o Dashboard"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 dark:bg-[#085078] flex items-center justify-center text-white shadow-sm shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white truncate">
              DocFlow
            </span>
          </Link>

          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden md:flex p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors shrink-0 cursor-pointer items-center justify-center"
            title="Recolher menu lateral"
            aria-label="Recolher menu lateral"
          >
            <PanelLeftClose className="w-4 h-4 text-white" />
          </button>
        </div>
      ) : (
        <div className="p-3 flex items-center justify-center border-b border-white/10 dark:border-slate-800 min-h-[65px]">
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden md:flex p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors shrink-0 cursor-pointer items-center justify-center"
            title="Expandir menu lateral"
            aria-label="Expandir menu lateral"
          >
            <PanelLeftOpen className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      {/* Navegação */}
      <div className="flex-1 py-5 px-2 sm:px-3 space-y-1.5 overflow-y-auto">
        {isSidebarOpen && (
          <div className="px-3 pb-2 text-[10px] font-bold text-white/70 dark:text-slate-400 uppercase tracking-wider truncate">
            Menu de Navegação
          </div>
        )}

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/coordenador' && pathname === '/coordenador/dashboard');
          const Icon = item.icon;

          if (!isSidebarOpen) {
            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.label}
                onClick={() => scrollToTop('instant')}
                className={cn(
                  'group relative flex items-center justify-center p-2.5 rounded-xl text-xs transition-colors duration-150',
                  isActive
                    ? 'bg-white/20 dark:bg-[#085078] text-white font-semibold shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-transform group-hover:scale-110',
                    isActive
                      ? 'text-white'
                      : 'text-white/80 group-hover:text-white dark:text-slate-400 dark:group-hover:text-white'
                  )}
                />
                {item.hasAlert && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2 shrink-0">
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
          }

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
                'group relative flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-colors duration-150',
                isActive
                  ? 'bg-white/20 dark:bg-[#085078] text-white font-semibold shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-transform group-hover:scale-105',
                    isActive
                      ? 'text-white'
                      : 'text-white/80 group-hover:text-white dark:text-slate-400 dark:group-hover:text-white'
                  )}
                />
                <span className="truncate text-white font-medium">{item.label}</span>
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
      <div className="p-3 border-t border-white/10 dark:border-slate-800 bg-black/10 dark:bg-[#0b192c]/90">
        <Link
          href="/perfil"
          onClick={() => {
            scrollToTop('instant');
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              closeSidebar();
            }
          }}
          className={cn(
            'w-full flex items-center gap-3 p-2 rounded-xl transition-all text-left group cursor-pointer border border-transparent dark:border-slate-800/80',
            !isSidebarOpen && 'justify-center p-1.5',
            pathname === '/perfil'
              ? 'bg-white/20 dark:bg-[#085078] text-white shadow-xs'
              : 'hover:bg-white/10 dark:hover:bg-slate-800/50 text-white'
          )}
          title={`Meu Perfil (${currentUserProfile.nome})`}
          aria-label="Abrir página de configurações de perfil"
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 dark:bg-[#085078] text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden shrink-0">
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
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#085078] dark:border-[#0b192c]"
              title="Online"
            />
          </div>

          {isSidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span
                  className="block text-white font-semibold text-xs truncate"
                  title={currentUserProfile.nome}
                >
                  {currentUserProfile.nome}
                </span>
                <Settings className="w-3.5 h-3.5 text-white/70 group-hover:text-white dark:text-slate-400 dark:group-hover:text-white transition-transform group-hover:rotate-45 shrink-0" />
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
          )}
        </Link>
      </div>
    </aside>
  );
}
