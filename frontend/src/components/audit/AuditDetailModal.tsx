'use client';

import React from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  UploadCloud,
  Eye,
  Download,
  FileText,
  User,
  Calendar,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { AuditLog } from '@/lib/types';

interface AuditDetailModalProps {
  log: AuditLog | null;
  onClose: () => void;
}

export function getActionDisplayInfo(action: string) {
  switch (action) {
    case 'DOCUMENT_APPROVAL':
      return {
        label: 'Documento Aprovado',
        color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
        badgeBg: 'bg-emerald-600',
        icon: CheckCircle2,
        actionVerb: 'Aprovou o documento',
      };
    case 'DOCUMENT_REJECTION':
      return {
        label: 'Documento Recusado',
        color: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
        badgeBg: 'bg-rose-600',
        icon: XCircle,
        actionVerb: 'Recusou o documento',
      };
    case 'DOCUMENT_UPLOAD':
    case 'SYSTEM_MAGIC_BYTES_VALIDATION':
      return {
        label: 'Documento Enviado',
        color: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800',
        badgeBg: 'bg-sky-600',
        icon: UploadCloud,
        actionVerb: 'Enviou um documento',
      };
    case 'DOCUMENT_VIEW_REDACTED':
    case 'DOCUMENT_VIEW_UNMASKED':
      return {
        label: 'Documento Visualizado',
        color: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
        badgeBg: 'bg-purple-600',
        icon: Eye,
        actionVerb: 'Visualizou o documento',
      };
    case 'DOSSIER_BULK_DOWNLOAD':
      return {
        label: 'Download de Documentos',
        color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
        badgeBg: 'bg-amber-600',
        icon: Download,
        actionVerb: 'Baixou documentos',
      };
    default:
      return {
        label: 'Atualização no Sistema',
        color: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
        badgeBg: 'bg-slate-600',
        icon: FileText,
        actionVerb: 'Realizou uma ação no sistema',
      };
  }
}

export function getRoleDisplay(role: string): string {
  switch (role) {
    case 'COORDENADOR':
      return 'Coordenador(a)';
    case 'SUPERADMIN':
      return 'Super Administrador';
    case 'ESTUDANTE':
      return 'Estudante';
    default:
      return role;
  }
}

export default function AuditDetailModal({ log, onClose }: AuditDetailModalProps) {
  if (!log) return null;

  const actionInfo = getActionDisplayInfo(log.action);
  const ActionIcon = actionInfo.icon;
  const roleDisplay = getRoleDisplay(log.userRole);

  const formattedDate = new Date(log.timestampUtc).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = new Date(log.timestampUtc).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-sans transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#065373] to-[#0284c7] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <Clock className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">Detalhes da Atividade</h3>
              <p className="text-xs text-cyan-100">Registro simples de ação no sistema</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Action Badge & Summary */}
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${actionInfo.badgeBg} text-white shrink-0`}>
                <ActionIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Ação Realizada
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {actionInfo.label}
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${actionInfo.color}`}
            >
              Concluído
            </span>
          </div>

          {/* Key Activity Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Quem realizou */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#00b4d8]" />
                Quem realizou:
              </span>
              <p className="font-black text-slate-900 dark:text-white text-sm">
                {log.userNome}
              </p>
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0284c7]/10 dark:bg-cyan-950/70 text-[#0284c7] dark:text-cyan-300">
                {roleDisplay}
              </span>
            </div>

            {/* Quando aconteceu */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#00b4d8]" />
                Quando aconteceu:
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm capitalize">
                {formattedDate}
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                às {formattedTime}
              </span>
            </div>
          </div>

          {/* Item ou Documento Envolvido */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-1 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#00b4d8]" />
              Documento ou Item Envolvido:
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {log.resourceTipo}
            </p>
          </div>

          {/* Observações / Descrição Clara */}
          {log.detalhes && (
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 space-y-1 text-xs">
              <span className="text-[#065373] dark:text-cyan-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#00b4d8]" />
                Observação / Detalhes:
              </span>
              <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                {log.detalhes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#065373] hover:bg-[#08668d] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
