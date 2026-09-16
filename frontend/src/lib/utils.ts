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
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        dot: 'bg-emerald-500',
        iconColor: 'text-emerald-600',
      };
    case 'EM_ANALISE':
      return {
        label: 'Pendente de Análise',
        shortLabel: 'Em Análise',
        bg: 'bg-orange-50 text-orange-700 border-orange-200',
        badgeColor: 'text-orange-700 bg-orange-50 border-orange-200',
        dot: 'bg-orange-500',
        iconColor: 'text-orange-600',
      };
    case 'RECUSADO':
      return {
        label: 'Recusado / Precisa de Correção',
        shortLabel: 'Recusado',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
        dot: 'bg-rose-500',
        iconColor: 'text-rose-600',
      };
    case 'EXPIRADO':
    case 'VENCENDO':
      return {
        label: 'Vencendo / Requer Renovação',
        shortLabel: 'Vencendo / Renovação',
        bg: 'bg-[#eac652]/15 text-[#8a6e14] border-[#eac652]/40',
        badgeColor: 'text-[#8a6e14] bg-[#eac652]/15 border-[#eac652]/40',
        dot: 'bg-[#eac652]',
        iconColor: 'text-[#8a6e14]',
      };
    case 'PENDENTE':
    default:
      return {
        label: 'Pendente de Envio',
        shortLabel: 'Pendente',
        bg: 'bg-slate-100 text-slate-600 border-slate-200',
        badgeColor: 'text-slate-600 bg-slate-100 border-slate-200',
        dot: 'bg-slate-400',
        iconColor: 'text-slate-500',
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
        bg: 'bg-red-50 text-red-700 border-red-200',
        text: 'text-red-700',
      };
    case 'MEDIO':
      return {
        label: 'Atenção / Médio',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        text: 'text-amber-700',
      };
    case 'BAIXO':
      return {
        label: 'Regular / Baixo',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        text: 'text-emerald-700',
      };
  }
}
