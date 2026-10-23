'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  documentosApi,
  alunosApi,
  healthApi,
  DocumentoResponse,
  AlunoResponse,
  HealthConnectionsResponse,
  ApiError,
} from '@/lib/api';
import {
  HardDrive,
  Database,
  ShieldCheck,
  Cloud,
  RefreshCw,
  Upload,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  FileText,
  Loader2,
  ArrowLeft,
  Filter,
} from 'lucide-react';

const TIPOS_DOCUMENTO = [
  { value: 'RG', label: 'Documento de Identidade (RG)' },
  { value: 'CPF', label: 'Cadastro de Pessoa Física (CPF)' },
  { value: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de Residência' },
  { value: 'COMPROVANTE_MATRICULA', label: 'Comprovante de Matrícula' },
  { value: 'CONTRATO_APRENDIZAGEM', label: 'Contrato de Aprendizagem' },
  { value: 'TERMO_COMPROMISSO_ESTAGIO', label: 'Termo de Compromisso de Estágio' },
  { value: 'OUTROS', label: 'Outros Documentos' },
];

export default function AdminArquivosCrudPage() {
  const { setToastMessage } = useApp();

  const [connections, setConnections] = useState<HealthConnectionsResponse | null>(null);
  const [isCheckingConnections, setIsCheckingConnections] = useState(false);

  const [documentos, setDocumentos] = useState<DocumentoResponse[]>([]);
  const [alunos, setAlunos] = useState<AlunoResponse[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<string>('COMPROVANTE_MATRICULA');
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const [filterTipo, setFilterTipo] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const loadConnections = useCallback(async () => {
    setIsCheckingConnections(true);
    try {
      const data = await healthApi.checkConnections();
      setConnections(data);
    } catch {
      setConnections({
        status: 'degraded',
        database: { connected: false, latency_ms: 0, provider: 'Supabase PostgreSQL' },
        auth: { connected: false, provider: 'Supabase Auth' },
        storage: { connected: false, bucket: 'docflow-documents', provider: 'Cloudflare R2' },
      });
    } finally {
      setIsCheckingConnections(false);
    }
  }, []);

  const loadDocumentosAndAlunos = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const [docsData, alunosData] = await Promise.all([
        documentosApi.listAll().catch(() => []),
        alunosApi.list().catch(() => []),
      ]);
      setDocumentos(docsData);
      setAlunos(alunosData);
      if (alunosData.length > 0 && !selectedAlunoId) {
        setSelectedAlunoId(alunosData[0].id);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao carregar dados';
      setToastMessage({
        title: 'Aviso de Carregamento',
        desc: msg,
        type: 'error',
      });
    } finally {
      setIsLoadingDocs(false);
    }
  }, [selectedAlunoId, setToastMessage]);

  useEffect(() => {
    loadConnections();
    loadDocumentosAndAlunos();
  }, [loadConnections, loadDocumentosAndAlunos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setToastMessage({
          title: 'Arquivo muito grande',
          desc: 'O tamanho limite por documento é de 10 MB.',
          type: 'error',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setToastMessage({
        title: 'Selecione um arquivo',
        desc: 'Escolha um arquivo PDF, PNG ou JPG para enviar ao R2.',
        type: 'error',
      });
      return;
    }

    if (!selectedAlunoId) {
      setToastMessage({
        title: 'Aluno obrigatório',
        desc: 'Selecione um aluno da lista para associar o documento.',
        type: 'error',
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('aluno_id', selectedAlunoId);
      formData.append('tipo', selectedTipo);

      const novoDoc = await documentosApi.upload(formData);
      setDocumentos((prev) => [novoDoc, ...prev]);
      setSelectedFile(null);

      const fileInput = document.getElementById('admin-file-input') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';

      setToastMessage({
        title: 'Upload Realizado com Sucesso!',
        desc: `Documento salvo no Cloudflare R2 e registrado no banco Supabase.`,
        type: 'success',
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao enviar arquivo para o Cloudflare R2.';
      setToastMessage({
        title: 'Erro no Upload',
        desc: msg,
        type: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenDownloadUrl = async (docId: string) => {
    setActionLoadingId(docId);
    try {
      const res = await documentosApi.getDownloadUrl(docId);
      if (res.download_url) {
        window.open(res.download_url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Não foi possível gerar a URL de download.';
      setToastMessage({
        title: 'Erro de Download',
        desc: msg,
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleValidateStatus = async (docId: string, novoStatus: 'APROVADO' | 'RECUSADO') => {
    setActionLoadingId(docId);
    try {
      const updated = await documentosApi.validate(docId, {
        status: novoStatus,
        justificativa_recusa: novoStatus === 'RECUSADO' ? 'Recusado pelo administrador no painel de teste.' : undefined,
      });
      setDocumentos((prev) => prev.map((d) => (d.id === docId ? updated : d)));
      setToastMessage({
        title: 'Status Atualizado',
        desc: `Documento marcado como ${novoStatus}.`,
        type: 'success',
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao atualizar status do documento.';
      setToastMessage({
        title: 'Erro na Validação',
        desc: msg,
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteDocumento = async (docId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este documento do Supabase e do Cloudflare R2?')) {
      return;
    }

    setActionLoadingId(docId);
    try {
      await documentosApi.delete(docId);
      setDocumentos((prev) => prev.filter((d) => d.id !== docId));
      setToastMessage({
        title: 'Documento Excluído',
        desc: 'Registro removido do banco de dados e arquivo deletado do bucket R2.',
        type: 'info',
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao excluir documento.';
      setToastMessage({
        title: 'Erro na Exclusão',
        desc: msg,
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredDocs = documentos.filter((doc) => {
    if (filterTipo !== 'ALL' && doc.tipo !== filterTipo) return false;
    if (filterStatus !== 'ALL' && doc.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchPath = doc.storage_path.toLowerCase().includes(term);
      const matchHash = doc.file_hash.toLowerCase().includes(term);
      const matchTipo = doc.tipo.toLowerCase().includes(term);
      if (!matchPath && !matchHash && !matchTipo) return false;
    }
    return true;
  });

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#065373] dark:text-cyan-400 hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Controle Global</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <HardDrive className="w-6 h-6 text-[#065373] dark:text-cyan-400" />
            <span>Gestão Isolada de Arquivos & Conexões</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Ambiente do Administrador para teste em tempo real de Cloudflare R2, Supabase PostgreSQL e Supabase Auth.
          </p>
        </div>

        <button
          type="button"
          onClick={loadConnections}
          disabled={isCheckingConnections}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isCheckingConnections ? 'animate-spin text-[#065373]' : ''}`} />
          <span>{isCheckingConnections ? 'Checando...' : 'Diagnosticar Conexões'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">PostgreSQL</span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full ${
                  connections?.database.connected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {connections?.database.connected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
              {connections?.database.provider || 'Supabase DB'}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              {connections?.database.connected ? `Latência: ${connections.database.latency_ms} ms` : 'Desconectado'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Autenticação</span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full ${
                  connections?.auth.connected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {connections?.auth.connected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
              {connections?.auth.provider || 'Supabase Auth'}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              {connections?.auth.connected ? 'OAuth & JWT Ativos' : 'Falha na Autenticação'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Cloud className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Storage S3 / R2</span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full ${
                  connections?.storage.connected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {connections?.storage.connected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
              {connections?.storage.provider || 'Cloudflare R2'}
            </p>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              {connections?.storage.bucket ? `Bucket: ${connections.storage.bucket}` : 'Sem Bucket Configurado'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Upload className="w-5 h-5 text-[#065373] dark:text-cyan-400" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            Upload & Cadastro de Documento de Teste (Create)
          </h2>
        </div>

        <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Arquivo Local (PDF, PNG, JPG até 10MB) *
            </label>
            <input
              id="admin-file-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              disabled={isUploading}
              className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#065373] file:text-white hover:file:bg-[#043c53] cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-slate-50 dark:bg-slate-800"
            />
            {selectedFile && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                Selecionado: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tipo do Documento *
            </label>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              disabled={isUploading}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#065373]"
            >
              {TIPOS_DOCUMENTO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Vincular a Aluno Cadastrado *
            </label>
            <select
              value={selectedAlunoId}
              onChange={(e) => setSelectedAlunoId(e.target.value)}
              disabled={isUploading || alunos.length === 0}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#065373]"
            >
              {alunos.length === 0 ? (
                <option value="">Nenhum aluno encontrado no tenant</option>
              ) : (
                alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome} ({a.matricula || a.cpf})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUploading || !selectedFile || !selectedAlunoId}
              className="px-6 py-2.5 rounded-xl bg-[#065373] hover:bg-[#043c53] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando para Cloudflare R2...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Enviar Documento ao R2</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#065373] dark:text-cyan-400" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Documentos Cadastrados no Storage & Banco (Read, Update, Delete)
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Status: Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="APROVADO">Aprovado</option>
                <option value="RECUSADO">Recusado</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs">
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tipo: Todos</option>
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Buscar por caminho ou hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none max-w-[200px]"
            />

            <button
              type="button"
              onClick={loadDocumentosAndAlunos}
              disabled={isLoadingDocs}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Recarregar tabela"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDocs ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {isLoadingDocs ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#065373] dark:text-cyan-400" />
            <span className="text-xs">Carregando documentos do banco de dados...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-12 text-center space-y-2 text-slate-400">
            <HardDrive className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-xs font-semibold">Nenhum documento encontrado com os filtros atuais.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Tipo & Caminho no R2</th>
                  <th className="py-3 px-4">Hash SHA-256</th>
                  <th className="py-3 px-4">Tamanho</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Data Envio</th>
                  <th className="py-3 px-4 text-right">Ações CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDocs.map((doc) => {
                  const isOperating = actionLoadingId === doc.id;
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 dark:text-slate-100 block">
                          {doc.tipo}
                        </span>
                        <span
                          className="font-mono text-[10px] text-slate-400 block truncate max-w-[280px]"
                          title={doc.storage_path}
                        >
                          {doc.storage_path}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-600 dark:text-slate-300 truncate max-w-[120px]" title={doc.file_hash}>
                            {doc.file_hash.slice(0, 12)}...
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(doc.file_hash)}
                            className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Copiar Hash Completo"
                          >
                            {copiedHash === doc.file_hash ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {formatFileSize(doc.tamanho_bytes)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            doc.status === 'APROVADO'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : doc.status === 'RECUSADO'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-BR') : '-'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDownloadUrl(doc.id)}
                            disabled={isOperating}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer disabled:opacity-50"
                            title="Abrir no Cloudflare R2 via Presigned URL"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleValidateStatus(doc.id, 'APROVADO')}
                            disabled={isOperating || doc.status === 'APROVADO'}
                            className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 cursor-pointer disabled:opacity-40"
                            title="Aprovar Documento"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleValidateStatus(doc.id, 'RECUSADO')}
                            disabled={isOperating || doc.status === 'RECUSADO'}
                            className="p-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 cursor-pointer disabled:opacity-40"
                            title="Recusar Documento"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteDocumento(doc.id)}
                            disabled={isOperating}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 cursor-pointer disabled:opacity-50"
                            title="Excluir Permanentemente do R2 e Banco"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
