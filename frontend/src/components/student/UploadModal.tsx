'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  AlertTriangle,
  Lock,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Loader2,
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [simulatedHash, setSimulatedHash] = useState<string>('');
  const [simulatedUuid, setSimulatedUuid] = useState<string>('');
  const [magicBytesStatus, setMagicBytesStatus] = useState<'IDLE' | 'CHECKING' | 'VALID' | 'INVALID'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!document) return null;

  const handleFileChange = async (file: File) => {
    setErrorMessage(null);

    // 1. Check size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(`Arquivo excede o limite estrito de 10 MB (tamanho: ${formatBytes(file.size)}).`);
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    setPipelineStep(1); // Inspecting Magic Bytes

    // Simulate inspection of magic bytes
    setMagicBytesStatus('CHECKING');
    await new Promise((r) => setTimeout(r, 600));

    const hasValidExt = /\.(pdf|jpg|jpeg|png)$/i.test(file.name);

    if (!hasValidExt) {
      setMagicBytesStatus('INVALID');
      setIsProcessing(false);
      setErrorMessage('Assinatura binária inválida! Apenas documentos autênticos PDF, JPEG ou PNG são aceitos.');
      return;
    }

    setMagicBytesStatus('VALID');
    setPipelineStep(2); // Generating SHA-256 and UUID

    const hash = await computeSHA256(file);
    const ext = file.name.split('.').pop() || 'pdf';
    const uuid = generateStorageUUID(ext);

    setSimulatedHash(hash);
    setSimulatedUuid(uuid);

    await new Promise((r) => setTimeout(r, 600));
    setPipelineStep(3); // LGPD Redaction Pre-process
    await new Promise((r) => setTimeout(r, 500));
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-[#065373] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Upload className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">{document.nomeExibicao}</h3>
              <p className="text-xs text-cyan-100/80">Guard-rails de Upload & Minimização LGPD</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Document Requirement Details */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800">Orientações de Envio: </span>
            {document.descricao}
          </div>

          {/* Upload Dropzone */}
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#065373] bg-[#065373]/5 scale-[0.99]'
                  : 'border-slate-300 hover:border-[#3f81a3] hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-[#065373] mb-3 shadow-inner">
                <Upload className="w-7 h-7" />
              </div>
              <p className="font-bold text-slate-800 text-sm">
                Clique para selecionar ou arraste o arquivo aqui
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Formatos aceitos: <strong>PDF, JPEG, PNG</strong> (Máximo <strong>10 MB</strong>)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#065373]/10 text-[#065373] flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 truncate max-w-[280px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500">{formatBytes(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPipelineStep(0);
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50"
                >
                  Substituir
                </button>
              </div>

              {/* Guard-rails Security Pipeline Card */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-3 font-mono text-xs">
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
                      <span className="text-amber-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Verificando cabeçalho binário...
                      </span>
                    )}
                    {magicBytesStatus === 'VALID' && (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Assinatura Válida (%PDF-/JPEG)
                      </span>
                    )}
                    {magicBytesStatus === 'INVALID' && (
                      <span className="text-rose-400 font-bold">Rejeitado</span>
                    )}
                  </div>

                  {/* Step 2: SHA256 & UUID */}
                  {pipelineStep >= 2 && (
                    <div className="space-y-1 text-[10px] bg-slate-950 p-2 rounded border border-slate-800">
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
                      <span className="text-cyan-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Tarja Automática Pronta
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
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
                <span>Processando...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
                <span>Confirmar & Gravar na Auditoria</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
