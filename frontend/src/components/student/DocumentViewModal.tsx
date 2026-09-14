'use client';

import React from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Calendar,
  Hash,
} from 'lucide-react';
import { DocumentItem } from '@/lib/types';
import { getStatusBadgeConfig, formatDateBr, formatBytes, maskCPF } from '@/lib/utils';

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
  if (!document) return null;

  const badge = getStatusBadgeConfig(document.status);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-200">
        {/* Modal Header */}
        <div className="bg-[#065373] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <FileText className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base leading-tight truncate">
                {document.nomeExibicao}
              </h3>
              <p className="text-[11px] text-cyan-100/80 flex items-center gap-1.5 mt-0.5">
                <Lock className="w-3 h-3 text-cyan-300" />
                <span>Visualização Segura & Conformidade LGPD</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0 ml-2"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Status & Verification Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status do Dossiê:</span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                {badge.label}
              </span>
            </div>

            {document.dataEnvio && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Enviado em {formatDateBr(document.dataEnvio)}
              </span>
            )}
          </div>

          {/* Rejection / Correction Box */}
          {document.status === 'RECUSADO' && document.justificativaRecusa && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-200 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Motivo da Devolução / Necessidade de Correção:</span>
              </div>
              <p className="text-rose-700 dark:text-rose-300 leading-relaxed pl-5 font-medium">
                {document.justificativaRecusa}
              </p>
            </div>
          )}

          {/* Simulated Document Preview Canvas */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-850 p-4 sm:p-6 relative overflow-hidden shadow-inner">
            {/* Watermark/Security Badge */}
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-cyan-300 text-[10px] font-mono px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-cyan-400/20 shadow-sm">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              <span>CUSTÓDIA SEGURA DOCFLOW</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm max-w-lg mx-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#065373]/10 dark:bg-cyan-500/10 text-[#065373] dark:text-cyan-300 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                      {document.nomeExibicao}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {document.nomeArquivoOriginal || 'documento_digitalizado.pdf'}
                    </p>
                  </div>
                </div>
                {document.tamanhoBytes && (
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    {formatBytes(document.tamanhoBytes)}
                  </span>
                )}
              </div>

              {/* Data protection notice / LGPD */}
              {document.protecaoLgpd && (
                <div className="p-3 bg-sky-50/70 dark:bg-cyan-950/40 border border-sky-200/80 dark:border-cyan-800/60 rounded-xl text-[11px] text-sky-900 dark:text-cyan-200 flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400 shrink-0 mt-0.5" />
                  <p className="leading-tight">
                    <strong>Proteção LGPD Ativa:</strong> Dados sensíveis estão criptografados e
                    anonimizados para visualização estudantil (Art. 6º, III da Lei 13.709/2018).
                  </p>
                </div>
              )}

              {/* Simulated extracted fields */}
              <div className="space-y-2.5 text-xs">
                {document.conteudoSensivelSimulado?.rgNumero && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Número do RG:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {document.conteudoSensivelSimulado.rgNumero}
                    </span>
                  </div>
                )}

                {document.conteudoSensivelSimulado?.cpfNumero && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">CPF Registrado:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {maskCPF(document.conteudoSensivelSimulado.cpfNumero)}
                    </span>
                  </div>
                )}

                {document.conteudoSensivelSimulado?.enderecoCompleto && (
                  <div className="py-1 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
                    <span className="text-slate-500 dark:text-slate-400">Endereço de Residência:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 p-2 rounded text-[11px]">
                      {document.conteudoSensivelSimulado.enderecoCompleto}
                    </p>
                  </div>
                )}

                {document.conteudoSensivelSimulado?.semestreAtual && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Período Letivo:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {document.conteudoSensivelSimulado.semestreAtual}
                    </span>
                  </div>
                )}

                {document.conteudoSensivelSimulado?.instituicaoEnsino && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Instituição:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                      {document.conteudoSensivelSimulado.instituicaoEnsino}
                    </span>
                  </div>
                )}

                {document.conteudoSensivelSimulado?.empresaConcedente && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Empresa Concedente:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {document.conteudoSensivelSimulado.empresaConcedente}
                    </span>
                  </div>
                )}

                {document.validadeAte && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Validade Documental:</span>
                    <span
                      className={`font-bold ${
                        document.diasParaVencer !== undefined && document.diasParaVencer <= 30
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {formatDateBr(document.validadeAte).split(' ')[0]}
                      {document.diasParaVencer !== undefined && (
                        <span className="text-[10px] ml-1 font-normal">
                          ({document.diasParaVencer > 0 ? `${document.diasParaVencer} dias restantes` : 'Vencido'})
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Cryptographic hash proof */}
              {document.fileHashSha256 && (
                <div className="pt-2">
                  <div className="p-2.5 bg-slate-900 dark:bg-slate-950 rounded-xl text-slate-300 font-mono text-[10px] space-y-1 border border-slate-800">
                    <div className="flex items-center justify-between text-cyan-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" /> Assinatura SHA-256 (Integridade)
                      </span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </div>
                    <p className="text-slate-400 break-all leading-tight">
                      {document.fileHashSha256}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onReplace(document);
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#065373] hover:bg-[#043c53] transition-all shadow-md flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-300" />
            <span>Substituir Documento</span>
          </button>
        </div>
      </div>
    </div>
  );
}
