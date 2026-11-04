'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  Upload,
  Camera,
  FolderOpen,
  AlertTriangle,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye,
  ArrowRight,
  FilePlus2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatBytes, computeSHA256, generateStorageUUID, isDocumentApplicableForStudent } from '@/lib/utils';
import { TipoDocumento } from '@/lib/types';

const SUPPLEMENTARY_DOCUMENT_OPTIONS = [
  {
    tipo: 'DOC_RESPONSAVEL' as TipoDocumento,
    nomeExibicao: 'RG e CPF do Responsável Legal',
    descricao: 'Documento oficial de identificação com foto e CPF do pai, mãe ou responsável legal.',
    categoria: 'IDENTIFICACAO_APOIO' as const,
  },
  {
    tipo: 'TITULO_ELEITOR' as TipoDocumento,
    nomeExibicao: 'Título de Eleitor',
    descricao: 'Título de eleitor digital (e-Título) ou comprovante de quitação eleitoral emitido pelo TSE.',
    categoria: 'IDENTIFICACAO_APOIO' as const,
  },
  {
    tipo: 'CERTIFICADO_RESERVISTA' as TipoDocumento,
    nomeExibicao: 'Certificado de Reservista / Alistamento Militar',
    descricao: 'Certificado de Alistamento Militar (CAM) ou Certificado de Dispensa de Incorporação (CDI).',
    categoria: 'COMPLEMENTAR' as const,
  },
  {
    tipo: 'CARTEIRA_TRABALHO' as TipoDocumento,
    nomeExibicao: 'Carteira de Trabalho (CTPS Digital/Física)',
    descricao: 'Cópia digitalizada da CTPS ou espelho em PDF da Carteira de Trabalho Digital.',
    categoria: 'COMPLEMENTAR' as const,
  },
  {
    tipo: 'DADOS_BANCARIOS' as TipoDocumento,
    nomeExibicao: 'Dados Bancários / Comprovante de Conta',
    descricao: 'Comprovante com agência e conta bancária em nome do estudante para crédito de bolsa ou salário.',
    categoria: 'COMPLEMENTAR' as const,
  },
  {
    tipo: 'APOLICE_SEGURO' as TipoDocumento,
    nomeExibicao: 'Apólice de Seguro / Outros Anexos',
    descricao: 'Apólice de seguro contra acidentes pessoais ou outros documentos anexos complementares.',
    categoria: 'COMPLEMENTAR' as const,
  },
  {
    tipo: 'CONTRATO_TCE' as TipoDocumento,
    nomeExibicao: 'Termo Aditivo de Contrato / Estágio',
    descricao: 'Aditivo contratual assinado para prorrogação de vigência ou alteração de bolsa/carga horária.',
    categoria: 'COMPLEMENTAR' as const,
  },
  {
    tipo: 'CONTRATO_TCE' as TipoDocumento,
    nomeExibicao: 'Relatório de Atividades',
    descricao: 'Relatório periódico de atividades desempenhadas, assinado pelo supervisor da empresa.',
    categoria: 'COMPLEMENTAR' as const,
  },
];

