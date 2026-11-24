'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, X, Loader2, AlertTriangle, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Student, Turma } from '@/lib/types';

type TurmaStatus = 'CRITICO' | 'ATENCAO' | 'REGULAR' | 'VAZIA';
type TurmaStatusFilter = 'ALL' | TurmaStatus;

function isStudentRegular(s: Student): boolean {
  const essentialDocs = (s.documentos || []).filter((d) => d.obrigatorio);
  if (essentialDocs.length === 0) return s.percentualConformidade === 100;
  return essentialDocs.every((d) => d.status === 'APROVADO');
}

function getStudentApprovedPercent(s: Student): number {
  const essentialDocs = (s.documentos || []).filter((d) => d.obrigatorio);
  if (essentialDocs.length === 0) return s.percentualConformidade ?? 0;
  const approvedCount = essentialDocs.filter((d) => d.status === 'APROVADO').length;
  return Math.round((approvedCount / essentialDocs.length) * 100);
}

export default function TurmaRiskTable() {
  const { turmas, studentsList, updateTurma, removeTurma, setToastMessage } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TurmaStatusFilter>('ALL');

  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [editForm, setEditForm] = useState({ codigo: '', nomeCurso: '', periodo: '' });
  const [isSaving, setIsSaving] = useState(false);

  const [deleteConfirmTurma, setDeleteConfirmTurma] = useState<Turma | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const enrichedTurmas = useMemo(() => {
    return turmas.map((turma) => {
      const turmaStudents = studentsList.filter((s) => s.turmaId === turma.id);
      const totalAlunos = turmaStudents.length;
      const regularesCount = turmaStudents.filter(isStudentRegular).length;
      const conformidadeMedia =
        totalAlunos > 0
          ? Math.round(
              turmaStudents.reduce((acc, s) => acc + getStudentApprovedPercent(s), 0) / totalAlunos
            )
          : 0;
      const hasCriticalRisk = turmaStudents.some(
        (s) =>
          s.nivelRisco === 'CRITICO' ||
          (s.documentos || []).some((d) => d.status === 'RECUSADO' || d.status === 'EXPIRADO')
      );

      let status: TurmaStatus = 'VAZIA';
      let statusLabel = 'Vazia';
      let statusBadgeClass =
        'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
      let rowBorderClass = 'border-l-4 border-l-slate-300 dark:border-l-slate-700';
      let progressBarClass = 'bg-slate-400';

      if (totalAlunos > 0) {
        if (hasCriticalRisk) {
          status = 'CRITICO';
          statusLabel = 'Crítico';
          statusBadgeClass =
            'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
          rowBorderClass = 'border-l-4 border-l-rose-500';
          progressBarClass = 'bg-rose-500';
        } else if (conformidadeMedia < 100) {
          status = 'ATENCAO';
          statusLabel = 'Atenção';
          statusBadgeClass =
            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
          rowBorderClass = 'border-l-4 border-l-amber-500';
          progressBarClass = 'bg-amber-500';
        } else {
          status = 'REGULAR';
          statusLabel = 'Regular';
          statusBadgeClass =
            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
          rowBorderClass = 'border-l-4 border-l-emerald-500';
          progressBarClass = 'bg-emerald-500';
        }
      }

      return {
        turma,
        totalAlunos,
        regularesCount,
        conformidadeMedia,
        status,
        statusLabel,
        statusBadgeClass,
        rowBorderClass,
        progressBarClass,
      };
    });
  }, [turmas, studentsList]);

  const totalActiveStudents = studentsList.length;
  const attentionTurmasCount = enrichedTurmas.filter(
    (item) => item.status === 'CRITICO' || item.status === 'ATENCAO'
  ).length;

  const filteredTurmas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedTurmas.filter((item) => {
      const matchesSearch =
        !q ||
        item.turma.codigo.toLowerCase().includes(q) ||
        item.turma.nomeCurso.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedTurmas, searchQuery, statusFilter]);

  const openEditModal = (turma: Turma) => {
    setEditForm({
      codigo: turma.codigo,
      nomeCurso: turma.nomeCurso,
      periodo: turma.periodo,
    });
    setEditingTurma(turma);
  };

  const handleSaveEdit = async () => {
    if (!editingTurma) return;
    if (!editForm.codigo.trim() || !editForm.nomeCurso.trim() || !editForm.periodo.trim()) {
      setToastMessage({
        title: 'Campos obrigatórios',
        desc: 'Código, curso e período são obrigatórios.',
        type: 'error',
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateTurma(editingTurma.id, {
        codigo: editForm.codigo.trim(),
        nomeCurso: editForm.nomeCurso.trim(),
        periodo: editForm.periodo.trim(),
      });
      setToastMessage({
        title: 'Turma atualizada',
        desc: `${editForm.codigo.trim()} foi atualizada com sucesso.`,
        type: 'success',
      });
      setEditingTurma(null);
    } catch {
      setToastMessage({
        title: 'Erro ao atualizar',
        desc: 'Não foi possível atualizar os dados da turma.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTurma) return;
    setIsDeleting(true);
    try {
      await removeTurma(deleteConfirmTurma.id);
      setToastMessage({
        title: 'Turma removida',
        desc: `${deleteConfirmTurma.codigo} foi excluída do sistema.`,
        type: 'success',
      });
      setDeleteConfirmTurma(null);
    } catch {
      setToastMessage({
        title: 'Erro ao excluir',
        desc: 'Não foi possível excluir a turma.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        {/* 1. Topo: Título + Resumo inline enxuto à direita */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Monitoramento por Turma
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {totalActiveStudents}{' '}
              {totalActiveStudents === 1 ? 'aprendiz ativo' : 'aprendizes ativos'}
            </span>

            {attentionTurmasCount > 0 ? (
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {attentionTurmasCount}{' '}
                {attentionTurmasCount === 1
                  ? 'turma requer atenção'
                  : 'turmas requerem atenção'}
              </span>
            ) : (
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                0 turmas requerem atenção
              </span>
            )}
          </div>
        </div>

        {/* Barra compacta de busca e filtro */}
        <div className="flex flex-col sm:flex-row gap-3 my-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código da turma ou curso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#085078] transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TurmaStatusFilter)}
            aria-label="Filtrar por status da turma"
            className="h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-[#085078] cursor-pointer sm:w-44"
          >
            <option value="ALL">Todos os Status</option>
            <option value="CRITICO">Crítico</option>
            <option value="ATENCAO">Atenção</option>
            <option value="REGULAR">Regular</option>
            <option value="VAZIA">Vazia</option>
          </select>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-5">Turma</th>
                <th className="py-3 px-5">Período</th>
                <th className="py-3 px-5 text-center">Aprendizes</th>
                <th className="py-3 px-5">Conformidade</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {filteredTurmas.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs text-slate-500 dark:text-slate-400"
                  >
                    {turmas.length === 0
                      ? 'Nenhuma turma cadastrada no momento.'
                      : 'Nenhuma turma encontrada para os filtros aplicados.'}
                  </td>
                </tr>
              ) : (
                filteredTurmas.map(
                  ({
                    turma,
                    totalAlunos,
                    regularesCount,
                    conformidadeMedia,
                    statusLabel,
                    statusBadgeClass,
                    rowBorderClass,
                    progressBarClass,
                  }) => (
                    <tr
                      key={turma.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* 1. Turma (com borda esquerda colorida por status) */}
                      <td className={`py-4 px-5 ${rowBorderClass}`}>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {turma.codigo}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {turma.nomeCurso}
                        </p>
                      </td>

                      {/* 2. Período */}
                      <td className="py-4 px-5 text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {turma.periodo}
                      </td>

                      {/* 3. Aprendizes (Contagem real) */}
                      <td className="py-4 px-5 text-center text-sm font-semibold text-slate-900 dark:text-white">
                        {totalAlunos}
                      </td>

                      {/* 4. Conformidade (Média real de documentos aprovados + cor por status) */}
                      <td className="py-4 px-5">
                        {totalAlunos === 0 ? (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Sem aprendizes
                          </span>
                        ) : (
                          <div className="space-y-1.5 min-w-[160px] max-w-[220px]">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 dark:text-slate-400">
                                {regularesCount} de {totalAlunos}{' '}
                                {regularesCount === 1 ? 'regular' : 'regulares'}
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white font-mono">
                                {conformidadeMedia}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${progressBarClass}`}
                                style={{ width: `${conformidadeMedia}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 5. Status */}
                      <td className="py-4 px-5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium ${statusBadgeClass}`}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      {/* 6. Ações */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {totalAlunos === 0 ? (
                            <Link
                              href="/coordenador/cadastro"
                              className="text-xs font-medium text-[#085078] dark:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                              + Vincular Aprendiz
                            </Link>
                          ) : (
                            <Link
                              href={`/coordenador/dossies?turma=${turma.id}`}
                              className="text-xs font-medium text-[#085078] dark:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                              Ver Alunos
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditModal(turma)}
                            title="Editar turma"
                            aria-label={`Editar ${turma.codigo}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmTurma(turma)}
                            title="Excluir turma"
                            aria-label={`Excluir ${turma.codigo}`}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição de Turma */}
      {editingTurma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Editar Turma
              </h3>
              <button
                type="button"
                onClick={() => setEditingTurma(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Código da Turma
                </label>
                <input
                  type="text"
                  value={editForm.codigo}
                  onChange={(e) => setEditForm((f) => ({ ...f, codigo: e.target.value }))}
                  className="w-full h-10 px-3 text-xs font-mono bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#085078]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Nome do Curso
                </label>
                <input
                  type="text"
                  value={editForm.nomeCurso}
                  onChange={(e) => setEditForm((f) => ({ ...f, nomeCurso: e.target.value }))}
                  className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#085078]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Período / Turno
                </label>
                <input
                  type="text"
                  value={editForm.periodo}
                  onChange={(e) => setEditForm((f) => ({ ...f, periodo: e.target.value }))}
                  placeholder="Ex: 2026.1 • Manhã"
                  className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#085078]"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingTurma(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-5 py-2.5 text-xs font-medium text-white bg-[#085078] hover:bg-[#063f60] rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão de Turma */}
      {deleteConfirmTurma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-rose-200 dark:border-rose-900 shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-950/60 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Excluir Turma?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tem certeza que deseja excluir{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {deleteConfirmTurma.codigo}
                  </span>
                  ? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmTurma(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? 'Excluindo...' : 'Sim, excluir'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
