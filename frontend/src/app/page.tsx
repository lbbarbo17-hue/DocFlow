'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { DocFlowLogo } from '@/components/DocFlowLogo';
import {
  Check,
  Sun,
  Moon,
  CheckCircle2,
  FileText,
  UploadCloud,
} from 'lucide-react';

type HeroAnimPhase =
  | 'act1_idle'
  | 'act1_moveToUpload'
  | 'act1_clickUpload'
  | 'act1_uploading'
  | 'act1_moveToSend'
  | 'act1_clickSend'
  | 'act1_sent'
  | 'act2_enter'
  | 'act2_moveToApprove'
  | 'act2_clickApprove'
  | 'act2_approved';

export default function HomePage() {
  const { theme, toggleTheme } = useApp();
  const [mounted, setMounted] = useState(false);
  const [animPhase, setAnimPhase] = useState<HeroAnimPhase>('act1_idle');
  const [isRgChecked, setIsRgChecked] = useState(false);
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number }>({
    x: 260,
    y: 230,
  });

  const mockupRef = useRef<HTMLDivElement>(null);
  const uploadZoneRef = useRef<HTMLDivElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const approveBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);

    let timers: ReturnType<typeof setTimeout>[] = [];

    const runHeroCycle = () => {
      timers.forEach(clearTimeout);
      timers = [];

      setAnimPhase('act1_idle');
      timers.push(setTimeout(() => setAnimPhase('act1_moveToUpload'), 200));
      timers.push(setTimeout(() => setAnimPhase('act1_clickUpload'), 1250));
      timers.push(setTimeout(() => setAnimPhase('act1_uploading'), 1550));
      timers.push(setTimeout(() => setAnimPhase('act1_moveToSend'), 2600));
      timers.push(setTimeout(() => setAnimPhase('act1_clickSend'), 3600));
      timers.push(setTimeout(() => setAnimPhase('act1_sent'), 3850));
      timers.push(setTimeout(() => setAnimPhase('act2_enter'), 4500));
      timers.push(setTimeout(() => setAnimPhase('act2_moveToApprove'), 4950));
      timers.push(setTimeout(() => setAnimPhase('act2_clickApprove'), 6200));
      timers.push(setTimeout(() => setAnimPhase('act2_approved'), 6450));
    };

    runHeroCycle();
    const heroInterval = setInterval(runHeroCycle, 9000);

    const rgTimer = setInterval(() => {
      setIsRgChecked((prev) => !prev);
    }, 2600);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(heroInterval);
      clearInterval(rgTimer);
    };
  }, []);

  useEffect(() => {
    const container = mockupRef.current;
    if (!container) return;

    const frame = requestAnimationFrame(() => {
      const getCenterCoords = (target: HTMLElement | null) => {
        if (!target) return null;
        const cRect = container.getBoundingClientRect();
        const tRect = target.getBoundingClientRect();
        return {
          x: tRect.left - cRect.left + tRect.width / 2,
          y: tRect.top - cRect.top + tRect.height / 2,
        };
      };

      if (animPhase === 'act1_idle') {
        const cRect = container.getBoundingClientRect();
        setCursorCoords({ x: cRect.width * 0.82, y: cRect.height * 0.84 });
      } else if (
        animPhase === 'act1_moveToUpload' ||
        animPhase === 'act1_clickUpload' ||
        animPhase === 'act1_uploading'
      ) {
        const coords = getCenterCoords(uploadZoneRef.current);
        if (coords) setCursorCoords(coords);
      } else if (
        animPhase === 'act1_moveToSend' ||
        animPhase === 'act1_clickSend' ||
        animPhase === 'act1_sent'
      ) {
        const coords = getCenterCoords(sendBtnRef.current);
        if (coords) setCursorCoords(coords);
      } else if (animPhase === 'act2_enter') {
        const cRect = container.getBoundingClientRect();
        setCursorCoords({ x: cRect.width * 0.3, y: cRect.height * 0.72 });
      } else if (
        animPhase === 'act2_moveToApprove' ||
        animPhase === 'act2_clickApprove' ||
        animPhase === 'act2_approved'
      ) {
        const coords = getCenterCoords(approveBtnRef.current);
        if (coords) setCursorCoords(coords);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [animPhase]);

  const activeScreen: 'student' | 'coordinator' =
    animPhase === 'act2_enter' ||
    animPhase === 'act2_moveToApprove' ||
    animPhase === 'act2_clickApprove' ||
    animPhase === 'act2_approved'
      ? 'coordinator'
      : 'student';

  const hasFile =
    animPhase === 'act1_uploading' ||
    animPhase === 'act1_moveToSend' ||
    animPhase === 'act1_clickSend' ||
    animPhase === 'act1_sent';

  const isAct1Sent = animPhase === 'act1_sent';
  const isAct2Approved = animPhase === 'act2_approved';

  const isCursorClicking =
    animPhase === 'act1_clickUpload' ||
    animPhase === 'act1_clickSend' ||
    animPhase === 'act2_clickApprove';

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans antialiased transition-colors duration-300">
      <header className="sticky top-0 z-50 h-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-[1140px] mx-auto px-6 h-full flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center shrink-0">
            <DocFlowLogo size="md" className="text-xl font-bold" />
          </Link>

          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-8"
          >
            <a
              href="#como-funciona"
              className="text-sm font-medium text-slate-600 hover:text-[#085078] dark:text-slate-300 dark:hover:text-cyan-400 transition-colors"
            >
              Como Funciona
            </a>
            <a
              href="#fluxo"
              className="text-sm font-medium text-slate-600 hover:text-[#085078] dark:text-slate-300 dark:hover:text-cyan-400 transition-colors"
            >
              Aprovação
            </a>
            <a
              href="#perfis"
              className="text-sm font-medium text-slate-600 hover:text-[#085078] dark:text-slate-300 dark:hover:text-cyan-400 transition-colors"
            >
              Perfis
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Alternar tema escuro/claro"
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              )}
            </button>

            <Link
              href="/login"
              className="bg-[#085078] hover:bg-[#063f60] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              Entrar na Plataforma
            </Link>
          </div>
        </div>
      </header>

      <section className="relative py-16 lg:py-24 overflow-hidden bg-slate-50/80 dark:bg-slate-950 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="max-w-[1140px] mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
          <div className="text-center lg:text-left relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#085078]/10 text-[#085078] dark:bg-cyan-500/10 dark:text-cyan-400 text-xs font-semibold mb-4">
              Plataforma de Conformidade Documental • CLT &amp; TCE
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight leading-[1.12] text-slate-900 dark:text-white mb-5">
              Estágios e aprendizagem sob{' '}
              <span className="text-[#085078] dark:text-cyan-400">
                controle total.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Centralize dossiês, valide contratos e acompanhe pendências entre
              instituições de ensino, empresas e estudantes.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <Link
                href="/login"
                className="bg-[#085078] hover:bg-[#063f60] text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors inline-flex items-center gap-2"
              >
                <span>Acessar o Sistema →</span>
              </Link>
              <a
                href="#como-funciona"
                className="border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Como Funciona
              </a>
            </div>
          </div>

          <div className="relative z-10">
            <div
              aria-hidden="true"
              className="absolute -inset-6 bg-[#085078]/15 dark:bg-[#085078]/25 blur-3xl rounded-full pointer-events-none"
            />

            <div
              ref={mockupRef}
              className="relative rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 overflow-hidden select-none"
            >
              <div className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-5 h-5 rounded bg-[#085078] text-white text-[10px] font-black flex items-center justify-center">
                      D
                    </span>
                    <span className="text-xs font-extrabold tracking-tight text-slate-900 dark:text-white">
                      Doc
                      <span className="font-light text-[#085078] dark:text-cyan-400">
                        Flow
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium">
                    <span
                      className={`px-2 py-1 rounded transition-colors duration-200 ${
                        activeScreen === 'coordinator'
                          ? 'bg-[#085078]/10 text-[#085078] dark:bg-cyan-400/15 dark:text-cyan-300 font-semibold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Dashboard
                    </span>
                    <span
                      className={`px-2 py-1 rounded transition-colors duration-200 ${
                        activeScreen === 'student'
                          ? 'bg-[#085078]/10 text-[#085078] dark:bg-cyan-400/15 dark:text-cyan-300 font-semibold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Documentos
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-[#085078] dark:text-cyan-300 shrink-0">
                  {activeScreen === 'coordinator'
                    ? 'Visão do Coordenador'
                    : 'Visão do Estudante'}
                </span>
              </div>

              <div className="h-[310px] bg-slate-50 dark:bg-slate-950 p-5 overflow-hidden">
                {activeScreen === 'student' ? (
                  <div
                    key="student-screen"
                    className="h-full animate-mockup-enter"
                  >
                    <div className="mb-3">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Checklist Documental
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Beatriz Helena • Desenvolvimento de Sistemas
                      </p>
                    </div>

                    <div
                      className={`rounded-lg border border-slate-200 dark:border-slate-800 border-l-4 bg-white dark:bg-slate-900 p-4 space-y-3.5 shadow-sm transition-colors duration-300 ${
                        isAct1Sent ? 'border-l-amber-500' : 'border-l-rose-500'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            Comprovante de Matrícula
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Obrigatório • Semestre 2026.1
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all duration-300 ${
                            isAct1Sent
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                          }`}
                        >
                          {isAct1Sent ? 'Em Análise' : 'Pendente'}
                        </span>
                      </div>

                      <div
                        ref={uploadZoneRef}
                        className={`rounded-lg border-2 border-dashed p-3 transition-all duration-200 ${
                          animPhase === 'act1_clickUpload'
                            ? 'scale-95 border-[#085078] bg-[#085078]/5 dark:border-cyan-400 dark:bg-cyan-400/10'
                            : hasFile
                              ? 'border-[#085078]/40 bg-slate-50 dark:border-cyan-400/40 dark:bg-slate-950/60'
                              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50'
                        }`}
                      >
                        {hasFile ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-[#085078] dark:text-cyan-400 shrink-0" />
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                                Comprovante_Matricula.pdf (420 KB)
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-[#085078] dark:bg-cyan-400 rounded-full transition-all duration-700 ${
                                  animPhase === 'act1_uploading' ||
                                  animPhase === 'act1_moveToSend' ||
                                  animPhase === 'act1_clickSend' ||
                                  animPhase === 'act1_sent'
                                    ? 'w-full'
                                    : 'w-0'
                                }`}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 py-1 text-slate-500 dark:text-slate-400">
                            <UploadCloud className="w-4 h-4 text-[#085078] dark:text-cyan-400 shrink-0" />
                            <span className="text-xs font-medium">
                              Clique para anexar PDF ou imagem
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        ref={sendBtnRef}
                        type="button"
                        tabIndex={-1}
                        className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 pointer-events-none ${
                          animPhase === 'act1_clickSend'
                            ? 'scale-95'
                            : 'scale-100'
                        } ${
                          isAct1Sent
                            ? 'bg-amber-600 text-white'
                            : 'bg-[#085078] text-white'
                        }`}
                      >
                        {isAct1Sent
                          ? 'Enviado para Análise ✓'
                          : 'Enviar Documento'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key="coordinator-screen"
                    className="h-full animate-mockup-enter"
                  >
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Aguardando Parecer
                        </h3>
                        <span
                          className={`text-[11px] font-medium px-2.5 py-0.5 rounded border transition-colors duration-300 ${
                            isAct2Approved
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {isAct2Approved ? 'Aprovado' : 'Em Análise'}
                        </span>
                      </div>

                      <div
                        className={`bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 border-l-4 rounded-lg p-3.5 flex items-center justify-between gap-3 transition-colors duration-300 ${
                          isAct2Approved
                            ? 'border-l-emerald-500'
                            : 'border-l-amber-500'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                            Beatriz Helena
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            Comprovante de Matrícula • Enviado agora
                          </p>
                        </div>

                        <button
                          ref={approveBtnRef}
                          type="button"
                          disabled={isAct2Approved}
                          tabIndex={-1}
                          className={`px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 pointer-events-none shrink-0 ${
                            animPhase === 'act2_clickApprove'
                              ? 'scale-95'
                              : 'scale-100'
                          } ${
                            isAct2Approved
                              ? 'bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-[#085078] text-white'
                          }`}
                        >
                          {isAct2Approved ? 'Validado ✓' : 'Aprovar'}
                        </button>
                      </div>

                      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Conformidade do Dossiê
                          </span>
                          <span
                            className={`font-mono font-bold transition-colors duration-500 ${
                              isAct2Approved
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-[#085078] dark:text-cyan-400'
                            }`}
                          >
                            {isAct2Approved ? '100% Regularizado' : '80%'}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isAct2Approved
                                ? 'w-full bg-emerald-500'
                                : 'w-4/5 bg-[#085078] dark:bg-cyan-400'
                            }`}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 transition-colors duration-300 ${
                              isAct2Approved
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-400'
                            }`}
                          />
                          <span>
                            {isAct2Approved
                              ? 'Dossiê regularizado e registrado na auditoria.'
                              : '4 de 5 documentos obrigatórios validados.'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div
                aria-hidden="true"
                style={{
                  left: `${cursorCoords.x}px`,
                  top: `${cursorCoords.y}px`,
                }}
                className="absolute z-30 pointer-events-none -ml-1 -mt-0.5 transition-all duration-700 ease-out opacity-100"
              >
                {isCursorClicking && (
                  <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full border-2 border-[#085078] dark:border-cyan-400 animate-ping opacity-80" />
                )}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] transition-transform duration-150 ${
                    isCursorClicking ? 'scale-90' : 'scale-100'
                  }`}
                >
                  <path
                    d="M4 3L11 20L14 13L21 10L4 3Z"
                    fill="#ffffff"
                    stroke="#0f172a"
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="fluxo"
        className="scroll-mt-20 py-20 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-[1140px] mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-5 leading-tight">
              Fluxo de aprovação integrado.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Substitua anexos soltos por e-mail por uma esteira direta de envio
              e conferência no navegador.
            </p>

            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                <Check className="w-5 h-5 text-[#085078] dark:text-cyan-400 shrink-0" />
                <span>Envio de PDF ou imagem direto pelo estudante.</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                <Check className="w-5 h-5 text-[#085078] dark:text-cyan-400 shrink-0" />
                <span>Inspeção no painel sem precisar baixar o arquivo.</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                <Check className="w-5 h-5 text-[#085078] dark:text-cyan-400 shrink-0" />
                <span>Aprovação em um clique ou recusa com justificativa.</span>
              </li>
            </ul>
          </div>

          <div>
            <svg
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900"
              viewBox="0 0 800 600"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0"
                y="0"
                width="800"
                height="70"
                className="fill-slate-100 dark:fill-slate-800"
              />
              <text
                x="30"
                y="42"
                className="fill-slate-900 dark:fill-white font-bold"
                fontSize="20"
              >
                Validação de Documento: RG
              </text>
              <rect
                x="650"
                y="18"
                width="120"
                height="36"
                rx="8"
                fill="#085078"
              />
              <text
                x="667"
                y="41"
                fontSize="14"
                fontWeight="bold"
                fill="#ffffff"
              >
                Aprovar Tudo
              </text>
              <line
                x1="0"
                y1="70"
                x2="800"
                y2="70"
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="2"
              />

              <rect
                x="30"
                y="100"
                width="450"
                height="460"
                rx="8"
                className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="1"
              />
              <rect
                x="80"
                y="150"
                width="350"
                height="220"
                rx="8"
                className="fill-slate-100 dark:fill-slate-800"
              />
              <rect
                x="100"
                y="170"
                width="80"
                height="100"
                rx="8"
                className="fill-slate-300 dark:fill-slate-700"
              />
              <rect
                x="200"
                y="180"
                width="150"
                height="12"
                rx="4"
                className="fill-slate-300 dark:fill-slate-700"
              />
              <rect
                x="200"
                y="210"
                width="200"
                height="12"
                rx="4"
                className="fill-slate-300 dark:fill-slate-700"
              />
              <rect
                x="200"
                y="240"
                width="180"
                height="12"
                rx="4"
                className="fill-slate-300 dark:fill-slate-700"
              />
              <circle
                cx="380"
                cy="320"
                r="30"
                className="fill-slate-300 dark:fill-slate-700"
              />
              <text
                x="140"
                y="420"
                className="fill-slate-500 dark:fill-slate-400"
                fontSize="14"
              >
                Visualização do Anexo (PDF / Imagem)
              </text>

              <rect
                x="510"
                y="100"
                width="260"
                height="460"
                rx="8"
                className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="1"
              />
              <text
                x="530"
                y="140"
                className="fill-slate-900 dark:fill-white font-bold"
                fontSize="16"
              >
                Aprovação Rápida
              </text>

              <rect x="530" y="170" width="20" height="20" rx="4" fill="#22c55e" />
              <path
                d="M535 180 L539 184 L546 176"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x="560"
                y="185"
                className="fill-slate-900 dark:fill-white"
                fontSize="14"
              >
                Documento Legível
              </text>

              <rect x="530" y="210" width="20" height="20" rx="4" fill="#22c55e" />
              <path
                d="M535 220 L539 224 L546 216"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x="560"
                y="225"
                className="fill-slate-900 dark:fill-white"
                fontSize="14"
              >
                Frente e Verso
              </text>

              <rect
                x="530"
                y="250"
                width="20"
                height="20"
                rx="4"
                fill={isRgChecked ? '#22c55e' : 'transparent'}
                className={
                  isRgChecked
                    ? 'transition-all duration-500'
                    : 'fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700 transition-all duration-500'
                }
                strokeWidth={isRgChecked ? '0' : '2'}
              />
              <path
                d="M535 260 L539 264 L546 256"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isRgChecked ? 1 : 0}
                className="transition-opacity duration-500"
              />
              <text
                x="560"
                y="265"
                className="fill-slate-900 dark:fill-white"
                fontSize="14"
              >
                Dados Conferem
              </text>

              <rect x="530" y="400" width="220" height="40" rx="8" fill="#15803d" />
              <text
                x="598"
                y="425"
                fontSize="14"
                fontWeight="bold"
                fill="#ffffff"
              >
                Aprovar RG
              </text>

              <rect
                x="530"
                y="450"
                width="220"
                height="40"
                rx="8"
                className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="1"
              />
              <text
                x="589"
                y="475"
                fontSize="14"
                fontWeight="bold"
                fill="#ef4444"
              >
                Recusar Envio
              </text>
            </svg>
          </div>
        </div>
      </section>

      <section id="perfis" className="scroll-mt-20 py-20">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="text-center max-w-[680px] mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Para cada perfil do processo
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              Interfaces dedicadas para cada participante do ciclo contratual.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-t-4 border-t-[#085078] dark:border-t-cyan-400 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#085078] dark:text-cyan-400 mb-3">
                Para Estudantes
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Checklist objetivo de envio pelo celular ou desktop, com status e
                alertas de vencimento em tempo real.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-t-4 border-t-[#085078] dark:border-t-cyan-400 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#085078] dark:text-cyan-400 mb-3">
                Para Instituições de Ensino
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Validação rápida de matrícula, TCE e CTPS por turma, sinalizando
                vínculos pendentes ou em risco.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-t-4 border-t-[#085078] dark:border-t-cyan-400 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#085078] dark:text-cyan-400 mb-3">
                Para Empresas Concedentes
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Dossiês padronizados em conformidade com CLT e Lei do Estágio,
                com guarda segura e trilha de auditoria.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="scroll-mt-20 py-20 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="text-center max-w-[680px] mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Como funciona na prática
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              Da abertura do vínculo à auditoria em três etapas diretas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
              <span className="block text-2xl font-bold text-[#085078] dark:text-cyan-400 font-mono mb-2">
                01
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Cadastro e Vínculo
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                A coordenação registra o aluno vinculando instituição, empresa
                concedente e regime contratual.
              </p>
            </div>

            <div className="bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
              <span className="block text-2xl font-bold text-[#085078] dark:text-cyan-400 font-mono mb-2">
                02
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Envio Digital pelo Estudante
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                O estudante envia os arquivos no checklist com conferência de
                formato e hash de integridade.
              </p>
            </div>

            <div className="bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
              <span className="block text-2xl font-bold text-[#085078] dark:text-cyan-400 font-mono mb-2">
                03
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Parecer e Auditoria da Coordenação
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                A equipe aprova ou recusa os anexos com justificativa e mantém
                todo o histórico auditável.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1140px] mx-auto px-6 text-center">
          <div className="bg-[#085078] text-white rounded-lg p-10 shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Pronto para digitalizar os dossiês da sua instituição?
            </h2>
            <p className="text-base sm:text-lg text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">
              Acesse com suas credenciais para gerenciar turmas, aprovar
              documentos e acompanhar a conformidade dos vínculos.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-white text-[#085078] hover:bg-slate-100 font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm"
            >
              Acessar DocFlow →
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-8">
            <div className="md:col-span-2">
              <Link href="/" className="inline-flex items-center mb-4">
                <DocFlowLogo size="sm" />
              </Link>
              <p className="max-w-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Plataforma corporativa para guarda contínua e validação de
                documentos de aprendizes e estagiários.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">
                Navegação
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="#como-funciona"
                    className="hover:text-[#085078] dark:hover:text-cyan-400 transition-colors"
                  >
                    Como Funciona
                  </a>
                </li>
                <li>
                  <a
                    href="#fluxo"
                    className="hover:text-[#085078] dark:hover:text-cyan-400 transition-colors"
                  >
                    Aprovação
                  </a>
                </li>
                <li>
                  <a
                    href="#perfis"
                    className="hover:text-[#085078] dark:hover:text-cyan-400 transition-colors"
                  >
                    Perfis
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">
                Acesso
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-[#085078] dark:hover:text-cyan-400 transition-colors"
                  >
                    Entrar na Plataforma
                  </Link>
                </li>
                <li>
                  <Link
                    href="/esqueceu-senha"
                    className="hover:text-[#085078] dark:hover:text-cyan-400 transition-colors"
                  >
                    Recuperar Senha
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-500">
            <p>
              &copy; 2026 DocFlow — Todos os direitos reservados. Gestão
              Documental Corporativa.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
