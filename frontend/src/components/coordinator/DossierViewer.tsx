'use client';

import React, { useState } from 'react';
import {
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
} from 'lucide-react';
import { Student, DocumentItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { getStatusBadgeConfig, getRiskBadgeConfig, maskCPF } from '@/lib/utils';
import ValidateModal from './ValidateModal';

interface DossierViewerProps {
  student: Student;
}

export default function DossierViewer({ student }: DossierViewerProps) {
  const { isLgpdRedactionActive, setIsLgpdRedactionActive, addAuditEntry, setToastMessage, currentRole } = useApp();
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem>(student.documentos[0]);
  const [validateModalState, setValidateModalState] = useState<{
    doc: DocumentItem;
    action: 'APROVADO' | 'RECUSADO';
  } | null>(null);

  const riskBadge = getRiskBadgeConfig(student.nivelRisco);
  const statusBadge = getStatusBadgeConfig(selectedDoc.status);

  const handleBulkDownload = () => {
    addAuditEntry({
      userId: 'usr-evaluator',
      userNome: currentRole === 'COORDENADOR' ? 'Coordenação de Curso' : 'Gestão de RH (Tenant)',
      userRole: currentRole,
      action: 'DOSSIER_BULK_DOWNLOAD',
      resourceId: student.id,
      resourceTipo: `Download Dossiê: ${student.nome}`,
      ipAddress: '189.45.112.44',
      status: 'SUCCESS',
      detalhes: `Download consolidado de 5 documentos do aprendiz ${student.nome}. Trilha registrada.`,
      sha256Hash: student.documentos[0]?.fileHashSha256 || 'HASH-DOSSIER-CONSOLIDADO',
    });

    setToastMessage({
      title: 'Dossiê Digital Exportado com Sucesso',
      desc: `Pacote ZIP com conformidade auditada para ${student.nome}.`,
      type: 'success',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Dossier Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">{student.nome}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${riskBadge.bg}`}>
                {riskBadge.label}
              </span>
              <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                Mat: {student.matricula}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {student.turmaNome} • <strong className="text-slate-700">{student.empresa}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Download Button */}
            <button
              onClick={handleBulkDownload}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Exportar Dossiê</span>
            </button>

            {/* Compliance pill */}
            <div className="bg-[#065373] text-white px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-sm">
              <span>Conformidade:</span>
              <span className="text-cyan-300 font-mono text-sm">{student.percentualConformidade}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Master-Detail Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-[520px]">
        {/* Document Selector Column */}
        <div className="md:col-span-4 border-r border-slate-200 p-4 space-y-2 bg-slate-50/50">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Documentos do Aprendiz ({student.documentos.length})
          </div>

          {student.documentos.map((doc) => {
            const isSelected = selectedDoc.id === doc.id;
            const b = getStatusBadgeConfig(doc.status);

            return (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-white border-[#065373] shadow-md ring-1 ring-[#065373]/20'
                    : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                      doc.status === 'APROVADO'
                        ? 'bg-emerald-100 text-emerald-700'
                        : doc.status === 'EM_ANALISE'
                        ? 'bg-sky-100 text-sky-700'
                        : doc.status === 'RECUSADO' || doc.status === 'EXPIRADO'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 truncate">{doc.nomeExibicao}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      {doc.nomeArquivoOriginal || 'Não enviado'}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${b.bg}`}>
                  {b.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Document Detailed Inspection & Viewer Column */}
        <div className="md:col-span-8 p-6 flex flex-col justify-between bg-slate-50/20">
          <div className="space-y-4">
            {/* Action Bar for the Document */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{selectedDoc.nomeExibicao}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusBadge.bg}`}>
                    {statusBadge.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  UUID: {selectedDoc.storageUuid || 'doc_privado_inexistente.pdf'}
                </p>
              </div>

              {/* Evaluation Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setValidateModalState({ doc: selectedDoc, action: 'APROVADO' })}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aprovar</span>
                </button>
                <button
                  onClick={() => setValidateModalState({ doc: selectedDoc, action: 'RECUSADO' })}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Recusar</span>
                </button>
              </div>
            </div>

            {/* Document Digital Viewer Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-inner space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#065373]" />
                  <span className="font-bold text-xs text-slate-800">
                    Visualizador de Alta Fidelidade (Protegido por UUID)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLgpdRedactionActive(!isLgpdRedactionActive)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                      isLgpdRedactionActive
                        ? 'bg-slate-900 text-cyan-300 border-slate-800'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <Lock className="w-3 h-3 text-cyan-400" />
                    <span>{isLgpdRedactionActive ? 'LGPD Tarjado' : 'Sem Tarja'}</span>
                  </button>
                </div>
              </div>

              {/* Simulated Document Preview Area */}
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{selectedDoc.nomeExibicao}</p>
                    <p className="text-[11px] text-slate-500">Documento Oficial Digitalizado</p>
                  </div>
                  <div className="text-right font-mono text-[10px] text-slate-500">
                    <p>DocFlow Secure Storage</p>
                    <p>Status: {selectedDoc.status}</p>
                  </div>
                </div>

                {/* Render Redacted Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Nome do Titular:</label>
                    <p className="font-bold text-slate-900">{student.nome}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Cadastro de Pessoa Física (CPF):</label>
                    <p className="font-mono font-bold text-slate-900">
                      {isLgpdRedactionActive ? maskCPF(student.cpf) : student.cpf}
                    </p>
                  </div>

                  {selectedDoc.conteudoSensivelSimulado?.rgNumero && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500">Número do Registro Geral (RG):</label>
                      <p className="font-mono text-slate-900">{selectedDoc.conteudoSensivelSimulado.rgNumero}</p>
                    </div>
                  )}

                  {selectedDoc.conteudoSensivelSimulado?.rgFiliacaoMae && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500">Filiação Materna (Dado Sensível):</label>
                      {isLgpdRedactionActive ? (
                        <div className="p-1 bg-slate-900 text-cyan-300 font-mono text-[10px] rounded px-2">
                          [DADO MINIMIZADO - LGPD ART. 6º, III]
                        </div>
                      ) : (
                        <p className="text-slate-900">{selectedDoc.conteudoSensivelSimulado.rgFiliacaoMae}</p>
                      )}
                    </div>
                  )}

                  {selectedDoc.conteudoSensivelSimulado?.enderecoCompleto && (
                    <div className="col-span-2 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500">Endereço Residencial:</label>
                      {isLgpdRedactionActive ? (
                        <div className="p-1 bg-slate-900 text-cyan-300 font-mono text-[10px] rounded px-2">
                          [ENDEREÇO TARJADO PARA OPERADOR NÃO PRIVILEGIADO]
                        </div>
                      ) : (
                        <p className="text-slate-900">{selectedDoc.conteudoSensivelSimulado.enderecoCompleto}</p>
                      )}
                    </div>
                  )}

                  {selectedDoc.conteudoSensivelSimulado?.semestreAtual && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500">Período Acadêmico:</label>
                      <p className="font-semibold text-slate-900">{selectedDoc.conteudoSensivelSimulado.semestreAtual}</p>
                    </div>
                  )}
                </div>

                {/* Expiration warning note */}
                {selectedDoc.validadeAte && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-center justify-between">
                    <span>Validade do documento semestral: <strong>{selectedDoc.validadeAte}</strong></span>
                    <span className="font-bold">
                      {selectedDoc.diasParaVencer && selectedDoc.diasParaVencer > 0
                        ? `Expira em ${selectedDoc.diasParaVencer} dias`
                        : 'Vencido'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Forensics Footer */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
            <span>SHA-256: {selectedDoc.fileHashSha256 || '9f86d081884c7d659a2feaa0c55ad015...'}</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Integridade Imutável Verificada
            </span>
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
