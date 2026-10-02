'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/lib/types';
import PageBanner from '@/components/layout/PageBanner';
import {
  UserPlus,
  Shield,
  Building2,
  Users,
  CheckCircle2,
  Mail,
  GraduationCap,
  Briefcase,
  Search,
} from 'lucide-react';

export default function CadastrarCoordenadorPage() {
  const {
    systemUsers,
    addNewSystemUser,
    updateUserRole,
    availableInstitutions,
    empresas,
    setToastMessage,
  } = useApp();

  // Form State
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('Coordenador Acadêmico de Estágios');
  const [role, setRole] = useState<UserRole>('COORDENADOR');
  const [entitySelect, setEntitySelect] = useState(
    availableInstitutions[0] || 'ETEC Politécnica de São Paulo'
  );
  const [customEntity, setCustomEntity] = useState('');
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search Filter for Coordinator List
  const [searchTerm, setSearchTerm] = useState('');

  const coordinators = systemUsers.filter((u) => u.role === 'COORDENADOR');

  const filteredCoordinators = coordinators.filter(
    (u) =>
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.instituicao && u.instituicao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      setToastMessage({
        title: 'Campos Obrigatórios',
        desc: 'Preencha o Nome Completo e o E-mail Profissional.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    const finalEntity =
      role === 'SUPERADMIN'
        ? 'Todas as Instituições (Global)'
        : entitySelect === '__CUSTOM__'
        ? customEntity.trim() || 'Instituição Conveniada'
        : entitySelect;

    addNewSystemUser({
      nome: nome.trim(),
      email: email.trim(),
      cargo: cargo.trim() || 'Coordenador / RH',
      role,
      instituicao: finalEntity,
      status,
    });

    // Reset Form
    setNome('');
    setEmail('');
    setCargo('Coordenador Acadêmico de Estágios');
    setRole('COORDENADOR');
    setEntitySelect(availableInstitutions[0] || 'ETEC Politécnica de São Paulo');
    setCustomEntity('');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header Banner */}
      <PageBanner
        title="Cadastro de Coordenadores & RH"
        subtitle="Vincule gestores pedagógicos e analistas de RH às suas instituições de ensino ou empresas conveniadas"
        icon={UserPlus}
        action={{
          label: 'Painel Global',
          href: '/admin',
          icon: Shield,
        }}
      />

      {/* Main Grid: Registration Form (Left) & Active Coordinators List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Registration Form (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border-[1.5px] border-slate-400 dark:border-slate-700 shadow-sm p-6 space-y-5 transition-colors">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-base text-slate-950 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#065373] dark:text-cyan-400" />
              <span>Novo Coordenador ou RH</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Preencha os dados de credenciamento do operador no DocFlow
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Nome Completo */}
            <div className="space-y-1">
              <label className="font-bold text-slate-900 dark:text-slate-100 block">
                Nome Completo
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Profª. Mariana Alcantara ou Camila Peixoto"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>

            {/* E-mail */}
            <div className="space-y-1">
              <label className="font-bold text-slate-900 dark:text-slate-100 block">
                E-mail Profissional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="coordenacao@etec.sp.gov.br ou rh@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>
            </div>

            {/* Cargo / Função */}
            <div className="space-y-1">
              <label className="font-bold text-slate-900 dark:text-slate-100 block">
                Cargo / Função na Entidade
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Coordenador Pedagógico, Gestora de RH, Supervisor de Estágios"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Perfil */}
              <div className="space-y-1">
                <label className="font-bold text-slate-900 dark:text-slate-100 block">
                  Perfil de Acesso
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3 py-2.5 text-slate-950 dark:text-white font-semibold focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 cursor-pointer"
                >
                  <option value="COORDENADOR">Coordenador / RH (Isolado)</option>
                  <option value="SUPERADMIN">Super Admin (Global)</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="font-bold text-slate-900 dark:text-slate-100 block">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ATIVO' | 'INATIVO')}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3 py-2.5 text-slate-950 dark:text-white font-semibold focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 cursor-pointer"
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>
            </div>

            {/* Instituição ou Empresa Vinculada */}
            {role !== 'SUPERADMIN' ? (
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                    <span>Instituição ou Empresa a que Pertence:</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                    Isolamento Ativo
                  </span>
                </div>

                <select
                  value={entitySelect}
                  onChange={(e) => setEntitySelect(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3 py-2.5 text-slate-950 dark:text-white font-semibold focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 cursor-pointer"
                >
                  <optgroup label="Instituições de Ensino / Polos">
                    {availableInstitutions.map((inst) => (
                      <option key={inst} value={inst}>
                        🏫 {inst}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Empresas Parceiras (RH Concedente)">
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.razaoSocial}>
                        🏢 {emp.nomeFantasia || emp.razaoSocial}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Nova Entidade">
                    <option value="__CUSTOM__">➕ Digitar Outra Instituição ou Empresa...</option>
                  </optgroup>
                </select>

                {entitySelect === '__CUSTOM__' && (
                  <div className="pt-2 animate-fadeIn">
                    <input
                      type="text"
                      required
                      placeholder="Digite o nome completo da nova instituição ou empresa..."
                      value={customEntity}
                      onChange={(e) => setCustomEntity(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border-[1.5px] border-[#065373] dark:border-cyan-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#065373]"
                    />
                  </div>
                )}

                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  O coordenador terá acesso <strong>apenas</strong> aos aprendizes, estagiários e turmas pertencentes a esta entidade.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs">
                <p className="font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Escopo Global Automático</span>
                </p>
                <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                  Super Administradores possuem acesso irrestrito a todas as instituições e empresas do sistema.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#065373] hover:bg-[#043c53] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Cadastrando...' : 'Cadastrar Coordenador / RH'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Coordinators & RH List (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-[1.5px] border-slate-400 dark:border-slate-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Coordenadores & RH
                </p>
                <p className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">
                  {coordinators.length}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#065373]/10 dark:bg-cyan-950/60 text-[#065373] dark:text-cyan-400">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-[1.5px] border-slate-400 dark:border-slate-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Instituições Atendidas
                </p>
                <p className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">
                  {availableInstitutions.length}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Coordinators Table Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-[1.5px] border-slate-400 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-slate-950 dark:text-white">
                  Coordenadores e Gestores Cadastrados
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Operadores com perfis de gestão isolados por instituição
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar coordenador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4">Nome / Cargo</th>
                    <th className="py-3 px-4">Instituição / Empresa</th>
                    <th className="py-3 px-4">E-mail</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredCoordinators.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                        Nenhum coordenador ou RH encontrado para esta busca.
                      </td>
                    </tr>
                  ) : (
                    filteredCoordinators.map((u) => {
                      const isEdu = u.instituicao?.toLowerCase().includes('etec') || u.instituicao?.toLowerCase().includes('senai') || u.instituicao?.toLowerCase().includes('instituto') || u.instituicao?.toLowerCase().includes('fatec');

                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-bold text-slate-950 dark:text-white">{u.nome}</p>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                                {u.cargo}
                              </p>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 max-w-[200px] truncate" title={u.instituicao}>
                              {isEdu ? (
                                <GraduationCap className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400 shrink-0" />
                              ) : (
                                <Briefcase className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                              )}
                              <span className="truncate">{u.instituicao || 'Não vinculada'}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            {u.email}
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{u.status}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <select
                              value={u.role}
                              onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                              className="text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer"
                              title="Alterar nível de acesso"
                            >
                              <option value="COORDENADOR">Coordenador / RH</option>
                              <option value="SUPERADMIN">Super Admin</option>
                              <option value="ESTUDANTE">Estudante</option>
                            </select>
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
      </div>
    </div>
  );
}
