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
} from 'lucide-react';
import { DocumentItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { getStatusBadgeConfig, formatBytes } from '@/lib/utils';
import UploadModal from './UploadModal';

export default function DocumentChecklist() {
  const { student, isLgpdRedactionActive } = useApp();
  const [activeUploadDoc, setActiveUploadDoc] = useState<DocumentItem | null>(null);
  const [viewingDocDetails, setViewingDocDetails] = useState<DocumentItem | null>(null);

  const approvedCount = student.documentos.filter((d) => d.status === 'APROVADO').length;
  const inReviewCount = student.documentos.filter((d) => d.status === 'EM_ANALISE').length;
  const pendingCount = student.documentos.filter(
    (d) => d.status === 'PENDENTE' || d.status === 'RECUSADO' || d.status === 'EXPIRADO'
  ).length;

  return (
    <div className="space-y-6">
      {/* Student Dossier Summary Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Dossiê Documental de {student.nome}
              </h2>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                Matrícula: {student.matricula}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Curso: <strong className="text-slate-700">{student.curso}</strong> • Empresa Concedente:{' '}
              <strong className="text-slate-700">{student.empresa}</strong>
            </p>
          </div>

          {/* Compliance Progress Indicator */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[280px]">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-700">Índice de Conformidade do Dossiê</span>
              <span
                className={
                  student.percentualConformidade === 100
                    ? 'text-emerald-600'
                    : student.percentualConformidade >= 60
                    ? 'text-[#065373]'
                    : 'text-rose-600'
                }
              >
                {student.percentualConformidade}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${
                  student.percentualConformidade === 100
                    ? 'bg-emerald-500'
                    : student.percentualConformidade >= 60
                    ? 'bg-gradient-to-r from-[#226a8b] to-[#3f81a3]'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${student.percentualConformidade}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>{approvedCount} Aprovados</span>
              <span>{inReviewCount} Em Análise</span>
              <span className="text-rose-600 font-semibold">{pendingCount} Pendentes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Items List */}
      <div className="space-y-3.5">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span>Documentos Obrigatórios do Dossiê</span>
          <span className="text-xs text-slate-400 font-normal">
            (5 itens exigidos pela regulamentação)
          </span>
        </h3>

        {student.documentos.map((doc) => {
          const badge = getStatusBadgeConfig(doc.status);

          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-[#3f81a3]/40 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left Info */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      doc.status === 'APROVADO'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : doc.status === 'EM_ANALISE'
                        ? 'bg-sky-50 text-sky-600 border-sky-200'
                        : doc.status === 'RECUSADO' || doc.status === 'EXPIRADO'
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {doc.status === 'APROVADO' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : doc.status === 'EM_ANALISE' ? (
                      <Clock className="w-6 h-6" />
                    ) : doc.status === 'RECUSADO' || doc.status === 'EXPIRADO' ? (
                      <AlertCircle className="w-6 h-6" />
                    ) : (
                      <FileText className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#065373] transition-colors">
                        {doc.nomeExibicao}
                      </h4>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                      {doc.obrigatorio && (
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          Obrigatório
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{doc.descricao}</p>

                    {/* Meta info if file uploaded */}
                    {doc.nomeArquivoOriginal && (
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
                        <span className="text-slate-700 font-semibold">{doc.nomeArquivoOriginal}</span>
                        {doc.tamanhoBytes && <span>• {formatBytes(doc.tamanhoBytes)}</span>}
                        {doc.fileHashSha256 && (
                          <span className="text-slate-400 hidden sm:inline" title={doc.fileHashSha256}>
                            • Hash: {doc.fileHashSha256.substring(0, 10)}...
                          </span>
                        )}
                        {doc.storageUuid && (
                          <span className="text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded text-[10px]">
                            UUID: {doc.storageUuid.substring(0, 14)}...
                          </span>
                        )}
                      </div>
                    )}

                    {/* Rejection Justification Notice */}
                    {doc.justificativaRecusa && (
                      <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                        <strong className="block text-rose-950 font-bold mb-0.5">
                          Motivo da Recusa (Coordenação/RH):
                        </strong>
                        {doc.justificativaRecusa}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="flex items-center gap-2 shrink-0">
                  {doc.nomeArquivoOriginal && (
                    <button
                      type="button"
                      onClick={() => setViewingDocDetails(doc)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span>Detalhes</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveUploadDoc(doc)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                      doc.status === 'APROVADO'
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : doc.status === 'RECUSADO' || doc.status === 'EXPIRADO'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-[#065373] hover:bg-[#043c53] text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{doc.nomeArquivoOriginal ? 'Substituir' : 'Enviar Arquivo'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {activeUploadDoc && (
        <UploadModal
          document={activeUploadDoc}
          onClose={() => setActiveUploadDoc(null)}
        />
      )}

      {/* Document Detail Preview Modal with LGPD Redaction Simulation */}
      {viewingDocDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#065373] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{viewingDocDetails.nomeExibicao}</h3>
                <p className="text-xs text-cyan-200 font-mono">
                  UUID: {viewingDocDetails.storageUuid || 'doc_privado.pdf'}
                </p>
              </div>
              <button
                onClick={() => setViewingDocDetails(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Nome do Arquivo Original:</span>
                  <span className="font-mono text-slate-800">{viewingDocDetails.nomeArquivoOriginal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Hash Criptográfico SHA-256:</span>
                  <span className="font-mono text-slate-800 text-[11px] truncate max-w-[280px]">
                    {viewingDocDetails.fileHashSha256}
                  </span>
                </div>
                {viewingDocDetails.dataEnvio && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Data de Envio:</span>
                    <span className="font-mono text-slate-800">{new Date(viewingDocDetails.dataEnvio).toLocaleString('pt-BR')}</span>
                  </div>
                )}
              </div>

              {/* Simulated Document Preview Card with LGPD Redaction */}
              <div className="border border-slate-300 rounded-xl p-5 bg-white shadow-inner space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-xs text-slate-800">Visualização do Documento</span>
                  {isLgpdRedactionActive && (
                    <span className="flex items-center gap-1 text-[10px] text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded font-mono font-bold">
                      <Lock className="w-3 h-3" /> Tarjamento LGPD Ativo
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-slate-600">
                    <strong>Titular do Documento:</strong> {student.nome}
                  </p>
                  <p className="text-slate-600">
                    <strong>CPF:</strong>{' '}
                    {isLgpdRedactionActive ? (
                      <span className="font-mono bg-slate-900 text-white px-2 py-0.5 rounded text-[10px]">
                        ***.***.***-**
                      </span>
                    ) : (
                      <span className="font-mono">{student.cpf}</span>
                    )}
                  </p>
                  {viewingDocDetails.conteudoSensivelSimulado?.rgFiliacaoMae && (
                    <p className="text-slate-600">
                      <strong>Filiação Materna:</strong>{' '}
                      {isLgpdRedactionActive ? (
                        <span className="font-mono bg-slate-900 text-cyan-300 px-2 py-0.5 rounded text-[10px]">
                          [TARJADO - ART. 6º LGPD]
                        </span>
                      ) : (
                        <span>{viewingDocDetails.conteudoSensivelSimulado.rgFiliacaoMae}</span>
                      )}
                    </p>
                  )}
                  {viewingDocDetails.conteudoSensivelSimulado?.enderecoCompleto && (
                    <p className="text-slate-600">
                      <strong>Endereço Residencial:</strong>{' '}
                      {isLgpdRedactionActive ? (
                        <span className="font-mono bg-slate-900 text-cyan-300 px-2 py-0.5 rounded text-[10px]">
                          [TARJADO - ENDEREÇO PRIVADO]
                        </span>
                      ) : (
                        <span>{viewingDocDetails.conteudoSensivelSimulado.enderecoCompleto}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setViewingDocDetails(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
