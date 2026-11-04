'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/lib/types';
import {
  authApi,
  setAuthToken,
  setTenantId,
  alunosApi,
  documentosApi,
  contratosApi,
  ApiError,
} from '@/lib/api';
import { mapAlunoResponseToStudent } from '@/context/AppContext';
import confetti from 'canvas-confetti';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const {
    setCurrentRole,
    setToastMessage,
    setStudentDirect,
    loginUser,
    setSystemUsers,
    setActiveCoordinatorUserId,
    setActiveInstitution,
  } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    const emailClean = identifier.trim();
    let hasError = false;

    if (!emailClean) {
      setEmailError('Informe seu e-mail institucional.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Informe sua senha de acesso.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('A senha deve conter no mínimo 6 caracteres.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await authApi.login(emailClean, password);
      setAuthToken(data.access_token);
      if (data.user?.tenant_id) {
        setTenantId(data.user.tenant_id);
      }

      let role: UserRole = 'ESTUDANTE';
      if (data.user?.perfil === 'ADMIN' || data.user?.perfil === 'SUPERADMIN') {
        role = 'SUPERADMIN';
      } else if (data.user?.perfil === 'COORDENADOR' || data.user?.perfil === 'RH') {
        role = 'COORDENADOR';
      } else if (data.user?.perfil === 'ESTUDANTE') {
        role = 'ESTUDANTE';
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('docflow_current_user', JSON.stringify(data.user));
        localStorage.setItem('docflow_user_role', role);
      }

      setCurrentRole(role);
      const localSync = loginUser(emailClean);

      if (role === 'COORDENADOR' && data.user?.id) {
        const coordUser = {
          id: data.user.id,
          nome: data.user.nome,
          email: data.user.email,
          role: 'COORDENADOR' as UserRole,
          cargo: 'Coordenador Pedagógico',
          status: 'ATIVO' as const,
          ultimoAcesso: 'Agora',
          instituicao: 'ETEC Politécnica de São Paulo',
        };
        setSystemUsers((prev) => {
          const exists = prev.some(
            (u) => u.id === coordUser.id || u.email.toLowerCase() === coordUser.email.toLowerCase()
          );
          return exists
            ? prev.map((u) => (u.id === coordUser.id ? { ...u, ...coordUser } : u))
            : [...prev, coordUser];
        });
        setActiveCoordinatorUserId(data.user.id);
        setActiveInstitution('ETEC Politécnica de São Paulo');
        if (typeof window !== 'undefined') {
          localStorage.setItem('docflow_active_coord_id', data.user.id);
          localStorage.setItem('docflow_active_institution', 'ETEC Politécnica de São Paulo');
        }
      }

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#085078', '#063c5a', '#38bdf8', '#0284c7'],
        });
      } catch {}

      setToastMessage({
        title: 'Bem-vindo ao DocFlow! 🚀',
        desc: `Autenticado com sucesso como ${data.user?.nome || localSync.user?.nome || 'Usuário'}.`,
        type: 'success',
      });

      if (role === 'ESTUDANTE') {
        try {
          const [alunos, docs, contratos] = await Promise.all([
            alunosApi.list().catch(() => []),
            documentosApi.listAll().catch(() => []),
            contratosApi.list().catch(() => []),
          ]);
          const matched = alunos.find(
            (a) => a.email.toLowerCase() === emailClean.toLowerCase()
          );
          if (matched) {
            const mapped = mapAlunoResponseToStudent(matched, docs, contratos);
            setStudentDirect(mapped);
          }
        } catch {}
        router.push('/estudante');
      } else if (role === 'COORDENADOR') {
        router.push('/coordenador');
      } else {
        router.push('/admin');
      }
    } catch (err) {
      if (err instanceof ApiError && err.status !== 500 && err.status !== 502 && err.status !== 503) {
        const errorMsg = err.message || 'E-mail ou senha incorretos.';
        setGeneralError(errorMsg);
        setEmailError('Verifique o e-mail digitado');
        setPasswordError('Verifique a senha digitada');
        setToastMessage({
          title: 'Falha na Autenticação',
          desc: errorMsg,
          type: 'error',
        });
        setIsLoading(false);
        return;
      }

      const loginResult = loginUser(emailClean);

      if (!loginResult || !loginResult.user) {
        const msg = 'E-mail ou senha não encontrados no sistema.';
        setGeneralError(msg);
        setEmailError('Credencial não localizada');
        setPasswordError('Senha incorreta');
        setToastMessage({
          title: 'Falha na Autenticação',
          desc: msg,
          type: 'error',
        });
        setIsLoading(false);
        return;
      }

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#085078', '#063c5a', '#38bdf8', '#0284c7'],
        });
      } catch {}

      setToastMessage({
        title: 'Bem-vindo ao DocFlow! 🚀',
        desc: `Autenticação realizada com sucesso${
          loginResult.user?.nome ? ` como ${loginResult.user.nome}` : ''
        }.`,
        type: 'success',
      });

      router.push(loginResult.route);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 p-0 m-0 font-sans selection:bg-[#085078] selection:text-white">
      {/* LADO ESQUERDO: Apresentação Institucional em Tela Cheia (lg:col-span-7) */}
      <div className="lg:col-span-7 bg-[#085078] p-8 sm:p-12 lg:p-16 xl:p-20 flex flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* Topo: Logótipo Oficial DocFlow */}
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

        {/* Meio: Título principal sólido e frase descritiva */}
        <div className="relative z-10 my-auto py-12 max-w-xl space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Sua central segura de documentos e comprovantes.
          </h1>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed font-normal">
            Envie termos e comprovantes para validação e mantenha seus arquivos organizados para consultar sempre que precisar.
          </p>
        </div>
      </div>

      {/* LADO DIREITO: Formulário de Alto Contraste e Legibilidade (lg:col-span-5) */}
      <div className="lg:col-span-5 bg-[#070c18] p-8 sm:p-12 lg:p-16 flex flex-col justify-center items-center">
        <div className="max-w-md w-full space-y-7">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Entrar na sua conta
            </h2>
            <p className="text-slate-400 text-sm">
              Insira suas credenciais institucionais para continuar.
            </p>
          </div>

          {generalError && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{generalError}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            {/* Campo E-mail */}
            <div>
              <label className="block text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider mb-2">
                E-mail institucional
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
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

            {/* Campo Senha */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider">
                  Senha
                </label>
                <Link
                  href="/esqueceu-senha"
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                    if (generalError) setGeneralError('');
                  }}
                  placeholder="••••••••••••"
                  className={`w-full px-4 py-3.5 bg-[#1e293b] border ${
                    passwordError ? 'border-rose-500 focus:ring-rose-500' : 'border-[#334155] focus:ring-[#085078]'
                  } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-rose-400 font-medium flex items-center gap-1.5 pt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-[#1e293b] text-[#085078] focus:ring-[#085078] w-4 h-4 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-slate-300 cursor-pointer select-none">
                Manter conectado neste navegador
              </label>
            </div>

            {/* Botão Entrar na Plataforma */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#085078] hover:bg-[#063c5a] active:scale-[0.99] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#085078]/25 transition-all text-sm sm:text-base flex items-center justify-center gap-2 mt-3 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Entrando na Plataforma...</span>
                </>
              ) : (
                <>
                  <span>Entrar na Plataforma</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
