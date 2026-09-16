'use client';

import React, { useState } from 'react';
import {
  Upload,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  Eye,
  Lock,
  RefreshCw,
  Calendar,
  AlertTriangle,
  RotateCw,
  Search,
} from 'lucide-react';
import { DocumentItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { getStatusBadgeConfig, formatDateBr, formatBytes } from '@/lib/utils';
import UploadModal from './UploadModal';
import DocumentViewModal from './DocumentViewModal';

export default function DocumentChecklist() {
  const { student } = useApp();
  const [activeUploadDoc, setActiveUploadDoc] = useState<DocumentItem | null>(null);
  const [activeViewDoc, setActiveViewDoc] = useState<DocumentItem | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const totalDocs = student.documentos.length;
  const pendingDocsCount = student.documentos.filter(
    (d) => d.status === 'PENDENTE' || d.status === 'RECUSADO' || d.status === 'EXPIRADO' || d.status === 'VENCENDO'
  ).length;
  const approvedDocsCount = student.documentos.filter((d) => d.status === 'APROVADO').length;

  const filteredDocs = student.documentos.filter((doc) => {
    // Tab filter
    if (activeTab === 'PENDING') {
      const isPending =
        doc.status === 'PENDENTE' ||
        doc.status === 'RECUSADO' ||
        doc.status === 'EXPIRADO' ||
        doc.status === 'VENCENDO';
      if (!isPending) return false;
    } else if (activeTab === 'APPROVED') {
      if (doc.status !== 'APROVADO') return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.nomeExibicao.toLowerCase().includes(q) ||
        doc.descricao.toLowerCase().includes(q) ||
        (doc.nomeArquivoOriginal && doc.nomeArquivoOriginal.toLowerCase().includes(q))
      );
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls for Mobile & Desktop */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#065373] dark:text-cyan-400" />
              Checklist de Documentos Obrigatórios
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Guarda digital, conferência contínua e conformidade LGPD
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-[#065373] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>Todos os Documentos</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {totalDocs}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>Requer Atenção</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'PENDING' ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
              }`}
            >
              {pendingDocsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('APPROVED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>Aprovados</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'APPROVED' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {approvedDocsCount}
            </span>
          </button>
        </div>
      </div>

      {/* Document Cards List */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Nenhum documento encontrado</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tente ajustar seus filtros ou termo de busca.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const badge = getStatusBadgeConfig(doc.status);
            const isApproved = doc.status === 'APROVADO';
            const isInReview = doc.status === 'EM_ANALISE';
            const isRejected = doc.status === 'RECUSADO';
            const isExpiringOrExpired = doc.status === 'EXPIRADO' || doc.status === 'VENCENDO';
            const hasUploadedFile = !!doc.nomeArquivoOriginal || isApproved || isInReview;

            return (
              <div
                key={doc.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border shadow-sm transition-all hover:shadow-md ${
                  isRejected
                    ? 'border-rose-300 dark:border-rose-800/60 bg-rose-50/20 dark:bg-rose-950/20'
                    : isExpiringOrExpired
                    ? 'border-[#eac652]/50 dark:border-[#eac652]/30 bg-[#eac652]/10 dark:bg-[#eac652]/15'
                    : isInReview
                    ? 'border-orange-200 dark:border-orange-800/50 bg-orange-50/10 dark:bg-orange-950/10'
                    : isApproved
                    ? 'border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Icon & Main Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Status Icon */}
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        isApproved
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : isInReview
                          ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300'
                          : isRejected
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : isExpiringOrExpired
                          ? 'bg-[#eac652]/20 dark:bg-[#eac652]/20 text-[#8a6e14] dark:text-[#eac652]'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {isApproved ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : isInReview ? (
                        <Clock className="w-6 h-6" />
                      ) : isRejected ? (
                        <AlertCircle className="w-6 h-6" />
                      ) : isExpiringOrExpired ? (
                        <AlertTriangle className="w-6 h-6" />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                    </div>

                    {/* Information */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Title & Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                          {doc.nomeExibicao}
                        </h4>

                        {/* Status Badge with 5 distinct colors */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isApproved
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                              : isInReview
                              ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60'
                              : isRejected
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                              : isExpiringOrExpired
                              ? 'bg-[#eac652]/15 dark:bg-[#eac652]/20 text-[#8a6e14] dark:text-[#fef08a] border-[#eac652]/40 dark:border-[#eac652]/40'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>

                        {/* LGPD Protection indicator */}
                        {doc.protecaoLgpd && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-cyan-950/50 text-[#065373] dark:text-cyan-300 border border-sky-200 dark:border-cyan-800/60"
                            title="Protegido por Criptografia e Anonimização LGPD (Art. 6º, III)"
                          >
                            <Lock className="w-3 h-3 text-[#065373] dark:text-cyan-300" />
                            <span>Proteção LGPD</span>
                          </span>
                        )}

                        {/* Recorrente tag */}
                        {doc.recorrente && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60"
                            title="Documento de renovação semestral contínua"
                          >
                            <RefreshCw className="w-3 h-3 text-[#065373] dark:text-cyan-300" />
                            <span>Recorrente Semestral</span>
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {doc.descricao}
                      </p>

                      {/* Observations / Validity info */}
                      {doc.observacaoValidade && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>{doc.observacaoValidade}</span>
                        </p>
                      )}

                      {/* Rejection alert box */}
                      {isRejected && doc.justificativaRecusa && (
                        <div className="mt-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-800 dark:text-rose-200 space-y-0.5">
                          <div className="flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>Motivo da recusa / Correção necessária:</span>
                          </div>
                          <p className="text-rose-700 dark:text-rose-300 pl-4">{doc.justificativaRecusa}</p>
                        </div>
                      )}

                      {/* Upload metadata: filename, date */}
                      {doc.nomeArquivoOriginal && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                          <span className="flex items-center gap-1 font-mono font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                            <FileText className="w-3 h-3 text-slate-400" />
                            {doc.nomeArquivoOriginal}
                          </span>
                          {doc.tamanhoBytes && (
                            <span className="font-mono text-slate-400 dark:text-slate-500">
                              ({formatBytes(doc.tamanhoBytes)})
                            </span>
                          )}
                          {doc.dataEnvio && (
                            <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                              <Calendar className="w-3 h-3" />
                              Atualizado em {formatDateBr(doc.dataEnvio)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons (Mobile-first ergonomically placed) */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                    {/* Visualizar Documento Button (if uploaded) */}
                    {hasUploadedFile && (
                      <button
                        type="button"
                        onClick={() => setActiveViewDoc(doc)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
                        title="Visualizar documento e conformidade LGPD"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                        <span>Visualizar</span>
                      </button>
                    )}

                    {/* Upload / Replace Action Button */}
                    <button
                      type="button"
                      onClick={() => setActiveUploadDoc(doc)}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
                        isApproved
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                          : isRejected || isExpiringOrExpired
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 dark:shadow-none'
                          : isInReview
                          ? 'bg-[#065373] dark:bg-cyan-700 hover:bg-[#043c53] dark:hover:bg-cyan-800 text-white shadow-[#065373]/20'
                          : 'bg-[#065373] dark:bg-cyan-700 hover:bg-[#043c53] dark:hover:bg-cyan-800 text-white shadow-md'
                      }`}
                    >
                      {hasUploadedFile ? (
                        <>
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Substituir</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Enviar Agora</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Modal */}
      {activeUploadDoc && (
        <UploadModal
          document={activeUploadDoc}
          onClose={() => setActiveUploadDoc(null)}
        />
      )}

      {/* Secure Document Viewer Modal */}
      {activeViewDoc && (
        <DocumentViewModal
          document={activeViewDoc}
          onClose={() => setActiveViewDoc(null)}
          onReplace={(doc) => {
            setActiveViewDoc(null);
            setActiveUploadDoc(doc);
          }}
        />
      )}
    </div>
  );
}
