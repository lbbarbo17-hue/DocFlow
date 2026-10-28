'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronDown, ChevronRight, Layers, Pencil, Trash2, X, Loader2, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getRiskBadgeConfig, cn, scrollToTop } from '@/lib/utils';
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

  const [collapsedTurmas, setCollapsedTurmas] = useState<Record<string, boolean>>({});

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

  const toggleTurmaCollapse = (turmaId: string) => {
    setCollapsedTurmas((prev) => ({
      ...prev,
      [turmaId]: !prev[turmaId],
    }));
  };

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

  const groupedByTurma = useMemo(() => {
    const map = new Map<string, typeof processedStudents>();

    turmas.forEach((t) => {
      map.set(t.id, []);
    });

    processedStudents.forEach((student) => {
      const existing = map.get(student.turmaId) || [];
      existing.push(student);
      map.set(student.turmaId, existing);
    });

    return map;
  }, [turmas, processedStudents]);

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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg">
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
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tipo de Vínculo:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                  {editForm.tipoVinculo === 'APRENDIZ' ? 'Jovem Aprendiz' : 'Estágio (TCE)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Nome Completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.nome}
                    onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))}
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Matrícula <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.matricula}
                    onChange={(e) => setEditForm((f) => ({ ...f, matricula: e.target.value }))}
                    className="w-full h-10 px-3 text-xs font-mono bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">E-mail</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 transition-all"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Empresa Concedente</label>
                  <input
                    type="text"
                    value={editForm.empresa}
                    onChange={(e) => setEditForm((f) => ({ ...f, empresa: e.target.value }))}
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 transition-all"
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
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer"
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
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
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
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
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
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
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
                      className="w-full h-10 px-3 text-xs font-mono bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingStudentId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEditSave}
                disabled={isSaving}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900 shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-950/60 rounded-xl shrink-0">
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
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, matrícula ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-950 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-[#065373] cursor-pointer shadow-2xs"
          >
            <option value="ALL">Todos os Riscos</option>
            <option value="CRITICO">Risco Crítico</option>
            <option value="MEDIO">Atenção / Médio</option>
            <option value="BAIXO">Regular / Baixo</option>
          </select>

          <div className="flex items-center gap-1 bg-slate-50/60 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 shadow-2xs">
            <ArrowUpDown className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'URGENCIA' | 'CONFORMIDADE_ASC' | 'CONFORMIDADE_DESC' | 'NOME'
                )
              }
              className="text-xs bg-transparent border-none focus:outline-none text-slate-800 dark:text-slate-100 font-semibold cursor-pointer"
            >
              <option value="URGENCIA">Urgência</option>
              <option value="CONFORMIDADE_ASC">Menor Conformidade</option>
              <option value="CONFORMIDADE_DESC">Maior Conformidade</option>
              <option value="NOME">Nome (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedTurma('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedTurma === 'ALL'
              ? 'bg-[#065373] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-2xs'
          }`}
        >
          Todas as Turmas ({studentsList.length})
        </button>

        {turmas.map((t) => {
          const count = studentsList.filter((s) => s.turmaId === t.id).length;
          const isSelected = selectedTurma === t.id;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTurma(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#065373] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-2xs'
              }`}
            >
              <span>{t.codigo}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex lg:hidden bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <button
          type="button"
          onClick={() => {
            setMobileTab('LIST');
            scrollToTop('instant');
          }}
          className={cn(
            'flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer',
            mobileTab === 'LIST'
              ? 'bg-[#065373] text-white shadow-xs'
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
            'flex-1 py-2 text-xs font-bold rounded-lg transition-all truncate px-2 cursor-pointer',
            mobileTab === 'DOSSIER'
              ? 'bg-[#065373] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          )}
        >
          {activeStudent ? `Dossiê: ${activeStudent.nome.split(' ')[0]}` : 'Dossiê do Aluno'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className={cn('lg:col-span-4 space-y-3 max-h-[750px] overflow-y-auto pr-1', mobileTab !== 'LIST' && 'hidden lg:block')}>
          {processedStudents.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs">
              Nenhum estudante encontrado.
            </div>
          ) : selectedTurma !== 'ALL' ? (
            <div className="space-y-2">
              {processedStudents.map((s) => renderStudentCard(s))}
            </div>
          ) : (
            Array.from(groupedByTurma.entries()).map(([turmaId, studentsInTurma]) => {
              if (studentsInTurma.length === 0) return null;
              const turmaObj = turmas.find((t) => t.id === turmaId);
              const isCollapsed = Boolean(collapsedTurmas[turmaId]);

              return (
                <div
                  key={turmaId}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleTurmaCollapse(turmaId)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between text-left cursor-pointer border-b border-slate-300 dark:border-b dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Layers className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400 shrink-0" />
                      <span className="font-bold text-xs text-slate-950 dark:text-white truncate">
                        {turmaObj?.codigo || 'Turma'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate hidden sm:inline">
                        • {turmaObj?.nomeCurso}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600">
                        {studentsInTurma.length}
                      </span>
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      )}
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div className="p-2.5 space-y-2.5 bg-slate-50/60 dark:bg-slate-950/30">
                      {studentsInTurma.map((s) => renderStudentCard(s))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className={cn('lg:col-span-8', mobileTab !== 'DOSSIER' && 'hidden lg:block')}>
          <button
            type="button"
            onClick={() => setMobileTab('LIST')}
            className="lg:hidden mb-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-[#065373] dark:text-cyan-300 border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-2xs hover:bg-slate-50 transition-colors"
          >
            ← Voltar para lista de aprendizes
          </button>

          {activeStudent ? (
            <div className="space-y-3">
              {currentRole === 'COORDENADOR' && (
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(activeStudent)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#065373] hover:text-[#065373] dark:hover:border-cyan-400 dark:hover:text-cyan-400 transition-all shadow-2xs cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(activeStudent.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all shadow-2xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                </div>
              )}
              <DossierViewer student={activeStudent} initialDocId={activeDocId} />
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium text-xs shadow-sm">
              Selecione um estudante para visualizar o dossiê.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function renderStudentCard(s: typeof processedStudents[0]) {
    const isSelected = s.id === activeStudent?.id;
    const riskBadge = getRiskBadgeConfig(s.nivelRisco);

    const hasReview = s.documentos.filter((d) => d.status === 'EM_ANALISE').length;
    const hasExpired = s.documentos.filter((d) => d.status === 'EXPIRADO').length;
    const hasRejected = s.documentos.filter((d) => d.status === 'RECUSADO').length;
    const hasExpiring = s.documentos.filter(
      (d) =>
        d.recorrente &&
        d.status === 'APROVADO' &&
        d.diasParaVencer !== undefined &&
        d.diasParaVencer <= 30 &&
        d.diasParaVencer > 0
    ).length;

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
        className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
          isSelected
            ? 'bg-white dark:bg-slate-800 border-[#0284c7] dark:border-[#00b4d8] shadow-sm ring-1 ring-[#0284c7]'
            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-100 shadow-2xs hover:shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="truncate">
            <p className="font-bold text-xs text-slate-950 dark:text-white truncate">
              {s.nome}
            </p>
            {s.empresa && (
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate mt-0.5">
                {s.empresa}
              </p>
            )}
            {s.instituicao && currentRole === 'SUPERADMIN' && (
              <p className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 truncate mt-0.5 flex items-center gap-1">
                <span>🏢 {s.instituicao}</span>
              </p>
            )}
          </div>

          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${riskBadge.bg}`}
          >
            {riskBadge.label}
          </span>
        </div>

        {(hasExpired > 0 || hasRejected > 0 || hasReview > 0 || hasExpiring > 0) && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {hasExpired > 0 && (
              <span className="text-[10px] font-bold text-rose-900 dark:text-white bg-rose-100 dark:bg-[#7f1d1d] border border-rose-300 dark:border-red-600 px-2 py-0.5 rounded shadow-2xs">
                {hasExpired} expirado
              </span>
            )}
            {hasRejected > 0 && (
              <span className="text-[10px] font-bold text-rose-900 dark:text-white bg-rose-100 dark:bg-[#7f1d1d] border border-rose-300 dark:border-red-600 px-2 py-0.5 rounded shadow-2xs">
                {hasRejected} recusado
              </span>
            )}
            {hasReview > 0 && (
              <span className="text-[10px] font-bold text-sky-900 dark:text-white bg-sky-100 dark:bg-[#0c4a6e] border border-sky-300 dark:border-sky-500 px-2 py-0.5 rounded shadow-2xs">
                {hasReview} em análise
              </span>
            )}
            {hasExpiring > 0 && (
              <span className="text-[10px] font-bold text-amber-950 dark:text-white bg-amber-100 dark:bg-[#78350f] border border-amber-300 dark:border-amber-500 px-2 py-0.5 rounded shadow-2xs">
                {hasExpiring} a vencer
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
}
