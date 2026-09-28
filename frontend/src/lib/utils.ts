import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StatusDocumento, NivelRisco } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function maskCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return '***.***.***-**';
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export async function computeSHA256(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback pseudo-hash
    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}

export function generateStorageUUID(ext: string): string {
  const uuid = crypto.randomUUID ? crypto.randomUUID() : `uuid-${Date.now()}`;
  return `doc_${uuid}.${ext.toLowerCase().replace('.', '')}`;
}

export function getStatusBadgeConfig(status: StatusDocumento) {
  switch (status) {
    case 'APROVADO':
      return {
        label: 'Aprovado / Válido',
        shortLabel: 'Aprovado',
        bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-[#023326] dark:text-white dark:border-emerald-700',
        badgeColor: 'text-emerald-900 bg-emerald-100 border-emerald-300 dark:bg-[#023326] dark:text-white dark:border-emerald-700',
        dot: 'bg-emerald-500',
        iconColor: 'text-emerald-600 dark:text-emerald-300',
      };
    case 'EM_ANALISE':
      return {
        label: 'Pendente de Análise',
        shortLabel: 'Em Análise',
        bg: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-[#0c4a6e] dark:text-white dark:border-sky-500',
        badgeColor: 'text-sky-900 bg-sky-100 border-sky-300 dark:bg-[#0c4a6e] dark:text-white dark:border-sky-500',
        dot: 'bg-sky-500',
        iconColor: 'text-sky-600 dark:text-sky-300',
      };
    case 'RECUSADO':
      return {
        label: 'Recusado / Precisa de Correção',
        shortLabel: 'Recusado',
        bg: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-[#7f1d1d] dark:text-white dark:border-red-600',
        badgeColor: 'text-rose-900 bg-rose-100 border-rose-300 dark:bg-[#7f1d1d] dark:text-white dark:border-red-600',
        dot: 'bg-rose-500',
        iconColor: 'text-rose-600 dark:text-rose-300',
      };
    case 'EXPIRADO':
    case 'VENCENDO':
      return {
        label: 'Vencendo / Requer Renovação',
        shortLabel: 'Vencendo / Renovação',
        bg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-[#78350f] dark:text-white dark:border-amber-500',
        badgeColor: 'text-amber-900 bg-amber-100 border-amber-300 dark:bg-[#78350f] dark:text-white dark:border-amber-500',
        dot: 'bg-amber-500',
        iconColor: 'text-amber-600 dark:text-amber-300',
      };
    case 'PENDENTE':
    default:
      return {
        label: 'Pendente de Envio',
        shortLabel: 'Pendente',
        bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-600',
        badgeColor: 'text-slate-800 bg-slate-100 border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-600',
        dot: 'bg-slate-400',
        iconColor: 'text-slate-500 dark:text-slate-400',
      };
  }
}

export function formatDateBr(isoDate?: string): string {
  if (!isoDate) return 'Não enviado';
  try {
    const d = new Date(isoDate);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoDate;
  }
}

export function getRiskBadgeConfig(risk: NivelRisco) {
  switch (risk) {
    case 'CRITICO':
      return {
        label: 'Risco Crítico',
        bg: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-[#7f1d1d] dark:text-white dark:border-red-600',
        text: 'text-rose-700 dark:text-white',
      };
    case 'MEDIO':
      return {
        label: 'Atenção / Médio',
        bg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-[#78350f] dark:text-white dark:border-amber-500',
        text: 'text-amber-700 dark:text-white',
      };
    case 'BAIXO':
      return {
        label: 'Regular / Baixo',
        bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-[#023326] dark:text-white dark:border-emerald-700',
        text: 'text-emerald-700 dark:text-white',
      };
  }
}
