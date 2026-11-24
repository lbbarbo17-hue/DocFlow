'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TipoVinculo } from '@/lib/types';
import { alunosApi, contratosApi, authApi, getTenantId } from '@/lib/api';
import { scrollToTop } from '@/lib/utils';

const formatCPF = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

function formatShortDate(dateStr?: string): string {
  if (!dateStr) return 'Recente';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

const DEFAULT_EMPRESAS_GRUPO = [
  'TechCorp Soluções Digitais S.A.',
  'Inovação & Sistemas Brasil Ltda',
  'Alpha Logística & Distribuição',
  'Nexus Engenharia e Projetos',
  'Banco Itaú Unibanco S.A.',
  'Ambev Brasil S.A.',
  'Accenture Soluções Tecnológicas',
  'Hospital & Centro Médico São Luiz',
];

const DEFAULT_TURMAS = [
  { id: 'turma-ds-01', codigo: 'DS-2026.1', nomeCurso: 'Técnico em Desenvolvimento de Sistemas' },
  { id: 'turma-adm-01', codigo: 'ADM-2026.1', nomeCurso: 'Técnico em Administração' },
  { id: 'turma-log-01', codigo: 'LOG-2026.1', nomeCurso: 'Técnico em Logística' },
  { id: 'turma-rh-01', codigo: 'RH-2026.1', nomeCurso: 'Técnico em Recursos Humanos' },
];

export default function CadastroPage() {
  const router = useRouter();
  const {
    currentRole,
    activeInstitution,
    availableInstitutions,
    turmas,
    empresas,
    allStudentsList,
    addNewStudent,
    addNewTurma,
    setToastMessage,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ALUNO' | 'TURMA' | 'CONTRATO'>('ALUNO');
  const [copiedCred, setCopiedCred] = useState(false);

  const companiesList = useMemo(() => {
    const set = new Set<string>(DEFAULT_EMPRESAS_GRUPO);
    empresas.forEach((e) => {
      if (e.razaoSocial) set.add(e.razaoSocial);
    });
    return Array.from(set);
  }, [empresas]);

  const availableTurmasList = useMemo(() => {
    if (turmas.length > 0) return turmas;
    return DEFAULT_TURMAS.map((dt) => ({
      ...dt,
      periodo: '2026.1 • Manhã',
      instituicao: activeInstitution,
      totalAlunos: 0,
      alunosEmRisco: 0,
      alunosRegulares: 0,
      conformidadeMedia: 100,
    }));
  }, [turmas, activeInstitution]);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [matricula, setMatricula] = useState('');
  const [tipoVinculo, setTipoVinculo] = useState<TipoVinculo>('APRENDIZ');
  const [turmaSelect, setTurmaSelect] = useState<string>(availableTurmasList[0]?.id || 'turma-ds-01');
  const [customTurma, setCustomTurma] = useState<string>('');
  const [curso, setCurso] = useState(
    availableTurmasList[0]?.nomeCurso || 'Técnico em Desenvolvimento de Sistemas'
  );
  const [empresaSelect, setEmpresaSelect] = useState<string>(
    companiesList[0] || 'TechCorp Soluções Digitais S.A.'
  );
  const [customEmpresa, setCustomEmpresa] = useState<string>('');
  const [instituicao, setInstituicao] = useState(activeInstitution);
  const [instituicaoTurma, setInstituicaoTurma] = useState(activeInstitution);
  const [dataAdmissao, setDataAdmissao] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingAluno, setIsSubmittingAluno] = useState(false);

  const [codigoTurma, setCodigoTurma] = useState('');
  const [nomeCursoTurma, setNomeCursoTurma] = useState('');
  const [periodoTurma, setPeriodoTurma] = useState('2026.2 • Manhã');
  const [isSubmittingTurma, setIsSubmittingTurma] = useState(false);

  const [contratoAlunoId, setContratoAlunoId] = useState<string>('');
  const [contratoNumero, setContratoNumero] = useState<string>('');
  const [contratoInicio, setContratoInicio] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [contratoFim, setContratoFim] = useState<string>('2026-12-15');
  const [contratoBolsa, setContratoBolsa] = useState<string>('1650');
  const [isSubmittingContrato, setIsSubmittingContrato] = useState(false);

  const handleTurmaChange = (newTurmaId: string) => {
    setTurmaSelect(newTurmaId);
    if (newTurmaId !== '__CUSTOM_TURMA__') {
      const selected = availableTurmasList.find((t) => t.id === newTurmaId);
      if (selected) {
        setCurso(selected.nomeCurso);
      }
    }
  };

  const handleCopyCredential = () => {
    const credential = senha.trim() || 'DocFlow@2026';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(credential);
      setCopiedCred(true);
      setTimeout(() => setCopiedCred(false), 2000);
    }
  };

  const handleAlunoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cpf.trim() || !matricula.trim()) {
      setToastMessage({
        title: 'Campos Obrigatórios',
        desc: 'Preencha Nome Completo, CPF e Matrícula.',
        type: 'error',
      });
      return;
    }

    const finalTurmaId =
      turmaSelect === '__CUSTOM_TURMA__' ? `turma-custom-${Date.now()}` : turmaSelect;

    const finalCurso =
      turmaSelect === '__CUSTOM_TURMA__' ? customTurma.trim() || 'Curso Técnico' : curso;

    const finalEmpresa =
      empresaSelect === '__CUSTOM__'
        ? customEmpresa.trim() || 'Empresa Concedente'
        : empresaSelect;

    const cleanEmail =
      email.trim() || `${nome.toLowerCase().replace(/\s+/g, '.')}@aluno.com.br`;
    const studentPassword = senha.trim() || 'DocFlow@2026';

    setIsSubmittingAluno(true);

    const tenantId = getTenantId() || '6a7eb67b-bddc-4ad1-8898-0106ff268ed5';

    try {
      await authApi.register({
        tenant_id: tenantId,
        email: cleanEmail,
        nome: nome.trim(),
        perfil: 'ESTUDANTE',
        senha: studentPassword,
      });
    } catch {}

    let createdBackendId: string | undefined = undefined;
    try {
      const novoAluno = await alunosApi.create({
        nome: nome.trim(),
        cpf: cpf.trim(),
        email: cleanEmail,
        matricula: matricula.trim(),
        status: 'ATIVO',
      });
      if (novoAluno && novoAluno.id) {
        createdBackendId = novoAluno.id;
        const prefixo = tipoVinculo === 'APRENDIZ' ? 'APREND' : 'TCE';
        contratosApi
          .create({
            aluno_id: novoAluno.id,
            numero_contrato: `${prefixo}-2026-${matricula.trim()}`,
            data_inicio: dataAdmissao || new Date().toISOString().split('T')[0],
            data_fim: '2026-12-15',
            valor_bolsa: 1650.0,
          })
          .catch(() => {});
      }
    } catch {}

    const created = addNewStudent({
      id: createdBackendId,
      nome: nome.trim(),
      cpf: cpf.trim(),
      email: cleanEmail,
      matricula: matricula.trim(),
      tipoVinculo,
      turmaId: finalTurmaId,
      curso: finalCurso,
      empresa: finalEmpresa,
      instituicao:
        tipoVinculo === 'APRENDIZ'
          ? currentRole === 'COORDENADOR'
            ? activeInstitution
            : instituicao
          : undefined,
      dataAdmissao,
    });

    setToastMessage({
      title: 'Estudante Cadastrado com Sucesso!',
      desc: `${nome} foi registrado com acesso ao sistema e contrato vinculado.`,
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

  const handleContratoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contratoAlunoId || !contratoNumero.trim() || !contratoInicio || !contratoFim) {
      setToastMessage({
        title: 'Campos Obrigatórios',
        desc: 'Selecione o estudante e preencha todos os campos do contrato.',
        type: 'error',
      });
      return;
    }
    setIsSubmittingContrato(true);
    try {
      const bolsaNum = parseFloat(contratoBolsa.replace(',', '.'));
      await contratosApi.create({
        aluno_id: contratoAlunoId,
        numero_contrato: contratoNumero.trim(),
        data_inicio: contratoInicio,
        data_fim: contratoFim,
        valor_bolsa: isNaN(bolsaNum) ? undefined : bolsaNum,
      });
      setToastMessage({
        title: 'Contrato Registrado!',
        desc: contratoNumero.trim(),
        type: 'success',
      });
      setContratoNumero('');
      setContratoAlunoId('');
      setContratoInicio(new Date().toISOString().split('T')[0]);
      setContratoFim('2026-12-15');
      setContratoBolsa('1650');
    } catch {
      setToastMessage({
        title: 'Erro ao Registrar Contrato',
        desc: 'Verifique os dados e tente novamente.',
        type: 'error',
      });
    }
    setIsSubmittingContrato(false);
  };

  const selectedTurmaObj = availableTurmasList.find((t) => t.id === turmaSelect);
  const previewTurmaLabel =
    turmaSelect === '__CUSTOM_TURMA__'
      ? customTurma.trim() || 'Turma personalizada'
      : selectedTurmaObj
      ? `${selectedTurmaObj.codigo} — ${selectedTurmaObj.nomeCurso}`
      : curso;

  const selectedContratoStudent = allStudentsList.find((s) => s.id === contratoAlunoId);
  const recentStudents = allStudentsList.slice(0, 3);

  const tabs = [
    { id: 'ALUNO' as const, label: 'Estudante' },
    { id: 'TURMA' as const, label: 'Turma' },
    { id: 'CONTRATO' as const, label: 'Contrato / TCE' },
  ];

  const inputClass =
    'w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#085078] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-colors';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Card Banner Superior (mesma largura total das demais páginas) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 mb-6 flex items-center justify-between shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
          Central de Cadastros
        </h1>

        <Link
          href="/coordenador/dossies"
          className="bg-[#085078] hover:bg-[#063f60] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          Ver Aprendizes
        </Link>
      </div>

      {/* 2. Navegação por Abas Horizontal Limpa e Alinhada à Esquerda */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              scrollToTop('instant');
            }}
            className={`pb-3 text-sm transition-all shrink-0 cursor-pointer border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-[#085078] text-[#085078] dark:text-cyan-400 dark:border-cyan-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Grid Equilibrado em 2 Colunas (2/3 Formulário + 1/3 Prévia & Recentes) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COLUNA PRINCIPAL: Formulário de Cadastro */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {activeTab === 'ALUNO' && (
            <form onSubmit={handleAlunoSubmit}>
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Novo Estudante
                </h2>

                {/* Seletor compacto de modalidade */}
                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/70 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setTipoVinculo('APRENDIZ')}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      tipoVinculo === 'APRENDIZ'
                        ? 'bg-[#085078] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Jovem Aprendiz
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoVinculo('ESTAGIARIO')}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      tipoVinculo === 'ESTAGIARIO'
                        ? 'bg-[#085078] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Estágio (TCE)
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Nome completo do estudante"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      CPF
                    </label>
                    <input
                      type="text"
                      required
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className={`${inputClass} font-mono`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Matrícula
                    </label>
                    <input
                      type="text"
                      required
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      placeholder="Ex: 2026-DS-0199"
                      className={`${inputClass} font-mono`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Senha de Acesso
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSenha(!showSenha)}
                        className="text-[11px] text-[#085078] dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showSenha ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showSenha ? 'Ocultar' : 'Exibir'}</span>
                      </button>
                    </div>
                    <input
                      type={showSenha ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Padrão: DocFlow@2026"
                      className={`${inputClass} font-mono`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Turma / Curso
                    </label>
                    <select
                      value={turmaSelect}
                      onChange={(e) => handleTurmaChange(e.target.value)}
                      className={`${inputClass} cursor-pointer`}
                    >
                      {availableTurmasList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.codigo} — {t.nomeCurso}
                        </option>
                      ))}
                      <option value="__CUSTOM_TURMA__">
                        + Informar outra turma / curso
                      </option>
                    </select>

                    {turmaSelect === '__CUSTOM_TURMA__' && (
                      <input
                        type="text"
                        required
                        value={customTurma}
                        onChange={(e) => {
                          setCustomTurma(e.target.value);
                          setCurso(e.target.value);
                        }}
                        placeholder="Código e nome da turma"
                        className={`${inputClass} mt-2`}
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      value={dataAdmissao}
                      onChange={(e) => setDataAdmissao(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className={tipoVinculo === 'APRENDIZ' ? 'space-y-1' : 'sm:col-span-2 space-y-1'}>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Empresa Concedente
                    </label>
                    <select
                      value={empresaSelect}
                      onChange={(e) => setEmpresaSelect(e.target.value)}
                      className={`${inputClass} cursor-pointer`}
                    >
                      {companiesList.map((empNome) => (
                        <option key={empNome} value={empNome}>
                          {empNome}
                        </option>
                      ))}
                      <option value="__CUSTOM__">+ Informar outra empresa</option>
                    </select>

                    {empresaSelect === '__CUSTOM__' && (
                      <input
                        type="text"
                        required
                        value={customEmpresa}
                        onChange={(e) => setCustomEmpresa(e.target.value)}
                        placeholder="Razão social da empresa"
                        className={`${inputClass} mt-2`}
                      />
                    )}
                  </div>

                  {tipoVinculo === 'APRENDIZ' && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                        Instituição de Ensino
                      </label>
                      {currentRole === 'COORDENADOR' ? (
                        <input
                          type="text"
                          readOnly
                          value={activeInstitution}
                          className="w-full h-10 px-3 text-xs bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-default"
                        />
                      ) : (
                        <select
                          value={instituicao}
                          onChange={(e) => setInstituicao(e.target.value)}
                          className={`${inputClass} cursor-pointer`}
                        >
                          {availableInstitutions.map((inst) => (
                            <option key={inst} value={inst}>
                              {inst}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/coordenador/dossies')}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAluno}
                  className="px-5 py-2.5 text-xs font-medium text-white bg-[#085078] hover:bg-[#063f60] rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAluno ? 'Cadastrando...' : 'Cadastrar Estudante'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'TURMA' && (
            <form onSubmit={handleTurmaSubmit}>
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Nova Turma
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Código da Turma
                    </label>
                    <input
                      type="text"
                      required
                      value={codigoTurma}
                      onChange={(e) => setCodigoTurma(e.target.value)}
                      placeholder="Ex: DS-2026.2-A"
                      className={`${inputClass} font-mono`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Turno / Período
                    </label>
                    <select
                      value={periodoTurma}
                      onChange={(e) => setPeriodoTurma(e.target.value)}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="2026.2 • Manhã">2026.2 • Manhã</option>
                      <option value="2026.2 • Tarde">2026.2 • Tarde</option>
                      <option value="2026.2 • Noite">2026.2 • Noite</option>
                      <option value="2026.2 • Integral">2026.2 • Integral</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Nome do Curso
                    </label>
                    <input
                      type="text"
                      required
                      value={nomeCursoTurma}
                      onChange={(e) => setNomeCursoTurma(e.target.value)}
                      placeholder="Ex: Técnico em Desenvolvimento de Sistemas"
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Instituição de Ensino
                    </label>
                    {currentRole === 'COORDENADOR' ? (
                      <input
                        type="text"
                        readOnly
                        value={activeInstitution}
                        className="w-full h-10 px-3 text-xs bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-default"
                      />
                    ) : (
                      <select
                        value={instituicaoTurma}
                        onChange={(e) => setInstituicaoTurma(e.target.value)}
                        className={`${inputClass} cursor-pointer`}
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

              <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/analytics')}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTurma}
                  className="px-5 py-2.5 text-xs font-medium text-white bg-[#085078] hover:bg-[#063f60] rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingTurma ? 'Salvando...' : 'Salvar Turma'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'CONTRATO' && (
            <form onSubmit={handleContratoSubmit}>
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Novo Contrato / Termo de Compromisso (TCE)
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Estudante
                    </label>
                    <select
                      required
                      value={contratoAlunoId}
                      onChange={(e) => setContratoAlunoId(e.target.value)}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="">Selecione o estudante...</option>
                      {allStudentsList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome} — {s.matricula}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Número do Contrato / TCE
                    </label>
                    <input
                      type="text"
                      required
                      value={contratoNumero}
                      onChange={(e) => setContratoNumero(e.target.value)}
                      placeholder="Ex: TCE-2026-042 ou APREND-2026-0199"
                      className={`${inputClass} font-mono`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      required
                      value={contratoInicio}
                      onChange={(e) => setContratoInicio(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Data de Término
                    </label>
                    <input
                      type="date"
                      required
                      value={contratoFim}
                      onChange={(e) => setContratoFim(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Bolsa-Auxílio Mensal (R$)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={contratoBolsa}
                      onChange={(e) => setContratoBolsa(e.target.value)}
                      placeholder="Ex: 1650.00"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/coordenador/dossies')}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingContrato}
                  className="px-5 py-2.5 text-xs font-medium text-white bg-[#085078] hover:bg-[#063f60] rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingContrato ? 'Registrando...' : 'Salvar Contrato / TCE'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* COLUNA LATERAL: Prévia do Cadastro + Últimos Cadastros */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card Superior: Prévia do Cadastro */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              Prévia do Cadastro
            </h3>

            {activeTab === 'ALUNO' && (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Nome</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5 truncate">
                    {nome.trim() || 'Aguardando preenchimento'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Modalidade</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {tipoVinculo === 'APRENDIZ' ? 'Jovem Aprendiz' : 'Estágio (TCE)'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Turma</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {previewTurmaLabel}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1.5">
                    Credencial de Acesso Inicial
                  </span>
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <span className="font-mono font-semibold text-slate-900 dark:text-white truncate">
                      {senha.trim() || 'DocFlow@2026'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCredential}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                      title="Copiar senha inicial"
                    >
                      {copiedCred ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'TURMA' && (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Código</span>
                  <p className="font-mono font-semibold text-slate-900 dark:text-white mt-0.5">
                    {codigoTurma.trim() || 'A definir'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Curso</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {nomeCursoTurma.trim() || 'Aguardando preenchimento'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Período</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {periodoTurma}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'CONTRATO' && (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Estudante</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5 truncate">
                    {selectedContratoStudent?.nome || 'Selecione um estudante'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Número</span>
                  <p className="font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {contratoNumero.trim() || 'A definir'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Vigência</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {formatShortDate(contratoInicio)} até {formatShortDate(contratoFim)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card Inferior: Últimos Cadastros */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              Últimos Cadastros
            </h3>

            {recentStudents.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                Nenhum cadastro recente.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentStudents.map((s) => {
                  const turmaCode =
                    turmas.find((t) => t.id === s.turmaId)?.codigo ||
                    s.turmaNome?.split('—')[0]?.trim() ||
                    s.curso ||
                    'Sem Turma';

                  return (
                    <Link
                      key={s.id}
                      href={`/coordenador/dossies?student=${s.id}`}
                      className="block border border-slate-200 dark:border-slate-800 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {s.nome}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {turmaCode} • {formatShortDate(s.dataAdmissao)}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
