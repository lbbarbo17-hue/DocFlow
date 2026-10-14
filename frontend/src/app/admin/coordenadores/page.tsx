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
  KeyRound,
  Eye,
  EyeOff,
  Check,
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
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
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
        desc: 'Preencha o Nome Completo e o E-mail de Acesso.',
        type: 'error',
      });
      return;
    }

    if (!senha.trim() || senha.length < 6) {
      setToastMessage({
        title: 'Senha Obrigatória',
        desc: 'Defina uma senha com no mínimo 6 caracteres para o usuário.',
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
      senha: senha.trim(),
      cargo: cargo.trim() || 'Coordenador / RH',
      role,
      instituicao: finalEntity,
      status,
    });

    // Reset Form
    setNome('');
    setEmail('');
    setSenha('');
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
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Novo Coordenador ou RH
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Credencie um gestor pedagógico ou operador de RH
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
                <Check className="w-3 h-3" />
                <span>Gestão</span>
              </span>
            </div>

            <form onSubmit={handleCoordinatorSubmit}>
              <div className="p-6 space-y-6">
                {/* Seção 1: Dados Pessoais & Login */}
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    1. Dados de Acesso
                  </span>

                  {/* Nome Completo */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Nome Completo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Profª. Mariana Alcantara ou Camila Peixoto"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                  </div>

                  {/* E-mail */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      E-mail de Login <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="coordenacao@etec.sp.gov.br ou rh@empresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                      />
                    </div>
                  </div>

                  {/* Senha */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Senha de Acesso <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-slate-400">Mínimo 6 caracteres</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showSenha ? 'text' : 'password'}
                        required
                        placeholder="Defina a senha do operador..."
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="w-full h-10 pl-9 pr-10 text-xs font-mono bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSenha(!showSenha)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        title={showSenha ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Seção 2: Atribuição & Escopo */}
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    2. Cargo & Instituição
                  </span>

                  {/* Cargo */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Cargo ou Função na Entidade <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Coordenador Pedagógico, Gestora de RH"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                  </div>

                  {/* Grid Perfil e Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Nível de Acesso
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer"
                      >
                        <option value="COORDENADOR">Coordenador / RH</option>
                        <option value="SUPERADMIN">Super Admin (Global)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Situação da Conta
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'ATIVO' | 'INATIVO')}
                        className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer"
                      >
                        <option value="ATIVO">Ativo</option>
                        <option value="INATIVO">Inativo</option>
                      </select>
                    </div>
                  </div>

                  {/* Instituição Vinculada */}
                  {role !== 'SUPERADMIN' ? (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Instituição ou Empresa Vinculada
                      </label>
                      <select
                        value={entitySelect}
                        onChange={(e) => setEntitySelect(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer"
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
                        <input
                          type="text"
                          required
                          placeholder="Digite o nome da nova instituição..."
                          value={customEntity}
                          onChange={(e) => setCustomEntity(e.target.value)}
                          className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-900 border border-[#065373] dark:border-cyan-400 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373]"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200">
                      <span className="font-bold flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Acesso Global</span>
                      </span>
                      <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                        Super administradores possuem visibilidade irrestrita sobre todas as entidades.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNome('');
                    setEmail('');
                    setSenha('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Limpar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Cadastrando...' : 'Salvar Operador'}
                </button>
              </div>
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
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6 transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-950 dark:text-white tracking-tight">
                    Nova Empresa Concedente
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cadastre empresas conveniadas para contratação
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Convênio Ativo
              </span>
            </div>

            <form onSubmit={handleEmpresaSubmit} className="space-y-4 text-xs">
              {/* Razão Social */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Razão Social *</span>
                  <span className="text-[10px] font-normal text-slate-400">Obrigatório</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: TechCorp Soluções Digitais S.A."
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  className="w-full bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all text-xs"
                />
              </div>

              {/* Nome Fantasia */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  placeholder="Ex: TechCorp Digital"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  className="w-full bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all text-xs"
                />
              </div>

              {/* CNPJ */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  CNPJ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0001-00"
                  maxLength={18}
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  className="w-full bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 font-mono text-slate-950 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all text-xs"
                />
              </div>

              {/* Ramo e Cidade */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Ramo de Atuação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Tecnologia"
                    value={ramoAtuacao}
                    onChange={(e) => setRamoAtuacao(e.target.value)}
                    className="w-full bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Cidade / UF
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: São Paulo / SP"
                    value={cidadeUf}
                    onChange={(e) => setCidadeUf(e.target.value)}
                    className="w-full bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all text-xs"
                  />
                </div>
              </div>

              {/* Contato RH */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Responsável / Contato de RH
                </label>
                <input
                  type="text"
                  placeholder="Ex: Camila Peixoto (Gestora de RH)"
                  value={contatoRh}
                  onChange={(e) => setContatoRh(e.target.value)}
                  className="w-full bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all text-xs"
                />
              </div>

              {/* E-mail e Telefone RH */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    E-mail do RH
                  </label>
                  <input
                    type="email"
                    placeholder="rh@empresa.com.br"
                    value={emailRh}
                    onChange={(e) => setEmailRh(e.target.value)}
                    className="w-full bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    maxLength={15}
                    value={telefone}
                    onChange={(e) => setTelefone(formatPhone(e.target.value))}
                    className="w-full bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingEmpresa}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isSubmittingEmpresa ? 'Cadastrando...' : 'Cadastrar Empresa Parceira'}</span>
                </button>
              </div>
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
