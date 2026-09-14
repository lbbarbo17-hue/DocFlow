'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getRiskBadgeConfig } from '@/lib/utils';
import DossierViewer from './DossierViewer';

export default function StudentMasterList() {
  const { studentsList, turmas } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurma, setSelectedTurma] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [activeStudentId, setActiveStudentId] = useState<string>(studentsList[0]?.id || '');

  // Filter logic
  const filteredStudents = studentsList.filter((s) => {
    const matchesSearch =
      s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.empresa.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTurma = selectedTurma === 'ALL' || s.turmaId === selectedTurma;
    const matchesRisk = selectedRisk === 'ALL' || s.nivelRisco === selectedRisk;

    return matchesSearch && matchesTurma && matchesRisk;
  });

  const activeStudent = studentsList.find((s) => s.id === activeStudentId) || studentsList[0];

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, matrícula ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#065373] focus:border-[#065373]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Turma filter */}
          <select
            value={selectedTurma}
            onChange={(e) => setSelectedTurma(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#065373]"
          >
            <option value="ALL">Todas as Turmas</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.codigo}
              </option>
            ))}
          </select>

          {/* Risk filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#065373]"
          >
            <option value="ALL">Todos os Riscos</option>
            <option value="CRITICO">🚨 Risco Crítico</option>
            <option value="MEDIO">⚠️ Atenção / Médio</option>
            <option value="BAIXO">✅ Regular / Baixo</option>
          </select>
        </div>
      </div>

      {/* Grid: Master List on Left, Dossier Viewer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Master Students List */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Aprendizes Encontrados ({filteredStudents.length})
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              Nenhum aprendiz encontrado com os filtros selecionados.
            </div>
          ) : (
            filteredStudents.map((s) => {
              const isSelected = s.id === activeStudent?.id;
              const riskBadge = getRiskBadgeConfig(s.nivelRisco);

              return (
                <div
                  key={s.id}
                  onClick={() => setActiveStudentId(s.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#065373] text-white border-[#065373] shadow-lg ring-2 ring-[#065373]/30 scale-[1.01]'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 truncate">
                      <p className="font-bold text-sm truncate">{s.nome}</p>
                      <p
                        className={`text-xs truncate ${
                          isSelected ? 'text-cyan-200' : 'text-slate-500'
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

                  {/* Progress Mini Bar */}
                  <div className="mt-3 pt-2 border-t border-slate-200/40">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                      <span className={isSelected ? 'text-slate-200' : 'text-slate-500'}>
                        Conformidade
                      </span>
                      <span
                        className={`font-bold ${
                          isSelected ? 'text-cyan-300' : 'text-[#065373]'
                        }`}
                      >
                        {s.percentualConformidade}%
                      </span>
                    </div>
                    <div
                      className={`w-full h-1.5 rounded-full overflow-hidden ${
                        isSelected ? 'bg-white/20' : 'bg-slate-100'
                      }`}
                    >
                      <div
                        className={`h-full rounded-full transition-all ${
                          s.percentualConformidade === 100
                            ? 'bg-emerald-400'
                            : isSelected
                            ? 'bg-cyan-300'
                            : 'bg-[#065373]'
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
            <DossierViewer student={activeStudent} />
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              Selecione um aprendiz para visualizar o dossiê.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
