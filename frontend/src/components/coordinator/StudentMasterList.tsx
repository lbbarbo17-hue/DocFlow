'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Loader2, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn, scrollToTop } from '@/lib/utils';
import { TipoVinculo } from '@/lib/types';
import DossierViewer from './DossierViewer';

interface StudentMasterListProps {
  initialStudentId?: string;
  initialDocId?: string;
}

interface EditFormState {
  nome: string;
  email: string;
  matricula: string;
  empresa: string;
  tipoVinculo: TipoVinculo;
  dataAdmissao: string;
  turmaId: string;
  curso: string;
  contratoInicio: string;
  contratoFim: string;
  contratoValorBolsa: string;
}

export default function StudentMasterList({
  initialStudentId,
  initialDocId,
}: StudentMasterListProps) {
  const { studentsList, turmas, currentRole, updateStudent, removeStudent, setToastMessage } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurma, setSelectedTurma] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'URGENCIA' | 'CONFORMIDADE_ASC' | 'CONFORMIDADE_DESC' | 'NOME'>('URGENCIA');
  const [activeStudentId, setActiveStudentId] = useState<string>(
    initialStudentId || studentsList[0]?.id || ''
  );
  const [activeDocId, setActiveDocId] = useState<string | undefined>(initialDocId);
  const [mobileTab, setMobileTab] = useState<'LIST' | 'DOSSIER'>(
    initialStudentId || initialDocId ? 'DOSSIER' : 'LIST'
  );

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    nome: '',
    email: '',
    matricula: '',
    empresa: '',
    tipoVinculo: 'APRENDIZ',
    dataAdmissao: '',
    turmaId: '',
    curso: '',
    contratoInicio: '',
    contratoFim: '',
    contratoValorBolsa: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (initialStudentId) {
      setActiveStudentId(initialStudentId);
    }
  }, [initialStudentId]);

  useEffect(() => {
    if (initialDocId) {
      setActiveDocId(initialDocId);
    }
  }, [initialDocId]);

  const processedStudents = useMemo(() => {
    const filtered = studentsList.filter((s) => {
      const matchesSearch =
        s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.empresa.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTurma = selectedTurma === 'ALL' || s.turmaId === selectedTurma;
      const matchesRisk = selectedRisk === 'ALL' || s.nivelRisco === selectedRisk;

      return matchesSearch && matchesTurma && matchesRisk;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'URGENCIA') {
        const riskWeight = { CRITICO: 3, MEDIO: 2, BAIXO: 1 };
        const weightDiff = riskWeight[b.nivelRisco] - riskWeight[a.nivelRisco];
        if (weightDiff !== 0) return weightDiff;

        const aHasReview = a.documentos.some((d) => d.status === 'EM_ANALISE') ? 1 : 0;
        const bHasReview = b.documentos.some((d) => d.status === 'EM_ANALISE') ? 1 : 0;
        if (bHasReview !== aHasReview) return bHasReview - aHasReview;

        return a.percentualConformidade - b.percentualConformidade;
      }

      if (sortBy === 'CONFORMIDADE_ASC') {
        return a.percentualConformidade - b.percentualConformidade;
      }

      if (sortBy === 'CONFORMIDADE_DESC') {
        return b.percentualConformidade - a.percentualConformidade;
      }

      if (sortBy === 'NOME') {
        return a.nome.localeCompare(b.nome);
      }

      return 0;
    });
  }, [studentsList, searchTerm, selectedTurma, selectedRisk, sortBy]);

  const activeStudent =
    studentsList.find((s) => s.id === activeStudentId) || processedStudents[0] || studentsList[0];

  const openEditModal = (s: typeof processedStudents[0]) => {
    setEditForm({
      nome: s.nome,
      email: s.email,
      matricula: s.matricula,
      empresa: s.empresa,
      tipoVinculo: s.tipoVinculo,
      dataAdmissao: s.dataAdmissao || '',
      turmaId: s.turmaId,
      curso: s.curso,
      contratoInicio: s.contratoAtivo?.dataInicio || s.dataAdmissao || new Date().toISOString().split('T')[0],
      contratoFim: s.contratoAtivo?.dataFim || '2026-12-15',
      contratoValorBolsa: s.contratoAtivo?.valorBolsa ? String(s.contratoAtivo.valorBolsa) : '1650.00',
    });
    setEditingStudentId(s.id);
  };

  const handleEditSave = async () => {
    if (!editingStudentId) return;
    if (!editForm.nome.trim() || !editForm.matricula.trim()) {
      setToastMessage({ title: 'Campos obrigatórios', desc: 'Nome e matrícula são obrigatórios.', type: 'error' });
      return;
    }
    setIsSaving(true);
    try {
      await updateStudent(editingStudentId, {
        nome: editForm.nome.trim(),
        email: editForm.email.trim(),
        matricula: editForm.matricula.trim(),
        empresa: editForm.empresa.trim(),
        dataAdmissao: editForm.dataAdmissao,
        turmaId: editForm.turmaId,
        curso: editForm.curso,
        contrato: {
          dataInicio: editForm.contratoInicio,
          dataFim: editForm.contratoFim,
          valorBolsa: editForm.contratoValorBolsa,
        },
      });
      setToastMessage({ title: 'Estudante atualizado', desc: `${editForm.nome} foi atualizado com sucesso.`, type: 'success' });
      setEditingStudentId(null);
    } catch {
      setToastMessage({ title: 'Erro ao atualizar', desc: 'Não foi possível salvar as alterações no banco de dados.', type: 'error' });
    }
    setIsSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    const target = studentsList.find((s) => s.id === deleteConfirmId);
    try {
      await removeStudent(deleteConfirmId);
      setToastMessage({ title: 'Estudante removido', desc: `${target?.nome || 'Estudante'} foi excluído do sistema.`, type: 'success' });
      setDeleteConfirmId(null);
      if (activeStudentId === deleteConfirmId) {
        setActiveStudentId(studentsList.find((s) => s.id !== deleteConfirmId)?.id || '');
      }
    } catch {
      setToastMessage({ title: 'Erro ao excluir', desc: 'Não foi possível remover o estudante no banco de dados.', type: 'error' });
    }
    setIsDeleting(false);
  };

  const studentToDelete = studentsList.find((s) => s.id === deleteConfirmId);

  return (
    <div className="space-y-4">
      {editingStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Editar Estudante</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">CPF e senha não podem ser alterados aqui</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudentId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tipo de Vínculo:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                  {editForm.tipoVinculo === 'APRENDIZ' ? 'Jovem Aprendiz' : 'Estágio (TCE)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={editForm.nome}
                    onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))}
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#085078] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Matrícula
                  </label>
                  <input
                    type="text"
                    value={editForm.matricula}
                    onChange={(e) => setEditForm((f) => ({ ...f, matricula: e.target.value }))}
                    className="w-full h-10 px-3 text-xs font-mono bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#085078] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">E-mail</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#085078] transition-all"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Empresa Concedente</label>
                  <input
                    type="text"
                    value={editForm.empresa}
                    onChange={(e) => setEditForm((f) => ({ ...f, empresa: e.target.value }))}
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#085078] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Turma / Curso</label>
                  <select
                    value={editForm.turmaId}
                    onChange={(e) => {
                      const t = turmas.find((x) => x.id === e.target.value);
                      setEditForm((f) => ({ ...f, turmaId: e.target.value, curso: t?.nomeCurso || f.curso }));
                    }}
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#085078] cursor-pointer"
                  >
                    {turmas.map((t) => (
                      <option key={t.id} value={t.id}>{t.codigo} — {t.nomeCurso}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Data de Admissão</label>
                  <input
                    type="date"
                    value={editForm.dataAdmissao}
                    onChange={(e) => setEditForm((f) => ({ ...f, dataAdmissao: e.target.value }))}
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#085078]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Contrato & Remuneração
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Vigência e reajuste salarial
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Início da Vigência
                    </label>
                    <input
                      type="date"
                      value={editForm.contratoInicio}
                      onChange={(e) => setEditForm((f) => ({ ...f, contratoInicio: e.target.value }))}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#085078]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Término da Vigência
                    </label>
                    <input
                      type="date"
                      value={editForm.contratoFim}
                      onChange={(e) => setEditForm((f) => ({ ...f, contratoFim: e.target.value }))}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#085078]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {editForm.tipoVinculo === 'APRENDIZ' ? 'Salário / Bolsa (R$)' : 'Bolsa-Auxílio (R$)'}
                    </label>
                    <input
                      type="text"
                      value={editForm.contratoValorBolsa}
                      onChange={(e) => setEditForm((f) => ({ ...f, contratoValorBolsa: e.target.value }))}
                      placeholder="1650.00"
                      className="w-full h-10 px-3 text-xs font-mono bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#085078]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingStudentId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEditSave}
                disabled={isSaving}
                className="px-5 py-2.5 text-xs font-medium text-white bg-[#085078] hover:bg-[#063f60] rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-rose-200 dark:border-rose-900 shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-950/60 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Excluir Estudante?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Você está prestes a excluir <span className="font-semibold text-slate-700 dark:text-slate-200">{studentToDelete?.nome}</span>. Esta ação não pode ser desfeita e removerá todos os dados vinculados.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Barra de Filtros Única e Enxuta */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 mb-6 flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, matrícula ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#085078] transition-colors"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <select
            value={selectedTurma}
            onChange={(e) => setSelectedTurma(e.target.value)}
            aria-label="Filtrar por turma"
            className="h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-[#085078] cursor-pointer"
          >
            <option value="ALL">Todas as Turmas</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.codigo}
              </option>
            ))}
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            aria-label="Filtrar por status"
            className="h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-[#085078] cursor-pointer"
          >
            <option value="ALL">Todos os Status</option>
            <option value="CRITICO">Crítico</option>
            <option value="MEDIO">Atenção</option>
            <option value="BAIXO">Em Dia</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as 'URGENCIA' | 'CONFORMIDADE_ASC' | 'CONFORMIDADE_DESC' | 'NOME'
              )
            }
            aria-label="Ordenar por"
            className="h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-[#085078] cursor-pointer"
          >
            <option value="URGENCIA">Ordenar por: Urgência</option>
            <option value="CONFORMIDADE_ASC">Ordenar por: Menor Conformidade</option>
            <option value="CONFORMIDADE_DESC">Ordenar por: Maior Conformidade</option>
            <option value="NOME">Ordenar por: Nome (A - Z)</option>
          </select>
        </div>
      </div>

      <div className="flex lg:hidden bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
        <button
          type="button"
          onClick={() => {
            setMobileTab('LIST');
            scrollToTop('instant');
          }}
          className={cn(
            'flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer',
            mobileTab === 'LIST'
              ? 'bg-[#085078] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          )}
        >
          Lista de Aprendizes ({processedStudents.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setMobileTab('DOSSIER');
            scrollToTop('instant');
          }}
          className={cn(
            'flex-1 py-2 text-xs font-medium rounded-lg transition-colors truncate px-2 cursor-pointer',
            mobileTab === 'DOSSIER'
              ? 'bg-[#085078] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          )}
        >
          {activeStudent ? `Dossiê: ${activeStudent.nome.split(' ')[0]}` : 'Dossiê do Aluno'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* 2. Coluna Esquerda: Lista Plana de Aprendizes */}
        <div className={cn('lg:col-span-4 space-y-2.5 max-h-[750px] overflow-y-auto pr-1', mobileTab !== 'LIST' && 'hidden lg:block')}>
          {processedStudents.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium text-xs">
              Nenhum aprendiz encontrado.
            </div>
          ) : (
            <>
              {processedStudents.map((s) => renderStudentCard(s))}
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
                {processedStudents.length} {processedStudents.length === 1 ? 'aprendiz listado' : 'aprendizes listados'}
              </p>
            </>
          )}
        </div>

        {/* 3. Coluna Direita: Painel do Dossiê Simplificado */}
        <div className={cn('lg:col-span-8', mobileTab !== 'DOSSIER' && 'hidden lg:block')}>
          <button
            type="button"
            onClick={() => setMobileTab('LIST')}
            className="lg:hidden mb-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-[#085078] dark:text-cyan-300 border border-slate-200 dark:border-slate-800 text-xs font-medium shadow-2xs hover:bg-slate-50 transition-colors"
          >
            ← Voltar para lista de aprendizes
          </button>

          {activeStudent ? (
            <DossierViewer
              student={activeStudent}
              initialDocId={activeDocId}
              onEdit={currentRole === 'COORDENADOR' ? () => openEditModal(activeStudent) : undefined}
              onDelete={currentRole === 'COORDENADOR' ? () => setDeleteConfirmId(activeStudent.id) : undefined}
            />
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium text-xs shadow-sm">
              Selecione um aprendiz para visualizar o dossiê.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function renderStudentCard(s: typeof processedStudents[0]) {
    const isSelected = s.id === activeStudent?.id;
    const badge =
      s.nivelRisco === 'CRITICO'
        ? {
            label: 'Crítico',
            className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
          }
        : s.nivelRisco === 'MEDIO'
        ? {
            label: 'Atenção',
            className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
          }
        : {
            label: 'Em Dia',
            className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
          };

    const turmaCodigo =
      turmas.find((t) => t.id === s.turmaId)?.codigo ||
      s.turmaNome?.split('—')[0]?.trim() ||
      'Sem Turma';

    return (
      <div
        key={s.id}
        onClick={() => {
          setActiveStudentId(s.id);
          setActiveDocId(undefined);
          setMobileTab('DOSSIER');
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            scrollToTop('instant');
          }
        }}
        className={cn(
          'rounded-lg p-3.5 border transition-colors cursor-pointer',
          isSelected
            ? 'border-[#085078] dark:border-cyan-500/60 bg-slate-100/80 dark:bg-slate-800/80'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {s.nome}
          </p>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0 ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
          {turmaCodigo}
          {s.empresa ? ` • ${s.empresa}` : ''}
        </p>
      </div>
    );
  }
}
