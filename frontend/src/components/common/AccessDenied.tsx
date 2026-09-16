'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';

interface AccessDeniedProps {
  requiredRoleName: string;
}

export default function AccessDenied({ requiredRoleName }: AccessDeniedProps) {
  const { currentRole } = useApp();

  const userPortalHref =
    currentRole === 'ESTUDANTE'
      ? '/estudante'
      : currentRole === 'COORDENADOR'
      ? '/coordenador'
      : '/admin';

  const userPortalName =
    currentRole === 'ESTUDANTE'
      ? 'Portal do Aprendiz / Estudante'
      : currentRole === 'COORDENADOR'
      ? 'Portal do Coordenador'
      : 'Painel do Super Admin';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-100 shadow-inner">
          <ShieldAlert className="w-8 h-8 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            Acesso Restrito • 403 Proibido
          </span>
          <h2 className="text-xl font-black text-slate-900 pt-1">
            Permissão Insuficiente para Esta Interface
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Esta página é exclusiva para o perfil <strong>{requiredRoleName}</strong>. Seu acesso atual está configurado para o <strong>{userPortalName}</strong>.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-3 text-left">
          <Lock className="w-5 h-5 text-slate-400 shrink-0" />
          <p className="text-[11px] leading-snug">
            O DocFlow mantém isolamento rigoroso entre as interfaces de Aprendizes, Coordenadores e Super Administradores.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={userPortalHref}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#065373] hover:bg-[#043c53] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Meu Portal</span>
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Trocar de Usuário</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
