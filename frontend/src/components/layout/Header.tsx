'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  LayoutGrid,
  FileText,
  UploadCloud,
  Shield,
  BarChart3,
  UserPlus,
  HardDrive,
  History,
  ChevronDown,
  User,
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
    toastMessage,
    setToastMessage,
    theme,
    toggleTheme,
    logout,
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora ou apertar Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  // Fecha o dropdown ao navegar
  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [pathname]);

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

  const roleBadgeLabel =
    currentRole === 'ESTUDANTE'
      ? student?.tipoVinculo === 'APRENDIZ'
        ? 'Jovem Aprendiz'
        : 'Estagiário'
      : currentRole === 'COORDENADOR'
      ? 'Coordenação / RH'
      : 'Super Administrador';

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
        {/* ESQUERDA: Apenas Logo "DocFlow" (sem divisórias extras) */}
        <div className="flex items-center shrink-0">
          <Link
            href={homeRoute}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            title="Ir para o início"
          >
            <DocFlowLogo size="sm" />
          </Link>
        </div>

        {/* CENTRO: Navegação Centralizada com Pílula Suave */}
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
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors select-none',
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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

        {/* DIREITA: Apenas Tema + Avatar com Menu Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Botão de Tema (Sol/Lua) discreto */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Alternar tema claro/escuro"
            aria-label="Alternar tema claro/escuro"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-500 dark:text-slate-400 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Avatar circular com iniciais ("BH" em bg-[#085078] text-white) + ChevronDown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className={cn(
                'flex items-center gap-1.5 p-1 rounded-full transition-colors cursor-pointer select-none text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none',
                isProfileMenuOpen && 'bg-slate-100 dark:bg-slate-800'
              )}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
              title="Abrir menu da conta"
            >
              <div className="w-8 h-8 rounded-full bg-[#085078] text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden shrink-0">
                {currentUserProfile?.avatarUrl ? (
                  <Image
                    src={currentUserProfile.avatarUrl}
                    alt={currentUserProfile.nome}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  userInitials
                )}
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 mr-1',
                  isProfileMenuOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Menu Dropdown do Perfil Enxuto (w-64, rounded-2xl, shadow-xl) */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Cabeçalho do Dropdown: Nome Completo e Cargo/Perfil (sem instituição) */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {currentUserProfile?.nome || student?.nome || 'Beatriz Helena de Castro Ramos'}
                  </p>
                  <p className="text-xs font-medium text-[#085078] dark:text-cyan-400 mt-0.5">
                    {roleBadgeLabel}
                  </p>
                </div>

                {/* Link Meu Perfil */}
                <div className="py-1">
                  <Link
                    href="/perfil"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors',
                      pathname === '/perfil'
                        ? 'text-[#085078] dark:text-cyan-400 bg-[#085078]/5 dark:bg-[#085078]/20 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>Meu Perfil</span>
                  </Link>
                </div>

                {/* Divisor sutil */}
                <div className="border-t border-slate-200 dark:border-slate-800 my-1" />

                {/* Opção Sair da conta */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Sair da conta</span>
                  </button>
                </div>
              </div>
            )}
          </div>
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
