'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Users,
  GraduationCap,
  Briefcase,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  X,
  FileCheck2,
  ExternalLink,
  Filter,
  RotateCcw,
} from 'lucide-react';

interface UnifiedMember {
  id: string;
  nome: string;
  email: string;
  tipo: 'COORDENADOR' | 'SUPERADMIN' | 'ESTAGIARIO' | 'APRENDIZ';
  cargoOuCurso: string;
  entidade: string;
  status: string;
  conformidade?: number;
  isStudent: boolean;
}

export default function AdminDashboard() {
  const {
    systemUsers,
    empresas,
    allStudentsList,
    availableInstitutions,
  } = useApp();

  // Tab State: Todos, Coordenadores, Estagiários, Aprendizes
  const [memberTab, setMemberTab] = useState<'TODOS' | 'COORDENADORES' | 'ESTAGIARIOS' | 'APRENDIZES'>('TODOS');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Build unified members list from system users and students
  const unifiedMembers = useMemo<UnifiedMember[]>(() => {
    const list: UnifiedMember[] = [];

    // System Users (Coordenadores & Superadmins)
    systemUsers.forEach((u) => {
      const isSuper = u.role === 'SUPERADMIN';
      list.push({
        id: u.id,
        nome: u.nome,
        email: u.email,
        tipo: isSuper ? 'SUPERADMIN' : 'COORDENADOR',
        cargoOuCurso: u.cargo,
        entidade: isSuper ? 'Acesso Global (Todas as Entidades)' : (u.instituicao || 'Instituição Conveniada'),
        status: u.status,
        isStudent: false,
      });
    });

    // Students (Estagiários & Aprendizes)
    allStudentsList.forEach((s) => {
      list.push({
        id: s.id,
        nome: s.nome,
        email: s.email,
        tipo: s.tipoVinculo,
        cargoOuCurso: `${s.curso || 'Curso Técnico'} • Matrícula: ${s.matricula}`,
        // Entidade única vinculada ao integrante
        entidade: s.instituicao || s.empresa || 'Instituição de Ensino',
        status: s.statusGeral,
        conformidade: s.percentualConformidade,
        isStudent: true,
      });
    });

    return list;
  }, [systemUsers, allStudentsList]);

  // Aggregate counts for category cards
  const countTodos = unifiedMembers.length;
  const countCoordenadores = unifiedMembers.filter((m) => m.tipo === 'COORDENADOR').length;
  const countEstagiarios = unifiedMembers.filter((m) => m.tipo === 'ESTAGIARIO').length;
  const countAprendizes = unifiedMembers.filter((m) => m.tipo === 'APRENDIZ').length;

  // Filtered members by Category Tab, Entity (Instituição/Empresa), and Search Term
  const filteredMembers = useMemo(() => {
    return unifiedMembers.filter((m) => {
      // 1. Tab filter
      if (memberTab === 'COORDENADORES' && m.tipo !== 'COORDENADOR') return false;
      if (memberTab === 'ESTAGIARIOS' && m.tipo !== 'ESTAGIARIO') return false;
      if (memberTab === 'APRENDIZES' && m.tipo !== 'APRENDIZ') return false;

      // 2. Entity filter (Instituição ou Empresa)
      if (selectedEntityFilter !== 'ALL') {
        const matchesEntidade = m.entidade.toLowerCase().includes(selectedEntityFilter.toLowerCase());
        if (!matchesEntidade) return false;
      }

      // 3. Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = m.nome.toLowerCase().includes(term);
        const matchesEmail = m.email.toLowerCase().includes(term);
        const matchesCargo = m.cargoOuCurso.toLowerCase().includes(term);
        const matchesEnt = m.entidade.toLowerCase().includes(term);

        if (!matchesName && !matchesEmail && !matchesCargo && !matchesEnt) {
          return false;
        }
      }

      return true;
    });
  }, [unifiedMembers, memberTab, selectedEntityFilter, searchTerm]);

  const hasActiveFilters = searchTerm.trim() !== '' || selectedEntityFilter !== 'ALL';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedEntityFilter('ALL');
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12 w-full max-w-full">
      {/* 4 Interactive Segmented Category Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        {/* Card 1: Todos */}
        <button
          type="button"
          onClick={() => setMemberTab('TODOS')}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer w-full relative overflow-hidden group ${
            memberTab === 'TODOS'
              ? 'bg-white dark:bg-slate-800 border-[#065373] dark:border-cyan-400 shadow-md ring-2 ring-[#065373]/15 dark:ring-cyan-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                Todos os Integrantes
              </span>
              <p className="text-2xl font-black text-slate-950 dark:text-white mt-0.5 tracking-tight">
                {countTodos}
              </p>
              <span className="text-[11px] text-[#065373] dark:text-cyan-400 font-semibold block truncate mt-0.5">
                Base consolidada geral
              </span>
            </div>
            <div
              className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                memberTab === 'TODOS'
                  ? 'bg-[#065373] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-[#065373]/10 group-hover:text-[#065373]'
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
          </div>
          {memberTab === 'TODOS' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#065373] dark:bg-cyan-400" />
          )}
        </button>

        {/* Card 2: Coordenadores */}
        <button
          type="button"
          onClick={() => setMemberTab('COORDENADORES')}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer w-full relative overflow-hidden group ${
            memberTab === 'COORDENADORES'
              ? 'bg-white dark:bg-slate-800 border-[#065373] dark:border-cyan-400 shadow-md ring-2 ring-[#065373]/15 dark:ring-cyan-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                Coordenadores & RH
              </span>
              <p className="text-2xl font-black text-slate-950 dark:text-white mt-0.5 tracking-tight">
                {countCoordenadores}
              </p>
              <span className="text-[11px] text-cyan-700 dark:text-cyan-400 font-semibold block truncate mt-0.5">
                Gestores de Polo / RH
              </span>
            </div>
            <div
              className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                memberTab === 'COORDENADORES'
                  ? 'bg-[#065373] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-[#065373]/10 group-hover:text-[#065373]'
              }`}
            >
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          {memberTab === 'COORDENADORES' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#065373] dark:bg-cyan-400" />
          )}
        </button>

        {/* Card 3: Estagiários */}
        <button
          type="button"
          onClick={() => setMemberTab('ESTAGIARIOS')}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer w-full relative overflow-hidden group ${
            memberTab === 'ESTAGIARIOS'
              ? 'bg-white dark:bg-slate-800 border-[#065373] dark:border-cyan-400 shadow-md ring-2 ring-[#065373]/15 dark:ring-cyan-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                Estagiários (TCE)
              </span>
              <p className="text-2xl font-black text-slate-950 dark:text-white mt-0.5 tracking-tight">
                {countEstagiarios}
              </p>
              <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold block truncate mt-0.5">
                Contratos de estágio
              </span>
            </div>
            <div
              className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                memberTab === 'ESTAGIARIOS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:text-blue-600'
              }`}
            >
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          {memberTab === 'ESTAGIARIOS' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400" />
          )}
        </button>

        {/* Card 4: Aprendizes */}
        <button
          type="button"
          onClick={() => setMemberTab('APRENDIZES')}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer w-full relative overflow-hidden group ${
            memberTab === 'APRENDIZES'
              ? 'bg-white dark:bg-slate-800 border-[#065373] dark:border-cyan-400 shadow-md ring-2 ring-[#065373]/15 dark:ring-cyan-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                Jovens Aprendizes
              </span>
              <p className="text-2xl font-black text-slate-950 dark:text-white mt-0.5 tracking-tight">
                {countAprendizes}
              </p>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold block truncate mt-0.5">
                Lei da Aprendizagem
              </span>
            </div>
            <div
              className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                memberTab === 'APRENDIZES'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          {memberTab === 'APRENDIZES' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 dark:bg-emerald-400" />
          )}
        </button>
      </div>

      {/* Clean Unified Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Left Side: Search Input + Entity Select */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, e-mail, curso ou entidade..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Entity Dropdown (Instituição ou Empresa) */}
          <div className="relative w-full sm:w-auto sm:min-w-[280px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Building2 className="w-4 h-4" />
            </div>
            <select
              value={selectedEntityFilter}
              onChange={(e) => setSelectedEntityFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer truncate transition-all"
              title="Filtrar por Instituição de Ensino ou Empresa"
            >
              <option value="ALL">🏢 Todas as Instituições & Empresas</option>
              <optgroup label="Instituições de Ensino / Polos">
                {availableInstitutions.map((inst) => (
                  <option key={inst} value={inst}>
                    🏫 {inst}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Empresas Concedentes / RH">
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.razaoSocial}>
                    🏢 {emp.nomeFantasia || emp.razaoSocial}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Right Side: Status Count & Reset Filter */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Exibindo <strong className="text-slate-900 dark:text-white font-bold">{filteredMembers.length}</strong> de {unifiedMembers.length}
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#065373] dark:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Limpar todos os filtros ativos"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Unified Table Card — Sized with clean separated columns: Vínculo, Situação, Dossiê */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors w-full">
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-4 w-[32%]">Nome & Cargo / Curso</th>
                <th className="py-3.5 px-3 w-[24%]">Instituição ou Empresa</th>
                <th className="py-3.5 px-3 w-[20%]">E-mail de Acesso</th>
                <th className="py-3.5 px-3 w-[10%] text-center">Vínculo</th>
                <th className="py-3.5 px-3 w-[9%] text-center">Situação</th>
                <th className="py-3.5 px-3 w-[5%] text-center">Dossiê</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                        <Filter className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Nenhum registro encontrado
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                        Nenhum integrante corresponde aos critérios de pesquisa ou filtros selecionados.
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-2 px-3 py-1.5 text-xs font-bold text-[#065373] dark:text-cyan-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Redefinir filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const initials = m.nome
                    .replace(/^(Profª\.|Prof\.|Dr\.|Dra\.)\s*/, '')
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();

                  const isEdu =
                    m.entidade.toLowerCase().includes('etec') ||
                    m.entidade.toLowerCase().includes('senai') ||
                    m.entidade.toLowerCase().includes('instituto') ||
                    m.entidade.toLowerCase().includes('fatec') ||
                    m.entidade.toLowerCase().includes('escola');

                  const isGlobal = m.tipo === 'SUPERADMIN';

                  return (
                    <tr
                      key={`${m.tipo}-${m.id}`}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Col 1: Nome & Cargo / Curso (32%) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#065373] to-[#1a6e94] text-white flex items-center justify-center font-black text-[11px] shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <div className="min-w-0 truncate">
                            <p
                              className="font-bold text-slate-900 dark:text-white truncate text-xs"
                              title={m.nome}
                            >
                              {m.nome}
                            </p>
                            <p
                              className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5"
                              title={m.cargoOuCurso}
                            >
                              {m.cargoOuCurso}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Col 2: Instituição ou Empresa (24%) — Entidade única vinculada sem duplicidade */}
                      <td className="py-3 px-3">
                        <div className="min-w-0">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold max-w-full truncate border ${
                              isGlobal
                                ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                : isEdu
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                : 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
                            }`}
                            title={m.entidade}
                          >
                            {isGlobal ? (
                              <span className="text-purple-600 dark:text-purple-400 shrink-0">🌐</span>
                            ) : isEdu ? (
                              <GraduationCap className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400 shrink-0" />
                            ) : (
                              <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            )}
                            <span className="truncate">{m.entidade}</span>
                          </span>
                        </div>
                      </td>

                      {/* Col 3: E-mail (20%) */}
                      <td className="py-3 px-3">
                        <p
                          className="font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate"
                          title={m.email}
                        >
                          {m.email}
                        </p>
                      </td>

                      {/* Col 4: Vínculo (10%) — Alinhado ao centro */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center">
                          {m.tipo === 'COORDENADOR' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 whitespace-nowrap">
                              Coordenador
                            </span>
                          )}
                          {m.tipo === 'SUPERADMIN' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800 whitespace-nowrap">
                              Super Admin
                            </span>
                          )}
                          {m.tipo === 'ESTAGIARIO' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                              Estagiário
                            </span>
                          )}
                          {m.tipo === 'APRENDIZ' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                              Aprendiz
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Col 5: Situação (9%) — Pills de largura padronizada e 100% alinhadas ao centro */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center">
                          {m.isStudent ? (
                            m.status === 'REGULAR' ? (
                              <span
                                className="inline-flex items-center justify-center gap-1.5 w-[76px] py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                title="Conformidade documental 100% regular"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>Regular</span>
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center justify-center gap-1.5 w-[76px] py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                title={`Conformidade documental em ${m.conformidade}%`}
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                                <span>{m.conformidade}%</span>
                              </span>
                            )
                          ) : (
                            <span
                              className="inline-flex items-center justify-center gap-1.5 w-[76px] py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              title="Conta de operador ativa no sistema"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Ativo</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Col 6: Dossiê / Ações (5%) — Coluna dedicada, centrada e sem cortes na borda */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center">
                          {m.isStudent ? (
                            <Link
                              href={`/coordenador/dossies?student=${m.id}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#065373] dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center justify-center"
                              title={`Abrir Dossiê Documental de ${m.nome}`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700 text-xs font-bold select-none">
                              —
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
