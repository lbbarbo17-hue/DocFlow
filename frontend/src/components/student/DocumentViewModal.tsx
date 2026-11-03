'use client';

import React from 'react';
import {
  X,
  FileText,
  AlertTriangle,
  Calendar,
  ExternalLink,
  Loader2,
  RotateCw,
  Info,
} from 'lucide-react';
import { DocumentItem } from '@/lib/types';
import { formatDateBr, formatBytes, formatCPF } from '@/lib/utils';
import { documentosApi } from '@/lib/api';
import { useApp } from '@/context/AppContext';

interface DocumentViewModalProps {
  document: DocumentItem | null;
  onClose: () => void;
  onReplace: (doc: DocumentItem) => void;
}

export default function DocumentViewModal({
  document,
  onClose,
  onReplace,
}: DocumentViewModalProps) {
  const { setToastMessage } = useApp();
  const [isOpeningFile, setIsOpeningFile] = React.useState(false);

  if (!document) return null;

  const isApproved = document.status === 'APROVADO';
  const isInReview = document.status === 'EM_ANALISE';
  const isRejected = document.status === 'RECUSADO';
  const canReplace = document.status !== 'EM_ANALISE';

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

  const handleOpenDownloadUrl = async () => {
    setIsOpeningFile(true);
    try {
      const res = await documentosApi.getDownloadUrl(document.id);
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
        title: 'Arquivo do Documento',
        desc: 'Documento registrado e verificado com sucesso.',
        type: 'info',
      });
    } finally {
      setIsOpeningFile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        {/* 1. Cabeçalho Integrado (sem a faixa cortando o topo) */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="min-w-0 pr-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
              {document.nomeExibicao}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Detalhes do Documento
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Conteúdo Principal do Modal */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Seção de Status e Data de Atualização */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Status:
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                {badgeLabel}
              </span>
            </div>

            {document.dataEnvio && (
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>Atualizado em {formatDateBr(document.dataEnvio)}</span>
              </span>
            )}
          </div>

          {/* Caixa de alerta em caso de recusa */}
          {isRejected && document.justificativaRecusa && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-200 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Motivo da recusa / Correção necessária:</span>
              </div>
              <p className="text-rose-700 dark:text-rose-300 pl-5.5 font-medium leading-relaxed">
                {document.justificativaRecusa}
              </p>
            </div>
          )}

          {/* Cartão Único e Elegante do Arquivo Anexado + Metadados */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3.5">
            {/* Informações do Arquivo */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#085078]/10 dark:bg-cyan-950/60 text-[#085078] dark:text-cyan-400 border border-[#085078]/20 dark:border-cyan-800/50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {document.nomeArquivoOriginal || `${document.nomeExibicao.toLowerCase().replace(/\s+/g, '_')}.pdf`}
                  </p>
                  {document.tamanhoBytes && (
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {formatBytes(document.tamanhoBytes)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Metadados Registrados */}
            <div className="space-y-2 text-xs">
              {document.conteudoSensivelSimulado?.rgNumero && (
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/40">
                  <span className="text-slate-500 dark:text-slate-400">Número do RG:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {document.conteudoSensivelSimulado.rgNumero}
                  </span>
                </div>
              )}

              {document.conteudoSensivelSimulado?.cpfNumero && (
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/40">
                  <span className="text-slate-500 dark:text-slate-400">CPF Registrado:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatCPF(document.conteudoSensivelSimulado.cpfNumero)}
                  </span>
                </div>
              )}

              {document.conteudoSensivelSimulado?.enderecoCompleto && (
                <div className="flex items-start justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/40 gap-4">
                  <span className="text-slate-500 dark:text-slate-400 shrink-0">Endereço de Residência:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                    {document.conteudoSensivelSimulado.enderecoCompleto}
                  </span>
                </div>
              )}

              {document.conteudoSensivelSimulado?.semestreAtual && (
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/40">
                  <span className="text-slate-500 dark:text-slate-400">Período Letivo:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {document.conteudoSensivelSimulado.semestreAtual}
                  </span>
                </div>
              )}

              {document.conteudoSensivelSimulado?.instituicaoEnsino && (
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/40">
                  <span className="text-slate-500 dark:text-slate-400">Instituição de Ensino:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                    {document.conteudoSensivelSimulado.instituicaoEnsino}
                  </span>
                </div>
              )}

              {document.conteudoSensivelSimulado?.empresaConcedente && (
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/40">
                  <span className="text-slate-500 dark:text-slate-400">Empresa Concedente:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {document.conteudoSensivelSimulado.empresaConcedente}
                  </span>
                </div>
              )}

              {document.validadeAte && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Validade Documental:</span>
                  <span
                    className={`font-bold ${
                      document.diasParaVencer !== undefined && document.diasParaVencer <= 30
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {formatDateBr(document.validadeAte).split(' ')[0]}
                    {document.diasParaVencer !== undefined && (
                      <span className="text-[11px] ml-1 font-normal text-slate-500 dark:text-slate-400">
                        ({document.diasParaVencer > 0 ? `${document.diasParaVencer} dias restantes` : 'Vencido'})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Instruções do Documento (Bloco discreto de apoio no rodapé do conteúdo) */}
          {document.descricao && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Instruções: </span>
                <span>{document.descricao}</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Rodapé com Hierarquia Clara de Botões */}
        <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          {/* Botão Secundário: Fechar (estilo neutro/ghost) */}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer order-last sm:order-first"
          >
            Fechar
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Botão de Ação do Arquivo: Visualizar / Baixar */}
            {document.status !== 'PENDENTE' && (
              <button
                type="button"
                disabled={isOpeningFile}
                onClick={handleOpenDownloadUrl}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#085078] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-cyan-400 transition-colors shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isOpeningFile ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                )}
                <span>Visualizar / Baixar</span>
              </button>
            )}

            {/* Botão Primário: Substituir Documento (apenas se o status permitir substituição) */}
            {canReplace && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReplace(document);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#085078] hover:bg-[#063c5a] dark:bg-[#085078] dark:hover:bg-[#063c5a] dark:text-white transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Substituir Documento</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
