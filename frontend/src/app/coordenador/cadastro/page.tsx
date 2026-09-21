'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TipoVinculo } from '@/lib/types';
import {
  UserPlus,
  User,
  Mail,
  CreditCard,
  Building2,
  GraduationCap,
  Calendar,
  Layers,
  BookOpen,
  CheckCircle2,
  FolderPlus,
  Clock,
  Sparkles,
  Phone,
  MapPin,
  Briefcase,
} from 'lucide-react';

export default function CadastroCentralPage() {
  const router = useRouter();
  const { turmas, empresas, addNewStudent, addNewTurma, addNewEmpresa } = useApp();

  const [activeTab, setActiveTab] = useState<'ALUNO' | 'TURMA' | 'EMPRESA'>('ALUNO');

  // Form states - Aluno
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [tipoVinculo, setTipoVinculo] = useState<TipoVinculo>('APRENDIZ');
  const [turmaId, setTurmaId] = useState(turmas[0]?.id || '');
  const [curso, setCurso] = useState(turmas[0]?.nomeCurso || '');
  const [empresa, setEmpresa] = useState(empresas[0]?.razaoSocial || '');
  const [instituicao, setInstituicao] = useState('ETEC Politécnica de São Paulo');
  const [dataAdmissao, setDataAdmissao] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmittingAluno, setIsSubmittingAluno] = useState(false);

  // Form states - Turma
  const [codigoTurma, setCodigoTurma] = useState('');
  const [nomeCursoTurma, setNomeCursoTurma] = useState('');
  const [periodoTurma, setPeriodoTurma] = useState('2026.2 - Manhã');
  const [isSubmittingTurma, setIsSubmittingTurma] = useState(false);

  // Form states - Empresa
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [ramoAtuacao, setRamoAtuacao] = useState('Tecnologia da Informação & Software');
  const [contatoRh, setContatoRh] = useState('');
  const [emailRh, setEmailRh] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidadeUf, setCidadeUf] = useState('São Paulo / SP');
  const [isSubmittingEmpresa, setIsSubmittingEmpresa] = useState(false);

  const handleTurmaChange = (newTurmaId: string) => {
    setTurmaId(newTurmaId);
    const selected = turmas.find((t) => t.id === newTurmaId);
    if (selected) {
      setCurso(selected.nomeCurso);
    }
  };

  const handleAlunoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAluno(true);

    const created = addNewStudent({
      nome,
      cpf,
      email,
      matricula,
      tipoVinculo,
      turmaId,
      curso,
      empresa: empresa || 'Empresa Parceira / Conveniada',
      instituicao,
      dataAdmissao,
    });

    setIsSubmittingAluno(false);
    router.push(`/coordenador/dossies?student=${created.id}`);
  };

  const handleTurmaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTurma(true);

    const newId = `turma-${Date.now()}`;
    addNewTurma({
      id: newId,
      codigo: codigoTurma,
      nomeCurso: nomeCursoTurma,
      periodo: periodoTurma,
      totalAlunos: 0,
      conformidadeMedia: 100,
      alunosEmRisco: 0,
      alunosRegulares: 0,
    });

    setIsSubmittingTurma(false);
    router.push('/analytics');
  };

  const handleEmpresaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEmpresa(true);

    const newEmpresaId = `emp-${Date.now()}`;
    addNewEmpresa({
      id: newEmpresaId,
      razaoSocial,
      nomeFantasia: nomeFantasia || razaoSocial,
      cnpj,
      ramoAtuacao,
      contatoRh,
      emailRh,
      telefone,
      cidadeUf,
    });

    setIsSubmittingEmpresa(false);
    setEmpresa(razaoSocial);
    setActiveTab('ALUNO');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#065373] dark:text-cyan-400" />
            <span>Central de Cadastros</span>
          </h1>
        </div>

        {/* Tab Switcher: 3 Tabs (Aluno, Turma, Empresa) */}
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700 flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('ALUNO')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ALUNO'
                ? 'bg-[#065373] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Aprendiz / Estagiário</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TURMA')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'TURMA'
                ? 'bg-[#065373] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Nova Turma</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('EMPRESA')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'EMPRESA'
                ? 'bg-[#065373] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Nova Empresa</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {activeTab === 'ALUNO' ? (
          <div>
            <div className="px-6 py-4 bg-gradient-to-r from-[#065373] to-[#226a8b] text-white">
              <h2 className="text-sm font-bold tracking-tight">Cadastro de Aprendiz ou Estagiário</h2>
            </div>

            <form onSubmit={handleAlunoSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Tipo de Vínculo */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Tipo de Vínculo Contratual *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTipoVinculo('APRENDIZ')}
                    className={`p-4 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 ${
                      tipoVinculo === 'APRENDIZ'
                        ? 'bg-[#065373] text-white border-[#065373] shadow-md ring-2 ring-[#065373]/30'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        tipoVinculo === 'APRENDIZ'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">Jovem Aprendiz</p>
                      <p
                        className={`text-[11px] font-normal ${
                          tipoVinculo === 'APRENDIZ'
                            ? 'text-cyan-100'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        Contrato de Aprendizagem (Lei nº 10.097/2000)
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoVinculo('ESTAGIARIO')}
                    className={`p-4 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 ${
                      tipoVinculo === 'ESTAGIARIO'
                        ? 'bg-[#065373] text-white border-[#065373] shadow-md ring-2 ring-[#065373]/30'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        tipoVinculo === 'ESTAGIARIO'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">Estagiário</p>
                      <p
                        className={`text-[11px] font-normal ${
                          tipoVinculo === 'ESTAGIARIO'
                            ? 'text-cyan-100'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        Termo de Compromisso de Estágio (Lei nº 11.788/2008)
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dados Pessoais */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Identificação do Estudante
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                      <span>Nome Completo *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Beatriz Lima dos Santos"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                      <span>CPF *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                      <span>E-mail Corporativo / Acadêmico *</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aluno@empresa.com.br"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                      <span>Matrícula Interna *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      placeholder="Ex: 2026-DS-0205"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Dados Acadêmicos e Contratuais */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Turma & Parcerias
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                      <span>Turma Vinculada *</span>
                    </label>
                    <select
                      required
                      value={turmaId}
                      onChange={(e) => handleTurmaChange(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
                    >
                      {turmas.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.codigo} — {t.nomeCurso} ({t.periodo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                      <span>Data de Admissão *</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={dataAdmissao}
                      onChange={(e) => setDataAdmissao(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                        <span>Empresa Concedente (RH) *</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('EMPRESA')}
                        className="text-[11px] text-[#065373] dark:text-cyan-400 hover:underline font-semibold"
                      >
                        + Nova Empresa
                      </button>
                    </div>
                    <select
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
                    >
                      {empresas.map((emp) => (
                        <option key={emp.id} value={emp.razaoSocial}>
                          {emp.razaoSocial} ({emp.cidadeUf})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                      <span>Instituição de Ensino</span>
                    </label>
                    <input
                      type="text"
                      value={instituicao}
                      onChange={(e) => setInstituicao(e.target.value)}
                      placeholder="Ex: ETEC Politécnica de São Paulo"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/coordenador/dossies')}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAluno}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#065373] to-[#226a8b] hover:from-[#0a6d96] hover:to-[#226a8b] rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                  <span>{isSubmittingAluno ? 'Salvando Cadastro...' : 'Concluir Cadastro do Aluno'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : activeTab === 'TURMA' ? (
          <div>
            <div className="px-6 py-4 bg-gradient-to-r from-[#065373] to-[#226a8b] text-white">
              <h2 className="text-sm font-bold tracking-tight">Cadastro de Nova Turma</h2>
            </div>

            <form onSubmit={handleTurmaSubmit} className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                    <span>Código de Identificação da Turma *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={codigoTurma}
                    onChange={(e) => setCodigoTurma(e.target.value)}
                    placeholder="Ex: DS-2026.2-B"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                    <span>Nome do Curso / Programa *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nomeCursoTurma}
                    onChange={(e) => setNomeCursoTurma(e.target.value)}
                    placeholder="Ex: Técnico em Desenvolvimento de Sistemas"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                    <span>Período & Turno Letivo *</span>
                  </label>
                  <select
                    value={periodoTurma}
                    onChange={(e) => setPeriodoTurma(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
                  >
                    <option value="2026.2 - Manhã">2026.2 - Manhã (07:30 às 11:30)</option>
                    <option value="2026.2 - Tarde">2026.2 - Tarde (13:00 às 17:00)</option>
                    <option value="2026.2 - Noite">2026.2 - Noite (18:30 às 22:30)</option>
                    <option value="2026.2 - Integral">2026.2 - Integral</option>
                  </select>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/analytics')}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTurma}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#065373] to-[#226a8b] hover:from-[#0a6d96] hover:to-[#226a8b] rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                  <span>{isSubmittingTurma ? 'Criando Turma...' : 'Criar e Ativar Turma'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <div className="px-6 py-4 bg-gradient-to-r from-[#065373] to-[#226a8b] text-white">
              <h2 className="text-sm font-bold tracking-tight">Cadastro de Empresa Concedente / Parceira</h2>
            </div>

            <form onSubmit={handleEmpresaSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Dados da Empresa */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Identificação da Empresa
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                      <span>Razão Social *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      placeholder="Ex: TechCorp Soluções Digitais S.A."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                      <span>Nome Fantasia</span>
                    </label>
                    <input
                      type="text"
                      value={nomeFantasia}
                      onChange={(e) => setNomeFantasia(e.target.value)}
                      placeholder="Ex: TechCorp"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                      <span>CNPJ *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                      <span>Ramo / Setor de Atuação</span>
                    </label>
                    <input
                      type="text"
                      value={ramoAtuacao}
                      onChange={(e) => setRamoAtuacao(e.target.value)}
                      placeholder="Ex: Tecnologia, Varejo, Logística"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                      <span>Cidade / UF *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={cidadeUf}
                      onChange={(e) => setCidadeUf(e.target.value)}
                      placeholder="Ex: São Paulo / SP"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Contato de RH */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Contato de RH / Gestão de Pessoas
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                      <span>Nome do Responsável RH</span>
                    </label>
                    <input
                      type="text"
                      value={contatoRh}
                      onChange={(e) => setContatoRh(e.target.value)}
                      placeholder="Ex: Mariana Castro"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                      <span>E-mail do RH</span>
                    </label>
                    <input
                      type="email"
                      value={emailRh}
                      onChange={(e) => setEmailRh(e.target.value)}
                      placeholder="rh@empresa.com.br"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                      <span>Telefone / Ramal</span>
                    </label>
                    <input
                      type="text"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(11) 3456-7890"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('ALUNO')}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEmpresa}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#065373] to-[#226a8b] hover:from-[#0a6d96] hover:to-[#226a8b] rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                  <span>{isSubmittingEmpresa ? 'Cadastrando Empresa...' : 'Cadastrar Empresa'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
