'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { contratosApi, ContratoResponse } from '@/lib/api';
import PageBanner from '@/components/layout/PageBanner';
import {
  FileSignature,
  UserCheck,
  RefreshCw,
  CheckCircle2,
  Calendar,
  DollarSign,
  Loader2,
} from 'lucide-react';

function formatDate(dateStr: string): string {
  if (!dateStr) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function isContractExpiringSoon(dataFim: string): boolean {
  const end = new Date(dataFim);
  const now = new Date();
  const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 45;
}

function isContractExpired(dataFim: string): boolean {
  return new Date(dataFim) < new Date();
}

export default function ContratosPage() {
  const { allStudentsList, setToastMessage } = useApp();
  const [contratos, setContratos] = useState<ContratoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [contratoAlunoId, setContratoAlunoId] = useState<string>('');
  const [contratoNumero, setContratoNumero] = useState<string>('');
  const [contratoInicio, setContratoInicio] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [contratoFim, setContratoFim] = useState<string>('2026-12-15');
  const [contratoBolsa, setContratoBolsa] = useState<string>('1650');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadContratos = async () => {
    setIsLoading(true);
    try {
      const data = await contratosApi.list(0, 200);
      setContratos(data);
    } catch {
      setContratos([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadContratos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contratoAlunoId || !contratoNumero.trim() || !contratoInicio || !contratoFim) {
      setToastMessage({
        title: 'Campos obrigatórios',
        desc: 'Selecione o estudante e preencha todos os campos.',
        type: 'error',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const bolsaNum = parseFloat(contratoBolsa.replace(',', '.'));
      const novo = await contratosApi.create({
        aluno_id: contratoAlunoId,
        numero_contrato: contratoNumero.trim(),
        data_inicio: contratoInicio,
        data_fim: contratoFim,
        valor_bolsa: isNaN(bolsaNum) ? undefined : bolsaNum,
      });
      setContratos((prev) => [novo, ...prev]);
      setToastMessage({
        title: 'Contrato registrado',
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
        title: 'Erro ao registrar contrato',
        desc: 'Verifique os dados e tente novamente.',
        type: 'error',
      });
    }
    setIsSubmitting(false);
  };

  const getStudentName = (alunoId: string): string => {
    const s = allStudentsList.find((st) => st.id === alunoId);
    return s ? s.nome : alunoId;
  };

  return (
    <div className="max-w-4xl mx-auto py-2 px-2 sm:px-0 animate-fadeIn space-y-6">
      <PageBanner
        title="Contratos & TCE"
        icon={FileSignature}
        backHref="/coordenador"
        backLabel="Voltar ao Painel"
        badge={{
          label: 'Gestão Contratual',
          icon: FileSignature,
        }}
        action={{
          label: 'Ver Aprendizes',
          href: '/coordenador/dossies',
          icon: UserCheck,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Registrar Novo Contrato / TCE
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Vincule um contrato a um estudante já cadastrado.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                Estudante
              </label>
              <select
                required
                value={contratoAlunoId}
                onChange={(e) => setContratoAlunoId(e.target.value)}
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer"
              >
                <option value="">Selecione o estudante...</option>
                {allStudentsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} — {s.matricula}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                Número do Contrato / TCE
              </label>
              <input
                type="text"
                required
                value={contratoNumero}
                onChange={(e) => setContratoNumero(e.target.value)}
                placeholder="Ex: TCE-2026-042 ou APREND-2026-0199"
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 rounded-xl px-3.5 py-2.5 font-mono text-slate-950 dark:text-white placeholder:text-slate-500 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  Data de Início
                </label>
                <input
                  type="date"
                  required
                  value={contratoInicio}
                  onChange={(e) => setContratoInicio(e.target.value)}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5">
                  Data de Término
                </label>
                <input
                  type="date"
                  required
                  value={contratoFim}
                  onChange={(e) => setContratoFim(e.target.value)}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 rounded-xl px-3.5 py-2.5 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Bolsa-Auxílio (R$)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={contratoBolsa}
                onChange={(e) => setContratoBolsa(e.target.value)}
                placeholder="Ex: 1650.00"
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-300 dark:border-slate-600 hover:border-slate-400 rounded-xl px-3.5 py-2.5 font-mono text-slate-950 dark:text-white placeholder:text-slate-500 font-medium focus:outline-none focus:border-[#065373] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-7 py-3 text-xs font-extrabold text-white bg-gradient-to-r from-[#065373] to-[#0284c7] hover:from-[#05435c] hover:to-sky-600 rounded-2xl shadow-lg shadow-[#065373]/25 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Registrando...
                  </span>
                ) : (
                  'Registrar Contrato / TCE'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Contratos Registrados
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {contratos.length} contrato{contratos.length !== 1 ? 's' : ''} encontrado{contratos.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={loadContratos}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Recarregar contratos"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#065373] dark:text-cyan-400" />
            </div>
          ) : contratos.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500 dark:text-slate-400">
              Nenhum contrato registrado ainda.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {contratos.map((c) => {
                const expired = isContractExpired(c.data_fim);
                const expiring = !expired && isContractExpiringSoon(c.data_fim);
                return (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-2xl border text-xs ${
                      expired
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                        : expiring
                        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold font-mono text-slate-900 dark:text-white truncate">
                          {c.numero_contrato}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 mt-0.5 font-medium truncate">
                          {getStudentName(c.aluno_id)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          expired
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : expiring
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {expired ? 'Expirado' : expiring ? 'Vencendo' : 'Vigente'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {formatDate(c.data_inicio)} — {formatDate(c.data_fim)}
                      </span>
                      {c.valor_bolsa && (
                        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                          <DollarSign className="w-3 h-3 shrink-0" />
                          R$ {c.valor_bolsa}
                        </span>
                      )}
                      {c.ativo && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          Ativo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
