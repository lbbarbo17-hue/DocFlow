'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TipoVinculo } from '@/lib/types';
import {
  UserPlus,
  FolderPlus,
  Building2,
  Check,
} from 'lucide-react';

const formatCPF = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

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

export default function CadastroPage() {
  const router = useRouter();
  const { turmas, empresas, addNewStudent, addNewTurma, addNewEmpresa, setToastMessage } = useApp();

  const [activeTab, setActiveTab] = useState<'ALUNO' | 'TURMA' | 'EMPRESA'>('ALUNO');

  // Form - Aluno
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [tipoVinculo, setTipoVinculo] = useState<TipoVinculo>('APRENDIZ');
  const [turmaId, setTurmaId] = useState(turmas[0]?.id || '');
  const [curso, setCurso] = useState(turmas[0]?.nomeCurso || 'Técnico em Desenvolvimento de Sistemas');
  const [empresa, setEmpresa] = useState(empresas[0]?.razaoSocial || 'TechCorp Soluções Digitais S.A.');
  const [instituicao, setInstituicao] = useState('ETEC Politécnica de São Paulo');
  const [dataAdmissao, setDataAdmissao] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmittingAluno, setIsSubmittingAluno] = useState(false);

  // Form - Turma
  const [codigoTurma, setCodigoTurma] = useState('');
  const [nomeCursoTurma, setNomeCursoTurma] = useState('');
  const [periodoTurma, setPeriodoTurma] = useState('2026.2 - Manhã');
  const [isSubmittingTurma, setIsSubmittingTurma] = useState(false);

  // Form - Empresa
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [ramoAtuacao, setRamoAtuacao] = useState('Tecnologia da Informação');
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
    if (!nome.trim() || !cpf.trim() || !matricula.trim()) {
      setToastMessage({
        title: 'Campos obrigatórios',
        desc: 'Preencha Nome, CPF e Matrícula.',
        type: 'error',
      });
      return;
    }

    setIsSubmittingAluno(true);
    const created = addNewStudent({
      nome: nome.trim(),
      cpf: cpf.trim(),
      email: email.trim() || `${nome.toLowerCase().replace(/\s+/g, '.')}@aluno.com.br`,
      matricula: matricula.trim(),
      tipoVinculo,
      turmaId,
      curso,
      empresa: empresa || 'Empresa Parceira',
      instituicao,
      dataAdmissao,
    });

    setToastMessage({
      title: 'Estudante cadastrado com sucesso',
      desc: nome,
      type: 'success',
    });

    setIsSubmittingAluno(false);
    router.push(`/coordenador/dossies?student=${created.id}`);
  };

  const handleTurmaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoTurma.trim() || !nomeCursoTurma.trim()) {
      setToastMessage({
        title: 'Campos obrigatórios',
        desc: 'Preencha Código e Nome do Curso.',
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
      totalAlunos: 0,
      conformidadeMedia: 100,
      alunosEmRisco: 0,
      alunosRegulares: 0,
    });

    setToastMessage({
      title: 'Turma criada',
      desc: codigoTurma,
      type: 'success',
    });

    setIsSubmittingTurma(false);
    router.push('/analytics');
  };

  const handleEmpresaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!razaoSocial.trim() || !cnpj.trim()) {
      setToastMessage({
        title: 'Campos obrigatórios',
        desc: 'Preencha Razão Social e CNPJ.',
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
      title: 'Empresa cadastrada',
      desc: razaoSocial,
      type: 'success',
    });

    setIsSubmittingEmpresa(false);
    setEmpresa(razaoSocial.trim());
    setActiveTab('ALUNO');
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 sm:px-0 animate-fadeIn">
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-xl mb-6 border-2 border-slate-400 dark:border dark:border-slate-800 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('ALUNO')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'ALUNO'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs border border-slate-300 dark:border-slate-700'
              : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Estudante</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TURMA')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'TURMA'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs border border-slate-300 dark:border-slate-700'
              : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>Turma</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EMPRESA')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'EMPRESA'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs border border-slate-300 dark:border-slate-700'
              : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Empresa</span>
        </button>
      </div>

      {/* Main Form Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-400 dark:border dark:border-slate-800 shadow-sm p-6 sm:p-8">
        {/* TAB 1: ESTUDANTE */}
        {activeTab === 'ALUNO' && (
          <form onSubmit={handleAlunoSubmit} className="space-y-5">
            {/* Vínculo Switch */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl border-2 border-slate-400 dark:border dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTipoVinculo('APRENDIZ')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tipoVinculo === 'APRENDIZ'
                    ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs border border-slate-300 dark:border-slate-700'
                    : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {tipoVinculo === 'APRENDIZ' && <Check className="w-3 h-3 text-[#065373] dark:text-cyan-400" />}
                <span>Jovem Aprendiz</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoVinculo('ESTAGIARIO')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tipoVinculo === 'ESTAGIARIO'
                    ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs border border-slate-300 dark:border-slate-700'
                    : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {tipoVinculo === 'ESTAGIARIO' && <Check className="w-3 h-3 text-[#065373] dark:text-cyan-400" />}
                <span>Estágio (TCE)</span>
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do estudante"
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  CPF
                </label>
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  Matrícula
                </label>
                <input
                  type="text"
                  required
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Ex: 2026-DS-0199"
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  Turma
                </label>
                <select
                  required
                  value={turmaId}
                  onChange={(e) => handleTurmaChange(e.target.value)}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer"
                >
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.codigo} — {t.nomeCurso}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={dataAdmissao}
                  onChange={(e) => setDataAdmissao(e.target.value)}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-900 dark:text-slate-100">
                    Empresa Concedente
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('EMPRESA')}
                    className="text-[11px] font-bold text-[#065373] dark:text-cyan-400 hover:underline"
                  >
                    + Nova Empresa
                  </button>
                </div>
                <select
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer"
                >
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.razaoSocial}>
                      {emp.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  Instituição de Ensino
                </label>
                <input
                  type="text"
                  value={instituicao}
                  onChange={(e) => setInstituicao(e.target.value)}
                  placeholder="ETEC Politécnica de São Paulo"
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/coordenador/dossies')}
                className="px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingAluno}
                className="px-5 py-2 text-xs font-bold text-white bg-[#065373] hover:bg-[#0a6d96] dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingAluno ? 'Cadastrando...' : 'Cadastrar Estudante'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: TURMA */}
        {activeTab === 'TURMA' && (
          <form onSubmit={handleTurmaSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                Código da Turma
              </label>
              <input
                type="text"
                required
                value={codigoTurma}
                onChange={(e) => setCodigoTurma(e.target.value)}
                placeholder="Ex: DS-2026.2-A"
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                Nome do Curso
              </label>
              <input
                type="text"
                required
                value={nomeCursoTurma}
                onChange={(e) => setNomeCursoTurma(e.target.value)}
                placeholder="Ex: Técnico em Desenvolvimento de Sistemas"
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                Turno / Período
              </label>
              <select
                value={periodoTurma}
                onChange={(e) => setPeriodoTurma(e.target.value)}
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer"
              >
                <option value="2026.2 - Manhã">2026.2 - Manhã</option>
                <option value="2026.2 - Tarde">2026.2 - Tarde</option>
                <option value="2026.2 - Noite">2026.2 - Noite</option>
                <option value="2026.2 - Integral">2026.2 - Integral</option>
              </select>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/analytics')}
                className="px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingTurma}
                className="px-5 py-2 text-xs font-bold text-white bg-[#065373] hover:bg-[#0a6d96] dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingTurma ? 'Criando...' : 'Cadastrar Turma'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: EMPRESA */}
        {activeTab === 'EMPRESA' && (
          <form onSubmit={handleEmpresaSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  Razão Social
                </label>
                <input
                  type="text"
                  required
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  placeholder="Razão social da empresa"
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  placeholder="Nome fantasia"
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  CNPJ
                </label>
                <input
                  type="text"
                  required
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  placeholder="00.000.000/0001-00"
                  maxLength={18}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  Ramo de Atuação
                </label>
                <input
                  type="text"
                  value={ramoAtuacao}
                  onChange={(e) => setRamoAtuacao(e.target.value)}
                  placeholder="Ex: Tecnologia"
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  Cidade / UF
                </label>
                <input
                  type="text"
                  value={cidadeUf}
                  onChange={(e) => setCidadeUf(e.target.value)}
                  placeholder="São Paulo / SP"
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  Responsável RH
                </label>
                <input
                  type="text"
                  value={contatoRh}
                  onChange={(e) => setContatoRh(e.target.value)}
                  placeholder="Nome do contato"
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  E-mail do RH
                </label>
                <input
                  type="email"
                  value={emailRh}
                  onChange={(e) => setEmailRh(e.target.value)}
                  placeholder="rh@empresa.com.br"
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  Telefone
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  placeholder="(11) 3456-7890"
                  maxLength={15}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('ALUNO')}
                className="px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={isSubmittingEmpresa}
                className="px-5 py-2 text-xs font-bold text-white bg-[#065373] hover:bg-[#0a6d96] dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingEmpresa ? 'Cadastrando...' : 'Cadastrar Empresa'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
