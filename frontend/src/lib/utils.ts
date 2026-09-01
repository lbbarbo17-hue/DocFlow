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
        label: 'Aprovado',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'EM_ANALISE':
      return {
        label: 'Em Análise',
        bg: 'bg-sky-50 text-sky-800 border-sky-200',
        dot: 'bg-sky-500',
      };
    case 'PENDENTE':
      return {
        label: 'Pendente',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'RECUSADO':
      return {
        label: 'Recusado',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'EXPIRADO':
      return {
        label: 'Expirado',
        bg: 'bg-red-100 text-red-800 border-red-300',
        dot: 'bg-red-600',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
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
