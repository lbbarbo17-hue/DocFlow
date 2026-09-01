'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DocumentItem, Student } from '@/lib/types';
import { useApp } from '@/context/AppContext';

interface ValidateModalProps {
  student: Student;
  document: DocumentItem;
  initialAction: 'APROVADO' | 'RECUSADO';
  onClose: () => void;
}

export default function ValidateModal({
  student,
  document,
  initialAction,
  onClose,
}: ValidateModalProps) {
  const { evaluateDocument } = useApp();
  const [action, setAction] = useState<'APROVADO' | 'RECUSADO'>(initialAction);
  const [justification, setJustification] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (action === 'RECUSADO' && !justification.trim()) {
      setValidationError('A justificativa é estritamente obrigatória para a recusa formal de documentos.');
      return;
    }

    evaluateDocument(student.id, document.id, action, justification.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div
          className={`p-5 text-white flex items-center justify-between ${
            action === 'APROVADO' ? 'bg-emerald-700' : 'bg-rose-700'
          }`}
        >
          <div className="flex items-center gap-3">
            {action === 'APROVADO' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-200" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-200" />
            )}
            <div>
              <h3 className="font-bold text-base">
                {action === 'APROVADO' ? 'Aprovar Documento' : 'Recusar Documento com Justificativa'}
              </h3>
              <p className="text-xs text-slate-100 opacity-90">
                {student.nome} • {document.nomeExibicao}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Action toggle buttons */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAction('APROVADO');
                setValidationError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                action === 'APROVADO'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aprovar Documento
            </button>
            <button
              type="button"
              onClick={() => setAction('RECUSADO')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                action === 'RECUSADO'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recusar com Justificativa
            </button>
          </div>

          {/* Justification Field for Rejection */}
          {action === 'RECUSADO' ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Motivo da Recusa (Obrigatório)*
              </label>
              <textarea
                rows={3}
                value={justification}
                onChange={(e) => {
                  setJustification(e.target.value);
                  if (e.target.value.trim()) setValidationError(null);
                }}
                placeholder="Ex: Documento com imagem cortada ou ilegível; comprovante com data superior a 90 dias; assinatura faltante..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-sans"
              />
              <p className="text-[11px] text-slate-500">
                Esta justificativa será registrada na trilha imutável de auditoria e enviada no checklist do estudante.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
              <p className="font-bold mb-1">Confirmar Conformidade Documental</p>
              <p className="text-[11px] text-emerald-800">
                Ao aprovar, o índice de regularidade do dossiê do estudante será recalculado automaticamente e gravado sob hash na trilha de auditoria.
              </p>
            </div>
          )}

          {/* Validation error message */}
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 ${
                action === 'APROVADO'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{action === 'APROVADO' ? 'Efetivar Aprovação' : 'Gravar Recusa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
