'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TipoVinculo, DadosAprendiz, DadosEstagiario } from '@/lib/types';
import { alunosApi, contratosApi, authApi, getTenantId } from '@/lib/api';
import { scrollToTop } from '@/lib/utils';

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

function formatShortDate(dateStr?: string): string {
  if (!dateStr) return 'Recente';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

const isUuid = (val?: string) =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

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
    currentCoordinatorUser,
    activeInstitution,
    instituicoes,
    turmas,
    empresas,
    allStudentsList,
    addNewStudent,
    addNewTurma,
    createEmpresaInline,
    addNewInstituicao,
    setToastMessage,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ALUNO' | 'TURMA' | 'CONTRATO'>('ALUNO');
  const [copiedCred, setCopiedCred] = useState(false);

  const isCompanyCoord =
    currentRole === 'COORDENADOR' && currentCoordinatorUser?.affiliationType === 'EMPRESA';
  const isInstitutionCoord = currentRole === 'COORDENADOR' && !isCompanyCoord;

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
  const [dataAdmissao, setDataAdmissao] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingAluno, setIsSubmittingAluno] = useState(false);

  // Vínculo bidirecional: Instituição <-> Empresa
  const [selectedInstituicaoId, setSelectedInstituicaoId] = useState<string>(
    instituicoes[0]?.id || ''
  );
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>(empresas[0]?.id || '');

  // Cadastro rápido inline de Empresa
  const [showInlineEmpresa, setShowInlineEmpresa] = useState(false);
  const [newEmpRazao, setNewEmpRazao] = useState('');
  const [newEmpCnpj, setNewEmpCnpj] = useState('');
  const [newEmpCidade, setNewEmpCidade] = useState('');
  const [isSavingEmpresa, setIsSavingEmpresa] = useState(false);

  // Cadastro rápido inline de Instituição
  const [showInlineInst, setShowInlineInst] = useState(false);
  const [newInstRazao, setNewInstRazao] = useState('');
  const [newInstCnpj, setNewInstCnpj] = useState('');
  const [newInstCidade, setNewInstCidade] = useState('');
  const [isSavingInst, setIsSavingInst] = useState(false);

  // Campos específicos de Jovem Aprendiz (dados_aprendiz)
  const [numeroCtps, setNumeroCtps] = useState('');
  const [serieCtps, setSerieCtps] = useState('');
  const [cbo, setCbo] = useState('');
  const [cursoAprendizagem, setCursoAprendizagem] = useState('');
  const [numeroContratoAprendizagem, setNumeroContratoAprendizagem] = useState('');

  // Campos específicos de Estagiário (dados_estagiario)
  const [numeroTce, setNumeroTce] = useState('');
  const [apoliceSeguro, setApoliceSeguro] = useState('');
  const [seguradora, setSeguradora] = useState('');
  const [supervisorEmpresa, setSupervisorEmpresa] = useState('');
  const [cursoSuperiorTecnico, setCursoSuperiorTecnico] = useState('');
  const [semestreAtual, setSemestreAtual] = useState('');

  // Aba Turma
  const [codigoTurma, setCodigoTurma] = useState('');
  const [nomeCursoTurma, setNomeCursoTurma] = useState('');
  const [periodoTurma, setPeriodoTurma] = useState('2026.2 • Manhã');
  const [instituicaoTurmaId, setInstituicaoTurmaId] = useState(instituicoes[0]?.id || '');
  const [isSubmittingTurma, setIsSubmittingTurma] = useState(false);

  // Aba Contrato
  const [contratoAlunoId, setContratoAlunoId] = useState<string>('');
  const [contratoNumero, setContratoNumero] = useState<string>('');
  const [contratoInicio, setContratoInicio] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [contratoFim, setContratoFim] = useState<string>('2026-12-15');
  const [contratoBolsa, setContratoBolsa] = useState<string>('1650');
  const [isSubmittingContrato, setIsSubmittingContrato] = useState(false);

  // Sincroniza instituição ou empresa travada conforme perfil do coordenador
  useEffect(() => {
    if (isInstitutionCoord) {
      const matched = instituicoes.find(
        (i) => i.razaoSocial === activeInstitution || i.id === currentCoordinatorUser?.instituicaoId
      );
      if (matched) setSelectedInstituicaoId(matched.id);
    } else if (!selectedInstituicaoId && instituicoes[0]) {
      setSelectedInstituicaoId(instituicoes[0].id);
    }
  }, [isInstitutionCoord, activeInstitution, instituicoes, currentCoordinatorUser, selectedInstituicaoId]);

  useEffect(() => {
    if (isCompanyCoord) {
      const matched = empresas.find(
        (e) =>
          e.id === currentCoordinatorUser?.empresaId ||
          e.razaoSocial === currentCoordinatorUser?.empresa
      );
      if (matched) setSelectedEmpresaId(matched.id);
    } else if (!selectedEmpresaId && empresas[0]) {
      setSelectedEmpresaId(empresas[0].id);
    }
  }, [isCompanyCoord, empresas, currentCoordinatorUser, selectedEmpresaId]);

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

  const handleCreateInlineEmpresa = async () => {
    if (!newEmpRazao.trim() || !newEmpCnpj.trim()) {
      setToastMessage({
        title: 'Dados da empresa incompletos',
        desc: 'Informe Razão Social e CNPJ para cadastrar a empresa.',
        type: 'error',
      });
      return;
    }
    setIsSavingEmpresa(true);
    try {
      const created = await createEmpresaInline({
        razaoSocial: newEmpRazao.trim(),
        cnpj: newEmpCnpj.trim(),
        cidade: newEmpCidade.trim() || undefined,
      });
      setSelectedEmpresaId(created.id);
      setShowInlineEmpresa(false);
      setNewEmpRazao('');
      setNewEmpCnpj('');
      setNewEmpCidade('');
      setToastMessage({
        title: 'Empresa cadastrada',
        desc: `${created.razaoSocial} selecionada para o vínculo.`,
        type: 'success',
      });
    } finally {
      setIsSavingEmpresa(false);
    }
  };

  const handleCreateInlineInstituicao = async () => {
    if (!newInstRazao.trim() || !newInstCnpj.trim()) {
      setToastMessage({
        title: 'Dados da instituição incompletos',
        desc: 'Informe Razão Social e CNPJ para cadastrar a instituição.',
        type: 'error',
      });
      return;
    }
    setIsSavingInst(true);
    try {
      const created = await addNewInstituicao({
        razaoSocial: newInstRazao.trim(),
        cnpj: newInstCnpj.trim(),
        cidade: newInstCidade.trim() || undefined,
      });
      setSelectedInstituicaoId(created.id);
      setShowInlineInst(false);
      setNewInstRazao('');
      setNewInstCnpj('');
      setNewInstCidade('');
      setToastMessage({
        title: 'Instituição cadastrada',
        desc: `${created.razaoSocial} selecionada para o vínculo.`,
        type: 'success',
      });
    } finally {
      setIsSavingInst(false);
    }
  };

  const resolvedInstituicaoObj = instituicoes.find((i) => i.id === selectedInstituicaoId);
  const resolvedEmpresaObj = empresas.find((e) => e.id === selectedEmpresaId);

  const finalInstituicaoNome = isInstitutionCoord
    ? activeInstitution
    : resolvedInstituicaoObj?.razaoSocial || activeInstitution;

  const finalEmpresaNome = isCompanyCoord
    ? currentCoordinatorUser?.empresa || resolvedEmpresaObj?.razaoSocial || ''
    : resolvedEmpresaObj?.razaoSocial || '';

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

    if (!finalInstituicaoNome || !finalEmpresaNome) {
      setToastMessage({
        title: 'Vínculo Obrigatório',
        desc: 'Selecione ou cadastre tanto a Instituição de Ensino quanto a Empresa Concedente.',
        type: 'error',
      });
      return;
    }

    const finalTurmaId =
      turmaSelect === '__CUSTOM_TURMA__' ? `turma-custom-${Date.now()}` : turmaSelect;

    const finalCurso =
      turmaSelect === '__CUSTOM_TURMA__'
        ? customTurma.trim() || 'Curso Técnico'
        : tipoVinculo === 'ESTAGIARIO'
        ? cursoSuperiorTecnico.trim() || curso
        : cursoAprendizagem.trim() || curso;

    const cleanEmail =
      email.trim() || `${nome.toLowerCase().replace(/\s+/g, '.')}@aluno.com.br`;
    const studentPassword = senha.trim() || 'DocFlow@2026';

    const dadosAprendizPayload: DadosAprendiz | undefined =
      tipoVinculo === 'APRENDIZ'
        ? {
            numeroCtps: numeroCtps.trim() || undefined,
            serieCtps: serieCtps.trim() || undefined,
            cbo: cbo.trim() || undefined,
            cursoAprendizagem: cursoAprendizagem.trim() || finalCurso,
            numeroContratoAprendizagem:
              numeroContratoAprendizagem.trim() || `APREND-2026-${matricula.trim()}`,
          }
        : undefined;

    const dadosEstagiarioPayload: DadosEstagiario | undefined =
      tipoVinculo === 'ESTAGIARIO'
        ? {
            numeroTce: numeroTce.trim() || `TCE-2026-${matricula.trim()}`,
            apoliceSeguro: apoliceSeguro.trim() || undefined,
            seguradora: seguradora.trim() || undefined,
            supervisorEmpresa: supervisorEmpresa.trim() || undefined,
            cursoSuperiorTecnico: cursoSuperiorTecnico.trim() || finalCurso,
            semestreAtual: semestreAtual.trim() || undefined,
          }
        : undefined;

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
        tipo_vinculo: tipoVinculo,
        status: 'ATIVO',
        turma_id: isUuid(finalTurmaId) ? finalTurmaId : undefined,
        instituicao_id: isUuid(resolvedInstituicaoObj?.id) ? resolvedInstituicaoObj?.id : undefined,
        empresa_id: isUuid(resolvedEmpresaObj?.id) ? resolvedEmpresaObj?.id : undefined,
        dados_aprendiz:
          tipoVinculo === 'APRENDIZ' && dadosAprendizPayload
            ? {
                numero_ctps: dadosAprendizPayload.numeroCtps,
                serie_ctps: dadosAprendizPayload.serieCtps,
                cbo: dadosAprendizPayload.cbo,
                curso_aprendizagem: dadosAprendizPayload.cursoAprendizagem,
                numero_contrato_aprendizagem: dadosAprendizPayload.numeroContratoAprendizagem,
              }
            : undefined,
        dados_estagiario:
          tipoVinculo === 'ESTAGIARIO' && dadosEstagiarioPayload
            ? {
                numero_tce: dadosEstagiarioPayload.numeroTce,
                apolice_seguro: dadosEstagiarioPayload.apoliceSeguro,
                seguradora: dadosEstagiarioPayload.seguradora,
                supervisor_empresa: dadosEstagiarioPayload.supervisorEmpresa,
                curso_superior_tecnico: dadosEstagiarioPayload.cursoSuperiorTecnico,
                semestre_atual: dadosEstagiarioPayload.semestreAtual,
              }
            : undefined,
      });

      if (novoAluno && novoAluno.id) {
        createdBackendId = novoAluno.id;
        const numeroContrato =
          tipoVinculo === 'APRENDIZ'
            ? dadosAprendizPayload?.numeroContratoAprendizagem || `APREND-2026-${matricula.trim()}`
            : dadosEstagiarioPayload?.numeroTce || `TCE-2026-${matricula.trim()}`;
        contratosApi
          .create({
            aluno_id: novoAluno.id,
            numero_contrato: numeroContrato,
            data_inicio: dataAdmissao || new Date().toISOString().split('T')[0],
            data_fim: '2026-12-15',
            valor_bolsa: 1650.0,
            instituicao_id: isUuid(resolvedInstituicaoObj?.id) ? resolvedInstituicaoObj?.id : undefined,
            empresa_id: isUuid(resolvedEmpresaObj?.id) ? resolvedEmpresaObj?.id : undefined,
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
      empresa: finalEmpresaNome,
      empresaId: resolvedEmpresaObj?.id,
      instituicao: finalInstituicaoNome,
      instituicaoId: resolvedInstituicaoObj?.id,
      dataAdmissao,
      dadosAprendiz: dadosAprendizPayload,
      dadosEstagiario: dadosEstagiarioPayload,
    });

    setToastMessage({
      title:
        tipoVinculo === 'APRENDIZ'
          ? 'Jovem Aprendiz cadastrado'
          : 'Estagiário cadastrado',
      desc: `${nome} vinculado(a) a ${finalInstituicaoNome} e ${finalEmpresaNome}.`,
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

    const instObj = instituicoes.find((i) => i.id === instituicaoTurmaId);
    const assignedInst = isInstitutionCoord
      ? activeInstitution
      : instObj?.razaoSocial || activeInstitution;

    setIsSubmittingTurma(true);
    const newId = `turma-${Date.now()}`;
    addNewTurma({
      id: newId,
      codigo: codigoTurma.trim(),
      nomeCurso: nomeCursoTurma.trim(),
      periodo: periodoTurma,
      instituicao: assignedInst,
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
      {/* 1. Card Banner Superior */}
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

      {/* 3. Grid Equilibrado em 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COLUNA PRINCIPAL */}
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

              <div className="p-6 space-y-6">
                {/* Bloco 1: Dados Pessoais & Turma */}
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
                      <option value="__CUSTOM_TURMA__">+ Informar outra turma / curso</option>
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
                </div>

                {/* Bloco 2: Vínculo Bidirecional (Instituição de Ensino ↔ Empresa Concedente) */}
                <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Vínculo Instituição e Empresa
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Instituição de Ensino */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Instituição de Ensino
                        </label>
                        {!isInstitutionCoord && (
                          <button
                            type="button"
                            onClick={() => setShowInlineInst((v) => !v)}
                            className="text-[11px] font-medium text-[#085078] dark:text-cyan-400 hover:underline cursor-pointer"
                          >
                            {showInlineInst ? 'Fechar' : '+ Nova instituição'}
                          </button>
                        )}
                      </div>

                      {isInstitutionCoord ? (
                        <input
                          type="text"
                          readOnly
                          value={activeInstitution}
                          className="w-full h-10 px-3 text-xs bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-default"
                        />
                      ) : (
                        <select
                          value={selectedInstituicaoId}
                          onChange={(e) => setSelectedInstituicaoId(e.target.value)}
                          className={`${inputClass} cursor-pointer`}
                        >
                          {instituicoes.map((inst) => (
                            <option key={inst.id} value={inst.id}>
                              {inst.razaoSocial}
                              {inst.cidade ? ` (${inst.cidade})` : ''}
                            </option>
                          ))}
                        </select>
                      )}

                      {showInlineInst && !isInstitutionCoord && (
                        <div className="p-3.5 mt-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                          <input
                            type="text"
                            placeholder="Razão Social da Instituição"
                            value={newInstRazao}
                            onChange={(e) => setNewInstRazao(e.target.value)}
                            className={inputClass}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="CNPJ"
                              maxLength={18}
                              value={newInstCnpj}
                              onChange={(e) => setNewInstCnpj(formatCNPJ(e.target.value))}
                              className={`${inputClass} font-mono`}
                            />
                            <input
                              type="text"
                              placeholder="Cidade/UF"
                              value={newInstCidade}
                              onChange={(e) => setNewInstCidade(e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowInlineInst(false)}
                              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              disabled={isSavingInst}
                              onClick={handleCreateInlineInstituicao}
                              className="px-3 py-1.5 text-xs font-medium bg-[#085078] hover:bg-[#063f60] text-white rounded-lg cursor-pointer disabled:opacity-50"
                            >
                              {isSavingInst ? 'Salvando...' : 'Salvar Instituição'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Empresa Concedente */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Empresa Concedente
                        </label>
                        {!isCompanyCoord && (
                          <button
                            type="button"
                            onClick={() => setShowInlineEmpresa((v) => !v)}
                            className="text-[11px] font-medium text-[#085078] dark:text-cyan-400 hover:underline cursor-pointer"
                          >
                            {showInlineEmpresa ? 'Fechar' : '+ Nova empresa'}
                          </button>
                        )}
                      </div>

                      {isCompanyCoord ? (
                        <input
                          type="text"
                          readOnly
                          value={finalEmpresaNome}
                          className="w-full h-10 px-3 text-xs bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-default"
                        />
                      ) : (
                        <select
                          value={selectedEmpresaId}
                          onChange={(e) => setSelectedEmpresaId(e.target.value)}
                          className={`${inputClass} cursor-pointer`}
                        >
                          {empresas.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.razaoSocial}
                              {emp.cidade || emp.cidadeUf ? ` (${emp.cidade || emp.cidadeUf})` : ''}
                            </option>
                          ))}
                        </select>
                      )}

                      {showInlineEmpresa && !isCompanyCoord && (
                        <div className="p-3.5 mt-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                          <input
                            type="text"
                            placeholder="Razão Social da Empresa"
                            value={newEmpRazao}
                            onChange={(e) => setNewEmpRazao(e.target.value)}
                            className={inputClass}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="CNPJ"
                              maxLength={18}
                              value={newEmpCnpj}
                              onChange={(e) => setNewEmpCnpj(formatCNPJ(e.target.value))}
                              className={`${inputClass} font-mono`}
                            />
                            <input
                              type="text"
                              placeholder="Cidade/UF"
                              value={newEmpCidade}
                              onChange={(e) => setNewEmpCidade(e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowInlineEmpresa(false)}
                              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              disabled={isSavingEmpresa}
                              onClick={handleCreateInlineEmpresa}
                              className="px-3 py-1.5 text-xs font-medium bg-[#085078] hover:bg-[#063f60] text-white rounded-lg cursor-pointer disabled:opacity-50"
                            >
                              {isSavingEmpresa ? 'Salvando...' : 'Salvar Empresa'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bloco 3: Seção Dinâmica de Dados Específicos (Aprendiz vs. Estagiário) */}
                <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {tipoVinculo === 'APRENDIZ'
                      ? 'Dados Específicos — Jovem Aprendiz (CTPS)'
                      : 'Dados Específicos — Estágio (TCE & Seguro)'}
                  </h3>

                  {tipoVinculo === 'APRENDIZ' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                          Número da CTPS
                        </label>
                        <input
                          type="text"
                          value={numeroCtps}
                          onChange={(e) => setNumeroCtps(e.target.value)}
                          placeholder="Ex: 1234567"
                          className={`${inputClass} font-mono`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                          Série da CTPS
                        </label>
                        <input
                          type="text"
                          value={serieCtps}
                          onChange={(e) => setSerieCtps(e.target.value)}
                          placeholder="Ex: 0010-SP"
                          className={`${inputClass} font-mono`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                          CBO
                        </label>
                        <input
                          type="text"
                          value={cbo}
                          onChange={(e) => setCbo(e.target.value)}
                          placeholder="Ex: 4110-10"
                          className={`${inputClass} font-mono`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                          Nº Contrato de Aprendizagem
                        </label>
                        <input
                          type="text"
                          value={numeroContratoAprendizagem}
                          onChange={(e) => setNumeroContratoAprendizagem(e.target.value)}
                          placeholder="Ex: APREND-2026-001"
                          className={`${inputClass} font-mono`}
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                          Curso de Aprendizagem
                        </label>
                        <input
                          type="text"
                          value={cursoAprendizagem}
                          onChange={(e) => setCursoAprendizagem(e.target.value)}
                          placeholder="Ex: Aprendizagem em Serviços Administrativos"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                          Número do TCE
                        </label>
                        <input
                          type="text"
                          value={numeroTce}
                          onChange={(e) => setNumeroTce(e.target.value)}
                          placeholder="Ex: TCE-2026-042"
                          className={`${inputClass} font-mono`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                          Apólice de Seguro
                        </label>
                        <input
                          type="text"
                          value={apoliceSeguro}
                          onChange={(e) => setApoliceSeguro(e.target.value)}
                          placeholder="Ex: AP-998812-SP"
                          className={`${inputClass} font-mono`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                          Seguradora
                        </label>
                        <input
                          type="text"
                          value={seguradora}
                          onChange={(e) => setSeguradora(e.target.value)}
                          placeholder="Ex: Porto Seguro"
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                          Supervisor na Empresa
                        </label>
                        <input
                          type="text"
                          value={supervisorEmpresa}
                          onChange={(e) => setSupervisorEmpresa(e.target.value)}
                          placeholder="Nome do supervisor responsável"
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                          Curso Superior / Técnico
                        </label>
                        <input
                          type="text"
                          value={cursoSuperiorTecnico}
                          onChange={(e) => setCursoSuperiorTecnico(e.target.value)}
                          placeholder="Ex: Análise e Desenv. de Sistemas"
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                          Semestre Atual
                        </label>
                        <input
                          type="text"
                          value={semestreAtual}
                          onChange={(e) => setSemestreAtual(e.target.value)}
                          placeholder="Ex: 3º Semestre"
                          className={inputClass}
                        />
                      </div>
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
                    {isInstitutionCoord ? (
                      <input
                        type="text"
                        readOnly
                        value={activeInstitution}
                        className="w-full h-10 px-3 text-xs bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-default"
                      />
                    ) : (
                      <select
                        value={instituicaoTurmaId}
                        onChange={(e) => setInstituicaoTurmaId(e.target.value)}
                        className={`${inputClass} cursor-pointer`}
                      >
                        {instituicoes.map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            {inst.razaoSocial}
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
                          {s.nome} ({s.tipoVinculo === 'APRENDIZ' ? 'Aprendiz' : 'Estagiário'}) —{' '}
                          {s.matricula}
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
                  <span className="text-slate-500 dark:text-slate-400 block">Instituição de Ensino</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    {finalInstituicaoNome || 'A definir'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Empresa Concedente</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    {finalEmpresaNome || 'A definir'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Turma</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {previewTurmaLabel}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">
                    Checklist Obrigatório
                  </span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {tipoVinculo === 'APRENDIZ'
                      ? '5 documentos (inclui Frequência Escolar e Contrato CTPS)'
                      : '6 documentos (inclui TCE e Apólice de Seguro)'}
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
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {s.nome}
                        </p>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                          {s.tipoVinculo === 'APRENDIZ' ? 'Aprendiz' : 'Estagiário'}
                        </span>
                      </div>
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
