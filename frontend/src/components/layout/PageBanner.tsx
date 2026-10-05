'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShieldCheck, LucideIcon } from 'lucide-react';

export interface PageBannerAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
}

export interface PageBannerBadge {
  label: string;
  icon?: LucideIcon;
}

export interface PageBannerProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  backHref?: string;
  backLabel?: string;
  badge?: PageBannerBadge;
  action?: PageBannerAction;
  className?: string;
}

export default function PageBanner({
  title,
  subtitle,
  icon: Icon,
  backHref,
  backLabel = 'Voltar ao Painel Principal',
  badge,
  action,
  className = '',
}: PageBannerProps) {
  const ActionIcon = action?.icon;
  const BadgeIcon = badge?.icon || ShieldCheck;

  const actionClasses =
    'inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shrink-0 cursor-pointer shadow-xs';

  const actionContent = action && (
    <>
      {ActionIcon && <ActionIcon className="w-4 h-4 text-[#0284c7] dark:text-[#00b4d8] shrink-0" />}
      <span>{action.label}</span>
      <ArrowRight className="w-3.5 h-3.5 ml-0.5 shrink-0 opacity-70" />
    </>
  );

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors ${className}`}
    >
      <div className="space-y-1 min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284c7] hover:text-sky-600 dark:text-[#00b4d8] mb-1 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>{backLabel}</span>
          </Link>
        )}

        <h1 className="text-xl sm:text-2xl font-black text-[#065373] dark:text-cyan-300 tracking-tight flex items-center gap-2.5">
          <Icon className="w-6 h-6 text-[#0284c7] dark:text-[#00b4d8] shrink-0" />
          <span className="truncate sm:whitespace-normal">{title}</span>
        </h1>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap shrink-0">
        {badge && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-sky-50 dark:bg-[#122634] border border-sky-200 dark:border-[#1c3547] text-xs font-semibold text-[#065373] dark:text-cyan-300">
            <BadgeIcon className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{badge.label}</span>
          </div>
        )}

        {action && (
          action.href ? (
            <Link href={action.href} className={actionClasses}>
              {actionContent}
            </Link>
          ) : (
            <button type="button" onClick={action.onClick} className={actionClasses}>
              {actionContent}
            </button>
          )
        )}
      </div>
    </div>
  );
}
