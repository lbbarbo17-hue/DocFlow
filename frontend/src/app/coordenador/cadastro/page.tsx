'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TipoVinculo } from '@/lib/types';
import { alunosApi, contratosApi, authApi, getTenantId } from '@/lib/api';
import { scrollToTop } from '@/lib/utils';
import PageBanner from '@/components/layout/PageBanner';
import {
  UserPlus,
  UserCheck,
  FolderPlus,
  Building2,
  Check,
  ShieldCheck,
  CalendarDays,
  DollarSign,
  KeyRound,
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
  Mail,
  FileSignature,
} from 'lucide-react';

const formatCPF = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

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
      periodo: '2026.1 - Manhã',
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

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passStrength = calculatePasswordStrength(senha);
  const strengthLabels = [
    { label: 'Muito Curta', color: 'bg-slate-700 text-slate-400', emoji: '😴' },
    { label: 'Fraca', color: 'bg-rose-500 text-rose-500', emoji: '⚠️' },
    { label: 'Média', color: 'bg-amber-500 text-amber-500', emoji: '🤔' },
    { label: 'Forte', color: 'bg-sky-500 text-sky-500', emoji: '🔥' },
    { label: 'Segura', color: 'bg-emerald-500 text-emerald-500', emoji: '🛡️' },
  ];
  const [matricula, setMatricula] = useState('');
  const [tipoVinculo, setTipoVinculo] = useState<TipoVinculo>('APRENDIZ');
  const [turmaSelect, setTurmaSelect] = useState<string>(availableTurmasList[0]?.id || 'turma-ds-01');
  const [customTurma, setCustomTurma] = useState<string>('');
  const [curso, setCurso] = useState(availableTurmasList[0]?.nomeCurso || 'Técnico em Desenvolvimento de Sistemas');
  const [empresaSelect, setEmpresaSelect] = useState<string>(companiesList[0] || 'TechCorp Soluções Digitais S.A.');
  const [customEmpresa, setCustomEmpresa] = useState<string>('');
  const [instituicao, setInstituicao] = useState(activeInstitution);
  const [instituicaoTurma, setInstituicaoTurma] = useState(activeInstitution);
  const [dataAdmissao, setDataAdmissao] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmittingAluno, setIsSubmittingAluno] = useState(false);

  const [codigoTurma, setCodigoTurma] = useState('');
  const [nomeCursoTurma, setNomeCursoTurma] = useState('');
  const [periodoTurma, setPeriodoTurma] = useState('2026.2 - Manhã');
  const [isSubmittingTurma, setIsSubmittingTurma] = useState(false);

  const [contratoAlunoId, setContratoAlunoId] = useState<string>('');
  const [contratoNumero, setContratoNumero] = useState<string>('');
  const [contratoInicio, setContratoInicio] = useState<string>(new Date().toISOString().split('T')[0]);
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
      turmaSelect === '__CUSTOM_TURMA__'
        ? `turma-custom-${Date.now()}`
        : turmaSelect;

    const finalCurso =
      turmaSelect === '__CUSTOM_TURMA__'
        ? customTurma.trim() || 'Curso Técnico'
        : curso;

    const finalEmpresa =
      empresaSelect === '__CUSTOM__'
        ? customEmpresa.trim() || 'Empresa Concedente'
        : empresaSelect;

    const cleanEmail = email.trim() || `${nome.toLowerCase().replace(/\s+/g, '.')}@aluno.com.br`;
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
    } catch {
    }

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
    } catch {
    }

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
      instituicao: tipoVinculo === 'APRENDIZ' ? (currentRole === 'COORDENADOR' ? activeInstitution : instituicao) : undefined,
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

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 animate-fadeIn space-y-6">
      <PageBanner
        title="Central de Cadastros"
        icon={UserPlus}
        backHref="/coordenador"
        backLabel="Voltar ao Painel"
        badge={{
          label: 'Ambiente da Coordenação',
          icon: ShieldCheck,
        }}
        action={{
          label: 'Ver Aprendizes',
          href: '/coordenador/dossies',
          icon: UserCheck,
        }}
      />

      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl w-full">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ALUNO');
              scrollToTop('instant');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'ALUNO'
                ? 'bg-white dark:bg-slate-900 text-[#0284c7] dark:text-[#00b4d8] shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4 text-[#0284c7] dark:text-[#00b4d8]" />
            <span>Estudante</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('TURMA');
              scrollToTop('instant');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'TURMA'
                ? 'bg-white dark:bg-slate-900 text-[#0284c7] dark:text-[#00b4d8] shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <FolderPlus className="w-4 h-4 text-[#0284c7] dark:text-[#00b4d8]" />
            <span>Turma</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('CONTRATO');
              scrollToTop('instant');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'CONTRATO'
                ? 'bg-white dark:bg-slate-900 text-[#0284c7] dark:text-[#00b4d8] shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <FileSignature className="w-4 h-4 text-[#0284c7] dark:text-[#00b4d8]" />
            <span>Contrato / TCE</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {activeTab === 'ALUNO' && (
          <form onSubmit={handleAlunoSubmit}>
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Novo Estudante
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cadastre um jovem aprendiz ou estagiário com credencial de acesso
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
                <Check className="w-3 h-3" />
                <span>Ativo</span>
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTipoVinculo('APRENDIZ')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    tipoVinculo === 'APRENDIZ'
                      ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs border border-slate-300 dark:border-slate-700'
                      : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-[#065373] dark:text-cyan-400" />
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
                  <Briefcase className="w-4 h-4 text-[#065373] dark:text-cyan-400" />
                  <span>Estágio (TCE)</span>
                </button>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  1. Dados Pessoais & Acesso
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Nome Completo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Nome do estudante"
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                  </div>

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

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Matrícula <span className="text-rose-500">*</span>
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

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      E-mail Institucional ou Pessoal
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@exemplo.com"
                        className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Senha de Acesso ao Portal
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
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Padrão: DocFlow@2026"
                        className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all font-mono"
                      />
                    </div>
                    {senha.length > 0 && (
                      <div className="pt-1.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-500 dark:text-slate-400">Força da Senha:</span>
                          <span className="font-bold flex items-center gap-1">
                            <span>{strengthLabels[passStrength].emoji}</span>
                            <span className={strengthLabels[passStrength].color.split(' ')[1]}>
                              {strengthLabels[passStrength].label}
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden flex gap-0.5">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-full flex-1 transition-all duration-300 ${
                                passStrength >= step
                                  ? passStrength === 1
                                    ? 'bg-rose-500'
                                    : passStrength === 2
                                    ? 'bg-amber-500'
                                    : passStrength === 3
                                    ? 'bg-sky-400'
                                    : 'bg-emerald-400'
                                  : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  2. Dados Acadêmicos & Concessão
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Turma / Curso
                    </label>
                    <select
                      value={turmaSelect}
                      onChange={(e) => handleTurmaChange(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer"
                    >
                      <optgroup label="Turmas Disponíveis">
                        {availableTurmasList.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.codigo} — {t.nomeCurso}
                          </option>
                        ))}
                      </optgroup>
                      <option value="__CUSTOM_TURMA__">
                        + Informar Outra Turma / Curso (Digitação Livre)
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
                        placeholder="Código e Nome da Turma (Ex: DS-2026 / Redes) *"
                        className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-900 border border-[#065373] dark:border-cyan-400 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] mt-2"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Data de Admissão / Início
                    </label>
                    <input
                      type="date"
                      value={dataAdmissao}
                      onChange={(e) => setDataAdmissao(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Empresa Concedente
                    </label>
                    <select
                      value={empresaSelect}
                      onChange={(e) => setEmpresaSelect(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer"
                    >
                      <optgroup label="Empresas Parceiras do Grupo">
                        {companiesList.map((empNome) => (
                          <option key={empNome} value={empNome}>
                            {empNome}
                          </option>
                        ))}
                      </optgroup>
                      <option value="__CUSTOM__">
                        + Informar Outra Empresa Concedente (Digitação Livre)
                      </option>
                    </select>

                    {empresaSelect === '__CUSTOM__' && (
                      <input
                        type="text"
                        required
                        value={customEmpresa}
                        onChange={(e) => setCustomEmpresa(e.target.value)}
                        placeholder="Digite a Razão Social da Empresa Concedente *"
                        className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-900 border border-[#065373] dark:border-cyan-400 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] mt-2"
                      />
                    )}
                  </div>

                  {tipoVinculo === 'APRENDIZ' && (
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
                  )}
                </div>
              </div>
            </div>

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
                {isSubmittingAluno ? 'Cadastrando...' : 'Cadastrar Estudante'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'TURMA' && (
          <form onSubmit={handleTurmaSubmit}>
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Nova Turma
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Crie uma turma para agrupar e monitorar aprendizes
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <Check className="w-3 h-3" />
                <span>Ativa</span>
              </span>
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

        {activeTab === 'CONTRATO' && (
          <form onSubmit={handleContratoSubmit}>
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Novo Contrato / Termo de Compromisso (TCE)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Vincule um contrato com vigência e bolsa-auxílio a um estudante
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60">
                <Check className="w-3 h-3" />
                <span>Contrato</span>
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 flex items-start gap-2.5">
                <CalendarDays className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
                <p className="text-xs text-sky-900 dark:text-sky-300 font-medium">
                  Registre ou vincule um contrato / TCE a um estudante já cadastrado. O contrato ficará visível no dossiê e no portal do estudante.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Estudante <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={contratoAlunoId}
                    onChange={(e) => setContratoAlunoId(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 cursor-pointer"
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
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Número do Contrato / TCE <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contratoNumero}
                    onChange={(e) => setContratoNumero(e.target.value)}
                    placeholder="Ex: TCE-2026-042 ou APREND-2026-0199"
                    className="w-full h-10 px-3 text-xs font-mono bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Data de Início <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={contratoInicio}
                    onChange={(e) => setContratoInicio(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Data de Término <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={contratoFim}
                    onChange={(e) => setContratoFim(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Bolsa-Auxílio Mensal (R$)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={contratoBolsa}
                    onChange={(e) => setContratoBolsa(e.target.value)}
                    placeholder="Ex: 1650.00"
                    className="w-full h-10 px-3 text-xs font-mono bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400"
                  />
                </div>
              </div>
            </div>

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
                disabled={isSubmittingContrato}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingContrato ? 'Registrando...' : 'Salvar Contrato / TCE'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
