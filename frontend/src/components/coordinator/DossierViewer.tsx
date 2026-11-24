'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Eye,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Student, DocumentItem, NivelRisco, StatusDocumento } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { formatBytes } from '@/lib/utils';
import { documentosApi } from '@/lib/api';

interface DossierViewerProps {
  student: Student;
  initialDocId?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

function getStudentStatusBadge(risk: NivelRisco) {
  switch (risk) {
    case 'CRITICO':
      return {
        label: 'Crítico',
        className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      };
    case 'MEDIO':
      return {
        label: 'Atenção',
        className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      };
    case 'BAIXO':
    default:
      return {
        label: 'Em Dia',
        className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      };
  }
}

function getDocStatusBadge(status: StatusDocumento) {
  switch (status) {
    case 'APROVADO':
      return {
        label: 'Aprovado',
        className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      };
    case 'EM_ANALISE':
      return {
        label: 'Em Análise',
        className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      };
    case 'RECUSADO':
      return {
        label: 'Recusado',
        className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      };
    case 'EXPIRADO':
    case 'VENCENDO':
      return {
        label: 'Requer Renovação',
        className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      };
    case 'PENDENTE':
    default:
      return {
        label: 'Pendente',
        className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      };
  }
}

function getShortDocName(doc: DocumentItem): string {
  switch (doc.tipo) {
    case 'RG':
      return 'RG';
    case 'CPF':
      return 'CPF';
    case 'COMPROVANTE_RESIDENCIA':
      return 'Residência';
    case 'COMPROVANTE_MATRICULA':
      return 'Matrícula';
    case 'CONTRATO_TCE':
      return doc.nomeExibicao.toLowerCase().includes('aprendizagem') ? 'Contrato' : 'TCE';
    case 'DOC_RESPONSAVEL':
      return 'Responsável';
    case 'TITULO_ELEITOR':
      return 'Título de Eleitor';
    case 'CERTIFICADO_RESERVISTA':
      return 'Reservista';
    case 'CARTEIRA_TRABALHO':
      return 'CTPS';
    case 'DADOS_BANCARIOS':
      return 'Dados Bancários';
    case 'APOLICE_SEGURO':
      return 'Apólice';
    default:
      return doc.nomeExibicao.length > 22
        ? `${doc.nomeExibicao.slice(0, 20)}...`
        : doc.nomeExibicao;
  }
}

export default function DossierViewer({
  student,
  initialDocId,
  onEdit,
  onDelete,
}: DossierViewerProps) {
  const { addAuditEntry, setToastMessage, currentRole, evaluateDocument } = useApp();
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | undefined>(() => {
    if (initialDocId) {
      const found = student.documentos.find((d) => d.id === initialDocId);
      if (found) return found;
    }
    return student.documentos[0];
  });

  useEffect(() => {
    if (initialDocId) {
      const target = student.documentos.find((d) => d.id === initialDocId);
      if (target) {
        setSelectedDoc(target);
        return;
      }
    }
    setSelectedDoc((prev) => {
      const currentStillExists = student.documentos.find((d) => d.id === prev?.id);
      return currentStillExists || student.documentos[0];
    });
  }, [student, initialDocId]);

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isOpeningFile, setIsOpeningFile] = useState(false);

  useEffect(() => {
    setIsRejecting(false);
    setRejectionReason('');
  }, [student.id, selectedDoc?.id]);

  const handleConfirmReject = () => {
    if (!selectedDoc || !rejectionReason.trim()) return;
    evaluateDocument(student.id, selectedDoc.id, 'RECUSADO', rejectionReason.trim());
    setIsRejecting(false);
    setRejectionReason('');
  };

  const handleViewDocumentFile = async (doc: DocumentItem) => {
    setIsOpeningFile(true);
    try {
      const res = await documentosApi.getDownloadUrl(doc.id);
      if (res?.download_url) {
        window.open(res.download_url, '_blank', 'noopener,noreferrer');
      } else {
        setToastMessage({
          title: 'Arquivo Indisponível',
          desc: 'Não foi possível gerar o link de visualização deste arquivo.',
          type: 'error',
        });
      }
    } catch {
      setToastMessage({
        title: 'Arquivo Indisponível',
        desc: 'Não foi possível abrir o arquivo digital deste documento.',
        type: 'info',
      });
    } finally {
      setIsOpeningFile(false);
    }
  };

  const handleBulkDownload = () => {
    addAuditEntry({
      userId: 'usr-evaluator',
      userNome: currentRole === 'COORDENADOR' ? 'Coordenação de Curso' : 'Gestão de RH (Tenant)',
      userRole: currentRole,
      action: 'DOSSIER_BULK_DOWNLOAD',
      resourceId: student.id,
      resourceTipo: `Download Documentos: ${student.nome}`,
      ipAddress: '189.45.112.44',
      status: 'SUCCESS',
      detalhes: `Download consolidado de documentos do aprendiz ${student.nome}. Trilha registrada.`,
      sha256Hash: student.documentos[0]?.fileHashSha256 || 'HASH-DOCUMENTOS-CONSOLIDADO',
    });

    setToastMessage({
      title: 'Dossiê exportado com sucesso',
      desc: student.nome,
      type: 'success',
    });
  };

  const studentBadge = getStudentStatusBadge(student.nivelRisco);
  const docBadge = selectedDoc ? getDocStatusBadge(selectedDoc.status) : null;

