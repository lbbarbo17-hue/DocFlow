'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/lib/types';
import {
  UserCheck,
  Building2,
  GraduationCap,
  Shield,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const {
    currentRole,
    setCurrentRole,
    toastMessage,
    setToastMessage,
    isLgpdRedactionActive,
    setIsLgpdRedactionActive,
  } = useApp();

  const roles: { key: UserRole; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'ESTUDANTE', label: 'Estudante', icon: GraduationCap },
    { key: 'COORDENADOR', label: 'Coordenador', icon: UserCheck },
    { key: 'GESTOR_RH', label: 'Gestor RH', icon: Building2 },
    { key: 'DPO', label: 'DPO / LGPD', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3.5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side: Context Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 bg-[#065373] rounded-full" />
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              DocFlow Enterprise Guard
              <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                v2.4.0 • DDD Lite
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Guarda contínua de dossiês acadêmicos e auditoria imutável
            </p>
          </div>
        </div>

        {/* Right Side: Role Selector & LGPD Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* LGPD Tarja Quick Toggle */}
          <button
            onClick={() => setIsLgpdRedactionActive(!isLgpdRedactionActive)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150',
              isLgpdRedactionActive
                ? 'bg-slate-900 text-cyan-300 border-slate-800 shadow-inner'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            )}
            title="Ativar/Desativar mascaramento visual automático de dados sensíveis (LGPD Art. 6º, III)"
          >
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tarja LGPD:</span>
            <span
              className={cn(
                'px-1.5 py-0.2 rounded text-[10px] font-mono',
                isLgpdRedactionActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-200 text-slate-600'
              )}
            >
              {isLgpdRedactionActive ? 'ATIVADA' : 'DESATIVADA'}
            </span>
          </button>

          {/* Role Switcher Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <span className="text-[11px] font-medium text-slate-400 px-2 uppercase tracking-wider hidden lg:inline">
              Perfil:
            </span>
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = currentRole === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setCurrentRole(r.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
                    isSelected
                      ? 'bg-[#065373] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
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
