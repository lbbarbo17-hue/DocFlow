'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { LayoutGrid, FileText, UploadCloud, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { currentRole, student } = useApp();

  const pendingDocsCount = student?.documentos
    ? student.documentos.filter(
        (d) => d.status === 'PENDENTE' || d.status === 'RECUSADO'
      ).length
    : 0;

  // Definição dos itens de navegação móvel de acordo com o papel do usuário
  const getNavItems = () => {
    if (currentRole === 'COORDENADOR') {
      return [
        {
          label: 'Início',
          href: '/coordenador',
          icon: LayoutGrid,
        },
        {
          label: 'Documentos',
          href: '/coordenador/dossies',
          icon: FileText,
          hasBadge: false,
        },
        {
          label: 'Enviar',
          href: '/coordenador/cadastro',
          icon: UploadCloud,
        },
        {
          label: 'Perfil',
          href: '/perfil',
          icon: User,
        },
      ];
    }

    if (currentRole === 'SUPERADMIN') {
      return [
        {
          label: 'Início',
          href: '/admin',
          icon: LayoutGrid,
        },
        {
          label: 'Documentos',
          href: '/admin/arquivos',
          icon: FileText,
          hasBadge: false,
        },
        {
          label: 'Enviar',
          href: '/admin/coordenadores',
          icon: UploadCloud,
        },
        {
          label: 'Perfil',
          href: '/perfil',
          icon: User,
        },
      ];
    }

    // Padrão: Aprendiz / Estudante
    return [
      {
        label: 'Início',
        href: '/estudante',
        icon: LayoutGrid,
      },
      {
        label: 'Documentos',
        href: '/estudante/checklist',
        icon: FileText,
        hasBadge: pendingDocsCount > 0,
      },
      {
        label: 'Enviar',
        href: '/estudante/enviar',
        icon: UploadCloud,
      },
      {
        label: 'Perfil',
        href: '/perfil',
        icon: User,
      },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav
      aria-label="Navegação inferior mobile"
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 py-1.5 pb-safe"
    >
      <div className="grid grid-cols-4 w-full items-center gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isDashboard =
            item.href === '/estudante' ||
            item.href === '/coordenador' ||
            item.href === '/admin';
          const isActive = isDashboard
            ? pathname === item.href
            : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all select-none ${
                isActive
                  ? 'bg-[#085078]/10 dark:bg-[#085078]/30 text-[#085078] dark:text-cyan-400 font-semibold shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                {item.hasBadge && (
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900"
                    title="Existem documentos pendentes"
                  />
                )}
              </div>
              <span className="text-[11px] mt-0.5 truncate max-w-full leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
