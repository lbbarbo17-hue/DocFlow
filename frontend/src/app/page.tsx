'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Clock,
  ShieldCheck,
  Check,
  Users,
  ArrowRight,
  Sun,
  Moon,
  FolderLock,
  Building2,
  GraduationCap,
} from 'lucide-react';

export default function HomePage() {
  const { theme, toggleTheme } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f8fafc] font-sans antialiased transition-colors duration-300 relative overflow-x-hidden">
      {/* BACKGROUND GLOWS */}
      <div 
        className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(30, 64, 175, 0.08) 0%, transparent 70%)',
        }}
      />
      <div 
        className="absolute top-[20%] right-[-300px] w-[600px] h-[600px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(30, 64, 175, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-[1140px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-extrabold text-[#1e40af] dark:text-[#3b82f6] flex items-center gap-2.5 z-10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>DocFlow</span>
          </Link>

          <div className="flex items-center gap-4 z-10">
            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Alternar tema escuro/claro"
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              )}
            </button>

            <Link
              href="/login"
              className="px-5 py-3 rounded-lg font-semibold text-sm text-white bg-[#1e40af] hover:bg-[#1e3a8a] dark:bg-[#3b82f6] dark:hover:bg-[#60a5fa] transition-all shadow-md hover:-translate-y-0.5"
            >
              Entrar na Plataforma
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative py-16 lg:py-24 overflow-hidden z-10">
        <div className="max-w-[1140px] mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight text-slate-900 dark:text-white mb-6">
              Gestão <span className="text-[#1e40af] dark:text-[#3b82f6]">Inteligente</span> de Documentos.
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-9 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              A solução corporativa para centralizar, analisar e gerenciar a documentação de aprendizes e estagiários com máxima eficiência e controle de processos.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link
                href="/login"
                className="px-8 py-4 text-lg font-semibold text-white bg-[#1e40af] hover:bg-[#1e3a8a] dark:bg-[#3b82f6] dark:hover:bg-[#60a5fa] rounded-lg transition-all shadow-lg shadow-blue-900/10 hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Acessar o Sistema</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="relative">
            {/* SVG Dashboard Mockup matching landing/index.html */}
            <svg 
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0f172a]" 
              viewBox="0 0 800 600" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Window Header */}
              <rect x="0" y="0" width="800" height="60" className="fill-slate-100 dark:fill-slate-800" />
              <circle cx="30" cy="30" r="6" fill="#ef4444"/>
              <circle cx="50" cy="30" r="6" fill="#f59e0b"/>
              <circle cx="70" cy="30" r="6" fill="#22c55e"/>
              
              {/* Sidebar */}
              <rect x="0" y="60" width="200" height="540" className="fill-slate-100 dark:fill-slate-800" />
              <rect x="20" y="90" width="160" height="36" rx="6" className="fill-blue-500/10 dark:fill-blue-500/20" />
              <rect x="40" y="103" width="100" height="10" rx="4" className="fill-blue-700 dark:fill-blue-500" />
              
              <rect x="40" y="150" width="120" height="8" rx="4" className="fill-slate-300 dark:fill-slate-700" />
              <rect x="40" y="190" width="100" height="8" rx="4" className="fill-slate-300 dark:fill-slate-700" />
              <rect x="40" y="230" width="140" height="8" rx="4" className="fill-slate-300 dark:fill-slate-700" />
              
              <line x1="200" y1="60" x2="200" y2="600" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="2"/>
              <line x1="0" y1="60" x2="800" y2="60" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="2"/>
              
              {/* Main Content Area */}
              <text x="240" y="120" className="fill-slate-900 dark:fill-white font-bold" fontSize="24">Painel de Aprendizes</text>
              <text x="240" y="145" className="fill-slate-500 dark:fill-slate-400" fontSize="14">Visão geral dos documentos enviados recentemente.</text>
              
              {/* Cards / List */}
              <g transform="translate(240, 180)">
                {/* Card 1 */}
                <rect x="0" y="0" width="520" height="80" rx="10" className="fill-white dark:fill-[#0f172a] stroke-slate-200 dark:stroke-slate-800" strokeWidth="1"/>
                <circle cx="40" cy="40" r="20" className="fill-blue-500/10 dark:fill-blue-500/20"/>
                <rect x="30" y="30" width="20" height="20" rx="2" className="fill-blue-700 dark:fill-blue-500"/>
                <text x="80" y="38" className="fill-slate-900 dark:fill-white font-bold" fontSize="16">João Silva</text>
                <text x="80" y="58" className="fill-slate-500 dark:fill-slate-400" fontSize="13">Matrícula pendente de envio</text>
                <rect x="420" y="25" width="80" height="30" rx="15" fill="#fef3c7"/>
                <text x="435" y="44" fontSize="12" fontWeight="bold" fill="#d97706">Em Análise</text>
                
                {/* Card 2 */}
                <rect x="0" y="100" width="520" height="80" rx="10" className="fill-white dark:fill-[#0f172a] stroke-slate-200 dark:stroke-slate-800" strokeWidth="1"/>
                <circle cx="40" cy="140" r="20" className="fill-blue-500/10 dark:fill-blue-500/20"/>
                <rect x="30" y="130" width="20" height="20" rx="2" className="fill-blue-700 dark:fill-blue-500"/>
                <text x="80" y="138" className="fill-slate-900 dark:fill-white font-bold" fontSize="16">Maria Souza</text>
                <text x="80" y="158" className="fill-slate-500 dark:fill-slate-400" fontSize="13">Todos os documentos validados</text>
                <rect x="420" y="125" width="80" height="30" rx="15" fill="#dcfce7"/>
                <text x="432" y="144" fontSize="12" fontWeight="bold" fill="#15803d">Aprovado</text>
                
                {/* Card 3 */}
                <rect x="0" y="200" width="520" height="80" rx="10" className="fill-white dark:fill-[#0f172a] stroke-slate-200 dark:stroke-slate-800" strokeWidth="1"/>
                <circle cx="40" cy="240" r="20" className="fill-blue-500/10 dark:fill-blue-500/20"/>
                <rect x="30" y="230" width="20" height="20" rx="2" className="fill-blue-700 dark:fill-blue-500"/>
                <text x="80" y="238" className="fill-slate-900 dark:fill-white font-bold" fontSize="16">Carlos Oliveira</text>
                <text x="80" y="258" className="fill-slate-500 dark:fill-slate-400" fontSize="13">RG recusado (Foto ilegível)</text>
                <rect x="420" y="225" width="80" height="30" rx="15" fill="#fee2e2"/>
                <text x="434" y="244" fontSize="12" fontWeight="bold" fill="#b91c1c">Pendente</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* METRICS BAR */}
      <section className="bg-slate-50 dark:bg-slate-800/60 py-14 border-y border-slate-200 dark:border-slate-800 z-10 relative">
        <div className="max-w-[1140px] mx-auto px-6 grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-4xl lg:text-5xl font-extrabold text-[#1e40af] dark:text-[#3b82f6] mb-2 leading-none">+500</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">Instituições Parceiras</p>
          </div>
          <div>
            <h3 className="text-4xl lg:text-5xl font-extrabold text-[#1e40af] dark:text-[#3b82f6] mb-2 leading-none">1M+</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">Documentos Validados</p>
          </div>
          <div>
            <h3 className="text-4xl lg:text-5xl font-extrabold text-[#1e40af] dark:text-[#3b82f6] mb-2 leading-none">85%</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">Redução de Tempo no RH</p>
          </div>
        </div>
      </section>

      {/* SEÇÃO: POR QUE ESCOLHER (RECURSOS PODEROSOS) */}
      <section className="py-24 z-10 relative">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1e40af] dark:text-[#3b82f6] mb-4 tracking-tight">
              Recursos Poderosos
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Desenvolvido para eliminar o retrabalho e garantir que toda a documentação esteja rigorosamente em dia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:border-[#1e40af] dark:hover:border-[#3b82f6] hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-[#1e40af] dark:text-[#3b82f6] flex items-center justify-center mb-6">
                <FolderLock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Dossiês Centralizados</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Organize RG, CPF, comprovantes, contratos e matrículas num formato digital acessível e padronizado.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:border-[#1e40af] dark:hover:border-[#3b82f6] hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-[#1e40af] dark:text-[#3b82f6] flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Controle de Vencimentos</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Monitoramento automático de validade de contratos e matrículas, emitindo alertas antes do encerramento do prazo.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:border-[#1e40af] dark:hover:border-[#3b82f6] hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-[#1e40af] dark:text-[#3b82f6] flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Acessos Monitorados</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Trilhas de auditoria claras que registram quem enviou, quem aprovou e quem visualizou qualquer documento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO: FLUXO DE APROVAÇÃO */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/40 border-y border-slate-200 dark:border-slate-800 z-10 relative">
        <div className="max-w-[1140px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Fluxo de aprovação integrado.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Chega de trocar e-mails longos com arquivos anexos, ou pilhas de papel no escritório. O DocFlow estrutura cada etapa da verificação.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-base">
                <Check className="w-6 h-6 text-[#1e40af] dark:text-[#3b82f6] shrink-0 mt-0.5" />
                <span><strong>Envio direto:</strong> O usuário faz upload dos PDFs ou imagens.</span>
              </li>
              <li className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-base">
                <Check className="w-6 h-6 text-[#1e40af] dark:text-[#3b82f6] shrink-0 mt-0.5" />
                <span><strong>Conferência ágil:</strong> O arquivo é exibido no próprio sistema sem necessidade de download.</span>
              </li>
              <li className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-base">
                <Check className="w-6 h-6 text-[#1e40af] dark:text-[#3b82f6] shrink-0 mt-0.5" />
                <span><strong>Retorno automático:</strong> Aceite o documento com um clique ou recuse informando o motivo.</span>
              </li>
              <li className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-base">
                <Check className="w-6 h-6 text-[#1e40af] dark:text-[#3b82f6] shrink-0 mt-0.5" />
                <span><strong>Histórico completo:</strong> Tenha o registro de tudo que foi alterado.</span>
              </li>
            </ul>
          </div>

          <div>
            <svg 
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0f172a]" 
              viewBox="0 0 800 600" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="0" y="0" width="800" height="70" className="fill-slate-100 dark:fill-slate-800"/>
              <text x="30" y="42" className="fill-slate-900 dark:fill-white font-bold" fontSize="20">Validação de Documento: RG</text>
              <rect x="650" y="20" width="120" height="36" rx="6" className="fill-blue-700 dark:fill-blue-500"/>
              <text x="670" y="43" fontSize="14" fontWeight="bold" fill="#ffffff">Aprovar Tudo</text>
              <line x1="0" y1="70" x2="800" y2="70" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="2"/>
              
              <rect x="30" y="100" width="450" height="460" rx="10" className="fill-white dark:fill-[#0f172a] stroke-slate-200 dark:stroke-slate-800" strokeWidth="1"/>
              <rect x="80" y="150" width="350" height="220" rx="12" className="fill-slate-100 dark:fill-slate-800"/>
              <rect x="100" y="170" width="80" height="100" rx="8" className="fill-slate-300 dark:fill-slate-700"/>
              <rect x="200" y="180" width="150" height="12" rx="4" className="fill-slate-300 dark:fill-slate-700"/>
              <rect x="200" y="210" width="200" height="12" rx="4" className="fill-slate-300 dark:fill-slate-700"/>
              <rect x="200" y="240" width="180" height="12" rx="4" className="fill-slate-300 dark:fill-slate-700"/>
              <circle cx="380" cy="320" r="30" className="fill-slate-300 dark:fill-slate-700"/>
              <text x="140" y="420" className="fill-slate-500 dark:fill-slate-400" fontSize="14">Visualização do Anexo (PDF / Imagem)</text>
              
              <rect x="510" y="100" width="260" height="460" rx="10" className="fill-white dark:fill-[#0f172a] stroke-slate-200 dark:stroke-slate-800" strokeWidth="1"/>
              <text x="530" y="140" className="fill-slate-900 dark:fill-white font-bold" fontSize="16">Aprovação Rápida</text>
              
              <rect x="530" y="170" width="20" height="20" rx="4" fill="#22c55e"/>
              <text x="560" y="185" className="fill-slate-900 dark:fill-white" fontSize="14">Documento Legível</text>
              
              <rect x="530" y="210" width="20" height="20" rx="4" fill="#22c55e"/>
              <text x="560" y="225" className="fill-slate-900 dark:fill-white" fontSize="14">Frente e Verso</text>
              
              <rect x="530" y="250" width="20" height="20" rx="4" className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700" strokeWidth="2"/>
              <text x="560" y="265" className="fill-slate-900 dark:fill-white" fontSize="14">Dados Conferem</text>
              
              <rect x="530" y="400" width="220" height="40" rx="6" fill="#15803d"/>
              <text x="585" y="425" fontSize="14" fontWeight="bold" fill="#ffffff">Aprovar RG</text>
              
              <rect x="530" y="450" width="220" height="40" rx="6" className="fill-white dark:fill-[#0f172a] stroke-slate-200 dark:stroke-slate-800" strokeWidth="1"/>
              <text x="590" y="475" fontSize="14" fontWeight="bold" fill="#ef4444">Recusar Envio</text>
            </svg>
          </div>
        </div>
      </section>

      {/* SEÇÃO: PERFIS DE USUÁRIOS */}
      <section className="py-24 z-10 relative">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Benefícios para todos os envolvidos
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              O DocFlow atende de forma otimizada às necessidades de cada etapa da gestão de contratos de estágio e aprendizagem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-[#1e40af] dark:text-[#3b82f6] mb-4 flex items-center gap-2.5">
                <GraduationCap className="w-6 h-6" />
                <span>Para os Estudantes</span>
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                <li>Autonomia para enviar documentos pelo próprio computador ou celular.</li>
                <li>Acompanhamento de status de aprovação em tempo real.</li>
                <li>Notificações claras sobre pendências contratuais.</li>
              </ul>
            </div>

            <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-[#1e40af] dark:text-[#3b82f6] mb-4 flex items-center gap-2.5">
                <Users className="w-6 h-6" />
                <span>Para o RH / Analistas</span>
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                <li>Visão unificada para análise e aprovação ágil.</li>
                <li>Redução severa do recebimento de documentos físicos.</li>
                <li>Rastreamento simplificado em caso de demissões ou renovações.</li>
              </ul>
            </div>

            <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-[#1e40af] dark:text-[#3b82f6] mb-4 flex items-center gap-2.5">
                <Building2 className="w-6 h-6" />
                <span>Para a Gestão</span>
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                <li>Garantia de que a empresa atua sem riscos trabalhistas.</li>
                <li>Padronização do fluxo de contratação.</li>
                <li>Gestão centralizada com informações confiáveis.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/40 border-y border-slate-200 dark:border-slate-800 z-10 relative">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1e40af] dark:text-[#3b82f6] mb-4 tracking-tight">
              O que dizem os coordenadores
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Histórias reais de quem transformou a rotina administrativa com nossa plataforma.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm">
              <p className="italic text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                &quot;Antes nós perdíamos dias organizando pastas físicas e enviando e-mails cobrando assinaturas de estagiários. Com o DocFlow, os alunos enviam tudo pelo celular e o nosso RH só precisa validar. Reduziu nosso tempo de admissão em 80%.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1e40af] dark:bg-[#3b82f6] text-white font-bold text-lg flex items-center justify-center">
                  M
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Mariana Alves</h4>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Gerente de RH na TechCorp</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm">
              <p className="italic text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                &quot;O melhor recurso para nós é o aviso de vencimento de matrícula. Nós tínhamos muitos problemas com quebra de regras por alunos que esqueciam de renovar o vínculo com a faculdade. O sistema nos avisa com 30 dias de antecedência!&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-sky-500 text-white font-bold text-lg flex items-center justify-center">
                  C
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Carlos Eduardo</h4>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Coord. de Estágio na EduMax</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm">
              <p className="italic text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                &quot;A implantação foi instantânea. No primeiro dia já tínhamos 50 aprendizes cadastrando seus RGs e comprovantes de residência. A visualização do documento embutida na plataforma, sem precisar baixar PDF, mudou nossa vida.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-bold text-lg flex items-center justify-center">
                  S
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Silvia Rodrigues</h4>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Supervisora Administrativa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 z-10 relative">
        <div className="max-w-[1140px] mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 rounded-3xl p-10 sm:p-16 text-white shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-5">
              Pronto para organizar sua rotina de admissão?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Abandone as pastas físicas e as trocas infinitas de e-mails. Comece a gerir documentos de forma rápida e segura hoje mesmo.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-[#1e40af] hover:bg-slate-100 font-bold text-lg rounded-lg transition-all shadow-lg hover:-translate-y-0.5"
            >
              Acessar DocFlow
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-400 text-sm z-10 relative">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <Link href="#" className="font-extrabold text-2xl text-[#1e40af] dark:text-[#3b82f6] flex items-center gap-2.5 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span>DocFlow</span>
              </Link>
              <p className="max-w-xs text-slate-500 dark:text-slate-400">
                A plataforma definitiva para organizar, validar e proteger a documentação de aprendizes e estagiários em conformidade com as leis trabalhistas.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Plataforma</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="hover:text-[#1e40af] dark:hover:text-[#3b82f6] transition-colors">Recursos e Vantagens</Link></li>
                <li><Link href="#" className="hover:text-[#1e40af] dark:hover:text-[#3b82f6] transition-colors">Como Funciona</Link></li>
                <li><Link href="#" className="hover:text-[#1e40af] dark:hover:text-[#3b82f6] transition-colors">Segurança e LGPD</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Suporte</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="hover:text-[#1e40af] dark:hover:text-[#3b82f6] transition-colors">Central de Ajuda</Link></li>
                <li><Link href="#" className="hover:text-[#1e40af] dark:hover:text-[#3b82f6] transition-colors">Fale Conosco</Link></li>
                <li><Link href="#" className="hover:text-[#1e40af] dark:hover:text-[#3b82f6] transition-colors">Termos de Uso</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-500">
            <p>&copy; 2026 DocFlow — Todos os direitos reservados. Software de Gestão Documental.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
