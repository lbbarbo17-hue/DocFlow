'use client';

import React from 'react';
import { X, Fingerprint, Lock } from 'lucide-react';
import { AuditLog } from '@/lib/types';

interface AuditDetailModalProps {
  log: AuditLog | null;
  onClose: () => void;
}

export default function AuditDetailModal({ log, onClose }: AuditDetailModalProps) {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn font-sans">
        {/* Header */}
        <div className="bg-[#065373] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Fingerprint className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Registro Forense de Auditoria</h3>
              <p className="text-xs text-cyan-100 font-mono">ID: {log.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block font-medium">Data e Hora (UTC):</span>
              <span className="font-mono font-bold text-slate-800">
                {new Date(log.timestampUtc).toLocaleString('pt-BR')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Endereço IP de Origem:</span>
              <span className="font-mono font-bold text-slate-800">{log.ipAddress}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Operador Responsável:</span>
              <span className="font-bold text-slate-800">{log.userNome}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Papel (RBAC):</span>
              <span className="font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                {log.userRole}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              Ação Executada:
            </span>
            <div className="p-3 bg-slate-100 rounded-xl font-mono text-slate-800 font-semibold">
              {log.action}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              Recurso Acessado / Descrição:
            </span>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
              <p className="font-bold text-slate-900">{log.resourceTipo}</p>
              <p className="mt-1 text-slate-600">{log.detalhes}</p>
            </div>
          </div>

          {/* Cryptographic SHA-256 Hash Verification */}
          <div className="p-4 bg-slate-950 text-slate-200 rounded-xl space-y-2 font-mono text-[11px] border border-slate-800">
            <div className="flex items-center justify-between text-cyan-400 font-bold text-xs">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Hash Criptográfico SHA-256 (Integridade)</span>
              </div>
              <span className="text-emerald-400 text-[10px]">Append-Only</span>
            </div>
            <p className="text-slate-300 break-all bg-slate-900 p-2.5 rounded border border-slate-800">
              {log.sha256Hash}
            </p>
            {log.storageUuid && (
              <p className="text-[10px] text-slate-400">
                Storage UUID: <span className="text-emerald-400">{log.storageUuid}</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Fechar Inspeção
          </button>
        </div>
      </div>
    </div>
  );
}
