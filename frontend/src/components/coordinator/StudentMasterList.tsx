'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getRiskBadgeConfig } from '@/lib/utils';
import DossierViewer from './DossierViewer';

interface StudentMasterListProps {
  initialStudentId?: string;
  initialDocId?: string;
}

export default function StudentMasterList({
  initialStudentId,
  initialDocId,
}: StudentMasterListProps) {
  const { studentsList, turmas } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurma, setSelectedTurma] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'URGENCIA' | 'CONFORMIDADE_ASC' | 'CONFORMIDADE_DESC' | 'NOME'>('URGENCIA');
  const [activeStudentId, setActiveStudentId] = useState<string>(
    initialStudentId || studentsList[0]?.id || ''
  );
  const [activeDocId, setActiveDocId] = useState<string | undefined>(initialDocId);

  // Collapsible state for each turma accordion when in 'ALL' mode
  const [collapsedTurmas, setCollapsedTurmas] = useState<Record<string, boolean>>({});

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

  // Filter & Sort logic
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

  // Group students by Turma
  const groupedByTurma = useMemo(() => {
    const map = new Map<string, typeof processedStudents>();

    // Initialize all turmas so they appear in order
    turmas.forEach((t) => {
      map.set(t.id, []);
    });

    // Populate with filtered students
    processedStudents.forEach((student) => {
      const existing = map.get(student.turmaId) || [];
      existing.push(student);
      map.set(student.turmaId, existing);
    });

    return map;
  }, [turmas, processedStudents]);

  const activeStudent =
    studentsList.find((s) => s.id === activeStudentId) || processedStudents[0] || studentsList[0];

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border-2 border-slate-400 dark:border dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-2.5 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-700 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, matrícula ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border-2 border-slate-400 dark:border dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white placeholder:text-slate-600 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Risk filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border-2 border-slate-400 dark:border dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-[#065373] cursor-pointer"
          >
            <option value="ALL">Todos os Riscos</option>
            <option value="CRITICO">Risco Crítico</option>
            <option value="MEDIO">Atenção / Médio</option>
            <option value="BAIXO">Regular / Baixo</option>
          </select>

          {/* Sort selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-2 py-1">
            <ArrowUpDown className="w-3 h-3 text-slate-700 dark:text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'URGENCIA' | 'CONFORMIDADE_ASC' | 'CONFORMIDADE_DESC' | 'NOME'
                )
              }
              className="text-xs bg-transparent border-none focus:outline-none text-slate-900 dark:text-slate-100 font-semibold cursor-pointer"
            >
              <option value="URGENCIA">Urgência</option>
              <option value="CONFORMIDADE_ASC">Menor Conformidade</option>
              <option value="CONFORMIDADE_DESC">Maior Conformidade</option>
              <option value="NOME">Nome (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Turma Segmented Pills (Fast filter per class) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedTurma('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedTurma === 'ALL'
              ? 'bg-[#065373] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-slate-400 dark:border dark:border-slate-800'
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
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-slate-400 dark:border dark:border-slate-800'
              }`}
            >
              <span>{t.codigo}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Student List (Left) + Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Students Grouped by Turma */}
        <div className="lg:col-span-4 space-y-3 max-h-[750px] overflow-y-auto pr-1">
          {processedStudents.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs">
              Nenhum estudante encontrado.
            </div>
          ) : selectedTurma !== 'ALL' ? (
            /* Flat view when a single turma is selected */
            <div className="space-y-2">
              {processedStudents.map((s) => renderStudentCard(s))}
            </div>
          ) : (
            /* Grouped by Turma (Accordion) when 'ALL' is selected */
            Array.from(groupedByTurma.entries()).map(([turmaId, studentsInTurma]) => {
              if (studentsInTurma.length === 0) return null;
              const turmaObj = turmas.find((t) => t.id === turmaId);
              const isCollapsed = Boolean(collapsedTurmas[turmaId]);

              return (
                <div
                  key={turmaId}
                  className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-400 dark:border dark:border-slate-800 overflow-hidden shadow-sm"
                >
                  {/* Turma Section Header (Clickable to collapse/expand) */}
                  <button
                    type="button"
                    onClick={() => toggleTurmaCollapse(turmaId)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors flex items-center justify-between text-left cursor-pointer border-b-2 border-slate-400 dark:border-b dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Layers className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400 shrink-0" />
                      <span className="font-bold text-xs text-slate-950 dark:text-white truncate">
                        {turmaObj?.codigo || 'Turma'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate hidden sm:inline">
                        • {turmaObj?.nomeCurso}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-950 dark:text-slate-100 border border-slate-500">
                        {studentsInTurma.length}
                      </span>
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-700 dark:text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Student Cards in Turma */}
                  {!isCollapsed && (
                    <div className="p-2 space-y-2 bg-slate-50/50 dark:bg-slate-950/30">
                      {studentsInTurma.map((s) => renderStudentCard(s))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Dossier Viewer */}
        <div className="lg:col-span-8">
          {activeStudent ? (
            <DossierViewer student={activeStudent} initialDocId={activeDocId} />
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-400 dark:border dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium text-xs shadow-sm">
              Selecione um estudante para visualizar o dossiê.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Helper renderer for student card
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
        }}
        className={`p-3 rounded-xl border-2 dark:border cursor-pointer transition-all ${
          isSelected
            ? 'bg-white dark:bg-slate-800 border-[#065373] dark:border-cyan-400 shadow-md ring-2 ring-[#065373]/30'
            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-400 dark:border-slate-800 text-slate-950 dark:text-slate-100 shadow-sm'
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
          </div>

          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${riskBadge.bg}`}
          >
            {riskBadge.label}
          </span>
        </div>

        {/* High contrast, deep tone, easily visible indicators */}
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
