'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TipoVinculo } from '@/lib/types';
import {
  X,
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
} from 'lucide-react';

interface StudentRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (studentId: string) => void;
}

export default function StudentRegisterModal({
  isOpen,
  onClose,
  onSuccess,
}: StudentRegisterModalProps) {
  const { turmas, addNewStudent } = useApp();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [tipoVinculo, setTipoVinculo] = useState<TipoVinculo>('APRENDIZ');
  const [turmaId, setTurmaId] = useState(turmas[0]?.id || '');
  const [curso, setCurso] = useState(turmas[0]?.nomeCurso || '');
  const [empresa, setEmpresa] = useState('');
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
    setIsSubmitting(true);

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

    setIsSubmitting(false);
    onClose();
    if (onSuccess) {
      onSuccess(created.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#065373] to-[#226a8b] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white border border-white/20">
              <UserPlus className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Cadastrar Novo Aluno</h2>
              <p className="text-xs text-cyan-100">
                Adicione um jovem aprendiz ou estagiário para iniciar a guarda documental
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Tipo de Vínculo Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Tipo de Vínculo Contratual *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoVinculo('APRENDIZ')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  tipoVinculo === 'APRENDIZ'
                    ? 'bg-[#065373] text-white border-[#065373] shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Jovem Aprendiz (Lei 10.097)</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoVinculo('ESTAGIARIO')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  tipoVinculo === 'ESTAGIARIO'
                    ? 'bg-[#065373] text-white border-[#065373] shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Estagiário (Lei 11.788)</span>
              </button>
            </div>
          </div>

          {/* Nome e CPF */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none transition-all"
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
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none transition-all"
              />
            </div>
          </div>

          {/* E-mail e Matrícula */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                <span>E-mail Institucional / Corporativo *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aluno@empresa.com.br"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                <span>Número de Matrícula *</span>
              </label>
              <input
                type="text"
                required
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Ex: 2026-DS-0199"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none transition-all"
              />
            </div>
          </div>

          {/* Turma e Data de Admissão */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                <span>Turma Vinculada *</span>
              </label>
              <select
                required
                value={turmaId}
                onChange={(e) => handleTurmaChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none transition-all"
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
                <span>Data de Início / Admissão *</span>
              </label>
              <input
                type="date"
                required
                value={dataAdmissao}
                onChange={(e) => setDataAdmissao(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none transition-all"
              />
            </div>
          </div>

          {/* Empresa Concedente & Instituição de Ensino */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#065373] dark:text-cyan-400" />
                <span>Empresa Concedente (RH)</span>
              </label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Ex: TechCorp Soluções Digitais S.A."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none transition-all"
              />
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
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#065373] dark:focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#065373] to-[#226a8b] hover:from-[#0a6d96] hover:to-[#226a8b] rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-300" />
              <span>{isSubmitting ? 'Cadastrando...' : 'Concluir Cadastro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
