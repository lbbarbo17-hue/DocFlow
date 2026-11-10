'use client';

import React, { useState } from 'react';
import {
  Upload,
  AlertCircle,
  FileText,
  Eye,
  Calendar,
  AlertTriangle,
  RotateCw,
  Search,
  ChevronDown,
} from 'lucide-react';
import { DocumentItem, StatusDocumento } from '@/lib/types';
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
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});

  const toggleDoc = (id: string) => {
    setExpandedDocs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getStatusCardStyle = (status: StatusDocumento) => {
    switch (status) {
      case 'APROVADO':
        return 'border border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-950/10';
      case 'EM_ANALISE':
      case 'EXPIRADO':
      case 'VENCENDO':
        return 'border border-amber-300 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-950/10';
      case 'RECUSADO':
        return 'border border-rose-300 bg-rose-50/50 dark:border-rose-500/30 dark:bg-rose-950/10';
      case 'PENDENTE':
      default:
        return 'border border-slate-300 bg-slate-50/50 dark:border-slate-700/60 dark:bg-slate-900/50';
    }
  };

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

  const tabs = [
    { id: 'ALL' as const, label: 'Todos', count: totalDocs },
    { id: 'PRINCIPAL' as const, label: 'Documentação Principal', count: essentialDocsCount },
    { id: 'COMPLEMENTARES' as const, label: 'Complementares', count: complementaryDocsCount },
    { id: 'PENDING' as const, label: 'Requer Atenção', count: pendingDocsCount, alert: true },
    { id: 'APPROVED' as const, label: 'Aprovados', count: approvedDocsCount, success: true },
  ];

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
      {/* Barra Superior: Filtro em Abas com Linha Inferior e Pesquisa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800">
        {/* Abas simples com linha inferior (border-b-2 border-[#085078]) */}
        <div className="flex items-center gap-6 overflow-x-auto min-w-0 max-w-full -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                scrollToTop('instant');
              }}
              className={`pb-3 text-xs sm:text-sm transition-all shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#085078] text-[#085078] dark:text-cyan-400 dark:border-cyan-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  activeTab === tab.id
                    ? 'bg-[#085078]/10 text-[#085078] dark:bg-cyan-500/20 dark:text-cyan-300'
                    : tab.alert && tab.count > 0
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                    : tab.success && tab.count > 0
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Campo de pesquisa integrado à direita */}
        <div className="pb-3 md:pb-2 w-full md:w-64 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar documento por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#085078] focus:border-[#085078] dark:focus:ring-cyan-500/40 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
            />
          </div>
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
            const isExpanded = !!expandedDocs[doc.id];
            const statusCardStyle = getStatusCardStyle(doc.status);

            // Badge de status correspondente
            const badgeClass = isApproved
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50'
              : isInReview || doc.status === 'VENCENDO' || doc.status === 'EXPIRADO'
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/50'
              : isRejected
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border-rose-300 dark:border-rose-800'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

            const dotClass = isApproved
              ? 'bg-emerald-500'
              : isInReview || doc.status === 'VENCENDO' || doc.status === 'EXPIRADO'
              ? 'bg-amber-500'
              : isRejected
              ? 'bg-rose-500'
              : 'bg-slate-400 dark:bg-slate-500';

            const badgeLabel = isApproved
              ? 'Aprovado'
              : isInReview
              ? 'Em Análise'
              : isRejected
              ? 'Recusado'
              : doc.status === 'EXPIRADO'
              ? 'Expirado'
              : doc.status === 'VENCENDO'
              ? 'Vencendo'
              : 'Pendente';

            return (
              <div
                key={doc.id}
                className={`rounded-xl ${statusCardStyle} shadow-xs overflow-hidden transition-all hover:shadow-sm`}
              >
                {/* 1. Cabeçalho Clicável (Estado Fechado / Base: Apenas Nome e Chevron) */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleDoc(doc.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleDoc(doc.id);
                    }
                  }}
                  aria-expanded={isExpanded}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                >
                  {/* Lado Esquerdo: Nome do documento em destaque */}
                  <div className="flex items-center min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-tight truncate">
                      {doc.nomeExibicao}
                    </h3>
                  </div>

                  {/* Lado Direito: Apenas Seta Chevron */}
                  <div
                    className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0"
                    aria-label={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                  >
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 shrink-0 ${
                        isExpanded ? 'rotate-180 text-slate-700 dark:text-slate-200' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* 2. Painel Interno Expansível (Accordion Body: Revela Badge, Ações e Detalhes) */}
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    isExpanded
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-3.5 border-t border-slate-200/60 dark:border-slate-800/60 space-y-4">
                      {/* Linha de Ações: Badge de Status e Botão de Ação Principal */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                            Status:
                          </span>
                          <span
                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
                            <span>{badgeLabel}</span>
                          </span>
                        </div>

                        {/* Botão de Ação Principal */}
                        <div>
                          {isApproved || isInReview ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveViewDoc(doc);
                              }}
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer active:scale-95 shrink-0"
                              title="Visualizar documento"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                              <span>Visualizar</span>
                            </button>
                          ) : isRejected ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveUploadDoc(doc);
                              }}
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-rose-200 dark:border-rose-800/80 bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100/80 dark:hover:bg-rose-900/50 transition-colors shadow-2xs cursor-pointer active:scale-95 shrink-0"
                              title="Substituir documento"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                              <span>Substituir</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveUploadDoc(doc);
                              }}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#085078] hover:bg-[#063c5a] text-white dark:bg-[#085078] dark:hover:bg-[#063c5a] dark:text-white shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
                              title="Enviar documento"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Enviar Agora</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Descrição do documento */}
                      {doc.descricao && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Descrição e Diretrizes
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {doc.descricao}
                          </p>
                        </div>
                      )}

                      {/* Observação condicional se houver */}
                      {doc.condicional && (
                        <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 p-2.5 rounded-lg">
                          <span className="font-semibold">Condição de aplicabilidade:</span> {doc.condicional}
                        </p>
                      )}

                      {/* Metadados: Data e Hora de Atualização */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span>
                            {doc.dataEnvio ? (
                              <>
                                Atualizado em{' '}
                                <strong className="font-semibold text-slate-700 dark:text-slate-200">
                                  {formatDateBr(doc.dataEnvio)}
                                </strong>
                              </>
                            ) : (
                              <span className="italic">Pendente de envio</span>
                            )}
                          </span>
                        </span>

                        {doc.nomeArquivoOriginal && (
                          <span className="inline-flex items-center gap-1.5 truncate max-w-[240px] sm:max-w-xs">
                            <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                            <span className="truncate">
                              Arquivo: <strong className="font-semibold text-slate-700 dark:text-slate-200">{doc.nomeArquivoOriginal}</strong>
                            </span>
                          </span>
                        )}

                        {doc.recorrente && (
                          <span
                            className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400"
                            title="Documento de renovação contínua"
                          >
                            <RotateCw className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                            <span>Recorrente</span>
                          </span>
                        )}

                        {doc.validadeAte && (
                          <span className="inline-flex items-center gap-1">
                            <span>
                              Validade:{' '}
                              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                                {formatDateBr(doc.validadeAte)}
                              </strong>
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Motivo de recusa ou observações da instituição (caso exista) */}
                      {doc.justificativaRecusa && (
                        <div className="p-3 bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 rounded-xl text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
                            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>Motivo da recusa / Correção necessária:</span>
                          </div>
                          <p className="text-rose-700 dark:text-rose-300 pl-5.5 leading-relaxed">
                            {doc.justificativaRecusa}
                          </p>
                        </div>
                      )}

                      {/* Observações da instituição (se houver) */}
                      {doc.observacaoValidade && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Observações da instituição:</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 pl-5.5 leading-relaxed">
                            {doc.observacaoValidade}
                          </p>
                        </div>
                      )}
                    </div>
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
