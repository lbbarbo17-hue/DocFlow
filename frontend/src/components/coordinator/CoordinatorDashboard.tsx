'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';

interface CoordinatorDashboardProps {
  onNavigateToDossier: (studentId: string, docId?: string) => void;
}

function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return 'Enviado recentemente';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Enviado agora';
    if (diffMins < 60) return `Enviado há ${diffMins} min`;
    if (diffHours < 24) return `Enviado há ${diffHours}h`;
    if (diffDays === 1) return 'Enviado ontem';
    if (diffDays < 30) return `Enviado há ${diffDays} dias`;
    return `Enviado em ${date.toLocaleDateString('pt-BR')}`;
  } catch {
    return 'Enviado recentemente';
  }
}

function formatDateBrShort(dateStr?: string): string {
  if (!dateStr) return 'A definir';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR');
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export default function CoordinatorDashboard({ onNavigateToDossier }: CoordinatorDashboardProps) {
  const { studentsList } = useApp();

  // 1. Fila de documentos aguardando parecer (status: EM_ANALISE)
  const pendingReviews = useMemo(() => {
    const list: Array<{
      studentId: string;
      studentNome: string;
      docId: string;
      docNome: string;
      dataEnvio?: string;
    }> = [];

    studentsList.forEach((s) => {
      s.documentos.forEach((doc) => {
        if (doc.status === 'EM_ANALISE') {
          list.push({
            studentId: s.id,
            studentNome: s.nome,
            docId: doc.id,
            docNome: doc.nomeExibicao,
            dataEnvio: doc.dataEnvio,
          });
        }
      });
    });

    return list;
  }, [studentsList]);

  // 2. Indicadores numéricos do Panorama Geral
  const { countCriticos, countVencendo, percentualEmDia } = useMemo(() => {
    let criticos = 0;
    let vencendo = 0;

    studentsList.forEach((s) => {
      s.documentos.forEach((doc) => {
        if (doc.status === 'EXPIRADO' || doc.status === 'RECUSADO') {
          criticos += 1;
        } else if (
          doc.recorrente &&
          doc.status === 'APROVADO' &&
          doc.diasParaVencer !== undefined &&
          doc.diasParaVencer <= 30 &&
          doc.diasParaVencer > 0
        ) {
          vencendo += 1;
        }
      });
    });

    const totalAlunos = studentsList.length;
    const regulares = studentsList.filter((s) => s.percentualConformidade === 100).length;
    const emDia = totalAlunos > 0 ? Math.round((regulares / totalAlunos) * 100) : 100;

    return {
      countCriticos: criticos,
      countVencendo: vencendo,
      percentualEmDia: emDia,
    };
  }, [studentsList]);

  // 3. Próximos Vencimentos (documentos recorrentes com diasParaVencer <= 30)
  const expiringDocs = useMemo(() => {
    const list: Array<{
      studentId: string;
      studentNome: string;
      docId: string;
      docNome: string;
      validadeAte?: string;
      diasParaVencer?: number;
    }> = [];

    studentsList.forEach((s) => {
      s.documentos.forEach((doc) => {
        if (
          doc.recorrente &&
          doc.status === 'APROVADO' &&
          doc.diasParaVencer !== undefined &&
          doc.diasParaVencer <= 30 &&
          doc.diasParaVencer > 0
        ) {
          list.push({
            studentId: s.id,
            studentNome: s.nome,
            docId: doc.id,
            docNome: doc.nomeExibicao,
            validadeAte: doc.validadeAte,
            diasParaVencer: doc.diasParaVencer,
          });
        }
      });
    });

    return list.sort((a, b) => (a.diasParaVencer ?? 999) - (b.diasParaVencer ?? 999));
  }, [studentsList]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-fadeIn">
      {/* COLUNA ESQUERDA: Aguardando Parecer / Fila de Validação */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Aguardando Parecer
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {pendingReviews.length} {pendingReviews.length === 1 ? 'pendente' : 'pendentes'}
          </span>
        </div>

        {pendingReviews.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Nenhum documento aguardando parecer no momento.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingReviews.map((item) => (
              <div
                key={`${item.studentId}-${item.docId}`}
                className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {item.studentNome}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {item.docNome} • {formatTimeAgo(item.dataEnvio)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateToDossier(item.studentId, item.docId)}
                  className="bg-[#085078] hover:bg-[#063f60] text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm shrink-0 cursor-pointer"
                >
                  Analisar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COLUNA DIREITA: Panorama Geral & Vencimentos */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        {/* Topo do card: 3 indicadores numéricos enxutos lado a lado */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Em Risco Crítico
            </p>
            <p
              className={`text-2xl font-bold mt-1 tracking-tight ${
                countCriticos > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {countCriticos}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Vencendo em 30d
            </p>
            <p
              className={`text-2xl font-bold mt-1 tracking-tight ${
                countVencendo > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {countVencendo}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Aprendizes em Dia
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
              {percentualEmDia}%
            </p>
          </div>
        </div>

        {/* Divisor sutil */}
        <div className="border-t border-slate-200 dark:border-slate-800 my-5" />

        {/* Abaixo do divisor: Próximos Vencimentos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Próximos Vencimentos
            </h3>
            {expiringDocs.length > 0 && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                {expiringDocs.length} {expiringDocs.length === 1 ? 'item' : 'itens'}
              </span>
            )}
          </div>

          {expiringDocs.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              Nenhum documento com vencimento próximo nos próximos 30 dias.
            </div>
          ) : (
            <div className="space-y-2.5">
              {expiringDocs.slice(0, 6).map((item) => (
                <div
                  key={`${item.studentId}-${item.docId}`}
                  onClick={() => onNavigateToDossier(item.studentId, item.docId)}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex items-center justify-between gap-3 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {item.studentNome}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {item.docNome}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 block">
                      {item.diasParaVencer} {item.diasParaVencer === 1 ? 'dia restante' : 'dias restantes'}
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Data limite: {formatDateBrShort(item.validadeAte)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
