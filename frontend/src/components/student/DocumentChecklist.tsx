'use client';

import React, { useState } from 'react';
import {
  Upload,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  Eye,
  Calendar,
  AlertTriangle,
  RotateCw,
  Search,
} from 'lucide-react';
import { DocumentItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { formatDateBr, isDocumentApplicableForStudent, scrollToTop } from '@/lib/utils';
import UploadModal from './UploadModal';
import DocumentViewModal from './DocumentViewModal';

export default function DocumentChecklist() {
  const { student } = useApp();
  const [activeUploadDoc, setActiveUploadDoc] = useState<DocumentItem | null>(null);
  const [activeViewDoc, setActiveViewDoc] = useState<DocumentItem | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PRINCIPAL' | 'COMPLEMENTARES' | 'PENDING' | 'APPROVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const applicableDocs = student.documentos.filter((d) =>
    isDocumentApplicableForStudent(d.tipo, student)
  );

  const totalDocs = applicableDocs.length;
  const essentialDocsCount = applicableDocs.filter((d) => d.obrigatorio).length;
  const complementaryDocsCount = applicableDocs.filter((d) => !d.obrigatorio).length;
  const pendingDocsCount = applicableDocs.filter(
    (d) => d.status === 'PENDENTE' || d.status === 'RECUSADO' || d.status === 'EXPIRADO' || d.status === 'VENCENDO'
  ).length;
  const approvedDocsCount = applicableDocs.filter((d) => d.status === 'APROVADO').length;

  const filteredDocs = applicableDocs.filter((doc) => {
    // Tab filter
    if (activeTab === 'PRINCIPAL') {
      if (!doc.obrigatorio) return false;
    } else if (activeTab === 'COMPLEMENTARES') {
      if (doc.obrigatorio) return false;
    } else if (activeTab === 'PENDING') {
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
        (doc.nomeArquivoOriginal && doc.nomeArquivoOriginal.toLowerCase().includes(q)) ||
        (doc.condicional && doc.condicional.toLowerCase().includes(q))
      );
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Barra Superior Unificada: Filtro e Pesquisa */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs transition-colors duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Barra de Filtros Estilo Tabs Unificadas */}
        <div className="h-10 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl flex items-center gap-1 overflow-x-auto min-w-0 max-w-full">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ALL');
              scrollToTop('instant');
            }}
            className={`h-8 px-3 rounded-lg text-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#085078] hover:bg-[#063c5a] text-white dark:bg-[#085078] dark:hover:bg-[#063c5a] dark:text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 font-medium'
            }`}
          >
            <span>Todos</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'ALL'
                  ? 'bg-white/20 text-white dark:bg-white/20 dark:text-white font-bold'
                  : 'bg-slate-200/70 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              {totalDocs}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('PRINCIPAL');
              scrollToTop('instant');
            }}
            className={`h-8 px-3 rounded-lg text-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'PRINCIPAL'
                ? 'bg-[#085078] hover:bg-[#063c5a] text-white dark:bg-[#085078] dark:hover:bg-[#063c5a] dark:text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 font-medium'
            }`}
          >
            <span>Documentação Principal</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'PRINCIPAL'
                  ? 'bg-white/20 text-white dark:bg-white/20 dark:text-white font-bold'
                  : 'bg-slate-200/70 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              {essentialDocsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('COMPLEMENTARES');
              scrollToTop('instant');
            }}
            className={`h-8 px-3 rounded-lg text-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'COMPLEMENTARES'
                ? 'bg-[#085078] hover:bg-[#063c5a] text-white dark:bg-[#085078] dark:hover:bg-[#063c5a] dark:text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 font-medium'
            }`}
          >
            <span>Complementares</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'COMPLEMENTARES'
                  ? 'bg-white/20 text-white dark:bg-white/20 dark:text-white font-bold'
                  : 'bg-slate-200/70 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              {complementaryDocsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('PENDING');
              scrollToTop('instant');
            }}
            className={`h-8 px-3 rounded-lg text-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-[#085078] hover:bg-[#063c5a] text-white dark:bg-[#085078] dark:hover:bg-[#063c5a] dark:text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 font-medium'
            }`}
          >
            <span>Requer Atenção</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'PENDING'
                  ? 'bg-white/20 text-white dark:bg-white/20 dark:text-white font-bold'
                  : 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 font-bold'
              }`}
            >
              {pendingDocsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('APPROVED');
              scrollToTop('instant');
            }}
            className={`h-8 px-3 rounded-lg text-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'APPROVED'
                ? 'bg-[#085078] hover:bg-[#063c5a] text-white dark:bg-[#085078] dark:hover:bg-[#063c5a] dark:text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 font-medium'
            }`}
          >
            <span>Aprovados</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'APPROVED'
                  ? 'bg-white/20 text-white dark:bg-white/20 dark:text-white font-bold'
                  : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold'
              }`}
            >
              {approvedDocsCount}
            </span>
          </button>
        </div>

        {/* Campo de pesquisa integrado à direita com ícone discreto e altura h-10 perfeitamente alinhada */}
        <div className="relative w-full md:w-64 lg:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar documento por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#085078]/20 focus:border-[#085078] dark:focus:ring-[#085078]/30 dark:focus:border-[#085078] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium transition-all"
          />
        </div>
      </div>

      {/* Document Cards List */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Nenhum documento encontrado</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tente ajustar seus filtros ou termo de busca.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isApproved = doc.status === 'APROVADO';
            const isInReview = doc.status === 'EM_ANALISE';
            const isRejected = doc.status === 'RECUSADO';
            const isExpiringOrExpired =
              doc.status === 'EXPIRADO' ||
              doc.status === 'VENCENDO' ||
              (doc.diasParaVencer !== undefined && doc.diasParaVencer <= 30);

            // Borda lateral de status (border-l-4) combinando com a badge
            const statusBorder = isApproved
              ? 'border-l-emerald-500'
              : isInReview
              ? 'border-l-amber-500'
              : 'border-l-rose-500';

            // Ícone circular com suave opacidade
            const iconContainerClass = isApproved
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : isInReview
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400';

            // Badge de status correspondente
            const badgeClass = isApproved
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50'
              : isInReview
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/50'
              : isRejected
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border-rose-300 dark:border-rose-800'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/70 dark:border-rose-900/40';

            const dotClass = isApproved
              ? 'bg-emerald-500'
              : isInReview
              ? 'bg-amber-500'
              : 'bg-rose-500';

            const badgeLabel = isApproved
              ? 'Aprovado'
              : isInReview
              ? 'Em Análise'
              : isRejected
              ? 'Recusado'
              : 'Pendente';

            return (
              <div
                key={doc.id}
                className={`bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-l-4 p-4 sm:p-5 transition-all hover:shadow-md ${statusBorder}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Icon & Main Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Status Icon em Círculo com Suave Opacidade */}
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 ${iconContainerClass}`}
                    >
                      {isApproved ? (
                        <CheckCircle2 className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                      ) : isInReview ? (
                        <Clock className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                      ) : isRejected ? (
                        <AlertCircle className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                      ) : isExpiringOrExpired ? (
                        <AlertTriangle className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                      ) : (
                        <FileText className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                      )}
                    </div>

                    {/* Information */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Title */}
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-tight">
                        {doc.nomeExibicao}
                      </h4>

                      {/* Descrição */}
                      {doc.descricao && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {doc.descricao}
                        </p>
                      )}

                      {/* Metadados: Data de Envio & Recorrente discreto */}
                      {(doc.dataEnvio || doc.recorrente) && (
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                          {doc.dataEnvio && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              <span>Atualizado em {formatDateBr(doc.dataEnvio)}</span>
                            </span>
                          )}
                          {doc.dataEnvio && doc.recorrente && (
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                          )}
                          {doc.recorrente && (
                            <span
                              className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400"
                              title="Documento de renovação contínua"
                            >
                              <RotateCw className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                              <span>Recorrente</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Rejection alert box */}
                      {isRejected && doc.justificativaRecusa && (
                        <div className="mt-2.5 p-3 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 rounded-xl text-xs text-rose-800 dark:text-rose-200 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
                            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>Motivo da recusa / Correção necessária:</span>
                          </div>
                          <p className="text-rose-700 dark:text-rose-300 pl-5.5">{doc.justificativaRecusa}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Status Badge & Quick Action Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 shrink-0">
                    {/* Status Badge alinhada à direita em coluna limpa */}
                    <span
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 min-w-[105px] text-center ${badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
                      <span>{badgeLabel}</span>
                    </span>

                    {/* Botão de Ação */}
                    {isApproved || isInReview ? (
                      <button
                        type="button"
                        onClick={() => setActiveViewDoc(doc)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs cursor-pointer active:scale-95 shrink-0"
                        title="Visualizar documento"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>Visualizar</span>
                      </button>
                    ) : isRejected ? (
                      <button
                        type="button"
                        onClick={() => setActiveUploadDoc(doc)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs cursor-pointer active:scale-95 shrink-0"
                        title="Substituir documento"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Substituir</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveUploadDoc(doc)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#085078] hover:bg-[#063c5a] text-white dark:bg-[#085078] dark:hover:bg-[#063c5a] dark:text-white shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
                        title="Enviar documento"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Enviar Agora</span>
                      </button>
                    )}
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
