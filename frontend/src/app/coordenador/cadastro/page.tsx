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
      instituicao: currentRole === 'COORDENADOR' ? activeInstitution : instituicao,
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
      instituicao: currentRole === 'COORDENADOR' ? activeInstitution : instituicaoTurma,
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

  return (
    <div className="max-w-2xl mx-auto py-2 px-2 sm:px-0 animate-fadeIn space-y-6">
      {/* Page Header Banner */}
      <PageBanner
        title="Cadastro & Admissão"
        subtitle="Cadastramento de novos estudantes aprendizes e abertura de turmas"
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

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
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
      </div>

      {/* Main Form Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        {/* TAB 1: ESTUDANTE */}
        {activeTab === 'ALUNO' && (
          <form onSubmit={handleAlunoSubmit} className="space-y-5">
            {/* Vínculo Switch */}
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
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
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
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 font-mono text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
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
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 font-mono text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
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
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
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
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer"
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
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  Empresa Concedente
                </label>
                <select
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer"
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
                  Instituição Concedente / Ensino
                </label>
                {currentRole === 'COORDENADOR' ? (
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#065373] dark:text-cyan-400 shrink-0" />
                      <span>{activeInstitution}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 font-semibold">
                      Sua Instituição
                    </span>
                  </div>
                ) : (
                  <select
                    value={instituicao}
                    onChange={(e) => setInstituicao(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer"
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

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => router.push('/coordenador/dossies')}
                className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingAluno}
                className="px-7 py-3 text-xs font-extrabold text-white bg-gradient-to-r from-[#0284c7] to-[#00b4d8] hover:from-sky-600 hover:to-sky-500 rounded-2xl shadow-lg shadow-[#0284c7]/25 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
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
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 font-mono text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
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
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                Instituição Concedente / Ensino
              </label>
              {currentRole === 'COORDENADOR' ? (
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#065373] dark:text-cyan-400 shrink-0" />
                    <span>{activeInstitution}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 font-semibold">
                    Sua Instituição
                  </span>
                </div>
              ) : (
                <select
                  value={instituicaoTurma}
                  onChange={(e) => setInstituicaoTurma(e.target.value)}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer"
                >
                  {availableInstitutions.map((inst) => (
                    <option key={inst} value={inst}>
                      {inst}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                Turno / Período
              </label>
              <select
                value={periodoTurma}
                onChange={(e) => setPeriodoTurma(e.target.value)}
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-2xs rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer"
              >
                <option value="2026.2 - Manhã">2026.2 - Manhã</option>
                <option value="2026.2 - Tarde">2026.2 - Tarde</option>
                <option value="2026.2 - Noite">2026.2 - Noite</option>
                <option value="2026.2 - Integral">2026.2 - Integral</option>
              </select>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => router.push('/analytics')}
                className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingTurma}
                className="px-7 py-3 text-xs font-extrabold text-white bg-gradient-to-r from-[#0284c7] to-[#00b4d8] hover:from-sky-600 hover:to-sky-500 rounded-2xl shadow-lg shadow-[#0284c7]/25 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingTurma ? 'Criando...' : 'Cadastrar Turma'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
