'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Sun,
  Moon,
  LogOut,
  Building2,
  LayoutGrid,
  FileText,
  UploadCloud,
  Shield,
  BarChart3,
  UserPlus,
  HardDrive,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocFlowLogo } from '@/components/DocFlowLogo';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentRole,
    student,
    currentUserProfile,
    activeInstitution,
    toastMessage,
    setToastMessage,
    theme,
    toggleTheme,
    logout,
  } = useApp();

  const homeRoute =
    currentRole === 'ESTUDANTE'
      ? '/estudante'
      : currentRole === 'COORDENADOR'
      ? '/coordenador'
      : '/admin';

  const pendingDocsCount = student?.documentos
    ? student.documentos.filter(
        (d) => d.status === 'PENDENTE' || d.status === 'RECUSADO'
      ).length
    : 0;

  const userInitials = (currentUserProfile?.nome || student?.nome || 'DocFlow')
    .replace(new RegExp('^(Profª\\.|Prof\\.|Dr\\.|Dra\\.)\\s*'), '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const shortName = (currentUserProfile?.nome || student?.nome || 'Usuário').split(' ')[0];

  const institutionName =
    currentRole === 'ESTUDANTE'
      ? student?.instituicao || 'ETEC Politécnica de São Paulo'
      : activeInstitution || 'ETEC Politécnica de São Paulo';

  const getNavItems = () => {
    if (currentRole === 'COORDENADOR') {
      return [
        { label: 'Dashboard', href: '/coordenador', icon: LayoutGrid },
        { label: 'Aprendizes/Estagiários', href: '/coordenador/dossies', icon: FileText },
        { label: 'Turmas', href: '/analytics', icon: BarChart3 },
        { label: 'Cadastro', href: '/coordenador/cadastro', icon: UserPlus },
      ];
    }
    if (currentRole === 'SUPERADMIN') {
      return [
        { label: 'Controle Global', href: '/admin', icon: Shield },
        { label: 'Coordenadores', href: '/admin/coordenadores', icon: UserPlus },
        { label: 'Arquivos', href: '/admin/arquivos', icon: HardDrive },
        { label: 'Auditoria', href: '/auditoria', icon: History },
      ];
    }
    // ESTUDANTE
    return [
      { label: 'Dashboard', href: '/estudante', icon: LayoutGrid },
      { label: 'Documentos', href: '/estudante/checklist', icon: FileText, hasAlert: pendingDocsCount > 0 },
      { label: 'Adicionar Documentos', href: '/estudante/enviar', icon: UploadCloud },
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm transition-colors duration-200">
      {/* Container alinhado exatamente à largura máxima do <main> (max-w-7xl mx-auto px-4 md:px-8) */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex items-center justify-between h-16">
        {/* LADO ESQUERDO: Marca + Navegação Horizontal no Desktop */}
        <div className="flex items-center gap-2">
          {/* Logo Oficial "DocFlow" */}
          <Link
            href={homeRoute}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
            title="Ir para o início"
          >
            <DocFlowLogo size="sm" />
          </Link>

          {/* Divisor vertical sutil no Desktop */}
          <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-800 mx-3 lg:mx-4" />

          {/* Links de navegação horizontal no Desktop */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navItems.map((item) => {
              const isHome = item.href === homeRoute;
              const isActive = isHome
                ? pathname === item.href
                : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm transition-all select-none',
                    isActive
                      ? 'bg-[#085078] text-white font-medium shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.hasAlert && (
                    <span
                      className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
                      title="Existem documentos pendentes"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* LADO DIREITO: Contexto e Conta */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Badge institucional limpa e discreta (Desktop) */}
          {institutionName && (
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden lg:flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate max-w-[200px] xl:max-w-[280px]" title={institutionName}>
                {institutionName}
              </span>
            </div>
          )}

          {/* Divisor vertical sutil entre instituição e ações */}
          {institutionName && (
            <div className="hidden lg:block h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          )}

          {/* Botão de Tema (Sol/Lua) - Limpo com hover suave */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            aria-label="Alternar tema de cores"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Avatar do usuário com iniciais - Desktop com hover suave */}
          <Link
            href="/perfil"
            className={cn(
              'hidden md:flex items-center gap-2 p-1.5 pr-2.5 rounded-lg transition-colors cursor-pointer select-none',
              pathname === '/perfil'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
            title={`Meu Perfil (${currentUserProfile?.nome || student?.nome || 'Usuário'})`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#085078] to-[#0a6d96] text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden shrink-0">
              {currentUserProfile?.avatarUrl ? (
                <Image
                  src={currentUserProfile.avatarUrl}
                  alt={currentUserProfile.nome}
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                userInitials
              )}
            </div>
            <span className="text-xs font-semibold truncate max-w-[100px] lg:max-w-[140px]">
              {shortName}
            </span>
          </Link>

          {/* Botão "Sair" - Ação secundária discreta */}
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Encerrar sessão"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* Global Toast Alert Display */}
      {toastMessage && (
        <div className="border-t border-slate-200 dark:border-slate-800">
          <div
            className={cn(
              'max-w-7xl mx-auto w-full px-4 md:px-8 py-2.5 flex items-center justify-between text-xs transition-all animate-fadeIn',
              toastMessage.type === 'success' && 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200',
              toastMessage.type === 'error' && 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200',
              toastMessage.type === 'info' && 'bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200'
            )}
          >
            <div className="flex items-center gap-2">
              {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
              {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
              {toastMessage.type === 'info' && <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />}
              <span className="font-semibold">{toastMessage.title}:</span>
              <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{toastMessage.desc}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              title="Fechar notificação"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
