'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TipoVinculo } from '@/lib/types';
import { scrollToTop } from '@/lib/utils';
import PageBanner from '@/components/layout/PageBanner';
import {
  UserPlus,
  UserCheck,
  FolderPlus,
  Building2,
  Check,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  User,
  CreditCard,
  Hash,
  Clock,
  ChevronRight,
  Info,
} from 'lucide-react';

const formatCPF = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export default function CadastroPage() {
  const router = useRouter();
  const {
    currentRole,
    activeInstitution,
    availableInstitutions,
    turmas,
    empresas,
    addNewStudent,
    addNewTurma,
    setToastMessage,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ALUNO' | 'TURMA'>('ALUNO');

  // Form - Aluno
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [matricula, setMatricula] = useState('');
  const [tipoVinculo, setTipoVinculo] = useState<TipoVinculo>('APRENDIZ');
  const [turmaId, setTurmaId] = useState(turmas[0]?.id || '');
  const [curso, setCurso] = useState(turmas[0]?.nomeCurso || 'Técnico em Desenvolvimento de Sistemas');
  const [empresa, setEmpresa] = useState(empresas[0]?.razaoSocial || 'TechCorp Soluções Digitais S.A.');
  const [instituicao, setInstituicao] = useState(activeInstitution);
  const [instituicaoTurma, setInstituicaoTurma] = useState(activeInstitution);
  const [dataAdmissao, setDataAdmissao] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmittingAluno, setIsSubmittingAluno] = useState(false);

  // Form - Turma
  const [codigoTurma, setCodigoTurma] = useState('');
  const [nomeCursoTurma, setNomeCursoTurma] = useState('');
  const [periodoTurma, setPeriodoTurma] = useState('2026.2 - Manhã');
  const [isSubmittingTurma, setIsSubmittingTurma] = useState(false);

  const handleTurmaChange = (newTurmaId: string) => {
    setTurmaId(newTurmaId);
    const selected = turmas.find((t) => t.id === newTurmaId);
    if (selected) {
      setCurso(selected.nomeCurso);
    }
  };

  const handleAlunoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cpf.trim() || !matricula.trim()) {
      setToastMessage({
        title: 'Campos Obrigatórios',
        desc: 'Preencha Nome Completo, CPF e Matrícula.',
        type: 'error',
      });
      return;
    }

    if (!senha.trim() || senha.length < 6) {
      setToastMessage({
        title: 'Senha Obrigatória',
        desc: 'Defina uma senha de acesso com no mínimo 6 caracteres para o estudante.',
        type: 'error',
      });
      return;
    }

    setIsSubmittingAluno(true);
    const created = addNewStudent({
      nome: nome.trim(),
      cpf: cpf.trim(),
      email: email.trim() || `${nome.toLowerCase().replace(/\s+/g, '.')}@aluno.com.br`,
      senha: senha.trim(),
      matricula: matricula.trim(),
      tipoVinculo,
      turmaId,
      curso,
      empresa: empresa || 'Empresa Parceira',
      instituicao: currentRole === 'COORDENADOR' ? activeInstitution : instituicao,
      dataAdmissao,
    });

    setToastMessage({
      title: 'Estudante Cadastrado com Sucesso! 🎉',
      desc: `${nome} foi adicionado(a) com acesso ativo.`,
      type: 'success',
    });

    setIsSubmittingAluno(false);
    router.push(`/coordenador/dossies?student=${created.id}`);
  };

  const handleTurmaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoTurma.trim() || !nomeCursoTurma.trim()) {
      setToastMessage({
        title: 'Campos Obrigatórios',
        desc: 'Preencha o Código da Turma e o Nome do Curso.',
        type: 'error',
      });
      return;
    }

    setIsSubmittingTurma(true);
    const newId = `turma-${Date.now()}`;
    addNewTurma({
      id: newId,
      codigo: codigoTurma.trim(),
      nomeCurso: nomeCursoTurma.trim(),
      periodo: periodoTurma,
      instituicao: currentRole === 'COORDENADOR' ? activeInstitution : instituicaoTurma,
      totalAlunos: 0,
      conformidadeMedia: 100,
      alunosEmRisco: 0,
      alunosRegulares: 0,
    });

    setToastMessage({
      title: 'Turma Criada com Sucesso!',
      desc: `Turma ${codigoTurma} adicionada.`,
      type: 'success',
    });

    setIsSubmittingTurma(false);
    router.push('/analytics');
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 animate-fadeIn space-y-6">
      {/* Page Header Banner */}
      <PageBanner
        title="Central de Cadastros"
        subtitle="Admissão simplificada de estudantes, turmas e gestão de credenciais"
        icon={UserPlus}
        backHref="/coordenador"
        backLabel="Voltar ao Painel"
        badge={{
          label: 'Coordenação',
          icon: ShieldCheck,
        }}
        action={{
          label: 'Ver Dossiês dos Alunos',
          href: '/coordenador/dossies',
          icon: UserCheck,
        }}
      />

      {/* Modern Pill Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-200/60 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ALUNO');
              scrollToTop('instant');
            }}
            className={`px-5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ALUNO'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-[#065373] dark:text-cyan-400" />
            <span>Novo Estudante</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('TURMA');
              scrollToTop('instant');
            }}
            className={`px-5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'TURMA'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderPlus className="w-4 h-4 text-[#065373] dark:text-cyan-400" />
            <span>Nova Turma</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* TAB 1: ESTUDANTE */}
        {activeTab === 'ALUNO' && (
          <form onSubmit={handleAlunoSubmit}>
            {/* Header com estilo limpo */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Cadastro de Aprendiz ou Estagiário
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Preencha os dados pessoais, acadêmicos e defina a senha para acesso ao portal do aluno.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <Check className="w-3 h-3" />
                <span>Pronto para Login</span>
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              {/* Seção 1: Modalidade de Contrato */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  1. Modalidade de Contratação
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTipoVinculo('APRENDIZ')}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      tipoVinculo === 'APRENDIZ'
                        ? 'border-[#065373] dark:border-cyan-400 bg-[#065373]/5 dark:bg-cyan-500/10 ring-2 ring-[#065373]/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      tipoVinculo === 'APRENDIZ'
                        ? 'bg-[#065373] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Jovem Aprendiz</p>
                        {tipoVinculo === 'APRENDIZ' && (
                          <span className="w-2 h-2 rounded-full bg-[#065373] dark:bg-cyan-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Contrato de Aprendizagem Profissional (Lei 10.097/00) com CTPS e programa teórico.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoVinculo('ESTAGIARIO')}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      tipoVinculo === 'ESTAGIARIO'
                        ? 'border-[#065373] dark:border-cyan-400 bg-[#065373]/5 dark:bg-cyan-500/10 ring-2 ring-[#065373]/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      tipoVinculo === 'ESTAGIARIO'
                        ? 'bg-[#065373] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Estágio (TCE)</p>
                        {tipoVinculo === 'ESTAGIARIO' && (
                          <span className="w-2 h-2 rounded-full bg-[#065373] dark:bg-cyan-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Termo de Compromisso de Estágio (Lei 11.788/08) vinculado à grade curricular.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Seção 2: Dados Pessoais & Acesso */}
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  2. Identificação & Credenciais de Acesso
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome Completo */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Nome Completo do Estudante <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Lucas Gabriel da Silva"
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                  </div>

                  {/* CPF */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      CPF <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="w-full h-10 px-3 text-xs font-mono bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                  </div>

                  {/* Matrícula */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Matrícula ou Código ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      placeholder="Ex: 2026-DS-0199"
                      className="w-full h-10 px-3 text-xs font-mono bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                  </div>

                  {/* E-mail de Acesso */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      E-mail de Login <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="lucas.gabriel@exemplo.com"
                        className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                      />
                    </div>
                  </div>

                  {/* Senha de Acesso */}
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
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Defina a senha inicial..."
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
              </div>

              {/* Seção 3: Vínculo Acadêmico & Empresa */}
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  3. Entidade, Turma & Empresa
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Turma */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Turma de Origem
                    </label>
                    <select
                      required
                      value={turmaId}
                      onChange={(e) => handleTurmaChange(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer"
                    >
                      {turmas.length === 0 ? (
                        <option value="">Nenhuma turma cadastrada (Geral)</option>
                      ) : (
                        turmas.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.codigo} — {t.nomeCurso}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Data de Início */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      value={dataAdmissao}
                      onChange={(e) => setDataAdmissao(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Empresa Concedente */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Empresa Parceira / Concedente
                    </label>
                    <select
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer"
                    >
                      {empresas.length === 0 ? (
                        <option value="">Empresa Conveniada Padrão</option>
                      ) : (
                        empresas.map((emp) => (
                          <option key={emp.id} value={emp.razaoSocial}>
                            {emp.nomeFantasia || emp.razaoSocial}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Instituição de Ensino */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Instituição de Ensino
                    </label>
                    {currentRole === 'COORDENADOR' ? (
                      <div className="h-10 px-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{activeInstitution}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Sua Instituição</span>
                      </div>
                    ) : (
                      <select
                        value={instituicao}
                        onChange={(e) => setInstituicao(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer"
                      >
                        {availableInstitutions.map((inst) => (
                          <option key={inst} value={inst}>
                            {inst}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 sm:px-8 py-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/coordenador/dossies')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingAluno}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingAluno ? 'Cadastrando...' : 'Salvar Estudante'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: TURMA */}
        {activeTab === 'TURMA' && (
          <form onSubmit={handleTurmaSubmit}>
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Nova Turma
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Crie turmas para organizar o envio e a validação em lote dos documentos dos alunos.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Código da Turma <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={codigoTurma}
                    onChange={(e) => setCodigoTurma(e.target.value)}
                    placeholder="Ex: DS-2026.2-A"
                    className="w-full h-10 px-3 text-xs font-mono bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Turno / Período
                  </label>
                  <select
                    value={periodoTurma}
                    onChange={(e) => setPeriodoTurma(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer"
                  >
                    <option value="2026.2 - Manhã">2026.2 - Manhã</option>
                    <option value="2026.2 - Tarde">2026.2 - Tarde</option>
                    <option value="2026.2 - Noite">2026.2 - Noite</option>
                    <option value="2026.2 - Integral">2026.2 - Integral</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Nome do Curso <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nomeCursoTurma}
                    onChange={(e) => setNomeCursoTurma(e.target.value)}
                    placeholder="Ex: Técnico em Desenvolvimento de Sistemas"
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Instituição de Ensino
                  </label>
                  {currentRole === 'COORDENADOR' ? (
                    <div className="h-10 px-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{activeInstitution}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Sua Instituição</span>
                    </div>
                  ) : (
                    <select
                      value={instituicaoTurma}
                      onChange={(e) => setInstituicaoTurma(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer"
                    >
                      {availableInstitutions.map((inst) => (
                        <option key={inst} value={inst}>
                          {inst}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 sm:px-8 py-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/analytics')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingTurma}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingTurma ? 'Criando...' : 'Salvar Turma'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

