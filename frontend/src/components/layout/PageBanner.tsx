'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface PageBannerAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
}

interface PageBannerProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  action?: PageBannerAction;
  className?: string;
}

export default function PageBanner({
  title,
  subtitle,
  icon: Icon,
  action,
  className = '',
}: PageBannerProps) {
  const ActionIcon = action?.icon;

  const actionContent = action && (
    <>
      {ActionIcon && <ActionIcon className="w-4 h-4 text-[#065373] dark:text-cyan-400 shrink-0" />}
      <span>{action.label}</span>
      <ArrowRight className="w-3.5 h-3.5 ml-1 shrink-0" />
    </>
  );

  const actionClasses =
    'inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shrink-0 cursor-pointer';

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#065373] to-[#226a8b] text-white flex items-center justify-center shadow-md shrink-0">
          <Icon className="w-6 h-6 text-cyan-300" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight truncate sm:whitespace-normal">
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
            {subtitle}
          </p>
        </div>
      </div>

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
  );
}
