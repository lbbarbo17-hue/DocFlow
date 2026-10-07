'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Building2,
  Briefcase,
  ShieldCheck,
  ChevronDown,
  FolderKanban,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function CoordinatorHeader() {
  const {
    currentCoordinatorUser,
    activeInstitution,
    setActiveInstitution,
    systemUsers,
  } = useApp();

  const coordinatorUsers = systemUsers.filter((u) => u.role === 'COORDENADOR');
  
  // Format greeting name (handling "Profª. Mariana" or "Mariana")
  const rawName = currentCoordinatorUser.nome || 'Coordenador';
  const nameParts = rawName.split(' ');
  const displayName = rawName.startsWith('Prof') && nameParts.length > 1
    ? `${nameParts[0]} ${nameParts[1]}`
    : nameParts[0];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors duration-200">
      {/* Decorative subtle background gradient */}
      <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#065373]/5 dark:from-cyan-500/10 to-transparent pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
        {/* Left Side: Avatar, Greeting & Metadata */}
        <div className="flex items-start sm:items-center gap-4">
          {/* Avatar with role icon */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#065373] to-[#226a8b] text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800">
              <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-200" />
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-xs bg-cyan-500 text-white"
              title="Ambiente da Coordenação & RH"
            >
              <ShieldCheck className="w-3 h-3" />
            </div>
          </div>

          {/* Coordinator name & details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-[#065373] dark:text-cyan-300 tracking-tight">
                Olá, {displayName}! 👋
              </h2>

              {/* Role badge */}
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-2xl bg-sky-50 dark:bg-[#122634] border border-sky-200 dark:border-[#1c3547] text-xs font-semibold text-[#065373] dark:text-cyan-300">
                <GraduationCap className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-300" />
                <span>Coordenação & RH</span>
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-1">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {currentCoordinatorUser.nome}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Registro:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{currentCoordinatorUser.id.toUpperCase()}</span>
              </span>
            </div>

            {/* Contract & Institution Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mt-3">
              {/* Cargo & Função */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs shadow-2xs">
                <div className="w-5 h-5 rounded-lg bg-[#065373]/10 dark:bg-cyan-400/10 flex items-center justify-center text-[#065373] dark:text-cyan-300 shrink-0">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{currentCoordinatorUser.cargo}</span>
                  {activeInstitution && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                        {activeInstitution}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Unidade / Instituição */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs shadow-2xs">
                <div className="w-5 h-5 rounded-lg bg-[#065373]/10 dark:bg-cyan-400/10 flex items-center justify-center text-[#065373] dark:text-cyan-300 shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Instituição:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-none">
                    {activeInstitution}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Profile Switcher & Action */}
        <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline">
              Simular Perfil:
            </span>
            <div className="relative">
              <select
                value={activeInstitution}
                onChange={(e) => setActiveInstitution(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 rounded-xl px-3.5 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 transition-colors"
                aria-label="Alternar perfil de coordenador"
              >
                {coordinatorUsers.map((u) => (
                  <option key={u.id} value={u.instituicao || ''} className="dark:bg-slate-800 dark:text-white">
                    {u.nome.replace(/^Profª?\.\s*/i, '').split(' ')[0]} ({u.instituicao ? u.instituicao.split(' ')[0] : 'Geral'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <Link
            href="/coordenador/dossies"
            className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shrink-0 cursor-pointer shadow-xs"
          >
            <FolderKanban className="w-4 h-4 text-[#0284c7] dark:text-[#00b4d8] shrink-0" />
            <span className="hidden sm:inline">Explorar Dossiês</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5 shrink-0 opacity-70" />
          </Link>
        </div>
      </div>
    </div>
  );
}
