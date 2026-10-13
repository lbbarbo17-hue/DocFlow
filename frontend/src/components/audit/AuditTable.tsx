'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  UploadCloud,
  Clock,
  LayoutList,
  Calendar,
  Filter,
  RotateCcw,
  Check,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { AuditLog } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import AuditDetailModal, { getActionDisplayInfo, getRoleDisplay } from './AuditDetailModal';

type FilterCategory = 'ALL' | 'APPROVALS' | 'UPLOADS' | 'REJECTIONS' | 'VIEWS' | 'DOWNLOADS';
type ViewMode = 'TIMELINE' | 'TABLE';

export default function AuditTable() {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('TIMELINE');
  const [inspectingLog, setInspectingLog] = useState<AuditLog | null>(null);

  // Friendly filtering
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // 1. Category Filter
      if (activeCategory === 'APPROVALS' && log.action !== 'DOCUMENT_APPROVAL') return false;
      if (activeCategory === 'REJECTIONS' && log.action !== 'DOCUMENT_REJECTION') return false;
      if (
        activeCategory === 'UPLOADS' &&
        log.action !== 'DOCUMENT_UPLOAD' &&
        log.action !== 'SYSTEM_MAGIC_BYTES_VALIDATION'
      )
        return false;
      if (
        activeCategory === 'VIEWS' &&
        log.action !== 'DOCUMENT_VIEW_REDACTED' &&
        log.action !== 'DOCUMENT_VIEW_UNMASKED'
      )
        return false;
      if (activeCategory === 'DOWNLOADS' && log.action !== 'DOSSIER_BULK_DOWNLOAD') return false;

      // 2. Search Term Filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const actionInfo = getActionDisplayInfo(log.action);
        const matchesUser = log.userNome.toLowerCase().includes(term);
        const matchesResource = log.resourceTipo.toLowerCase().includes(term);
        const matchesDetails = (log.detalhes || '').toLowerCase().includes(term);
        const matchesActionLabel = actionInfo.label.toLowerCase().includes(term);

        if (!matchesUser && !matchesResource && !matchesDetails && !matchesActionLabel) {
          return false;
        }
      }

      return true;
    });
  }, [auditLogs, activeCategory, searchTerm]);

  // Metric counts
  const totalCount = auditLogs.length;
  const approvalsCount = auditLogs.filter((l) => l.action === 'DOCUMENT_APPROVAL').length;
  const uploadsCount = auditLogs.filter(
    (l) => l.action === 'DOCUMENT_UPLOAD' || l.action === 'SYSTEM_MAGIC_BYTES_VALIDATION'
  ).length;
  const rejectionsCount = auditLogs.filter((l) => l.action === 'DOCUMENT_REJECTION').length;

  // Group logs by day for timeline view
  const groupedLogs = useMemo(() => {
    const groups: { [key: string]: AuditLog[] } = {};

    filteredLogs.forEach((log) => {
      const date = new Date(log.timestampUtc);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Hoje';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Ontem';
      } else {
        groupKey = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(log);
    });

    return groups;
  }, [filteredLogs]);

  // Export to Excel-compatible Spreadsheet (CSV with BOM and semicolon)
  const handleExportExcel = () => {
    const headers = [
      'Data e Horário',
      'Responsável',
      'Função',
      'Atividade',
      'Documento ou Item',
      'Observações',
      'Situação',
    ];

    const escapeCsv = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

    const rows = filteredLogs.map((log) => {
      const actionInfo = getActionDisplayInfo(log.action);
      return [
        escapeCsv(new Date(log.timestampUtc).toLocaleString('pt-BR')),
        escapeCsv(log.userNome),
        escapeCsv(getRoleDisplay(log.userRole)),
        escapeCsv(actionInfo.label),
        escapeCsv(log.resourceTipo),
        escapeCsv(log.detalhes || 'Sem observações adicionais'),
        escapeCsv('Concluído'),
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.setAttribute(
      'download',
      `docflow_historico_atividades_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const hasActiveFilters = searchTerm.trim() !== '' || activeCategory !== 'ALL';

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total de Atividades
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalCount}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">Registros salvos</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Clock className="w-5 h-5 text-[#0284c7]" />
          </div>
        </div>

        {/* Aprovações */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Aprovações
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {approvalsCount}
            </p>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-500 font-medium">
              Documentos aceitos
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Envios */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Envios de Arquivos
            </span>
            <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-0.5">
              {uploadsCount}
            </p>
            <span className="text-[11px] text-sky-700 dark:text-sky-500 font-medium">
              Recebidos dos alunos
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <UploadCloud className="w-5 h-5" />
          </div>
        </div>

        {/* Recusas */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Recusas de Documentos
            </span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
              {rejectionsCount}
            </p>
            <span className="text-[11px] text-rose-700 dark:text-rose-500 font-medium">
              Ajustes solicitados
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search + Category Pills + View Switcher */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Top row: Search + View Switcher + Export */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por pessoa, documento ou ação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373]/20 focus:border-[#065373] font-medium transition-all"
            />
          </div>

          {/* Right controls: View toggle & Export */}
          <div className="flex items-center gap-2 justify-between md:justify-end">
            {/* View Mode Toggle */}
            <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('TIMELINE')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'TIMELINE'
                    ? 'bg-white dark:bg-slate-700 text-[#065373] dark:text-cyan-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Ver como Linha do Tempo"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Linha do Tempo</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'TABLE'
                    ? 'bg-white dark:bg-slate-700 text-[#065373] dark:text-cyan-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Ver como Tabela"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Tabela</span>
              </button>
            </div>

            {/* Excel Export Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-bold text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
              title="Baixar histórico formatado em planilha do Excel (.csv)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Baixar Planilha (Excel)</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              title="Imprimir histórico ou salvar como PDF"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="hidden lg:inline">Imprimir</span>
            </button>
          </div>
        </div>

        {/* Bottom row: Filter chips */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
              Filtrar por:
            </span>

            {[
              { id: 'ALL', label: 'Todas as Ações' },
              { id: 'APPROVALS', label: 'Aprovações' },
              { id: 'UPLOADS', label: 'Envios' },
              { id: 'REJECTIONS', label: 'Recusas' },
              { id: 'VIEWS', label: 'Visualizações' },
              { id: 'DOWNLOADS', label: 'Downloads' },
            ].map((tab) => {
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id as FilterCategory)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#065373] text-white shadow-xs dark:bg-cyan-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('ALL');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#065373] dark:text-cyan-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Timeline View or Table View */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="flex flex-col items-center justify-center space-y-2.5 max-w-sm mx-auto">
            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Filter className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Nenhuma atividade encontrada
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Não encontramos nenhum registro correspondente à sua busca ou filtro selecionado.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('ALL');
                }}
                className="mt-2 px-4 py-2 text-xs font-bold text-white bg-[#065373] hover:bg-[#08668d] rounded-xl transition-colors cursor-pointer"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'TIMELINE' ? (
        /* ================= Linha do Tempo (Timeline Feed) ================= */
        <div className="space-y-6">
          {Object.entries(groupedLogs).map(([groupDate, logs]) => (
            <div key={groupDate} className="space-y-3">
              {/* Date Group Header */}
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-[#065373]/10 dark:bg-cyan-950/60 text-[#065373] dark:text-cyan-300">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {groupDate}
                </h3>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 ml-2" />
                <span className="text-[11px] font-semibold text-slate-400">
                  {logs.length} {logs.length === 1 ? 'atividade' : 'atividades'}
                </span>
              </div>

              {/* Items in Day */}
              <div className="relative pl-6 sm:pl-8 space-y-3 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {logs.map((log) => {
                  const actionInfo = getActionDisplayInfo(log.action);
                  const ActionIcon = actionInfo.icon;
                  const roleDisplay = getRoleDisplay(log.userRole);
                  const time = new Date(log.timestampUtc).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const initials = log.userNome
                    .replace(/^(Profª\.|Prof\.|Dr\.|Dra\.)\s*/, '')
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={log.id}
                      className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:border-[#0284c7]/50 transition-all group"
                    >
                      {/* Timeline Dot Indicator */}
                      <div
                        className={`absolute -left-[31px] sm:-left-[39px] top-4 w-7 h-7 rounded-full ${actionInfo.badgeBg} text-white flex items-center justify-center shadow-xs ring-4 ring-white dark:ring-slate-950`}
                      >
                        <ActionIcon className="w-3.5 h-3.5" />
                      </div>

                      {/* Card Content */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        {/* Main info */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          {/* User & Time header */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {initials}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                              {log.userNome}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {roleDisplay}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              às {time}
                            </span>
                          </div>

                          {/* Action phrase */}
                          <div className="text-xs text-slate-800 dark:text-slate-200">
                            <span className="font-semibold text-slate-600 dark:text-slate-400">
                              {actionInfo.actionVerb}:{' '}
                            </span>
                            <span className="font-black text-slate-900 dark:text-white">
                              {log.resourceTipo}
                            </span>
                          </div>

                          {/* Friendly note / description */}
                          {log.detalhes && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                              {log.detalhes}
                            </p>
                          )}
                        </div>

                        {/* Right side: Action badge & details button */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${actionInfo.color}`}
                          >
                            <ActionIcon className="w-3 h-3 shrink-0" />
                            <span>{actionInfo.label}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => setInspectingLog(log)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#065373] dark:text-cyan-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver detalhes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================= Tabela Simplificada ================= */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3.5 px-5">Data e Horário</th>
                  <th className="py-3.5 px-5">Quem realizou</th>
                  <th className="py-3.5 px-5">Atividade</th>
                  <th className="py-3.5 px-5">Documento ou Item</th>
                  <th className="py-3.5 px-5 text-center">Situação</th>
                  <th className="py-3.5 px-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => {
                  const actionInfo = getActionDisplayInfo(log.action);
                  const ActionIcon = actionInfo.icon;
                  const roleDisplay = getRoleDisplay(log.userRole);
                  const formattedDateTime = new Date(log.timestampUtc).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Data e Horário */}
                      <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">
                        {formattedDateTime}
                      </td>

                      {/* Quem realizou */}
                      <td className="py-3.5 px-5">
                        <p className="font-bold text-slate-900 dark:text-white">{log.userNome}</p>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          {roleDisplay}
                        </span>
                      </td>

                      {/* Atividade */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${actionInfo.color}`}
                        >
                          <ActionIcon className="w-3 h-3 shrink-0" />
                          <span>{actionInfo.label}</span>
                        </span>
                      </td>

                      {/* Documento ou Item */}
                      <td className="py-3.5 px-5 max-w-xs truncate">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {log.resourceTipo}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {log.detalhes}
                        </p>
                      </td>

                      {/* Situação */}
                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <Check className="w-3 h-3" />
                          <span>Concluído</span>
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setInspectingLog(log)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#065373] dark:text-cyan-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver detalhes</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Details Modal */}
      {inspectingLog && (
        <AuditDetailModal log={inspectingLog} onClose={() => setInspectingLog(null)} />
      )}
    </div>
  );
}

