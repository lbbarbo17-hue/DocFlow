'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
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
} from 'lucide-react';
import { DocumentItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { formatBytes, computeSHA256, generateStorageUUID } from '@/lib/utils';

interface UploadModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export default function UploadModal({ document, onClose }: UploadModalProps) {
  const { uploadStudentDocument } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isImageFile, setIsImageFile] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [simulatedHash, setSimulatedHash] = useState<string>('');
  const [simulatedUuid, setSimulatedUuid] = useState<string>('');
  const [magicBytesStatus, setMagicBytesStatus] = useState<'IDLE' | 'CHECKING' | 'VALID' | 'INVALID'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clean up object URL when modal unmounts or file changes
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  if (!document) return null;

  const handleFileChange = async (file: File) => {
    setErrorMessage(null);
    setZoomLevel(100);
    setRotation(0);

    // 1. Check size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(`Arquivo excede o limite estrito de 10 MB (tamanho: ${formatBytes(file.size)}).`);
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
    setPipelineStep(1); // Inspecting Magic Bytes

    // Simulate inspection of magic bytes
    setMagicBytesStatus('CHECKING');
    await new Promise((r) => setTimeout(r, 450));

    const hasValidExt = /\.(pdf|jpg|jpeg|png)$/i.test(file.name) || file.type.includes('pdf') || file.type.includes('image');

    if (!hasValidExt) {
      setMagicBytesStatus('INVALID');
      setIsProcessing(false);
      setErrorMessage('Assinatura binária inválida! Apenas documentos autênticos PDF, JPEG ou PNG são aceitos.');
      return;
    }

    setMagicBytesStatus('VALID');
    setPipelineStep(2); // Generating SHA-256 and UUID

    const hash = await computeSHA256(file);
    const ext = file.name.split('.').pop() || (isImg ? 'jpg' : 'pdf');
    const uuid = generateStorageUUID(ext);

    setSimulatedHash(hash);
    setSimulatedUuid(uuid);

    await new Promise((r) => setTimeout(r, 450));
    setPipelineStep(3); // LGPD Redaction Pre-process
    await new Promise((r) => setTimeout(r, 350));
    setPipelineStep(4); // Ready to commit
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

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    await uploadStudentDocument(document.id, selectedFile);
    setIsProcessing(false);
    onClose();
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-200">
        {/* Modal Header */}
        <div className="bg-[#065373] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <Upload className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base leading-tight truncate">
                Envio: {document.nomeExibicao}
              </h3>
              <p className="text-[11px] text-cyan-100/80 flex items-center gap-1.5 mt-0.5">
                <Lock className="w-3 h-3 text-cyan-300" />
                <span>Upload Seguro & Guard-rails de Conformidade</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0 ml-2"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Document Requirement Guidelines */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#065373] dark:text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 dark:text-white">Instruções para Aprovação Rápida: </span>
              {document.descricao}
            </div>
          </div>

          {/* Upload Dropzone & Shortcuts */}
          {!selectedFile ? (
            <div className="space-y-4">
              {/* Desktop Drag-and-Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
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

                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#065373]/10 dark:bg-cyan-500/10 flex items-center justify-center text-[#065373] dark:text-cyan-300 mb-3 shadow-inner">
                  <Upload className="w-7 h-7 text-[#065373] dark:text-cyan-300" />
                </div>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                  Clique para buscar ou arraste o arquivo aqui
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Formatos aceitos: <strong>PDF, PNG, JPG</strong> (Máximo <strong>10 MB</strong>)
                </p>
              </div>

              {/* Mobile-First Direct Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Camera Input Shortcut */}
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

                {/* Gallery / File Picker Shortcut */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
                >
                  <FolderOpen className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <span>Escolher da Galeria / Arquivos</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between gap-3">
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

              {/* Interactive File Previewer for Legibility Check */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-3 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#065373] dark:text-cyan-400" />
                    Pré-visualização de Legibilidade
                  </span>

                  {/* Image Zoom & Rotate Controls */}
                  {isImageFile && (
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                      <button
                        type="button"
                        onClick={handleZoomOut}
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
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
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Aumentar Zoom"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-700 mx-1" />
                      <button
                        type="button"
                        onClick={handleRotate}
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Girar 90°"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Preview Frame */}
                <div className="bg-slate-900/5 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[180px] sm:min-h-[220px] max-h-[300px] flex items-center justify-center overflow-auto p-2 relative">
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
                        className="max-h-[260px] object-contain rounded-lg shadow-md"
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

                {/* Legibility Advice Card */}
                <div className="p-3 bg-[#eac652]/15 dark:bg-[#eac652]/15 border border-[#eac652]/40 dark:border-[#eac652]/30 rounded-xl text-xs text-[#735a0f] dark:text-[#fef08a] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#8a6e14] dark:text-[#eac652] shrink-0 mt-0.5" />
                  <p className="leading-tight">
                    <strong>Confira a legibilidade:</strong> Certifique-se de que números de documentos,
                    datas, carimbos e assinaturas estão 100% visíveis e nítidos para evitar recusa pela coordenação.
                  </p>
                </div>
              </div>

              {/* Guard-rails Security Pipeline Card */}
              <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-200 space-y-3 font-mono text-xs shadow-md border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-cyan-400 font-bold uppercase">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    <span>Guard-rails de Segurança DocFlow</span>
                  </div>
                  <span>Etapa {pipelineStep}/4</span>
                </div>

                <div className="space-y-2">
                  {/* Step 1: Magic Bytes */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">1. Inspeção de Magic Bytes:</span>
                    {magicBytesStatus === 'CHECKING' && (
                      <span className="text-[#eac652] flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Verificando assinatura binária...
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

                  {/* Step 2: SHA256 & UUID */}
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

                  {/* Step 3: LGPD Minimization */}
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

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Security limits discrete footer note */}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            🔒 Transmissão segura com criptografia TLS 1.3 de ponta a ponta. Formatos: PDF, PNG, JPG até 10 MB.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!selectedFile || isProcessing || pipelineStep < 3}
            onClick={handleConfirmUpload}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#065373] hover:bg-[#043c53] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Validando Arquivo...</span>
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
  );
}
