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
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border-2 border-slate-400 dark:border dark:border-slate-800 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div
          className={`p-5 text-white flex items-center justify-between ${
            action === 'APROVADO' ? 'bg-emerald-700 dark:bg-emerald-800' : 'bg-rose-700 dark:bg-rose-800'
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
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1.5 border-2 border-slate-400 dark:border dark:border-slate-800 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setAction('APROVADO');
                setValidationError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                action === 'APROVADO'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'
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
                  : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Recusar com Justificativa
            </button>
          </div>

          {/* Justification Field for Rejection */}
          {action === 'RECUSADO' ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100">
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
                className="w-full text-xs p-3 rounded-xl border-2 border-slate-400 dark:border dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white placeholder:text-slate-600 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
              <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                Esta justificativa será enviada para o estudante para que ele possa providenciar a regularização.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border-2 border-emerald-400 dark:border dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200">
              <p className="font-bold mb-1">Confirmar Aprovação do Documento</p>
              <p className="text-[11px] font-medium text-emerald-950 dark:text-emerald-200">
                Ao aprovar, o documento será marcado como válido e o dossiê do estudante será atualizado com sucesso.
              </p>
            </div>
          )}

          {/* Validation error message */}
          {validationError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-400 dark:border dark:border-rose-800/60 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t-2 border-slate-400 dark:border-t dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
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
