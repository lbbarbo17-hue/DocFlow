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
  MapPin,
  Building,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const formatCNPJ = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

const formatPhone = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

export default function CadastrarCoordenadorPage() {
  const {
    systemUsers,
    addNewSystemUser,
    updateUserRole,
    availableInstitutions,
    empresas,
    addNewEmpresa,
    setToastMessage,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'COORDENADORES' | 'EMPRESAS'>('COORDENADORES');

  // Form State - Coordenador
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

  // Form State - Empresa
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [ramoAtuacao, setRamoAtuacao] = useState('Tecnologia da Informação & Software');
  const [contatoRh, setContatoRh] = useState('');
  const [emailRh, setEmailRh] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidadeUf, setCidadeUf] = useState('São Paulo / SP');
  const [isSubmittingEmpresa, setIsSubmittingEmpresa] = useState(false);

  // Search Filter for Empresa List
  const [empresaSearchTerm, setEmpresaSearchTerm] = useState('');

  const coordinators = systemUsers.filter((u) => u.role === 'COORDENADOR');

  const filteredCoordinators = coordinators.filter(
    (u) =>
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.instituicao && u.instituicao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredEmpresas = empresas.filter(
    (emp) =>
      emp.razaoSocial.toLowerCase().includes(empresaSearchTerm.toLowerCase()) ||
      emp.nomeFantasia.toLowerCase().includes(empresaSearchTerm.toLowerCase()) ||
      emp.cnpj.toLowerCase().includes(empresaSearchTerm.toLowerCase()) ||
      emp.contatoRh.toLowerCase().includes(empresaSearchTerm.toLowerCase()) ||
      (emp.cidadeUf && emp.cidadeUf.toLowerCase().includes(empresaSearchTerm.toLowerCase()))
  );

  const handleCoordinatorSubmit = (e: React.FormEvent) => {
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

  const handleEmpresaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!razaoSocial.trim() || !cnpj.trim()) {
      setToastMessage({
        title: 'Campos Obrigatórios',
        desc: 'Preencha a Razão Social e o CNPJ da Empresa.',
        type: 'error',
      });
      return;
    }

    setIsSubmittingEmpresa(true);
    const newEmpresaId = `emp-${Date.now()}`;
    addNewEmpresa({
      id: newEmpresaId,
      razaoSocial: razaoSocial.trim(),
      nomeFantasia: nomeFantasia.trim() || razaoSocial.trim(),
      cnpj: cnpj.trim(),
      ramoAtuacao: ramoAtuacao.trim(),
      contatoRh: contatoRh.trim(),
      emailRh: emailRh.trim(),
      telefone: telefone.trim(),
      cidadeUf: cidadeUf.trim(),
    });

    // Reset Form
    setRazaoSocial('');
    setNomeFantasia('');
    setCnpj('');
    setRamoAtuacao('Tecnologia da Informação & Software');
    setContatoRh('');
    setEmailRh('');
    setTelefone('');
    setCidadeUf('São Paulo / SP');
    setIsSubmittingEmpresa(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header Banner */}
      <PageBanner
        title="Gestão de Coordenadores & Empresas"
        subtitle="Credenciamento centralizado de gestores educacionais, analistas de RH e empresas parceiras conveniadas"
        icon={Building2}
        backHref="/admin"
        backLabel="Voltar ao Painel Principal"
        badge={{
          label: 'Super Administrador',
          icon: ShieldCheck,
        }}
      />

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl">
        <button
          type="button"
          onClick={() => setActiveTab('COORDENADORES')}
          className={cn(
            'flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer',
            activeTab === 'COORDENADORES'
              ? 'bg-white dark:bg-slate-900 text-[#0284c7] dark:text-[#00b4d8] shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          )}
        >
          <UserPlus className="w-4 h-4 text-[#0284c7] dark:text-[#00b4d8]" />
          <span>Coordenadores & RH</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-[#0284c7] dark:text-sky-300 font-bold ml-1">
            {coordinators.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EMPRESAS')}
          className={cn(
            'flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer',
            activeTab === 'EMPRESAS'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          )}
        >
          <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Empresas Parceiras</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold ml-1">
            {empresas.length}
          </span>
        </button>
      </div>

      {/* ABA 1: COORDENADORES */}
      {activeTab === 'COORDENADORES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          {/* Left Column: Registration Form (5 cols on lg) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-5 transition-colors">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-base text-slate-950 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#065373] dark:text-cyan-400" />
                <span>Novo Coordenador ou RH</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Preencha os dados de credenciamento do operador no DocFlow
              </p>
            </div>

            <form onSubmit={handleCoordinatorSubmit} className="space-y-4 text-xs">
              {/* Nome Completo */}
              <div className="space-y-1">
                <label className="font-bold text-slate-900 dark:text-slate-100 block">
                  Nome Completo *
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
                  E-mail Profissional *
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
                  Cargo / Função na Entidade *
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
                  <p className="text-[11px] mt-1 text-purple-800 dark:text-purple-300">
                    Super administradores têm visualização irrestrita sobre todas as instituições e empresas do ecossistema DocFlow.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#0284c7] to-[#00b4d8] hover:from-sky-600 hover:to-sky-500 text-white font-extrabold text-xs shadow-lg shadow-[#0284c7]/25 hover:shadow-xl transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Cadastrando...' : 'Cadastrar Coordenador / RH'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Coordinators List (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Coordenadores & RH
                  </p>
                  <p className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">
                    {coordinators.length}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-300">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Instituições Atendidas
                  </p>
                  <p className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">
                    {availableInstitutions.length}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Coordinators Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
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
                        const isEdu =
                          u.instituicao?.toLowerCase().includes('etec') ||
                          u.instituicao?.toLowerCase().includes('senai') ||
                          u.instituicao?.toLowerCase().includes('instituto') ||
                          u.instituicao?.toLowerCase().includes('fatec');

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
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 max-w-[200px] truncate"
                                title={u.instituicao}
                              >
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
      )}

      {/* ABA 2: EMPRESAS PARCEIRAS */}
      {activeTab === 'EMPRESAS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          {/* Left Column: Form de Cadastro de Empresa (5 cols on lg) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-5 transition-colors">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-base text-slate-950 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Nova Empresa Concedente</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Cadastre empresas conveniadas para contratação de aprendizes e estagiários
              </p>
            </div>

            <form onSubmit={handleEmpresaSubmit} className="space-y-4 text-xs">
              {/* Razão Social */}
              <div className="space-y-1">
                <label className="font-bold text-slate-900 dark:text-slate-100 block">
                  Razão Social *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: TechCorp Soluções Digitais S.A."
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              {/* Nome Fantasia */}
              <div className="space-y-1">
                <label className="font-bold text-slate-900 dark:text-slate-100 block">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  placeholder="Ex: TechCorp Digital"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              {/* CNPJ */}
              <div className="space-y-1">
                <label className="font-bold text-slate-900 dark:text-slate-100 block">
                  CNPJ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0001-00"
                  maxLength={18}
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 font-mono text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              {/* Ramo e Cidade */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-900 dark:text-slate-100 block">
                    Ramo de Atuação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Tecnologia"
                    value={ramoAtuacao}
                    onChange={(e) => setRamoAtuacao(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900 dark:text-slate-100 block">
                    Cidade / UF
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: São Paulo / SP"
                    value={cidadeUf}
                    onChange={(e) => setCidadeUf(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                </div>
              </div>

              {/* Contato RH */}
              <div className="space-y-1">
                <label className="font-bold text-slate-900 dark:text-slate-100 block">
                  Responsável / Contato de RH
                </label>
                <input
                  type="text"
                  placeholder="Ex: Camila Peixoto (Gestora de RH)"
                  value={contatoRh}
                  onChange={(e) => setContatoRh(e.target.value)}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              {/* E-mail e Telefone RH */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-900 dark:text-slate-100 block">
                    E-mail do RH
                  </label>
                  <input
                    type="email"
                    placeholder="rh@empresa.com.br"
                    value={emailRh}
                    onChange={(e) => setEmailRh(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900 dark:text-slate-100 block">
                    Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    maxLength={15}
                    value={telefone}
                    onChange={(e) => setTelefone(formatPhone(e.target.value))}
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingEmpresa}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 hover:shadow-xl transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmittingEmpresa ? 'Cadastrando...' : 'Cadastrar Empresa Conveniada'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Empresas Catalog (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total de Empresas Parceiras
                  </p>
                  <p className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">
                    {empresas.length}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  <Building className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status dos Convênios
                  </p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    100% Ativos
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Empresas Table / List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-950 dark:text-white">
                    Catálogo de Empresas Parceiras
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Empresas credenciadas para acolhimento de aprendizes e estagiários
                  </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar empresa ou CNPJ..."
                    value={empresaSearchTerm}
                    onChange={(e) => setEmpresaSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                {filteredEmpresas.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                    Nenhuma empresa encontrada com este critério de busca.
                  </div>
                ) : (
                  filteredEmpresas.map((emp) => (
                    <div
                      key={emp.id}
                      className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-900 dark:text-white text-sm">
                            {emp.razaoSocial}
                          </span>
                          {emp.nomeFantasia && emp.nomeFantasia !== emp.razaoSocial && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                              {emp.nomeFantasia}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                            CNPJ: {emp.cnpj}
                          </span>
                          <span>•</span>
                          <span className="text-purple-700 dark:text-purple-400 font-semibold">
                            {emp.ramoAtuacao}
                          </span>
                          {emp.cidadeUf && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {emp.cidadeUf}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0 space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                        {emp.contatoRh && (
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                            RH: {emp.contatoRh}
                          </div>
                        )}
                        {emp.emailRh && (
                          <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {emp.emailRh}
                          </div>
                        )}
                        {emp.telefone && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                            {emp.telefone}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
