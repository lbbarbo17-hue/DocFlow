'use client';

import React from 'react';
import {
  BellRing,
  AlertTriangle,
  Clock,
  RefreshCw,
  Upload,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { DocumentItem } from '@/lib/types';
import { formatDateBr } from '@/lib/utils';

interface ExpirationAlertProps {
  documents: DocumentItem[];
  onUploadClick: (doc: DocumentItem) => void;
}

export default function ExpirationAlert({ documents, onUploadClick }: ExpirationAlertProps) {
  // Busca documentos urgentes (expirados, recusados, vencendo ou pendentes obrigatórios)
  const urgentDocs = documents.filter(
    (d) =>
      d.status === 'EXPIRADO' ||
      d.status === 'RECUSADO' ||
      (d.diasParaVencer !== undefined && d.diasParaVencer <= 30) ||
      (d.recorrente && d.status !== 'APROVADO')
  );

  const pendingMandatoryDocs = documents.filter((d) => d.obrigatorio && d.status === 'PENDENTE');

  // Seleciona o documento mais urgente
  const primaryDoc = urgentDocs[0] || pendingMandatoryDocs[0] || documents[0];

  // Formatação amigável do prazo limite
  const deadlineDateStr = primaryDoc?.validadeAte
    ? formatDateBr(primaryDoc.validadeAte).split(' ')[0]
    : '29/10';

  const daysRemaining = primaryDoc?.diasParaVencer !== undefined ? primaryDoc.diasParaVencer : 3;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-colors duration-200 gap-5">
      {/* 1. Header do Painel */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-800 dark:text-amber-400" />
            Central de Avisos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Prazos contratuais e comunicações de conformidade
          </p>
        </div>

        <span className="text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-500/10 border border-amber-300/60 dark:border-amber-500/20 px-3 py-1 rounded-full">
          1 pendência prioritária
        </span>
      </div>

      {/* 2. Card de Destaque com Suporte a Tema Claro e Escuro */}
      {primaryDoc ? (
        <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/15 shadow-xs flex flex-col gap-3.5">
          {/* Topo: Ícone + Título e Descrição */}
          <div className="flex items-start gap-3.5">
            {/* Ícone de Alerta */}
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                {primaryDoc.nomeExibicao}
              </h3>

              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed font-normal">
                {primaryDoc.status === 'RECUSADO'
                  ? primaryDoc.justificativaRecusa ||
                    'Documento recusado na análise da coordenação pedagógica. É necessário enviar uma nova via com assinatura legível.'
                  : primaryDoc.status === 'EXPIRADO'
                  ? 'O prazo de validade deste termo expirou. Regularize o documento para não interromper os lançamentos da bolsa-auxílio.'
                  : 'A renovação periódica deste termo é obrigatória para manter a conformidade do seu contrato de estágio/aprendizagem.'}
              </p>
            </div>
          </div>

          {/* Rodapé de Ações: Barra completa com Badge e Botão na mesma altura */}
          <div className="pt-2.5 border-t border-amber-200/60 dark:border-amber-500/15 flex flex-wrap items-center justify-between gap-2.5">
            <div className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg bg-amber-100/90 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20 text-xs font-medium tracking-tight whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-amber-800 dark:text-amber-300 shrink-0" />
              <span>Ação necessária até {deadlineDateStr} (em {daysRemaining} dias)</span>
            </div>

            <button
              type="button"
              onClick={() => onUploadClick(primaryDoc)}
              className="h-8 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-lg text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 active:scale-95 transition-all shadow-sm cursor-pointer shrink-0"
              title={primaryDoc.status === 'RECUSADO' ? 'Corrigir e Reenviar' : 'Renovar Documento'}
            >
              {primaryDoc.status === 'RECUSADO' ? (
                <Upload className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>
                {primaryDoc.status === 'RECUSADO'
                  ? 'Corrigir e Reenviar'
                  : 'Renovar Documento'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Nenhuma pendência crítica ou renovação pendente no momento.
          </p>
        </div>
      )}

      {/* 3. Bloco de Histórico no Rodapé */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>Histórico Recente de Notificações</span>
        </div>

        <div className="space-y-3">
          {/* Item 1 */}
          <div className="flex items-start gap-2.5 text-xs leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Comprovante de Matrícula:
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                Validado e aprovado pela coordenação pedagógica (há 2 dias)
              </span>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-start gap-2.5 text-xs leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Termo de Compromisso:
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                Lembrete de renovação semestral programado (há 4 dias)
              </span>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-start gap-2.5 text-xs leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-blue-400 mt-1 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Documentos Pessoais (RG/CPF):
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                Conformidade cadastral confirmada no dossiê (há 1 semana)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