export default function AdicionarDocumentoPage() {
  const { student, uploadStudentDocument, addNewDocumentToStudent } = useApp();

  // Modo de seleção: existente no checklist ou complementar
  const [selectedDocId, setSelectedDocId] = useState<string>(
    student.documentos.find((d) => d.status !== 'APROVADO')?.id || student.documentos[0]?.id || ''
  );
  const [isSupplementary, setIsSupplementary] = useState<boolean>(false);
  const [selectedSupplementaryIndex, setSelectedSupplementaryIndex] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isImageFile, setIsImageFile] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [simulatedHash, setSimulatedHash] = useState<string>('');
  const [simulatedUuid, setSimulatedUuid] = useState<string>('');
  const [magicBytesStatus, setMagicBytesStatus] = useState<'IDLE' | 'CHECKING' | 'VALID' | 'INVALID'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const applicableSupplementaryOptions = SUPPLEMENTARY_DOCUMENT_OPTIONS.filter((opt) =>
    isDocumentApplicableForStudent(opt.tipo, student)
  );
  const applicableChecklistDocs = student.documentos.filter(
    (d) => d.obrigatorio && isDocumentApplicableForStudent(d.tipo, student)
  );

  const currentSupplementary = applicableSupplementaryOptions[selectedSupplementaryIndex] || applicableSupplementaryOptions[0];

  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const handleFileChange = async (file: File) => {
    setErrorMessage(null);
    setUploadSuccess(false);
    setZoomLevel(100);
    setRotation(0);

    // 1. Limite de tamanho (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(`O arquivo excede o limite máximo permitido de 10 MB (tamanho: ${formatBytes(file.size)}).`);
      return;
    }

    const isImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(file.name);
    setIsImageFile(isImg);

    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);

    setSelectedFile(file);
    setIsProcessing(true);
    setPipelineStep(1);

    // Simulação da inspeção de magic bytes
    setMagicBytesStatus('CHECKING');
    await new Promise((r) => setTimeout(r, 450));

    const hasValidExt =
      /\.(pdf|jpg|jpeg|png)$/i.test(file.name) ||
      file.type.includes('pdf') ||
      file.type.includes('image');

    if (!hasValidExt) {
      setMagicBytesStatus('INVALID');
      setIsProcessing(false);
      setErrorMessage('Assinatura binária inválida! Apenas documentos autênticos PDF, JPEG ou PNG são aceitos.');
      return;
    }

    setMagicBytesStatus('VALID');
    setPipelineStep(2);

    const hash = await computeSHA256(file);
    const ext = file.name.split('.').pop() || (isImg ? 'jpg' : 'pdf');
    const uuid = generateStorageUUID(ext);

    setSimulatedHash(hash);
    setSimulatedUuid(uuid);

    await new Promise((r) => setTimeout(r, 450));
    setPipelineStep(3);
    await new Promise((r) => setTimeout(r, 350));
    setPipelineStep(4);
    setIsProcessing(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    if (isSupplementary) {
      setIsProcessing(true);
      const existingDoc = student.documentos.find(
        (d) => d.nomeExibicao === currentSupplementary.nomeExibicao
      );
      let success = false;
      if (existingDoc) {
        success = await uploadStudentDocument(existingDoc.id, selectedFile);
      } else {
        success = await addNewDocumentToStudent(
          {
            tipo: currentSupplementary.tipo,
            nomeExibicao: currentSupplementary.nomeExibicao,
            descricao: currentSupplementary.descricao,
            categoria: currentSupplementary.categoria,
            obrigatorio: false,
            status: 'EM_ANALISE',
          },
          selectedFile
        );
      }
      setIsProcessing(false);
      if (success) {
        setUploadSuccess(true);
      }
    } else {
      if (!selectedDocId) {
        setErrorMessage('Selecione um documento da lista.');
        return;
      }
      setIsProcessing(true);
      const success = await uploadStudentDocument(selectedDocId, selectedFile);
      setIsProcessing(false);
      if (success) {
        setUploadSuccess(true);
      }
    }
  };

  const handleResetForm = () => {
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setPipelineStep(0);
    setErrorMessage(null);
    setUploadSuccess(false);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Cabeçalho da Página (Estilo Dashboard / Checklist) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <UploadCloud className="w-6 h-6 text-[#085078] dark:text-cyan-400 shrink-0" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
            Adicionar e Enviar Documentos
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/estudante/checklist"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 dark:hover:text-cyan-400 hover:text-[#085078] transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span>← Ver Meus Documentos</span>
          </Link>
        </div>
      </div>

      {/* 2. Tela de Sucesso após Envio */}
      {uploadSuccess ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-emerald-200 dark:border-emerald-800/60 shadow-xs text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Documento Enviado com Sucesso! 🎉
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O arquivo foi processado com validação de autenticidade e encaminhado para a equipe de coordenação para conferência.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 max-w-lg mx-auto border border-slate-200 dark:border-slate-700 text-left font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Arquivo:</span>
              <span className="font-bold text-slate-800 dark:text-white truncate max-w-[260px]">{selectedFile?.name}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Hash SHA-256:</span>
              <span className="text-[#085078] dark:text-cyan-400 font-bold">{simulatedHash.substring(0, 20)}...</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Status Inicial:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Em Análise</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Enviar Outro Documento
            </button>
            <Link
              href="/estudante/checklist"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#085078] hover:bg-[#063c5a] text-white dark:bg-[#085078] dark:hover:bg-[#063c5a] shadow-sm transition-all flex items-center gap-2"
            >
              <span>Acompanhar em Meus Documentos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* 3. Formulário Principal em 2 Colunas */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda (7 colunas): 1. Selecionar Documento */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FilePlus2 className="w-4 h-4 text-[#085078] dark:text-cyan-400" />
                  <span>1. Selecionar Documento</span>
                </h3>
              </div>

              {/* Toggle de Categoria: Padrão Tabs Unificadas */}
              <div className="p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50 grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setIsSupplementary(false)}
                  className={`h-9 px-3 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    !isSupplementary
                      ? 'bg-[#085078] hover:bg-[#063c5a] text-white dark:bg-[#085078] dark:hover:bg-[#063c5a] dark:text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 font-medium'
                  }`}
                >
                  <span>Documentação Principal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSupplementary(true)}
                  className={`h-9 px-3 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSupplementary
                      ? 'bg-[#085078] hover:bg-[#063c5a] text-white dark:bg-[#085078] dark:hover:bg-[#063c5a] dark:text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 font-medium'
                  }`}
                >
                  <span>Documentos Complementares</span>
                </button>
              </div>

              {!isSupplementary ? (
                /* Lista de Opções de Documentos Principais do Estudante */
                <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                  {applicableChecklistDocs.map((doc) => {
                    const isSelected = selectedDocId === doc.id;
                    const isApproved = doc.status === 'APROVADO';
                    const isInReview = doc.status === 'EM_ANALISE';
                    const isRejected = doc.status === 'RECUSADO';
                    const isExpiring = doc.status === 'VENCENDO' || doc.status === 'EXPIRADO';

                    const statusBorder = isApproved
                      ? 'border-l-emerald-500'
                      : isInReview
                      ? 'border-l-amber-500'
                      : isRejected
                      ? 'border-l-rose-500'
                      : isExpiring
                      ? 'border-l-amber-500'
                      : 'border-l-rose-500';

                    const badgeClass = isApproved
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50'
                      : isInReview
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/50'
                      : isRejected
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/70 dark:border-rose-900/40';

                    const dotClass = isApproved
                      ? 'bg-emerald-500'
                      : isInReview
                      ? 'bg-amber-500'
                      : 'bg-rose-500';

                    const badgeLabel = isApproved
                      ? 'Aprovado'
                      : isInReview
                      ? 'Em Análise'
                      : isRejected
                      ? 'Recusado'
                      : 'Pendente';

                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`p-3.5 rounded-xl border border-l-4 cursor-pointer transition-all ${statusBorder} ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 shadow-2xs'
                            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {doc.nomeExibicao}
                            </p>
                            {doc.descricao && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {doc.descricao}
                              </p>
                            )}
                          </div>

                          {/* Status Badge com Dot */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
                            <span>{badgeLabel}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Lista de Opções de Documentos Complementares & Apoio */
                <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                  {applicableSupplementaryOptions.map((opt, idx) => {
                    const isSelected = selectedSupplementaryIndex === idx;
                    const existingDoc = student.documentos.find(
                      (d) => d.nomeExibicao === opt.nomeExibicao
                    );

                    const isApproved = existingDoc?.status === 'APROVADO';
                    const isInReview = existingDoc?.status === 'EM_ANALISE';
                    const isRejected = existingDoc?.status === 'RECUSADO';
                    const isExpiring = existingDoc?.status === 'VENCENDO' || existingDoc?.status === 'EXPIRADO';

                    const statusBorder = !existingDoc
                      ? 'border-l-slate-300 dark:border-l-slate-700'
                      : isApproved
                      ? 'border-l-emerald-500'
                      : isInReview
                      ? 'border-l-amber-500'
                      : isRejected
                      ? 'border-l-rose-500'
                      : isExpiring
                      ? 'border-l-amber-500'
                      : 'border-l-rose-500';

                    const badgeClass = !existingDoc
                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      : isApproved
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50'
                      : isInReview
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/50'
                      : isRejected
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/70 dark:border-rose-900/40';

                    const dotClass = !existingDoc
                      ? 'bg-slate-400 dark:bg-slate-500'
                      : isApproved
                      ? 'bg-emerald-500'
                      : isInReview
                      ? 'bg-amber-500'
                      : 'bg-rose-500';

                    const badgeLabel = !existingDoc
                      ? 'Disponível'
                      : isApproved
                      ? 'Aprovado'
                      : isInReview
                      ? 'Em Análise'
                      : isRejected
                      ? 'Recusado'
                      : 'Pendente';

                    return (
                      <div
                        key={opt.nomeExibicao}
                        onClick={() => setSelectedSupplementaryIndex(idx)}
                        className={`p-3.5 rounded-xl border border-l-4 cursor-pointer transition-all ${statusBorder} ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 shadow-2xs'
                            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {opt.nomeExibicao}
                            </p>
                            {opt.descricao && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {opt.descricao}
                              </p>
                            )}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
                            <span>{badgeLabel}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita (5 colunas): 2. Anexar Arquivo & Pré-visualização */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#085078] dark:text-cyan-400" />
                  <span>2. Anexar Arquivo & Pré-visualização</span>
                </h3>
              </div>

              {!selectedFile ? (
                <div className="space-y-4">
                  {/* Drag-and-Drop Dropzone com Borda Pontilhada Suave e Fundo Neutro */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-[#085078] dark:border-cyan-400 bg-[#085078]/5 dark:bg-cyan-500/10 scale-[0.99]'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-[#085078] dark:hover:border-cyan-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />

                    <div className="w-14 h-14 mx-auto rounded-2xl bg-[#085078]/10 dark:bg-cyan-500/10 flex items-center justify-center text-[#085078] dark:text-cyan-400 mb-3.5">
                      <UploadCloud className="w-7 h-7 text-[#085078] dark:text-cyan-400" />
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      Clique para buscar ou arraste o arquivo aqui
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      Formatos aceitos: <strong>PDF, PNG, JPG</strong> (Tamanho máximo: <strong>10 MB</strong>)
                    </p>
                  </div>

                  {/* Atalhos: Botões Secundários / Ghost */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-semibold text-xs sm:text-sm transition-all active:scale-95 shadow-2xs"
                    >
                      <Camera className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span>Tirar Foto com a Câmera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-semibold text-xs sm:text-sm transition-all active:scale-95 shadow-2xs"
                    >
                      <FolderOpen className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span>Buscar na Galeria / Pastas</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Arquivo Selecionado e Painel de Pré-visualização */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#085078]/10 dark:bg-cyan-500/10 text-[#085078] dark:text-cyan-400 flex items-center justify-center font-bold shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {formatBytes(selectedFile.size)} • {selectedFile.type || 'Documento'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreviewUrl(null);
                        setPipelineStep(0);
                      }}
                      className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                    >
                      Trocar Arquivo
                    </button>
                  </div>

                  {/* Frame de Pré-visualização */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800/80 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-[#085078] dark:text-cyan-400" />
                        Pré-visualização de Legibilidade
                      </span>

                      {isImageFile && (
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                          <button
                            type="button"
                            onClick={handleZoomOut}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded"
                            title="Diminuir Zoom"
                          >
                            <ZoomOut className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-mono px-1 font-bold text-slate-600 dark:text-slate-300">
                            {zoomLevel}%
                          </span>
                          <button
                            type="button"
                            onClick={handleZoomIn}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded"
                            title="Aumentar Zoom"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-700 mx-1" />
                          <button
                            type="button"
                            onClick={handleRotate}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded"
                            title="Girar 90°"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900/5 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[200px] max-h-[320px] flex items-center justify-center overflow-auto p-2">
                      {isImageFile && filePreviewUrl ? (
                        <div
                          className="transition-transform duration-200 flex items-center justify-center"
                          style={{
                            transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={filePreviewUrl}
                            alt="Pré-visualização do documento"
                            className="max-h-[280px] object-contain rounded-lg shadow-md"
                          />
                        </div>
                      ) : (
                        <div className="text-center p-6 space-y-2">
                          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
                            <FileText className="w-6 h-6" />
                          </div>
                          <p className="font-bold text-xs text-slate-800 dark:text-white">
                            Documento PDF pronto para envio
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                            O arquivo PDF será processado com validação de integridade criptográfica.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pipeline de Segurança & Integridade */}
                  <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 text-slate-200 space-y-3 font-mono text-xs shadow-md border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-cyan-400 font-bold uppercase">
                      <div className="flex items-center gap-1.5">
                        <Cpu className="w-4 h-4" />
                        <span>Validação de Segurança & Integridade</span>
                      </div>
                      <span>Etapa {pipelineStep}/3</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">1. Inspeção de Magic Bytes:</span>
                        {magicBytesStatus === 'CHECKING' && (
                          <span className="text-amber-400 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Verificando assinatura...
                          </span>
                        )}
                        {magicBytesStatus === 'VALID' && (
                          <span className="text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Assinatura Válida (%PDF-/JPEG/PNG)
                          </span>
                        )}
                        {magicBytesStatus === 'INVALID' && (
                          <span className="text-rose-400 font-bold">Rejeitado</span>
                        )}
                      </div>

                      {pipelineStep >= 2 && (
                        <div className="space-y-1 text-[10px] bg-slate-950 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>2. Hash SHA-256 (Integridade):</span>
                            <span className="text-cyan-300 font-bold">{simulatedHash.substring(0, 16)}...</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>3. Storage Privado UUID:</span>
                            <span className="text-emerald-400">{simulatedUuid}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Mensagem de Erro */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Botão Primário de Confirmação e Envio */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!selectedFile || isProcessing || pipelineStep < 2}
                  onClick={handleSubmit}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#085078] hover:bg-[#063c5a] dark:bg-[#085078] dark:hover:bg-[#063c5a] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processando & Enviando Arquivo...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-cyan-300" />
                      <span>Confirmar & Enviar Documento</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
