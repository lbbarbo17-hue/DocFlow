'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Download,
  Eye,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import { AuditLog } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import AuditDetailModal from './AuditDetailModal';

export default function AuditTable() {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [inspectingLog, setInspectingLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceTipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm) ||
      log.sha256Hash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `docflow_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-[#065373] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-300" />
            <h2 className="text-lg font-bold">Trilha Forense de Auditoria Imutável (Append-Only)</h2>
          </div>
          <p className="text-xs text-cyan-100/80">
            Conformidade estrita com o Art. 6º da LGPD. Todos os eventos de visualização, validação e custódia são irreversivelmente registrados.
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="px-4 py-2.5 rounded-xl bg-white text-[#065373] font-bold text-xs hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-sm shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Trilha (JSON)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por operador, IP, hash SHA-256 ou recurso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#065373]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#065373]"
          >
            <option value="ALL">Todas as Ações</option>
            <option value="DOCUMENT_UPLOAD">Upload de Documento</option>
            <option value="DOCUMENT_APPROVAL">Aprovação de Documento</option>
            <option value="DOCUMENT_REJECTION">Recusa de Documento</option>
            <option value="DOCUMENT_VIEW_REDACTED">Visualização Tarjada LGPD</option>
            <option value="DOSSIER_BULK_DOWNLOAD">Download em Lote</option>
            <option value="SYSTEM_MAGIC_BYTES_VALIDATION">Inspeção Magic Bytes</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-5">Timestamp (UTC)</th>
                <th className="py-3 px-5">Operador / Papel</th>
                <th className="py-3 px-5">Ação Executada</th>
                <th className="py-3 px-5">Recurso / Contexto</th>
                <th className="py-3 px-5 font-mono">Endereço IP</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right">Forense</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.map((log) => {
                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors font-sans">
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {new Date(log.timestampUtc).toLocaleString('pt-BR')}
                    </td>

                    <td className="py-3.5 px-5">
                      <div>
                        <p className="font-bold text-slate-900">{log.userNome}</p>
                        <span className="text-[10px] font-mono text-[#065373] bg-[#065373]/10 px-1.5 py-0.2 rounded font-semibold">
                          {log.userRole}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-[11px] font-semibold text-slate-800">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-5 max-w-xs truncate">
                      <p className="font-semibold text-slate-800 truncate">{log.resourceTipo}</p>
                      <p className="text-[10px] text-slate-400 truncate">{log.detalhes}</p>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-slate-600 text-[11px]">
                      {log.ipAddress}
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.status === 'BLOCKED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {log.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                        {log.status === 'BLOCKED' && <AlertOctagon className="w-3 h-3" />}
                        <span>{log.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setInspectingLog(log)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Inspecionar</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensics Modal */}
      {inspectingLog && (
        <AuditDetailModal
          log={inspectingLog}
          onClose={() => setInspectingLog(null)}
        />
      )}
    </div>
  );
}
