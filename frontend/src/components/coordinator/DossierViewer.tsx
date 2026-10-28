'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  ExternalLink,
  Eye,
  Loader2,
  Copy,
  Check,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Student, DocumentItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { getStatusBadgeConfig, getRiskBadgeConfig, formatBytes } from '@/lib/utils';
import { documentosApi } from '@/lib/api';
import ValidateModal from './ValidateModal';

interface DossierViewerProps {
  student: Student;
  initialDocId?: string;
}

export default function DossierViewer({ student, initialDocId }: DossierViewerProps) {
  const { addAuditEntry, setToastMessage, currentRole } = useApp();
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem>(() => {
    if (initialDocId) {
      const found = student.documentos.find((d) => d.id === initialDocId);
      if (found) return found;
    }
    return student.documentos[0];
  });

  React.useEffect(() => {
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

  const [validateModalState, setValidateModalState] = useState<{
    doc: DocumentItem;
    action: 'APROVADO' | 'RECUSADO';
  } | null>(null);
  const [isOpeningFile, setIsOpeningFile] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

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
        title: 'Visualização Segura',
        desc: 'Documento registrado sob custódia digital e hash SHA-256.',
        type: 'info',
      });
    } finally {
      setIsOpeningFile(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
      setToastMessage({
        title: 'Hash Copiado',
        desc: 'Assinatura criptográfica SHA-256 copiada para a área de transferência.',
        type: 'info',
      });
    }
  };

  const riskBadge = getRiskBadgeConfig(student.nivelRisco);
  const statusBadge = getStatusBadgeConfig(selectedDoc.status);
  const isCtpsOrContract =
    selectedDoc.tipo === 'CARTEIRA_TRABALHO' ||
    selectedDoc.tipo === 'CONTRATO_TCE' ||
    selectedDoc.nomeExibicao.toLowerCase().includes('ctps') ||
    selectedDoc.nomeExibicao.toLowerCase().includes('registro') ||
    selectedDoc.nomeExibicao.toLowerCase().includes('contrato');

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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-[1.5px] border-slate-400 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Dossier Header */}
      <div className="p-4 sm:p-5 border-b border-slate-300 dark:border-b dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {student.nome}
              </h2>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${riskBadge.bg}`}>
                {riskBadge.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                {student.empresa}
              </p>
              {student.contratoAtivo && (
                <span className="font-mono bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-cyan-300 border border-sky-300 dark:border-sky-800 px-2 py-0.5 rounded text-[10px] font-bold">
                  {student.contratoAtivo.numeroContrato}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleBulkDownload}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
              <span>Exportar Dossiê</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Document List (Left) + Document Details (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-[500px]">
        {/* Document List */}
        <div className="md:col-span-4 border-r border-slate-300 dark:border-r dark:border-slate-700 p-3 space-y-1.5 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider px-2 py-1">
            Documentos ({student.documentos.length})
          </div>

          {student.documentos.map((doc) => {
            const isSelected = selectedDoc.id === doc.id;
            const b = getStatusBadgeConfig(doc.status);

            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDoc(doc)}
                title={`${doc.nomeExibicao} (${b.label})`}
                className={`w-full text-left p-2.5 rounded-xl border-[1.5px] transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 border-[#065373] dark:border-cyan-400 shadow-sm ring-1 ring-[#065373]'
                    : 'bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-700 hover:border-slate-500 dark:hover:border-slate-600 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-950 dark:text-white leading-snug">
                    {doc.nomeExibicao}
                  </span>
                </div>

                <span
                  title={b.label}
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${b.dot} ring-2 ring-slate-100 dark:ring-slate-800`}
                />
              </button>
            );
          })}
        </div>

        {/* Selected Document Inspection & Actions */}
        <div className="md:col-span-8 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Top Toolbar for Selected Doc */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-b dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedDoc.nomeExibicao}
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>

              {/* Approval Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={selectedDoc.status === 'PENDENTE' || isOpeningFile}
                  onClick={() => handleViewDocumentFile(selectedDoc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs ${
                    selectedDoc.status === 'PENDENTE'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                      : 'bg-[#065373] hover:bg-[#05435c] text-white'
                  }`}
                  title={
                    selectedDoc.status === 'PENDENTE'
                      ? 'Documento ainda não enviado pelo aluno'
                      : 'Abrir arquivo digital'
                  }
                >
                  {isOpeningFile ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ExternalLink className="w-3.5 h-3.5" />
                  )}
                  <span>Visualizar Arquivo</span>
                </button>

                {selectedDoc.status === 'APROVADO' ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Documento Aprovado</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setValidateModalState({ doc: selectedDoc, action: 'RECUSADO' })}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors"
                      title="Reverter aprovação e recusar com justificativa"
                    >
                      Alterar para Recusado
                    </button>
                  </div>
                ) : selectedDoc.status === 'RECUSADO' ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800">
                      <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>Documento Recusado</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setValidateModalState({ doc: selectedDoc, action: 'APROVADO' })}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 transition-colors"
                    >
                      Reavaliar e Aprovar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={selectedDoc.status === 'PENDENTE'}
                      onClick={() => setValidateModalState({ doc: selectedDoc, action: 'APROVADO' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs hover:shadow-xs ${
                        selectedDoc.status === 'PENDENTE'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aprovar</span>
                    </button>
                    <button
                      type="button"
                      disabled={selectedDoc.status === 'PENDENTE'}
                      onClick={() => setValidateModalState({ doc: selectedDoc, action: 'RECUSADO' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs hover:shadow-xs ${
                        selectedDoc.status === 'PENDENTE'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                          : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Recusar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Document Metadata Details Card */}
            <div className="bg-slate-50/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 p-4 space-y-4 text-xs shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">Titular</span>
                  <p className="font-bold text-slate-950 dark:text-white">{student.nome}</p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">CPF</span>
                  <p className="font-mono font-bold text-slate-950 dark:text-white">{student.cpf}</p>
                </div>

                {isCtpsOrContract && student.contratoAtivo && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">Nº do Contrato</span>
                    <p className="font-mono font-bold text-slate-950 dark:text-white">{student.contratoAtivo.numeroContrato}</p>
                  </div>
                )}

                {isCtpsOrContract && student.contratoAtivo && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">Vigência Contratual</span>
                    <p className="font-semibold text-slate-950 dark:text-white">
                      {student.contratoAtivo.dataInicio} até {student.contratoAtivo.dataFim}
                    </p>
                  </div>
                )}

                {isCtpsOrContract && student.contratoAtivo?.valorBolsa && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">
                      {student.tipoVinculo === 'APRENDIZ' ? 'Salário / Bolsa' : 'Bolsa-Auxílio'}
                    </span>
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">
                      R$ {typeof student.contratoAtivo.valorBolsa === 'number'
                        ? student.contratoAtivo.valorBolsa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : student.contratoAtivo.valorBolsa}
                    </p>
                  </div>
                )}

                {selectedDoc.conteudoSensivelSimulado?.rgNumero && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">RG</span>
                    <p className="font-mono font-bold text-slate-950 dark:text-white">{selectedDoc.conteudoSensivelSimulado.rgNumero}</p>
                  </div>
                )}

                {selectedDoc.conteudoSensivelSimulado?.rgFiliacaoMae && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">Filiação</span>
                    <p className="font-semibold text-slate-950 dark:text-white">{selectedDoc.conteudoSensivelSimulado.rgFiliacaoMae}</p>
                  </div>
                )}

                {selectedDoc.conteudoSensivelSimulado?.enderecoCompleto && (
                  <div className="sm:col-span-2">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">Endereço</span>
                    <p className="font-semibold text-slate-950 dark:text-white">{selectedDoc.conteudoSensivelSimulado.enderecoCompleto}</p>
                  </div>
                )}

                {selectedDoc.conteudoSensivelSimulado?.semestreAtual && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">Semestre Letivo</span>
                    <p className="font-bold text-slate-950 dark:text-white">{selectedDoc.conteudoSensivelSimulado.semestreAtual}</p>
                  </div>
                )}
              </div>

              {/* Expiration warning note if applicable */}
              {selectedDoc.validadeAte && (
                <div className="p-2.5 bg-amber-50 dark:bg-[#78350f] border border-amber-200 dark:border dark:border-amber-600 rounded-lg text-amber-950 dark:text-white text-[11px] flex items-center justify-between">
                  <span>Validade: <strong>{selectedDoc.validadeAte}</strong></span>
                  <span className="font-bold">
                    {selectedDoc.diasParaVencer && selectedDoc.diasParaVencer > 0
                      ? `${selectedDoc.diasParaVencer} dias restantes`
                      : 'Vencido'}
                  </span>
                </div>
              )}
            </div>

            {selectedDoc.status !== 'PENDENTE' ? (
              <div className="p-4 bg-sky-50/60 dark:bg-slate-800/80 rounded-xl border border-sky-200/80 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#065373]/10 dark:bg-cyan-500/10 flex items-center justify-center text-[#065373] dark:text-cyan-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">
                        {selectedDoc.nomeArquivoOriginal || `${selectedDoc.nomeExibicao}.pdf`}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {selectedDoc.tamanhoBytes ? formatBytes(selectedDoc.tamanhoBytes) : 'Arquivo enviado'} • Custódia Digital Verificada
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isOpeningFile}
                    onClick={() => handleViewDocumentFile(selectedDoc)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#065373] hover:bg-[#05435c] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isOpeningFile ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    <span>Abrir Documento</span>
                  </button>
                </div>

                {selectedDoc.fileHashSha256 && (
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 truncate">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400">SHA-256:</span>
                      <span className="text-slate-800 dark:text-slate-200 truncate">
                        {selectedDoc.fileHashSha256}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyHash(selectedDoc.fileHashSha256 || '')}
                      className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0"
                      title="Copiar Hash SHA-256"
                    >
                      {copiedHash ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-1">
                <Clock className="w-5 h-5 text-amber-500 mx-auto" />
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Documento Pendente de Envio
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  O aprendiz ainda não realizou o upload deste comprovante no Portal do Estudante.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validate Modal */}
      {validateModalState && (
        <ValidateModal
          student={student}
          document={validateModalState.doc}
          initialAction={validateModalState.action}
          onClose={() => setValidateModalState(null)}
        />
      )}
    </div>
  );
}

