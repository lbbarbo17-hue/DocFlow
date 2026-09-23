'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Sun,
  Moon,
  Menu,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const {
    currentRole,
    toastMessage,
    setToastMessage,
    theme,
    toggleTheme,
    isSidebarOpen,
    toggleSidebar,
  } = useApp();

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-800 px-4 sm:px-6 py-3 shadow-sm transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left Side: Sidebar Toggle & Portal Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors shadow-xs flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
            title={isSidebarOpen ? 'Ocultar menu lateral' : 'Exibir menu lateral'}
            aria-label="Alternar visibilidade do menu lateral"
          >
            <Menu className="w-4 h-4 text-[#065373] dark:text-cyan-300" />
          </button>

          <div className="hidden sm:block h-6 w-[1px] bg-slate-300 dark:bg-slate-700" />

          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              DocFlow
              <span className="text-[11px] sm:text-xs font-semibold text-[#065373] dark:text-cyan-300 bg-[#065373]/10 dark:bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-[#065373]/20 dark:border-cyan-500/30">
                {currentRole === 'ESTUDANTE'
                  ? 'Portal do Aprendiz'
                  : currentRole === 'COORDENADOR'
                  ? 'Portal da Coordenação & RH'
                  : 'Painel do Super Administrador'}
              </span>
            </h1>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium hidden sm:block">
              Ambiente de acesso seguro e exclusivo
            </p>
          </div>
        </div>

        {/* Right Side: Theme Toggle & Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors shadow-xs"
            title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            aria-label="Alternar tema de cores"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-[#065373] hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Logout Button */}
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border-2 border-rose-300 dark:border-rose-800/60 transition-colors"
            title="Encerrar sessão e trocar de conta"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </Link>
        </div>
      </div>

      {/* Global Toast Alert Display */}
      {toastMessage && (
        <div
          className={cn(
            'mt-3 px-4 py-3 rounded-lg border flex items-start justify-between shadow-md text-xs transition-all animate-fadeIn',
            toastMessage.type === 'success' && 'bg-emerald-50 border-emerald-300 text-emerald-900',
            toastMessage.type === 'error' && 'bg-rose-50 border-rose-300 text-rose-900',
            toastMessage.type === 'info' && 'bg-sky-50 border-sky-300 text-sky-900'
          )}
        >
          <div className="flex items-start gap-2.5">
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />}
            <div>
              <p className="font-bold">{toastMessage.title}</p>
              <p className="text-slate-800 dark:text-slate-200 font-mono text-[11px] mt-0.5">{toastMessage.desc}</p>
            </div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 ml-3"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
}
