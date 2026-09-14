'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/lib/types';
import confetti from 'canvas-confetti';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  GraduationCap,
  UserCheck,
  Shield,
  Clock,
  KeyRound,
  Calendar,
  Loader2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentRole, setToastMessage } = useApp();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [identifier, setIdentifier] = useState('lucas.gabriel@empresa-tech.com.br');
  const [password, setPassword] = useState('DocFlow@2026');
  const [dataNascimento, setDataNascimento] = useState('2005-05-14');
  const [nome, setNome] = useState('Lucas Gabriel da Silva');
  const [cpf, setCpf] = useState('458.912.308-44');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRolePreset, setSelectedRolePreset] = useState<UserRole>('ESTUDANTE');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Dynamic Password Strength Meter
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passStrength = calculatePasswordStrength(password);
  const strengthLabels = [
    { label: 'Muito Curta', color: 'bg-slate-700 text-slate-400', emoji: '😴' },
    { label: 'Fraca', color: 'bg-rose-500 text-rose-300', emoji: '⚠️' },
    { label: 'Média', color: 'bg-amber-500 text-amber-300', emoji: '🤔' },
    { label: 'Forte', color: 'bg-sky-500 text-sky-300', emoji: '🔥' },
    { label: 'Suprema & Segura', color: 'bg-emerald-400 text-emerald-300', emoji: '🛡️' },
  ];

  // Quick Preset Selector handler (3 Profiles)
  const handleSelectPreset = (role: UserRole) => {
    setSelectedRolePreset(role);
    if (role === 'ESTUDANTE') {
      setIdentifier('lucas.gabriel@empresa-tech.com.br');
      setPassword('DocFlow@2026');
    } else if (role === 'COORDENADOR') {
      setIdentifier('mariana.coordenacao@etec.sp.gov.br');
      setPassword('Coord@DocFlow2026');
    } else if (role === 'SUPERADMIN') {
      setIdentifier('admin@docflow.security');
      setPassword('Admin#DocFlow2026');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication
    await new Promise((resolve) => setTimeout(resolve, 700));

    setCurrentRole(selectedRolePreset);

    // Celebratory confetti
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#065373', '#226a8b', '#3f81a3', '#5b98bb', '#77afd3', '#38bdf8'],
      });
    } catch {
      // ignore
    }

    setToastMessage({
      title: `Bem-vindo ao DocFlow! 🚀`,
      desc: `Sessão autenticada como ${
        selectedRolePreset === 'ESTUDANTE'
          ? 'Aprendiz / Estagiário (Lucas Gabriel)'
          : selectedRolePreset === 'COORDENADOR'
          ? 'Coordenador (Curso / RH Empresa)'
          : 'Super Admin'
      }.`,
      type: 'success',
    });

    setIsLoading(false);

    // Redirect based on role
    if (selectedRolePreset === 'ESTUDANTE') {
      router.push('/estudante');
    } else if (selectedRolePreset === 'COORDENADOR') {
      router.push('/coordenador');
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#043c53] relative overflow-hidden flex items-center justify-center p-4 lg:p-8 font-sans selection:bg-cyan-400 selection:text-slate-900">
      {/* Background Animated Glowing Mesh Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#065373] rounded-full blur-3xl opacity-70 animate-pulse-glow pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-[#226a8b] rounded-full blur-3xl opacity-60 animate-pulse-glow pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#3f81a3]/30 rounded-full blur-2xl pointer-events-none" />

      {/* Subtle Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#77afd3 1px, transparent 1px), radial-gradient(#77afd3 1px, #043c53 1px)',
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: Brand Story & Clear Value Proposition */}
        <div className="lg:col-span-6 space-y-6 text-white text-center lg:text-left">
          {/* Logo Brand presentation */}
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

          {/* High Energy Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Sua carreira sem{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-[#77afd3] to-white">
                burocracia documental.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-cyan-100/80 max-w-lg leading-relaxed mx-auto lg:mx-0">
              Envie seus comprovantes, RG e TCE direto do seu celular ou computador com confirmação
              imediata, sem risco de perder o estágio e com total proteção dos seus dados.
            </p>
          </div>

          {/* Floating Interactive Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {/* Card 1: Simplified Language */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] group text-left animate-float-slow">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-cyan-300" />
              </div>
              <h4 className="font-bold text-sm text-white">Upload Rápido & Fácil</h4>
              <p className="text-xs text-cyan-100/70 mt-1 leading-snug">
                Envie fotos ou PDFs dos seus documentos em instantes. Tudo rápido, aprovado na hora e sem complicação.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] group text-left animate-float-reverse">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <h4 className="font-bold text-sm text-white">Privacidade & Segurança</h4>
              <p className="text-xs text-cyan-100/70 mt-1 leading-snug">
                Seus dados pessoais sensíveis ficam protegidos e com visualização restrita para sua segurança.
              </p>
            </div>

            {/* Card 3 */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-[#226a8b]/60 to-[#065373]/60 backdrop-blur-md border border-white/15 flex items-center gap-3.5 text-left">
              <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-white">Avisos de Renovação Semestral</p>
                <p className="text-[11px] text-cyan-100/80">
                  O sistema avisa com antecedência quando chegar a hora de renovar o comprovante da faculdade ou curso técnico.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Login / Signup Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="relative rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/20 shadow-2xl p-6 sm:p-8 text-white overflow-hidden">
            {/* Top Glowing Laser Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-[#77afd3] to-[#226a8b]" />

            {/* Header Persona Presets (3 Profiles) */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                <span>Selecione seu Perfil de Acesso:</span>
              </div>

              {/* 3 Persona Pills */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    role: 'ESTUDANTE' as UserRole,
                    label: 'Aprendiz / Estagiário',
                    icon: GraduationCap,
                    color: 'text-cyan-300',
                  },
                  {
                    role: 'COORDENADOR' as UserRole,
                    label: 'Coordenador',
                    sub: 'Curso / RH',
                    icon: UserCheck,
                    color: 'text-purple-300',
                  },
                  {
                    role: 'SUPERADMIN' as UserRole,
                    label: 'Super Admin',
                    icon: Shield,
                    color: 'text-emerald-300',
                  },
                ].map((item) => {
                  const isSelected = selectedRolePreset === item.role;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleSelectPreset(item.role)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border text-center ${
                        isSelected
                          ? 'bg-[#065373] text-white border-cyan-400 shadow-lg shadow-cyan-950/50 scale-[1.03]'
                          : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-[10.5px] leading-tight font-semibold">{item.label}</span>
                      {item.sub && (
                        <span className="text-[9px] text-slate-400 font-normal leading-none">{item.sub}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Switcher: Login vs Primeiro Acesso */}
            <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('LOGIN')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'LOGIN'
                    ? 'bg-[#065373] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Entrar na Conta
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SIGNUP')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'SIGNUP'
                    ? 'bg-[#065373] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Primeiro Acesso ✨
              </button>
            </div>

            {/* Main Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {activeTab === 'SIGNUP' && (
                <>
                  {/* Nome Completo */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Nome Completo</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Lucas Gabriel da Silva"
                      className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 transition-all font-sans outline-none"
                    />
                  </div>

                  {/* CPF & Data de Nascimento */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">CPF</label>
                      <input
                        type="text"
                        required
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 font-mono outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        <span>Data de Nascimento</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 font-sans outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email / Identificador */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>E-mail</span>
                  </span>
                </label>
                <input
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 transition-all font-sans outline-none"
                />
              </div>

              {/* Password with Strength & Animated Eye */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Senha</span>
                  </label>
                  {activeTab === 'LOGIN' && (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setToastMessage({
                          title: 'Link de Recuperação Enviado',
                          desc: `Instruções enviadas para ${identifier}.`,
                          type: 'info',
                        });
                      }}
                      className="text-[11px] text-cyan-300 hover:text-cyan-200 transition-colors"
                    >
                      Esqueceu a senha?
                    </a>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 transition-all font-mono outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors p-1"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Live Password Strength Meter */}
                {password.length > 0 && (
                  <div className="pt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Força da Senha:</span>
                      <span className="font-bold flex items-center gap-1">
                        <span>{strengthLabels[passStrength].emoji}</span>
                        <span className={strengthLabels[passStrength].color.split(' ')[1]}>
                          {strengthLabels[passStrength].label}
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-0.5">
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
                              : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-[#065373] focus:ring-cyan-400 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Lembrar meu dispositivo</span>
                </label>
              </div>

              {/* Submit Button with Laser Shine */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#065373] via-[#226a8b] to-[#3f81a3] hover:from-[#0a6d96] hover:to-[#226a8b] text-white py-3 px-4 font-bold text-xs shadow-lg shadow-[#065373]/50 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <div className="absolute top-0 bottom-0 w-24 bg-white/20 skew-x-12 animate-shine pointer-events-none" />

                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>Entrando no DocFlow...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {activeTab === 'LOGIN' ? 'Acessar Meu Dossiê Seguro' : 'Criar Minha Conta no DocFlow'}
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-cyan-300" />
                  </>
                )}
              </button>
            </form>

            {/* Micro footer guarantee */}
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
