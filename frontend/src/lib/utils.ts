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
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
        badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
        dot: 'bg-emerald-500',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'EM_ANALISE':
      return {
        label: 'Pendente de Análise',
        shortLabel: 'Em Análise',
        bg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60',
        badgeColor: 'text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60',
        dot: 'bg-sky-500',
        iconColor: 'text-sky-600 dark:text-sky-400',
      };
    case 'RECUSADO':
      return {
        label: 'Recusado / Precisa de Correção',
        shortLabel: 'Recusado',
        bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
        badgeColor: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
        dot: 'bg-rose-500',
        iconColor: 'text-rose-600 dark:text-rose-400',
      };
    case 'EXPIRADO':
    case 'VENCENDO':
      return {
        label: 'Vencendo / Requer Renovação',
        shortLabel: 'Vencendo / Renovação',
        bg: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
        badgeColor: 'text-amber-800 bg-amber-50 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
        dot: 'bg-amber-500',
        iconColor: 'text-amber-600 dark:text-amber-400',
      };
    case 'PENDENTE':
    default:
      return {
        label: 'Pendente de Envio',
        shortLabel: 'Pendente',
        bg: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        badgeColor: 'text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
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
        bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
        text: 'text-rose-700 dark:text-rose-300',
      };
    case 'MEDIO':
      return {
        label: 'Atenção / Médio',
        bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
        text: 'text-amber-700 dark:text-amber-300',
      };
    case 'BAIXO':
      return {
        label: 'Regular / Baixo',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
        text: 'text-emerald-700 dark:text-emerald-300',
      };
  }
}
