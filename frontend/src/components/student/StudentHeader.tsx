'use client';

import React from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';

export default function StudentHeader() {
  const { student } = useApp();

  const studentName = student?.nome || 'Beatriz Helena de Castro Ramos';
  const curso = student?.curso || 'Técnico em Desenvolvimento de Sistemas';
  const instituicao = student?.instituicao || 'ETEC Politécnica';
  const empresa = student?.empresa || 'TechCorp S.A.';
  const contrato = student?.contratoAtivo?.numeroContrato
    ? `Contrato #${student.contratoAtivo.numeroContrato}`
    : null;

  // Iniciais para avatar limpo e minimalista (sem ícone de chapéu repetido)
  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'BH';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs transition-colors duration-200">
      <div className="flex items-center gap-4">
        {/* Avatar Simples: foto ou iniciais, sem sobreposição de ícones ou badges */}
        <div className="relative shrink-0">
          {student?.avatarUrl ? (
            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src={student.avatarUrl}
                alt={studentName}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-lg flex items-center justify-center select-none">
              {initials}
            </div>
          )}
        </div>

        {/* Informações do Perfil: Nome em destaque + Dados em linha/parágrafo legível */}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {studentName}
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{curso}</span>
            <span className="text-slate-300 dark:text-slate-600 select-none">•</span>
            <span>{instituicao}</span>
            <span className="text-slate-300 dark:text-slate-600 select-none">•</span>
            <span>{empresa}</span>
            {contrato && (
              <>
                <span className="text-slate-300 dark:text-slate-600 select-none">•</span>
                <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">
                  {contrato}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
