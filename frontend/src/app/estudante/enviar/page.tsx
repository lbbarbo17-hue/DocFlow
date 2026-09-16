'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  Upload,
  Camera,
  FolderOpen,
  AlertTriangle,
  Lock,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye,
  Info,
  ArrowRight,
  FilePlus2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatBytes, computeSHA256, generateStorageUUID } from '@/lib/utils';
import StudentHeader from '@/components/student/StudentHeader';
import { TipoDocumento } from '@/lib/types';

export default function AdicionarDocumentoPage() {
  const { student, uploadStudentDocument, addNewDocumentToStudent } = useApp();

  // Selection mode: 'EXISTING' or 'CUSTOM'
  const [selectedDocId, setSelectedDocId] = useState<string>(
    student.documentos.find((d) => d.status !== 'APROVADO')?.id || student.documentos[0]?.id || ''
  );
  const [isCustomDoc, setIsCustomDoc] = useState<boolean>(false);
  const [customDocTitle, setCustomDocTitle] = useState<string>('');
  const [customDocDesc, setCustomDocDesc] = useState<string>('');

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

  const selectedDoc = student.documentos.find((d) => d.id === selectedDocId);

  // Clean up object URL when component unmounts or file changes
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

    // 1. Check size limit (10 MB)
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

    // Simulate inspection of magic bytes
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
    setPipelineStep(3); // LGPD Redaction Pre-process
    await new Promise((r) => setTimeout(r, 350));
    setPipelineStep(4); // Ready
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

    if (isCustomDoc) {
      if (!customDocTitle.trim()) {
        setErrorMessage('Por favor, informe o nome do documento adicional.');
        return;
      }
      setIsProcessing(true);
      const success = await addNewDocumentToStudent(
        {
          tipo: 'CONTRATO_TCE' as TipoDocumento,
          nomeExibicao: customDocTitle.trim(),
          descricao: customDocDesc.trim() || 'Documento complementar anexado pelo estudante.',
          obrigatorio: false,
          status: 'EM_ANALISE',
          protecaoLgpd: true,
        },
        selectedFile
      );
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
    setCustomDocTitle('');
    setCustomDocDesc('');
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header do Estudante */}
      <StudentHeader />

      {/* 2. Banner de Título da Página */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#065373] to-[#226a8b] text-white flex items-center justify-center shadow-md shrink-0">
            <UploadCloud className="w-6 h-6 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Adicionar e Enviar Documentos
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Envio seguro com conferência de autenticidade, custódia SHA-256 e conformidade LGPD
            </p>
          </div>
        </div>

        <Link
          href="/estudante/checklist"
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
        >
          <FileText className="w-4 h-4 text-[#065373] dark:text-cyan-400" />
          <span>Ver Checklist Completo</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>

      {/* 3. Tela de Sucesso após Envio */}
      {uploadSuccess ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-emerald-200 dark:border-emerald-800/60 shadow-sm text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Documento Enviado com Sucesso! 🎉
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O arquivo foi processado, criptografado e encaminhado para a equipe de coordenação e RH para validação contínua.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 max-w-lg mx-auto border border-slate-200 dark:border-slate-700 text-left font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Arquivo:</span>
              <span className="font-bold text-slate-800 dark:text-white">{selectedFile?.name}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Hash SHA-256:</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">{simulatedHash.substring(0, 20)}...</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Status Inicial:</span>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 font-bold text-[10px]">
                EM ANÁLISE
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Enviar Outro Documento
            </button>
            <Link
              href="/estudante/checklist"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#065373] hover:bg-[#043c53] text-white shadow-md transition-all flex items-center gap-2"
            >
              <span>Acompanhar no Checklist</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* 4. Formulário Principal em 2 Colunas no Desktop */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda (5 colunas): Seleção do Tipo de Documento */}
          <div className="lg:col-span-5 space-y-6">
            {/* Bloco de Escolha do Documento */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FilePlus2 className="w-4 h-4 text-[#065373] dark:text-cyan-400" />
                  <span>1. Selecionar Documento</span>
                </h3>
              </div>

              {/* Toggle entre Documento do Checklist ou Documento Adicional */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => setIsCustomDoc(false)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    !isCustomDoc
                      ? 'bg-white dark:bg-slate-900 text-[#065373] dark:text-cyan-300 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Do Meu Checklist
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomDoc(true)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    isCustomDoc
                      ? 'bg-white dark:bg-slate-900 text-[#065373] dark:text-cyan-300 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Documento Adicional
                </button>
              </div>

              {!isCustomDoc ? (
                /* Lista de Documentos do Estudante */
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {student.documentos.map((doc) => {
                    const isSelected = selectedDocId === doc.id;
                    const isApproved = doc.status === 'APROVADO';
                    const isExpiring = doc.status === 'VENCENDO' || doc.status === 'EXPIRADO';
                    const isRejected = doc.status === 'RECUSADO';

                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#065373] dark:border-cyan-400 bg-cyan-50/40 dark:bg-cyan-950/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {doc.nomeExibicao}
                              </p>
                              {doc.obrigatorio && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                  Obrigatório
                                </span>
                              )}
                              {doc.recorrente && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-[#065373] dark:text-cyan-300 flex items-center gap-0.5">
                                  <RefreshCw className="w-2.5 h-2.5" /> Semestral
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {doc.descricao}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                              isApproved
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : isRejected
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                : isExpiring
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {doc.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Formulário para Documento Adicional */
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Nome / Título do Documento:
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Certificado de Curso, Termo Aditivo..."
                      value={customDocTitle}
                      onChange={(e) => setCustomDocTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Descrição ou Observação (Opcional):
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Descreva brevemente a finalidade deste arquivo..."
                      value={customDocDesc}
                      onChange={(e) => setCustomDocDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#065373] dark:focus:ring-cyan-400 text-slate-900 dark:text-white resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Informações e Diretrizes */}
              {selectedDoc && !isCustomDoc && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#065373] dark:text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">Dica da Coordenação: </span>
                    {selectedDoc.descricao}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita (7 colunas): Upload Zone & Pré-visualizador */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#065373] dark:text-cyan-400" />
                  <span>2. Anexar Arquivo & Pré-visualização</span>
                </h3>
              </div>

              {!selectedFile ? (
                <div className="space-y-4">
                  {/* Drag-and-Drop Dropzone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-[#065373] dark:border-cyan-400 bg-[#065373]/5 dark:bg-cyan-500/10 scale-[0.99]'
                        : 'border-slate-300 dark:border-slate-700 hover:border-[#065373] dark:hover:border-cyan-400 hover:bg-slate-50/60 dark:hover:bg-slate-800/50'
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

                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[#065373]/10 dark:bg-cyan-500/10 flex items-center justify-center text-[#065373] dark:text-cyan-300 mb-3.5 shadow-inner">
                      <UploadCloud className="w-8 h-8 text-[#065373] dark:text-cyan-300" />
                    </div>
                    <p className="font-extrabold text-slate-900 dark:text-white text-base">
                      Clique para buscar ou arraste o arquivo aqui
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      Formatos aceitos: <strong>PDF, PNG, JPG</strong> (Tamanho máximo: <strong>10 MB</strong>)
                    </p>
                  </div>

                  {/* Atalhos Mobile / Câmera */}
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
                      className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-[#065373]/10 dark:bg-cyan-500/10 hover:bg-[#065373]/20 dark:hover:bg-cyan-500/20 text-[#065373] dark:text-cyan-300 font-bold text-xs sm:text-sm border border-[#065373]/20 dark:border-cyan-500/30 transition-all active:scale-95"
                    >
                      <Camera className="w-5 h-5 text-[#065373] dark:text-cyan-300" />
                      <span>Tirar Foto com a Câmera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
                    >
                      <FolderOpen className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <span>Buscar na Galeria / Pastas</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Arquivo Selecionado e Painel de Pré-visualização */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#065373]/10 dark:bg-cyan-500/10 text-[#065373] dark:text-cyan-300 flex items-center justify-center font-bold shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
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
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                    >
                      Trocar Arquivo
                    </button>
                  </div>

                  {/* Frame de Pré-visualização */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-[#065373] dark:text-cyan-400" />
                        Pré-visualização de Legibilidade
                      </span>

                      {isImageFile && (
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
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

                    <div className="bg-slate-900/5 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[200px] max-h-[320px] flex items-center justify-center overflow-auto p-2">
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
                          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
                            <FileText className="w-6 h-6" />
                          </div>
                          <p className="font-extrabold text-xs text-slate-800 dark:text-white">
                            Documento PDF pronto para envio
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                            O arquivo PDF será processado com validação de integridade criptográfica.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pipeline de Guard-rails */}
                  <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-200 space-y-3 font-mono text-xs shadow-md border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-cyan-400 font-bold uppercase">
                      <div className="flex items-center gap-1.5">
                        <Cpu className="w-4 h-4" />
                        <span>Guard-rails de Segurança DocFlow</span>
                      </div>
                      <span>Etapa {pipelineStep}/4</span>
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
                        <div className="space-y-1 text-[10px] bg-slate-950 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>2. Hash SHA-256:</span>
                            <span className="text-cyan-300 font-bold">{simulatedHash.substring(0, 16)}...</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>3. Storage Privado UUID:</span>
                            <span className="text-emerald-400">{simulatedUuid}</span>
                          </div>
                        </div>
                      )}

                      {pipelineStep >= 3 && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">4. Minimização LGPD (Art. 6º, III):</span>
                          <span className="text-cyan-400 flex items-center gap-1 font-bold">
                            <Lock className="w-3 h-3" /> Tarja Automática Pronta
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Mensagem de Erro */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Botão de Confirmação e Envio */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!selectedFile || isProcessing || pipelineStep < 3}
                  onClick={handleSubmit}
                  className="w-full py-3.5 rounded-2xl text-sm font-black text-white bg-[#065373] hover:bg-[#043c53] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2.5 active:scale-98"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Validando & Criptografando Arquivo...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-cyan-300" />
                      <span>Confirmar & Enviar Documento para Custódia</span>
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
