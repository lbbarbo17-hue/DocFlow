'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { authApi } from '@/lib/api';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function EsqueceuSenhaPage() {
  const { setToastMessage, logout } = useApp();

  useEffect(() => {
    logout();
  }, [logout]);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setGeneralError('');

    const emailClean = email.trim();

    if (!emailClean) {
      setEmailError('Informe seu e-mail institucional ou CPF.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.forgotPassword(emailClean).catch(() => ({ message: 'ok' }));
      setIsSubmitted(true);
      setToastMessage({
        title: 'Instruções Enviadas',
        desc: `Verifique sua caixa de entrada no endereço ${emailClean}.`,
        type: 'success',
      });
    } catch {
      setIsSubmitted(true);
      setToastMessage({
        title: 'Instruções Enviadas',
        desc: 'Se o e-mail estiver cadastrado, as instruções serão encaminhadas.',
        type: 'info',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 p-0 m-0 font-sans selection:bg-[#085078] selection:text-white">
      {/* LADO ESQUERDO: Apresentação Institucional em Tela Cheia (lg:col-span-7) */}
      <div className="lg:col-span-7 bg-[#085078] p-8 sm:p-12 lg:p-16 xl:p-20 flex flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* Topo: Logótipo Oficial DocFlow com bom respiro */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">DocFlow</span>
          </div>
        </div>

        {/* Meio: Título principal sólido e subtítulo direto */}
        <div className="relative z-10 my-auto py-12 max-w-xl space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Recuperação de acesso à plataforma.
          </h1>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed font-normal">
            Mantenha sua conta segura. Enviaremos um link de redefinição para que você volte a gerenciar seus documentos sem complicação.
          </p>
        </div>
      </div>

      {/* LADO DIREITO: Formulário de Recuperação de Alto Contraste (lg:col-span-5) */}
      <div className="lg:col-span-5 bg-[#070c18] p-8 sm:p-12 lg:p-16 flex flex-col justify-center items-center">
        <div className="max-w-md w-full space-y-7">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Recuperar senha
            </h2>
            <p className="text-slate-400 text-sm">
              Informe seu e-mail cadastrado para receber as instruções de redefinição.
            </p>
          </div>

          {generalError && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{generalError}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white text-base">E-mail de recuperação enviado!</p>
                  <p className="text-emerald-200/90 leading-relaxed text-xs sm:text-sm">
                    Se o e-mail <span className="font-semibold text-white">{email}</span> estiver
                    cadastrado, enviamos um link para você redefinir sua senha. Verifique também sua
                    caixa de spam.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-white font-semibold text-sm border border-[#334155] transition-all cursor-pointer"
                >
                  Informar outro e-mail
                </button>

                <Link
                  href="/login"
                  className="w-full bg-[#085078] hover:bg-[#063c5a] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#085078]/25 transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer block text-center"
                >
                  <span>Ir para a Página de Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Campo E-mail / CPF */}
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider mb-2">
                  E-MAIL INSTITUCIONAL OU CPF
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                      if (generalError) setGeneralError('');
                    }}
                    placeholder="seu.email@exemplo.com"
                    className={`w-full px-4 py-3.5 bg-[#1e293b] border ${
                      emailError ? 'border-rose-500 focus:ring-rose-500' : 'border-[#334155] focus:ring-[#085078]'
                    } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  />
                  <span className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </span>
                </div>
                {emailError && (
                  <p className="text-xs text-rose-400 font-medium flex items-center gap-1.5 pt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Botão Enviar Link de Recuperação */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#085078] hover:bg-[#063c5a] active:scale-[0.99] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#085078]/25 transition-all text-sm sm:text-base flex items-center justify-center gap-2 mt-3 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Enviando link...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Link de Recuperação</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>

              {/* Link de Retorno */}
              <div className="pt-4 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-400 hover:text-sky-300 hover:underline transition-colors"
                >
                  <span>← Voltar para o Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
