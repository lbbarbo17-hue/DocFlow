'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TipoVinculo } from '@/lib/types';
import {
  X,
  UserPlus,
  Check,
} from 'lucide-react';

interface StudentRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (studentId: string) => void;
}

const formatCPF = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export default function StudentRegisterModal({
  isOpen,
  onClose,
  onSuccess,
}: StudentRegisterModalProps) {
  const { turmas, empresas, addNewStudent, setToastMessage } = useApp();

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTurmaChange = (newTurmaId: string) => {
    setTurmaId(newTurmaId);
    const selected = turmas.find((t) => t.id === newTurmaId);
    if (selected) {
      setCurso(selected.nomeCurso);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cpf.trim() || !matricula.trim()) {
      setToastMessage({
        title: 'Campos obrigatórios',
        desc: 'Preencha Nome, CPF e Matrícula.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
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
      title: 'Estudante cadastrado',
      desc: nome,
      type: 'success',
    });

    setIsSubmitting(false);
    onClose();
    if (onSuccess) {
      onSuccess(created.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-slate-400 dark:border dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-slate-400 dark:border-b dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#065373] dark:text-cyan-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Cadastrar Estudante
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Modalidade */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl border-2 border-slate-400 dark:border dark:border-slate-800">
            <button
              type="button"
              onClick={() => setTipoVinculo('APRENDIZ')}
              className={`py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
              className={`py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tipoVinculo === 'ESTAGIARIO'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs border border-slate-300 dark:border-slate-700'
                  : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              {tipoVinculo === 'ESTAGIARIO' && <Check className="w-3 h-3 text-[#065373] dark:text-cyan-400" />}
              <span>Estágio (TCE)</span>
            </button>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do estudante"
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                CPF
              </label>
              <input
                type="text"
                required
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2 font-mono text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                Matrícula
              </label>
              <input
                type="text"
                required
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Ex: 2026-DS-0199"
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2 font-mono text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                Turma
              </label>
              <select
                required
                value={turmaId}
                onChange={(e) => handleTurmaChange(e.target.value)}
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer"
              >
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.codigo} — {t.nomeCurso}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                Data de Início
              </label>
              <input
                type="date"
                value={dataAdmissao}
                onChange={(e) => setDataAdmissao(e.target.value)}
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                Empresa Concedente
              </label>
              <select
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer"
              >
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.razaoSocial}>
                    {emp.razaoSocial}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                Instituição de Ensino
              </label>
              <input
                type="text"
                value={instituicao}
                onChange={(e) => setInstituicao(e.target.value)}
                placeholder="ETEC Politécnica de São Paulo"
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-400 dark:border dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t-2 border-slate-400 dark:border-t dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 font-bold text-white bg-[#065373] hover:bg-[#0a6d96] dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar Estudante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
