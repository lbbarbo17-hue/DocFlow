'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FileText,
  Shield,
  Clock,
  FileCheck2,
  ArrowRight,
  GraduationCap,
  Users,
  LayoutDashboard,
  Lock,
  Check,
  HelpCircle,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-[#065373] selection:text-white">
      {/* NAVEGAÇÃO / CABEÇALHO (Apenas marca e selo sutil) */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#065373] to-[#226a8b] flex items-center justify-center text-white shadow-md shadow-[#065373]/20">
              <FileText className="w-5 h-5 stroke-[1.8]" />
            </div>
            <span className="text-2xl font-extrabold text-[#065373] tracking-tight">
              DocFlow
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#226a8b] bg-[#eef6fa] px-3.5 py-1.5 rounded-full border border-[#065373]/10">
            <Shield className="w-3.5 h-3.5" />
            <span>Guarda Documental & Conformidade</span>
          </div>
        </div>
      </nav>

      {/* HERO SECTION COM BANNER PROPORCIONAL E CHECKLIST */}
      <section className="pt-10 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#eaf4fa] to-slate-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Coluna de Texto */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#065373]/20 shadow-sm text-xs font-bold text-[#065373] w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Segurança & Proteção de Dados
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Gestão e Guarda Segura de Documentos para{' '}
              <span className="text-[#065373]">
                Aprendizes e Estagiários
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Guarde e organize todos os documentos de aprendizes e estagiários em um só lugar, com segurança total e controle de prazos.
            </p>

            {/* Checklist com ícones vazados */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <div className="w-5 h-5 rounded bg-[#eef6fa] text-[#065373] flex items-center justify-center border border-[#065373]/20 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Centralização completa de RG, CPF, Residência, Matrícula e Contratos.</span>
              </div>

              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <div className="w-5 h-5 rounded bg-[#eef6fa] text-[#065373] flex items-center justify-center border border-[#065373]/20 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Avisos prévios antes do vencimento do comprovante de matrícula.</span>
              </div>

              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <div className="w-5 h-5 rounded bg-[#eef6fa] text-[#065373] flex items-center justify-center border border-[#065373]/20 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Proteção rigorosa de dados pessoais e privacidade de acordo com a lei.</span>
              </div>
            </div>
          </div>

          {/* Coluna do Banner Lateral Proporcional */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-xl border-2 border-white aspect-[4/3] flex group">
            <Image
              src="/docflow_banner.jpg"
              alt="Dossiês e Gestão Segura de Documentos"
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Card flutuante sobre a imagem */}
            <div className="absolute inset-x-4 bottom-4 bg-[#065373]/90 backdrop-blur-md p-4 rounded-xl text-white border border-white/20 flex items-center gap-3 shadow-lg">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white leading-tight">
                  Pastas Digitais Protegidas
                </h5>
                <p className="text-xs text-[#77afd3] mt-0.5">
                  Dossiês organizados e seguros contra perdas
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FAIXA DE INDICADORES */}
      <div className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#eef6fa] text-[#065373] flex items-center justify-center shrink-0 border border-[#065373]/15">
              <FileText className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Pastas Completas</h4>
              <p className="text-xs sm:text-sm text-slate-600">Toda a documentação reunida em um só lugar</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#eef6fa] text-[#065373] flex items-center justify-center shrink-0 border border-[#065373]/15">
              <Clock className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Prazos em Dia</h4>
              <p className="text-xs sm:text-sm text-slate-600">Alertas automáticos para renovação de matrículas</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#eef6fa] text-[#065373] flex items-center justify-center shrink-0 border border-[#065373]/15">
              <Shield className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Privacidade Garantida</h4>
              <p className="text-xs sm:text-sm text-slate-600">Acesso seguro e restrito a pessoas autorizadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* COMO FUNCIONA (3 ETAPAS) */}
      <section className="py-16 bg-[#f1f6f9] border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#226a8b] mb-2">
              Fluxo Direto
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Como o DocFlow funciona
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Processo simples e sem burocracia do início ao fim.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative pt-8">
              <span className="absolute -top-3.5 left-6 bg-[#065373] text-white text-xs font-extrabold px-3 py-1 rounded-full">
                Etapa 1
              </span>
              <h4 className="font-bold text-slate-900 text-base mb-2">1. Envio dos Arquivos</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                O estudante anexa fotos ou PDFs dos documentos solicitados diretamente pelo portal de forma guiada.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative pt-8">
              <span className="absolute -top-3.5 left-6 bg-[#065373] text-white text-xs font-extrabold px-3 py-1 rounded-full">
                Etapa 2
              </span>
              <h4 className="font-bold text-slate-900 text-base mb-2">2. Validação Rápida</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                O coordenador ou setor de RH confere os dados em tela clara e realiza a aprovação com apenas um clique.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative pt-8">
              <span className="absolute -top-3.5 left-6 bg-[#065373] text-white text-xs font-extrabold px-3 py-1 rounded-full">
                Etapa 3
              </span>
              <h4 className="font-bold text-slate-900 text-base mb-2">3. Guarda e Avisos</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Os documentos ficam salvos com segurança e o sistema avisa com antecedência sobre renovações necessárias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS PRINCIPAIS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#226a8b] mb-2">
            Recursos Chave
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tudo que sua instituição precisa
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Ferramentas práticas para facilitar a rotina diária de conferência e arquivo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#5b98bb] hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#eef6fa] text-[#065373] flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Pastas Organizadas</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Reúna RG, CPF, comprovante de residência, matrícula e contratos em um só lugar.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#5b98bb] hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#eef6fa] text-[#065373] flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Proteção de Dados</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Segurança e privacidade no tratamento dos dados pessoais de acordo com a legislação.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#5b98bb] hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#eef6fa] text-[#065373] flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Aviso de Vencimentos</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Acompanhe as datas de renovação de matrícula para evitar quebras contratuais.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#5b98bb] hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#eef6fa] text-[#065373] flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Histórico de Acessos</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Registro claro de quem enviou, visualizou e aprovou cada documento da pasta digital.
            </p>
          </div>
        </div>
      </section>

      {/* QUEM USA O SISTEMA */}
      <section className="py-16 bg-[#f5f9fc] border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#226a8b] mb-2">
              Perfis Dedicados
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Feito para toda a equipe
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Cada usuário com a visão exata do que precisa realizar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex gap-4 items-start shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-[#eef6fa] text-[#065373] flex items-center justify-center shrink-0 border border-[#065373]/15">
                <GraduationCap className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base mb-1">
                  Estudantes e Aprendizes
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Envio fácil de documentos pelo celular ou computador e acompanhamento do status de entrega.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex gap-4 items-start shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-[#eef6fa] text-[#065373] flex items-center justify-center shrink-0 border border-[#065373]/15">
                <Users className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base mb-1">
                  Coordenadores e RH
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Conferência rápida dos arquivos, aprovação direta e visão geral da situação de cada aluno.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex gap-4 items-start shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-[#eef6fa] text-[#065373] flex items-center justify-center shrink-0 border border-[#065373]/15">
                <LayoutDashboard className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base mb-1">
                  Gestão e Controle
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Relatórios simples, controle de acessos e garantia de que toda a instituição está regular.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PERGUNTAS FREQUENTES */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#226a8b] mb-2">
              Tire suas dúvidas
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#f8fafc] border border-slate-200 p-5 rounded-2xl">
              <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#065373]" />
                Quais documentos são organizados?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                RG, CPF, Comprovante de Residência, Comprovante de Matrícula e Contrato de Trabalho / Termo de Estágio.
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-slate-200 p-5 rounded-2xl">
              <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#065373]" />
                Como os prazos são monitorados?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                O sistema acompanha as datas de expiração e emite alertas visuais para renovação semestral antes do vencimento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION COM O ÚNICO BOTÃO DE ACESSO */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#065373] via-[#043c53] to-[#065373] text-white p-10 sm:p-14 shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 tracking-tight">
              Tudo pronto para organizar seus documentos?
            </h2>
            <p className="text-sm sm:text-base text-[#77afd3] mb-8 leading-relaxed">
              Acesse a plataforma DocFlow e faça a gestão completa dos seus dossiês com máxima agilidade e segurança.
            </p>

            {/* O ÚNICO BOTÃO DA LANDING PAGE */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-3 bg-white text-[#065373] hover:bg-slate-100 font-extrabold text-base sm:text-lg px-9 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 group"
            >
              <span>Acessar o DocFlow</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 DocFlow — Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center font-medium">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#065373]" />
              Documentos Protegidos
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#065373]" />
              Conformidade LGPD
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
