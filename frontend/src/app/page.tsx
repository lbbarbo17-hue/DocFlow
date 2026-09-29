'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  CloudUpload,
  ShieldCheck,
  Sun,
  Moon,
  ArrowRight,
  ArrowDown,
  Menu,
  X,
  UploadCloud,
  Bell,
  CheckCircle2,
  Building2,
  GraduationCap,
  Check,
  FileCheck,
  Camera,
} from 'lucide-react';

export default function HomePage() {
  const { theme, toggleTheme } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09131a] text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
      {/* CABEÇALHO / NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#09131a]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1c3547] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo da Marca */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#00b4d8] flex items-center justify-center text-white shadow-lg shadow-[#0284c7]/25 group-hover:scale-105 transition-transform shrink-0">
              <CloudUpload className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white block leading-none">
                DocFlow
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                Guarda & Gestão de Documentos
              </span>
            </div>
          </Link>

          {/* Menu de Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#recursos" className="hover:text-[#00b4d8] transition-colors">
              Recursos
            </a>
            <a href="#como-funciona" className="hover:text-[#00b4d8] transition-colors">
              Como Funciona
            </a>
            <a href="#beneficios" className="hover:text-[#00b4d8] transition-colors">
              Vantagens
            </a>
          </nav>

          {/* Ações do Cabeçalho */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Alternador de Tema */}
            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Alternar Tema"
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-[#122634] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1c3547] hover:border-[#00b4d8] transition-all cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Botão Entrar na Plataforma (visível em todas as telas) */}
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white bg-[#0284c7] hover:bg-sky-600 rounded-xl transition-all shadow-md active:scale-95"
            >
              <span>Entrar</span>
              <ArrowRight className="w-3.5 h-3.5 hidden xs:inline" />
            </Link>

            {/* Botão Hambúrguer Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              aria-label="Abrir Menu"
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-[#122634] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1c3547] hover:border-[#00b4d8] transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Menu Dropdown Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-[#1c3547] bg-white dark:bg-[#09131a] px-4 py-3 space-y-2 transition-all shadow-lg animate-fadeIn">
            <a
              href="#recursos"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#122634] transition-colors"
            >
              Recursos
            </a>
            <a
              href="#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#122634] transition-colors"
            >
              Como Funciona
            </a>
            <a
              href="#beneficios"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#122634] transition-colors"
            >
              Vantagens
            </a>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#0284c7] to-[#00b4d8] text-white text-xs font-bold rounded-xl shadow-md"
              >
                <span>Acessar Plataforma</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-8 sm:pt-12 pb-12 sm:pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
        {/* Glow Background Effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(2, 132, 199, 0.25) 0%, rgba(9, 19, 26, 0) 70%)',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-[#00b4d8] text-[11px] sm:text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Gestão Documental de Estagiários e Aprendizes</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight max-w-4xl mx-auto">
            Sua gestão de documentos{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-[#00b4d8] to-sky-400">
              100% digital e sem burocracia
            </span>
            .
          </h1>

          <p className="text-xs sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Envie e gerencie comprovantes, RG e contratos diretamente pelo computador ou celular com validação e alertas automáticos de renovação.
          </p>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-[#0284c7] to-[#00b4d8] hover:from-sky-600 hover:to-sky-500 rounded-xl transition-all shadow-lg shadow-[#0284c7]/25 flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Entrar na Plataforma</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#como-funciona"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-white bg-white dark:bg-[#122634] border border-slate-200 dark:border-[#1c3547] hover:border-[#00b4d8] rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Ver Como Funciona</span>
              <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
          </div>

          {/* Métricas / Diferenciais Limpos */}
          <div className="pt-6 sm:pt-8 grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto border-t border-slate-200 dark:border-[#1c3547]/80 text-center">
            <div className="p-1 sm:p-0">
              <span className="block text-base sm:text-xl font-black text-slate-900 dark:text-white">
                100%
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                Digital
              </span>
            </div>
            <div className="p-1 sm:p-0">
              <span className="block text-base sm:text-xl font-black text-[#00b4d8]">
                Sem Papéis
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                PDFs e Fotos
              </span>
            </div>
            <div className="p-1 sm:p-0">
              <span className="block text-base sm:text-xl font-black text-emerald-500">
                Alertas
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                De Vencimento
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS DA PLATAFORMA */}
      <section
        id="recursos"
        className="py-12 sm:py-16 bg-white dark:bg-[#0e1e28] border-y border-slate-200 dark:border-[#1c3547] transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12 space-y-2">
            <span className="text-xs font-bold text-[#00b4d8] uppercase tracking-wider">
              Recursos
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Tudo o que você precisa para manter a conformidade
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Recurso 1 */}
            <div className="bg-slate-50 dark:bg-[#122634] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#1c3547] hover:border-[#00b4d8]/50 transition-all hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-[#00b4d8] flex items-center justify-center mb-4">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Upload Rápido
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Envio de comprovantes por foto da câmera do celular ou arquivo em PDF/PNG até 10 MB.
              </p>
            </div>

            {/* Recurso 2 */}
            <div className="bg-slate-50 dark:bg-[#122634] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#1c3547] hover:border-amber-500/50 transition-all hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Avisos de Vencimento
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Notificações e contagem regressiva para renovação semestral de matrículas e contratos.
              </p>
            </div>

            {/* Recurso 3 */}
            <div className="bg-slate-50 dark:bg-[#122634] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#1c3547] hover:border-emerald-500/50 transition-all hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Checklist Inteligente
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Acompanhe o status instantâneo dos itens aprovados, pendentes e em análise.
              </p>
            </div>

            {/* Recurso 4 */}
            <div className="bg-slate-50 dark:bg-[#122634] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#1c3547] hover:border-[#00b4d8]/50 transition-all hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-[#00b4d8] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Custódia Protegida
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Segurança no armazenamento com restrição de acesso e privacidade garantida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PASSO A PASSO ORGANIZADO */}
      <section
        id="como-funciona"
        className="py-12 sm:py-16 bg-slate-50 dark:bg-[#09131a] transition-colors duration-300"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14 space-y-2">
            <span className="text-xs font-bold text-[#00b4d8] uppercase tracking-wider">
              Fluxo Simplificado
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Como funciona na prática
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Processo estruturado em 3 etapas diretas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {/* Passo 1 */}
            <div className="bg-white dark:bg-[#0e1e28] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#1c3547] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#0284c7] text-white font-black text-sm flex items-center justify-center">
                  1
                </span>
                <Bell className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                1. Notificação & Pendência
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                O estudante consulta os documentos que precisam ser enviados ou renovados diretamente no painel.
              </p>
            </div>

            {/* Passo 2 */}
            <div className="bg-white dark:bg-[#0e1e28] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#1c3547] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#00b4d8] text-white font-black text-sm flex items-center justify-center">
                  2
                </span>
                <Camera className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                2. Envio Rápido
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tire uma foto com a câmera do celular ou selecione o arquivo em PDF direto das suas pastas.
              </p>
            </div>

            {/* Passo 3 */}
            <div className="bg-white dark:bg-[#0e1e28] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#1c3547] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-black text-sm flex items-center justify-center">
                  3
                </span>
                <FileCheck className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                3. Validação Concluída
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                A equipe valida os anexos e o status de conformidade atualiza instantaneamente para regular.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VANTAGENS */}
      <section
        id="beneficios"
        className="py-12 sm:py-16 bg-white dark:bg-[#0e1e28] border-t border-slate-200 dark:border-[#1c3547] transition-colors duration-300"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12 space-y-2">
            <span className="text-xs font-bold text-[#00b4d8] uppercase tracking-wider">
              Vantagens
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Eficiência para quem gerencia, facilidade para quem envia
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
            {/* Para RH */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#122634] border border-slate-200 dark:border-[#1c3547] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Para RH e Gestores
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Elimina a cobrança manual por e-mails ou planilhas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Mantém contratos de estágio e aprendizagem em dia.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Gera registros organizados para consultas e auditorias.</span>
                </li>
              </ul>
            </div>

            {/* Para Estagiários */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#122634] border border-slate-200 dark:border-[#1c3547] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Para Estagiários e Aprendizes
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Envio simples diretamente do celular.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Alertas prévios para não perder prazos de renovação.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Confirmação imediata do recebimento do documento.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* BANNER FINAL COM O BOTÃO PRINCIPAL DE ACESSO */}
      <section id="acessar-app" className="py-12 sm:py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-[#0e1e28] via-[#122634] to-[#0e1e28] border border-[#1c3547] rounded-3xl p-6 sm:p-12 text-white shadow-2xl relative text-center space-y-4 sm:space-y-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#0284c7] to-[#00b4d8] flex items-center justify-center mx-auto text-white shadow-lg shadow-[#0284c7]/30">
              <CloudUpload className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Pronto para acessar o DocFlow?
            </h2>

            <p className="text-slate-300 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
              Clique no botão abaixo para entrar no ambiente da plataforma e gerenciar seus documentos com facilidade e segurança.
            </p>

            <div className="pt-2 flex justify-center">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-[#0284c7] to-[#00b4d8] hover:from-sky-600 hover:to-sky-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-[#0284c7]/30 transition-all hover:scale-105 flex items-center justify-center gap-3 active:scale-95"
              >
                <span>Entrar na Plataforma</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>

            <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1 sm:pt-2">
              Ambiente Seguro • Custódia Digital com Conformidade
            </p>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="bg-slate-900 dark:bg-[#071822] text-slate-400 text-xs py-8 border-t border-slate-800 dark:border-[#1c3547]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0284c7] to-[#00b4d8] flex items-center justify-center text-white font-bold">
              <CloudUpload className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white">DocFlow</span>
          </div>

          <p className="text-[11px] text-slate-500">
            © 2026 DocFlow — Guarda & Gestão de Documentos. Todos os direitos reservados.
          </p>

          <Link
            href="/login"
            className="text-[#00b4d8] hover:underline font-bold text-xs"
          >
            Entrar na Plataforma ↑
          </Link>
        </div>
      </footer>
    </div>
  );
}
