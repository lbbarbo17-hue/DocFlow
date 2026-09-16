'use client';

import React from 'react';
import {
  Building2,
  BookOpen,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function StudentHeader() {
  const { student, studentsList, selectStudent } = useApp();

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
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Olá, {firstName}! 👋
              </h2>

              {/* Vínculo badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold border shadow-xs ${
                  isAprendiz
                    ? 'bg-cyan-50 dark:bg-cyan-950/50 text-[#065373] dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                }`}
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

        {/* Right Side: Quick Profile Switcher (Simulação e Demonstração) */}
        <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline">
              Simular Perfil:
            </span>
            <div className="relative">
              <select
                value={student.id}
                onChange={(e) => selectStudent(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 rounded-xl px-3.5 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 transition-colors"
                aria-label="Alternar estudante para teste"
              >
                {studentsList.map((s) => (
                  <option key={s.id} value={s.id} className="dark:bg-slate-800 dark:text-white">
                    {s.nome.split(' ')[0]} ({s.tipoVinculo === 'APRENDIZ' ? 'Aprendiz' : 'Estágio'} - {s.percentualConformidade}%)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