  const isCtpsOrContract = selectedDoc
    ? selectedDoc.tipo === 'CARTEIRA_TRABALHO' ||
      selectedDoc.tipo === 'CONTRATO_TCE' ||
      selectedDoc.nomeExibicao.toLowerCase().includes('ctps') ||
      selectedDoc.nomeExibicao.toLowerCase().includes('registro') ||
      selectedDoc.nomeExibicao.toLowerCase().includes('contrato')
    : false;

  const subtitleParts = [
    student.empresa,
    student.contratoAtivo?.numeroContrato || (student.matricula ? `Matrícula ${student.matricula}` : ''),
  ].filter(Boolean);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* 1. Cabeçalho do Aprendiz (dentro do card principal) */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {student.nome}
            </h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-md font-medium ${studentBadge.className}`}>
              {studentBadge.label}
            </span>
          </div>
          {subtitleParts.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {subtitleParts.join(' • ')}
            </p>
          )}
        </div>

        {/* Grupo único de ações alinhadas */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleBulkDownload}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Exportar Dossiê</span>
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Editar</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Excluir aprendiz"
              aria-label="Excluir aprendiz"
              className="p-2 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Navegação dos Documentos em Abas Horizontais */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {student.documentos.map((doc) => {
          const isSelected = selectedDoc?.id === doc.id;
          const dotColor =
            doc.status === 'APROVADO'
              ? isSelected
                ? 'bg-emerald-400'
                : 'bg-emerald-500'
              : doc.status === 'EM_ANALISE' || doc.status === 'VENCENDO'
              ? isSelected
                ? 'bg-amber-400'
                : 'bg-amber-500'
              : isSelected
              ? 'bg-rose-400'
              : 'bg-rose-500';

          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => setSelectedDoc(doc)}
              title={doc.nomeExibicao}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                isSelected
                  ? 'bg-[#085078] text-white border-[#085078] shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
              <span>{getShortDocName(doc)}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Área de Análise do Documento Selecionado */}
      {selectedDoc && docBadge ? (
        <div className="p-5 sm:p-6 space-y-5">
          {/* (1) Cabeçalho do documento selecionado */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {selectedDoc.nomeExibicao}
            </h3>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${docBadge.className}`}>
              {docBadge.label}
            </span>
          </div>

          {/* (2) Card compacto do arquivo anexado (apenas UM botão Visualizar Arquivo) */}
          {selectedDoc.status !== 'PENDENTE' ? (
            <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-slate-200/70 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {selectedDoc.nomeArquivoOriginal || `${selectedDoc.nomeExibicao}.pdf`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedDoc.tamanhoBytes ? formatBytes(selectedDoc.tamanhoBytes) : 'Arquivo anexado'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isOpeningFile}
                onClick={() => handleViewDocumentFile(selectedDoc)}
                className="bg-[#085078] hover:bg-[#063f60] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isOpeningFile ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                <span>Visualizar Arquivo</span>
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Documento Pendente de Envio
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                O aprendiz ainda não enviou este comprovante no portal.
              </p>
            </div>
          )}

          {/* (3) Grid limpo com os dados de conferência (Titular e CPF) */}
          <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                  Titular
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {student.nome}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                  CPF
                </span>
                <p className="text-sm font-mono font-semibold text-slate-900 dark:text-white">
                  {student.cpf}
                </p>
              </div>

              {isCtpsOrContract && student.contratoAtivo && (
                <>
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                      Nº do Contrato
                    </span>
                    <p className="text-sm font-mono font-semibold text-slate-900 dark:text-white">
                      {student.contratoAtivo.numeroContrato}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                      Vigência Contratual
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {student.contratoAtivo.dataInicio} até {student.contratoAtivo.dataFim}
                    </p>
                  </div>
                </>
              )}
            </div>

            {selectedDoc.justificativaRecusa && selectedDoc.status === 'RECUSADO' && (
              <div className="border-l-4 border-l-rose-500 bg-rose-500/5 dark:bg-rose-500/10 rounded-r-lg p-3 mt-2 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                <strong className="font-bold text-rose-600 dark:text-rose-400">
                  Motivo da recusa:{' '}
                </strong>
                <span>{selectedDoc.justificativaRecusa}</span>
              </div>
            )}
          </div>

          {/* (4) Área inline de justificativa obrigatória + barra de decisão */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            {isRejecting && (
              <div className="border border-rose-500/30 bg-rose-500/5 rounded-lg p-4 mb-4 space-y-3 animate-fadeIn">
                <label
                  htmlFor="rejection-reason"
                  className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  Motivo da recusa
                </label>
                <textarea
                  id="rejection-reason"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Descreva o que precisa ser corrigido neste documento..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-rose-500 focus:outline-none transition-colors"
                />
                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRejecting(false);
                      setRejectionReason('');
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!rejectionReason.trim()}
                    onClick={handleConfirmReject}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmar Recusa
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                disabled={
                  isRejecting ||
                  selectedDoc.status === 'PENDENTE' ||
                  selectedDoc.status === 'RECUSADO'
                }
                onClick={() => setIsRejecting(true)}
                className="px-4 py-2.5 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Recusar Documento</span>
              </button>

              <button
                type="button"
                disabled={selectedDoc.status === 'PENDENTE' || selectedDoc.status === 'APROVADO'}
                onClick={() => {
                  setIsRejecting(false);
                  setRejectionReason('');
                  evaluateDocument(student.id, selectedDoc.id, 'APROVADO');
                }}
                className="px-4 py-2.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Aprovar Documento</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
          Nenhum documento disponível para este aprendiz.
        </div>
      )}
    </div>
  );
}
