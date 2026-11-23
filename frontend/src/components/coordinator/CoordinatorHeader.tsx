'use client';

import React from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';

export default function CoordinatorHeader() {
  const { currentCoordinatorUser, currentUserProfile, activeInstitution } = useApp();

  const coordinatorName =
    currentUserProfile?.nome || currentCoordinatorUser?.nome || 'Coordenador Acadêmico';
  const cargo = currentCoordinatorUser?.cargo || 'Coordenador';
  const instituicao = activeInstitution || 'Instituição Conveniada';
  const registro = currentCoordinatorUser?.id
    ? `ID #${currentCoordinatorUser.id.toUpperCase()}`
    : null;

  // Iniciais para avatar limpo e minimalista (sem ícone de chapéu ou badges)
  const initials = coordinatorName
    .replace(new RegExp('^(Profª\\.|Prof\\.|Dr\\.|Dra\\.)\\s*'), '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'CD';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-4">
        {/* Avatar Simples: foto ou iniciais */}
        <div className="relative shrink-0">
          {currentUserProfile?.avatarUrl ? (
            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src={currentUserProfile.avatarUrl}
                alt={coordinatorName}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#085078] text-white font-semibold text-lg flex items-center justify-center select-none shadow-xs">
              {initials}
            </div>
          )}
        </div>

        {/* Informações do Perfil */}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {coordinatorName}
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{cargo}</span>
            <span className="text-slate-300 dark:text-slate-600 select-none">•</span>
            <span>{instituicao}</span>
            {registro && (
              <>
                <span className="text-slate-300 dark:text-slate-600 select-none">•</span>
                <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">
                  {registro}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
