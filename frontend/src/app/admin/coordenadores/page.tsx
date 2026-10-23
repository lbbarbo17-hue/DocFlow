'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/lib/types';
import { authApi, getTenantId } from '@/lib/api';
import PageBanner from '@/components/layout/PageBanner';
import {
  UserPlus,
  Building2,
  ShieldCheck,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  Briefcase,
  Mail,
  Shield,
  Search,
} from 'lucide-react';

const defaultInstitutions = [
  'ETEC Politécnica de São Paulo',
  'FATEC São Paulo - Bom Retiro',
  'SENAI Roberto Simonsen',
  'IFSP - Instituto Federal de São Paulo',
];

export default function CadastrarCoordenadorPage() {
  const {
    availableInstitutions,
    empresas,
    systemUsers,
    addNewSystemUser,
    addNewEmpresa,
    setToastMessage,
    setSystemUsers,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'COORDENADORES' | 'EMPRESAS'>('COORDENADORES');

  const institutionsList =
    availableInstitutions.length > 0 ? availableInstitutions : defaultInstitutions;

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [cargo, setCargo] = useState('Coordenador Acadêmico de Estágios');
  const [role, setRole] = useState<UserRole>('COORDENADOR');
  const [entitySelect, setEntitySelect] = useState('ETEC Politécnica de São Paulo');
  const [customEntity, setCustomEntity] = useState('');
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadCoordinators() {
      try {
        const users = await authApi.listUsers();
        if (!isMounted) return;
        setSystemUsers((prev) => {
          const newUsers: typeof prev = [];
          users.forEach((u) => {
            if (u.perfil === 'COORDENADOR' && !prev.some((su) => su.email === u.email)) {
              newUsers.push({
                id: u.id,
                nome: u.nome,
                email: u.email,
                role: 'COORDENADOR',
                cargo: 'Coordenador Acadêmico de Estágios',
                instituicao: 'ETEC Politécnica de São Paulo',
                status: u.ativo ? 'ATIVO' : 'INATIVO',
                ultimoAcesso: 'Recentemente',
              });
            }
          });
          if (newUsers.length === 0) return prev;
          return [...prev, ...newUsers];
        });
      } catch {
      }
    }
    loadCoordinators();
    return () => {
      isMounted = false;
    };
  }, [setSystemUsers]);

  const [searchTerm, setSearchTerm] = useState('');

  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [ramoAtuacao, setRamoAtuacao] = useState('Tecnologia da Informação & Software');
  const [contatoRh, setContatoRh] = useState('');
  const [emailRh, setEmailRh] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidadeUf, setCidadeUf] = useState('São Paulo / SP');
  const [isSubmittingEmpresa, setIsSubmittingEmpresa] = useState(false);

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

  const handleCoordinatorSubmit = async (e: React.FormEvent) => {
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

    const tenantId = getTenantId() || '6a7eb67b-bddc-4ad1-8898-0106ff268ed5';
    const perfilApi = role === 'SUPERADMIN' ? 'ADMIN' : 'COORDENADOR';

    try {
      await authApi.register({
        tenant_id: tenantId,
        email: email.trim(),
        nome: nome.trim(),
        perfil: perfilApi,
        senha: senha.trim() || 'DocFlow@2026',
      });
    } catch {
    }

    addNewSystemUser({
      nome: nome.trim(),
      email: email.trim(),
      cargo: cargo.trim() || 'Coordenador / RH',
      role,
      instituicao: finalEntity,
      status,
    });

    setToastMessage({
      title: 'Operador Cadastrado!',
      desc: `${nome} foi credenciado(a) como ${role === 'SUPERADMIN' ? 'Super Admin' : 'Coordenador(a)'}.`,
      type: 'success',
    });

    setNome('');
    setEmail('');
    setSenha('');
    setCargo('Coordenador Acadêmico de Estágios');
    setRole('COORDENADOR');
    setEntitySelect(institutionsList[0] || 'ETEC Politécnica de São Paulo');
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

    setToastMessage({
      title: 'Empresa Concedente Cadastrada!',
      desc: `${razaoSocial} foi adicionada ao ecossistema DocFlow.`,
      type: 'success',
    });

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

      <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl">
        <button
          type="button"
          onClick={() => setActiveTab('COORDENADORES')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'COORDENADORES'
              ? 'bg-white dark:bg-slate-900 text-[#0284c7] dark:text-[#00b4d8] shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4 text-[#0284c7] dark:text-[#00b4d8]" />
          <span>Coordenadores & RH ({coordinators.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EMPRESAS')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'EMPRESAS'
              ? 'bg-white dark:bg-slate-900 text-[#0284c7] dark:text-[#00b4d8] shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#0284c7] dark:text-[#00b4d8]" />
          <span>Empresas Concedentes ({empresas.length})</span>
        </button>
      </div>

      {activeTab === 'COORDENADORES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
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
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    1. Dados de Acesso
                  </span>

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

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      E-mail Institucional <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
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

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Senha de Acesso <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSenha(!showSenha)}
                        className="text-[11px] text-[#065373] dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showSenha ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showSenha ? 'Ocultar' : 'Exibir'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showSenha ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres (Ex: Coord@2026)"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 2: Cargo & Instituição */}
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    2. Atribuição & Vínculo
                  </span>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Cargo / Função <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: Coordenador Pedagógico, Gestor de RH"
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Perfil de Acesso
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
                        Status da Conta
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'ATIVO' | 'INATIVO')}
                        className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer"
                      >
                        <option value="ATIVO">🟢 Ativo</option>
                        <option value="INATIVO">🔴 Inativo</option>
                      </select>
                    </div>
                  </div>

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
                          {institutionsList.map((inst) => (
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

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Operadores Cadastrados
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Lista de coordenadores e operadores de RH ativos
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar operador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[560px] overflow-y-auto">
              {filteredCoordinators.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
                  Nenhum coordenador encontrado.
                </div>
              ) : (
                filteredCoordinators.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {u.nome}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'ATIVO'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                          }`}
                        >
                          {u.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {u.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                        <span>{u.cargo}</span>
                        <span>•</span>
                        <span className="truncate">{u.instituicao}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'EMPRESAS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Nova Empresa Concedente
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cadastre empresas parceiras e concedentes de vagas
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <Check className="w-3 h-3" />
                <span>Parceiro</span>
              </span>
            </div>

            <form onSubmit={handleEmpresaSubmit}>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Razão Social <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TechCorp Soluções Digitais S.A."
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Nome Fantasia
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: TechCorp"
                      value={nomeFantasia}
                      onChange={(e) => setNomeFantasia(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      CNPJ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="00.000.000/0000-00"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Ramo de Atuação
                  </label>
                  <input
                    type="text"
                    value={ramoAtuacao}
                    onChange={(e) => setRamoAtuacao(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Contato RH
                    </label>
                    <input
                      type="text"
                      placeholder="Nome do contato"
                      value={contatoRh}
                      onChange={(e) => setContatoRh(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      E-mail RH
                    </label>
                    <input
                      type="email"
                      placeholder="rh@empresa.com"
                      value={emailRh}
                      onChange={(e) => setEmailRh(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Telefone
                    </label>
                    <input
                      type="text"
                      placeholder="(11) 90000-0000"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Cidade / UF
                    </label>
                    <input
                      type="text"
                      placeholder="São Paulo / SP"
                      value={cidadeUf}
                      onChange={(e) => setCidadeUf(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRazaoSocial('');
                    setNomeFantasia('');
                    setCnpj('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Limpar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEmpresa}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEmpresa ? 'Cadastrando...' : 'Salvar Empresa'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Empresas Cadastradas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Rede de empresas conveniadas para estágio e aprendizagem
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar empresa..."
                  value={empresaSearchTerm}
                  onChange={(e) => setEmpresaSearchTerm(e.target.value)}
                  className="h-9 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[560px] overflow-y-auto">
              {filteredEmpresas.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
                  Nenhuma empresa cadastrada.
                </div>
              ) : (
                filteredEmpresas.map((emp) => (
                  <div
                    key={emp.id}
                    className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {emp.nomeFantasia || emp.razaoSocial}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {emp.cnpj}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {emp.razaoSocial}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                        <span>{emp.ramoAtuacao}</span>
                        <span>•</span>
                        <span>{emp.cidadeUf}</span>
                        {emp.contatoRh && (
                          <>
                            <span>•</span>
                            <span>RH: {emp.contatoRh}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
