'use client';

import React from 'react';
import {
  Building2,
  BookOpen,
  GraduationCap,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function StudentHeader() {
  const { student } = useApp();

  const isAprendiz = student.tipoVinculo === 'APRENDIZ';
  const firstName = student.nome.split(' ')[0];

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
              {isAprendiz ? (
                <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-200" />
              ) : (
                <Briefcase className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-200" />
              )}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-xs ${
                isAprendiz ? 'bg-cyan-500 text-white' : 'bg-emerald-500 text-white'
              }`}
              title={isAprendiz ? 'Jovem Aprendiz' : 'Estagiário'}
            >
              <ShieldCheck className="w-3 h-3" />
            </div>
          </div>

          {/* Student name & details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-[#065373] dark:text-cyan-300 tracking-tight">
                Olá, {firstName}! 👋
              </h2>

              {/* Vínculo badge */}
              <span
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-2xl bg-sky-50 dark:bg-[#122634] border border-sky-200 dark:border-[#1c3547] text-xs font-semibold text-[#065373] dark:text-cyan-300"
              >
                {isAprendiz ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-300" />
                    <span>Jovem Aprendiz</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                    <span>Estagiário</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-1">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {student.nome}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Matrícula:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{student.matricula}</span>
              </span>
            </div>

            {/* Contract & Course Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mt-3">
              {/* Instituição & Curso */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs shadow-2xs">
                <div className="w-5 h-5 rounded-lg bg-[#065373]/10 dark:bg-cyan-400/10 flex items-center justify-center text-[#065373] dark:text-cyan-300 shrink-0">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{student.curso}</span>
                  {student.instituicao && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                        {student.instituicao}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Empresa Concedente */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs shadow-2xs">
                <div className="w-5 h-5 rounded-lg bg-[#065373]/10 dark:bg-cyan-400/10 flex items-center justify-center text-[#065373] dark:text-cyan-300 shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Empresa:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-none">
                    {student.empresa}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
