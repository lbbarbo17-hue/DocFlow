'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  FileText,
  Download,
} from 'lucide-react';
import { Student, DocumentItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { getStatusBadgeConfig, getRiskBadgeConfig } from '@/lib/utils';
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
      title: 'Dossiê exportado com sucesso',
      desc: student.nome,
      type: 'success',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-400 dark:border dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Dossier Header */}
      <div className="p-4 sm:p-5 border-b-2 border-slate-400 dark:border-b dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900">
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
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
              {student.empresa}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleBulkDownload}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border-2 border-slate-400 dark:border dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span>Exportar Dossiê</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Document List (Left) + Document Details (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-[500px]">
        {/* Document List */}
        <div className="md:col-span-4 border-r-2 border-slate-400 dark:border-r dark:border-slate-800 p-3 space-y-1.5 bg-slate-50/60 dark:bg-slate-950/20">
          <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider px-2 py-1">
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
                className={`w-full text-left p-2.5 rounded-xl border-2 dark:border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 border-[#065373] dark:border-cyan-400 shadow-md ring-2 ring-[#065373]/30'
                    : 'bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-800 hover:border-[#065373] dark:hover:border-cyan-400 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />
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
            <div className="flex items-center justify-between gap-3 pb-3 border-b-2 border-slate-400 dark:border-b dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedDoc.nomeExibicao}
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>

              {/* Approval Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setValidateModalState({ doc: selectedDoc, action: 'APROVADO' })}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aprovar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setValidateModalState({ doc: selectedDoc, action: 'RECUSADO' })}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Recusar</span>
                </button>
              </div>
            </div>

            {/* Document Metadata Details Card */}
            <div className="bg-white dark:bg-slate-800/80 rounded-xl border-2 border-slate-400 dark:border dark:border-slate-800 p-4 space-y-4 text-xs shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Titular</span>
                  <p className="font-bold text-slate-950 dark:text-white">{student.nome}</p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mb-0.5">CPF</span>
                  <p className="font-mono font-bold text-slate-950 dark:text-white">{student.cpf}</p>
                </div>

                {selectedDoc.conteudoSensivelSimulado?.rgNumero && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mb-0.5">RG</span>
                    <p className="font-mono font-bold text-slate-950 dark:text-white">{selectedDoc.conteudoSensivelSimulado.rgNumero}</p>
                  </div>
                )}

                {selectedDoc.conteudoSensivelSimulado?.rgFiliacaoMae && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Filiação</span>
                    <p className="font-semibold text-slate-950 dark:text-white">{selectedDoc.conteudoSensivelSimulado.rgFiliacaoMae}</p>
                  </div>
                )}

                {selectedDoc.conteudoSensivelSimulado?.enderecoCompleto && (
                  <div className="sm:col-span-2">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Endereço</span>
                    <p className="font-semibold text-slate-950 dark:text-white">{selectedDoc.conteudoSensivelSimulado.enderecoCompleto}</p>
                  </div>
                )}

                {selectedDoc.conteudoSensivelSimulado?.semestreAtual && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Semestre Letivo</span>
                    <p className="font-bold text-slate-950 dark:text-white">{selectedDoc.conteudoSensivelSimulado.semestreAtual}</p>
                  </div>
                )}
              </div>

              {/* Expiration warning note if applicable */}
              {selectedDoc.validadeAte && (
                <div className="p-2.5 bg-amber-100 dark:bg-[#78350f] border-2 border-amber-400 dark:border dark:border-amber-600 rounded-lg text-amber-950 dark:text-white text-[11px] flex items-center justify-between">
                  <span>Validade: <strong>{selectedDoc.validadeAte}</strong></span>
                  <span className="font-bold">
                    {selectedDoc.diasParaVencer && selectedDoc.diasParaVencer > 0
                      ? `${selectedDoc.diasParaVencer} dias restantes`
                      : 'Vencido'}
                  </span>
                </div>
              )}
            </div>
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
