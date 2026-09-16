'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
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
    // 1. Filter
    const filtered = studentsList.filter((s) => {
      const matchesSearch =
        s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.empresa.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTurma = selectedTurma === 'ALL' || s.turmaId === selectedTurma;
      const matchesRisk = selectedRisk === 'ALL' || s.nivelRisco === selectedRisk;

      return matchesSearch && matchesTurma && matchesRisk;
    });

    // 2. Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'URGENCIA') {
        // Priority weight: CRITICO (3) > MEDIO (2) > BAIXO (1)
        const riskWeight = { CRITICO: 3, MEDIO: 2, BAIXO: 1 };
        const weightDiff = riskWeight[b.nivelRisco] - riskWeight[a.nivelRisco];
        if (weightDiff !== 0) return weightDiff;

        // If risk is same, check if has EM_ANALISE docs
        const aHasReview = a.documentos.some((d) => d.status === 'EM_ANALISE') ? 1 : 0;
        const bHasReview = b.documentos.some((d) => d.status === 'EM_ANALISE') ? 1 : 0;
        if (bHasReview !== aHasReview) return bHasReview - aHasReview;

        // Then by lower compliance
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

  return (
    <div className="space-y-6">
      {/* Top Filter & Sort Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, matrícula ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-500 focus:border-[#065373]"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Turma filter */}
          <select
            value={selectedTurma}
            onChange={(e) => setSelectedTurma(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-500 font-medium"
          >
            <option value="ALL" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Todas as Turmas ({turmas.length})</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {t.codigo}
              </option>
            ))}
          </select>

          {/* Risk filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-500 font-medium"
          >
            <option value="ALL" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Todos os Riscos</option>
            <option value="CRITICO" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">🚨 Risco Crítico</option>
            <option value="MEDIO" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">⚠️ Atenção / Médio</option>
            <option value="BAIXO" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">✅ Regular / Baixo</option>
          </select>

          {/* Sort selector */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'URGENCIA' | 'CONFORMIDADE_ASC' | 'CONFORMIDADE_DESC' | 'NOME'
                )
              }
              className="text-xs bg-transparent border-none focus:outline-none text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
            >
              <option value="URGENCIA" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Ordenar: Maior Urgência</option>
              <option value="CONFORMIDADE_ASC" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Menor Conformidade</option>
              <option value="CONFORMIDADE_DESC" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Maior Conformidade</option>
              <option value="NOME" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Nome (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Master List on Left, Dossier Viewer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Master Students List */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[780px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            <span>Aprendizes ({processedStudents.length})</span>
            {sortBy === 'URGENCIA' && (
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-normal">Priorizados por risco</span>
            )}
          </div>

          {processedStudents.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs">
              Nenhum aprendiz encontrado com os filtros selecionados.
            </div>
          ) : (
            processedStudents.map((s) => {
              const isSelected = s.id === activeStudent?.id;
              const riskBadge = getRiskBadgeConfig(s.nivelRisco);

              // Calculate quick indicators
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
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#065373] dark:bg-cyan-800 text-white border-[#065373] dark:border-cyan-700 shadow-lg ring-2 ring-[#065373]/30 dark:ring-cyan-400/30 scale-[1.01]'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 truncate">
                      <p className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {s.nome}
                      </p>
                      <p
                        className={`text-xs truncate ${
                          isSelected ? 'text-cyan-200' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {s.matricula} • {s.empresa}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        isSelected ? 'bg-white/20 text-white border-white/30' : riskBadge.bg
                      }`}
                    >
                      {s.nivelRisco}
                    </span>
                  </div>

                  {/* Urgency tags */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {hasExpired > 0 && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-rose-400 text-rose-950 font-extrabold'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60'
                        }`}
                      >
                        🚨 {hasExpired} doc expirado
                      </span>
                    )}
                    {hasRejected > 0 && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-rose-300 text-rose-950'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60'
                        }`}
                      >
                        ⛔ {hasRejected} recusado
                      </span>
                    )}
                    {hasReview > 0 && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-cyan-300 text-cyan-950 font-extrabold'
                            : 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-900/60'
                        }`}
                      >
                        ⏳ {hasReview} em análise
                      </span>
                    )}
                    {hasExpiring > 0 && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-amber-300 text-amber-950'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60'
                        }`}
                      >
                        ⚠️ {hasExpiring} vencendo
                      </span>
                    )}
                  </div>

                  {/* Progress Mini Bar */}
                  <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                      <span className={isSelected ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'}>
                        Conformidade
                      </span>
                      <span
                        className={`font-bold ${
                          isSelected ? 'text-cyan-300' : 'text-[#065373] dark:text-cyan-400'
                        }`}
                      >
                        {s.percentualConformidade}%
                      </span>
                    </div>
                    <div
                      className={`w-full h-1.5 rounded-full overflow-hidden ${
                        isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      <div
                        className={`h-full rounded-full transition-all ${
                          s.percentualConformidade === 100
                            ? 'bg-emerald-400'
                            : isSelected
                            ? 'bg-cyan-300'
                            : 'bg-[#065373] dark:bg-cyan-500'
                        }`}
                        style={{ width: `${s.percentualConformidade}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dossier Viewer on Right */}
        <div className="lg:col-span-8">
          {activeStudent ? (
            <DossierViewer student={activeStudent} initialDocId={activeDocId} />
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs">
              Selecione um aprendiz para visualizar o dossiê.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
