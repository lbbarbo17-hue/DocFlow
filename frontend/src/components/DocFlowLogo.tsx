'use client';

import React, { useId } from 'react';

export interface DocFlowLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'auto' | 'light' | 'dark' | 'inverted';
  showSubtitle?: boolean;
  layout?: 'horizontal' | 'vertical';
  iconOnly?: boolean;
  inverted?: boolean;
}

export function DocFlowLogo({
  className = '',
  size = 'md',
  variant = 'auto',
  showSubtitle = false,
  layout = 'horizontal',
  iconOnly = false,
  inverted = false,
}: DocFlowLogoProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '');

  // Dimensionamento proporcional
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', subtitle: 'text-[7px]' },
    md: { icon: 36, text: 'text-2xl', subtitle: 'text-[8.5px]' },
    lg: { icon: 48, text: 'text-3xl', subtitle: 'text-[10px]' },
    xl: { icon: 68, text: 'text-5xl', subtitle: 'text-xs' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Determina se o modo escuro/invertido deve ser forçado (ex: sidebar ou banner escuro de login)
  const isForcedDark =
    inverted ||
    variant === 'dark' ||
    variant === 'inverted' ||
    className.includes('inverted') ||
    className.includes('text-white');

  const isForcedLight = variant === 'light';

  // Classes de visibilidade dos grupos SVG para suporte a tema dinâmico (auto)
  const lightGroupClass = isForcedDark
    ? 'hidden'
    : isForcedLight
    ? ''
    : 'dark:hidden';

  const darkGroupClass = isForcedLight
    ? 'hidden'
    : isForcedDark
    ? ''
    : 'hidden dark:inline';

  return (
    <div
      className={`inline-flex items-center ${
        layout === 'vertical' ? 'flex-col text-center gap-2.5' : 'flex-row gap-3'
      } ${className}`}
    >
      {/* Símbolo Vetorial Oficial: D Estilizado em Documentos Sobrepostos + Seta de Fluxo 3D */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 select-none transition-transform duration-200"
      >
        <defs>
          {/* Gradientes do Modo Claro (Light Mode) */}
          <linearGradient id={`df_l_sheetBack_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#003366" />
            <stop offset="100%" stopColor="#1e5f9e" />
          </linearGradient>

          <linearGradient id={`df_l_sheetFront_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e5f9e" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#3498db" stopOpacity="0.88" />
          </linearGradient>

          <linearGradient id={`df_l_fold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#bdc3c7" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id={`df_l_swoop_${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#002244" />
            <stop offset="45%" stopColor="#003366" />
            <stop offset="100%" stopColor="#3498db" />
          </linearGradient>

          <linearGradient id={`df_l_arrowLeft_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          <linearGradient id={`df_l_arrowRight_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Gradientes do Modo Escuro / Fundo Sombrio (Dark / Inverted Mode) */}
          <linearGradient id={`df_d_sheetBack_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.25" />
          </linearGradient>

          <linearGradient id={`df_d_sheetFront_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id={`df_d_stroke_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>

          <linearGradient id={`df_d_fold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id={`df_d_swoop_${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="60%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>

          <linearGradient id={`df_d_arrowLeft_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          <linearGradient id={`df_d_arrowRight_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
        </defs>

        {/* 1. Modo Claro (Light Theme) */}
        <g className={lightGroupClass}>
          {/* Folha traseira (Back Document Layer) */}
          <path
            d="M36 12 H64 L74 22 V54 C74 65 67 73 56 75 H36 V12 Z"
            fill={`url(#df_l_sheetBack_${uid})`}
            opacity="0.95"
          />
          {/* Dobra da folha traseira (Back Dog-ear) */}
          <path d="M64 12 L74 22 H64 V12 Z" fill={`url(#df_l_fold_${uid})`} />

          {/* Folha frontal com relevo (Front Document Layer) */}
          <path
            d="M25 21 H53 L63 31 V66 C63 76 54 83 43 83 H25 V21 Z"
            fill={`url(#df_l_sheetFront_${uid})`}
          />
          {/* Dobra da folha frontal (Front Dog-ear) */}
          <path d="M53 21 L63 31 H53 V21 Z" fill={`url(#df_l_fold_${uid})`} />

          {/* Abertura central no formato da letra 'D' */}
          <path
            d="M35 34 H47 C54 34 58 39 58 48 C58 57 54 62 47 62 H35 V34 Z"
            fill="#ffffff"
          />

          {/* Curva de Fluxo dinâmica (Swoop Ribbon) - conecta sem emendas na seta */}
          <path
            d="M25 75 C25 88 44 92 64 85 C73 81 78 70 79 50 L73 46 C70 65 65 74 58 77 C45 82 33 78 33 69 Z"
            fill={`url(#df_l_swoop_${uid})`}
          />

          {/* Seta 3D Chanfrada com relevo e facetas de luz/sombra */}
          <path d="M80 24 L79 50 L73 46 L63 52 L80 24 Z" fill={`url(#df_l_arrowLeft_${uid})`} />
          <path d="M80 24 L94 52 L84 46 L79 50 L80 24 Z" fill={`url(#df_l_arrowRight_${uid})`} />
        </g>

        {/* 2. Modo Escuro / Invertido (Dark Theme / Sidebar) */}
        <g className={darkGroupClass}>
          {/* Folha traseira (Back Document Layer) */}
          <path
            d="M36 12 H64 L74 22 V54 C74 65 67 73 56 75 H36 V12 Z"
            fill={`url(#df_d_sheetBack_${uid})`}
            stroke={`url(#df_d_stroke_${uid})`}
            strokeWidth="1.2"
          />
          {/* Dobra da folha traseira (Back Dog-ear) */}
          <path
            d="M64 12 L74 22 H64 V12 Z"
            fill={`url(#df_d_fold_${uid})`}
            stroke={`url(#df_d_stroke_${uid})`}
            strokeWidth="0.8"
          />

          {/* Folha frontal com relevo (Front Document Layer) */}
          <path
            d="M25 21 H53 L63 31 V66 C63 76 54 83 43 83 H25 V21 Z"
            fill={`url(#df_d_sheetFront_${uid})`}
            stroke={`url(#df_d_stroke_${uid})`}
            strokeWidth="1.5"
          />
          {/* Dobra da folha frontal (Front Dog-ear) */}
          <path
            d="M53 21 L63 31 H53 V21 Z"
            fill={`url(#df_d_fold_${uid})`}
            stroke={`url(#df_d_stroke_${uid})`}
            strokeWidth="0.8"
          />

          {/* Abertura central no formato da letra 'D' */}
          <path
            d="M35 34 H47 C54 34 58 39 58 48 C58 57 54 62 47 62 H35 V34 Z"
            fill="#002244"
            stroke={`url(#df_d_stroke_${uid})`}
            strokeWidth="1.2"
          />

          {/* Curva de Fluxo dinâmica (Swoop Ribbon) - conecta sem emendas na seta */}
          <path
            d="M25 75 C25 88 44 92 64 85 C73 81 78 70 79 50 L73 46 C70 65 65 74 58 77 C45 82 33 78 33 69 Z"
            fill={`url(#df_d_swoop_${uid})`}
          />

          {/* Seta 3D Chanfrada com realce luminoso */}
          <path d="M80 24 L79 50 L73 46 L63 52 L80 24 Z" fill={`url(#df_d_arrowLeft_${uid})`} />
          <path d="M80 24 L94 52 L84 46 L79 50 L80 24 Z" fill={`url(#df_d_arrowRight_${uid})`} />
        </g>
      </svg>

      {/* Tipografia Oficial DocFlow */}
      {!iconOnly && (
        <div className={`flex flex-col ${layout === 'vertical' ? 'items-center' : 'items-start min-w-0'}`}>
          <div className={`leading-none tracking-tight ${currentSize.text} select-none`}>
            {/* 'Doc' em Negrito Encorpado */}
            <span
              className={`font-black ${
                isForcedDark ? 'text-white' : 'text-[#1a1a1a] dark:text-white'
              }`}
            >
              Doc
            </span>

            {/* 'Flow' Elegante e Leve */}
            <span
              className={`font-light ${
                isForcedDark ? 'text-white' : 'text-[#003366] dark:text-white'
              }`}
            >
              Flow
            </span>
          </div>

          {/* Slogan Corporativo Oficial (Opcional) */}
          {showSubtitle && (
            <span
              className={`font-semibold uppercase tracking-[0.22em] mt-1.5 select-none ${currentSize.subtitle} ${
                isForcedDark ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              GESTÃO INTELIGENTE DE DOCUMENTOS
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default DocFlowLogo;
