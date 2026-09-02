'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  UserCheck,
  GraduationCap,
  Shield,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Lock,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const {
    currentRole,
    student,
    toastMessage,
    setToastMessage,
    isLgpdRedactionActive,
    setIsLgpdRedactionActive,
  } = useApp();

  const userDisplayName =
    currentRole === 'ESTUDANTE'
      ? student.nome
      : currentRole === 'COORDENADOR'
      ? 'Profª. Mariana Alcantara'
      : 'Super Administrador DocFlow';

  const userRoleBadge =
    currentRole === 'ESTUDANTE'
      ? { label: 'Aprendiz / Estagiário', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: GraduationCap }
      : currentRole === 'COORDENADOR'
      ? { label: 'Coordenação & RH', color: 'bg-cyan-50 text-cyan-800 border-cyan-200', icon: UserCheck }
      : { label: 'Super Admin', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Shield };

  const RoleIcon = userRoleBadge.icon;

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3.5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Active Portal Title */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 bg-[#065373] rounded-full" />
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              DocFlow
              <span className="text-xs font-semibold text-[#065373] bg-[#065373]/10 px-2.5 py-0.5 rounded-full border border-[#065373]/20">
                {currentRole === 'ESTUDANTE'
                  ? 'Portal do Aprendiz'
                  : currentRole === 'COORDENADOR'
                  ? 'Portal da Coordenação & RH'
                  : 'Painel do Super Administrador'}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Ambiente de acesso seguro e exclusivo
            </p>
          </div>
        </div>

        {/* Right Side: Active User Identity & Logout Button */}
        <div className="flex items-center gap-3">
          {/* Tarja Quick Toggle (Visible for Coordinator and Admin) */}
          {currentRole !== 'ESTUDANTE' && (
            <button
              onClick={() => setIsLgpdRedactionActive(!isLgpdRedactionActive)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150',
                isLgpdRedactionActive
                  ? 'bg-slate-900 text-cyan-300 border-slate-800 shadow-inner'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              )}
              title="Ativar/Desativar proteção visual de dados sensíveis"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tarja Protetora:</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded text-[10px] font-mono font-bold',
                  isLgpdRedactionActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-200 text-slate-600'
                )}
              >
                {isLgpdRedactionActive ? 'LIGADA' : 'DESLIGADA'}
              </span>
            </button>
          )}

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-[#065373]/10 text-[#065373] flex items-center justify-center font-bold text-xs">
              <RoleIcon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 truncate max-w-[150px] leading-tight">
                {userDisplayName}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {userRoleBadge.label}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
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
              <p className="text-slate-600 font-mono text-[11px] mt-0.5">{toastMessage.desc}</p>
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
