'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { authApi } from '@/lib/api';
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Building2,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function EsqueceuSenhaPage() {
  const { setToastMessage } = useApp();

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
      setEmailError('Informe seu e-mail cadastrado.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      setEmailError('Digite um formato de e-mail válido.');
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
        desc: `Se o e-mail estiver cadastrado, as instruções serão encaminhadas.`,
        type: 'info',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#043c53] relative overflow-hidden flex items-center justify-center p-4 lg:p-8 font-sans selection:bg-cyan-400 selection:text-slate-900">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#065373] rounded-full blur-3xl opacity-70 animate-pulse-glow pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-[#226a8b] rounded-full blur-3xl opacity-60 animate-pulse-glow pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#3f81a3]/30 rounded-full blur-2xl pointer-events-none" />

      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#77afd3 1px, transparent 1px), radial-gradient(#77afd3 1px, #043c53 1px)',
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center py-6 sm:py-0">
        <div className="order-2 lg:order-1 lg:col-span-6 space-y-4 sm:space-y-6 text-white text-center lg:text-left">
          <div className="inline-flex items-center gap-3.5 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <div className="w-11 h-11 relative rounded-xl overflow-hidden bg-white flex items-center justify-center p-1 shadow-md">
              <Image
                src="/logo.png"
                alt="DocFlow Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-lg tracking-tight text-white block leading-tight">
                DocFlow
              </span>
              <span className="text-xs text-cyan-200">Guarda & Gestão de Documentos</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Recuperação segura{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-[#77afd3] to-white">
                de acesso à conta.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-cyan-100/80 max-w-lg leading-relaxed mx-auto lg:mx-0">
              Esqueceu sua senha de acesso? Não se preocupe. Digite o e-mail cadastrado e
              enviaremos as orientações para redefinir sua credencial com segurança e agilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] group text-left animate-float-slow">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-cyan-300" />
              </div>
              <h4 className="font-bold text-sm text-white">Envio Instantâneo</h4>
              <p className="text-xs text-cyan-100/70 mt-1 leading-snug">
                Receba o link de redefinição diretamente na sua caixa de entrada em poucos segundos.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] group text-left animate-float-reverse">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <h4 className="font-bold text-sm text-white">Proteção & LGPD</h4>
              <p className="text-xs text-cyan-100/70 mt-1 leading-snug">
                A redefinição é individual e criptografada, mantendo os dados da sua instituição protegidos.
              </p>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-[#226a8b]/60 to-[#065373]/60 backdrop-blur-md border border-white/15 flex items-center gap-3.5 text-left">
              <div className="p-2.5 rounded-xl bg-cyan-400/20 text-cyan-300 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-white">Suporte Institucional</p>
                <p className="text-[11px] text-cyan-100/80">
                  Caso não tenha mais acesso ao e-mail, solicite o reenvio diretamente ao seu coordenador pedagógico.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-6 w-full max-w-md mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/20 shadow-2xl p-5 sm:p-8 text-white overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-[#77afd3] to-[#226a8b]" />

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 transition-colors mb-4 group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Voltar para o Login</span>
            </Link>

            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">Recuperar Senha</h3>
              <p className="text-xs text-slate-400">
                Informe o seu e-mail para receber as instruções de recuperação.
              </p>
            </div>

            {isSubmitted ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-white text-sm">E-mail de recuperação enviado!</p>
                    <p className="text-emerald-200/80 leading-relaxed">
                      Se o e-mail <span className="font-semibold text-white">{email}</span> estiver
                      cadastrado, enviamos um link para você redefinir sua senha. Verifique também a
                      pasta de spam.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                  >
                    Informar outro e-mail
                  </button>

                  <Link
                    href="/login"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#065373] via-[#226a8b] to-[#3f81a3] hover:from-[#0a6d96] hover:to-[#226a8b] text-white font-bold text-xs shadow-lg shadow-[#065373]/50 transition-all flex items-center justify-center gap-2 cursor-pointer block text-center"
                  >
                    <span>Ir para a Página de Login</span>
                    <ArrowRight className="w-4 h-4 text-cyan-300 inline" />
                  </Link>
                </div>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="space-y-4">
                {generalError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{generalError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>E-mail cadastrado</span>
                    </span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                      if (generalError) setGeneralError('');
                    }}
                    placeholder="seu.email@exemplo.com"
                    className={`w-full bg-slate-950/90 border ${
                      emailError
                        ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400/40'
                        : 'border-slate-700 focus:border-cyan-400 focus:ring-cyan-400'
                    } focus:ring-1 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 transition-all font-sans outline-none`}
                  />
                  {emailError && (
                    <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1.5 pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#065373] via-[#226a8b] to-[#3f81a3] hover:from-[#0a6d96] hover:to-[#226a8b] text-white py-3 px-4 font-bold text-xs shadow-lg shadow-[#065373]/50 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
                >
                  <div className="absolute top-0 bottom-0 w-24 bg-white/20 skew-x-12 animate-shine pointer-events-none" />

                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                      <span>Enviando link...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Link de Recuperação</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-cyan-300" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-cyan-400" />
              <span>Ambiente Seguro • Guarda Digital com Conformidade</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
