'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
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

  // 2. Aprendizes com pendências (status: PENDENTE ou RECUSADO)
  const pendingStudents = useMemo(() => {
    const list: Array<{
      studentId: string;
      studentNome: string;
      motivo: string;
      firstIssueDocId?: string;
      urgencyWeight: number;
    }> = [];

    studentsList.forEach((s) => {
      const recusados = s.documentos.filter((d) => d.status === 'RECUSADO');
      const pendentes = s.documentos.filter((d) => d.status === 'PENDENTE');
      const total = recusados.length + pendentes.length;

      if (total > 0) {
        let motivo = '';
        if (recusados.length > 0) {
          if (recusados.length === 1 && pendentes.length === 0) {
            motivo = `${recusados[0].nomeExibicao} recusado`;
          } else if (recusados.length === 1 && pendentes.length > 0) {
            const pendText = pendentes.length === 1 ? '1 pendente' : `${pendentes.length} pendentes`;
            motivo = `${recusados[0].nomeExibicao} recusado (${pendText})`;
          } else if (recusados.length > 1 && pendentes.length === 0) {
            motivo = `${recusados.length} documentos recusados`;
          } else {
            motivo = `${recusados.length} recusados • ${pendentes.length} pendentes`;
          }
        } else {
          if (pendentes.length === 1) {
            motivo = `${pendentes[0].nomeExibicao} pendente`;
          } else {
            motivo = `${pendentes.length} documentos pendentes`;
          }
        }

        const firstIssueDoc = recusados[0] || pendentes[0];

        list.push({
          studentId: s.id,
          studentNome: s.nome,
          motivo,
          firstIssueDocId: firstIssueDoc?.id,
          urgencyWeight: recusados.length * 10 + pendentes.length,
        });
      }
    });

    return list.sort((a, b) => b.urgencyWeight - a.urgencyWeight);
  }, [studentsList]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-fadeIn">
      {/* COLUNA ESQUERDA: Aguardando Parecer / Fila de Validação */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Aguardando Parecer
          </h2>
          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-medium px-2.5 py-1 rounded-md">
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
                className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500 rounded-lg p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {item.studentNome}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {item.docNome} • {formatTimeAgo(item.dataEnvio)}
                  </p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    EM ANÁLISE
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateToDossier(item.studentId, item.docId)}
                  className="bg-[#085078] hover:bg-[#063f60] text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shrink-0 cursor-pointer shadow-sm"
                >
                  Analisar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COLUNA DIREITA: Aprendizes com Pendências */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Aprendizes com Pendências
          </h2>
          <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-medium px-2.5 py-1 rounded-md">
            {pendingStudents.length} {pendingStudents.length === 1 ? 'aprendiz' : 'aprendizes'}
          </span>
        </div>

        {pendingStudents.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Todos os aprendizes estão com a documentação regularizada.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingStudents.map((item) => (
              <div
                key={item.studentId}
                className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 border-l-4 border-l-rose-500 rounded-lg p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {item.studentNome}
                  </p>
                  <span className="inline-block max-w-full truncate align-bottom mt-1.5 px-2 py-0.5 text-[11px] font-medium rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    {item.motivo}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateToDossier(item.studentId, item.firstIssueDocId)}
                  className="bg-[#085078] hover:bg-[#063f60] text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shrink-0 cursor-pointer shadow-sm"
                >
                  Ver Dossiê
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Rodapé: Link para visualização completa de aprendizes */}
        <Link
          href="/coordenador/aprendizes"
          className="block w-full mt-4 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Ver todos os aprendizes →
        </Link>
      </div>
    </div>
  );
}
