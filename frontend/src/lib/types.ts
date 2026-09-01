export type UserRole = 'ESTUDANTE' | 'COORDENADOR' | 'GESTOR_RH' | 'DPO';

export type TipoDocumento =
  | 'RG'
  | 'CPF'
  | 'COMPROVANTE_RESIDENCIA'
  | 'COMPROVANTE_MATRICULA'
  | 'CONTRATO_TCE';

export type StatusDocumento =
  | 'PENDENTE'
  | 'EM_ANALISE'
  | 'APROVADO'
  | 'RECUSADO'
  | 'EXPIRADO';

export type NivelRisco = 'BAIXO' | 'MEDIO' | 'CRITICO';

export interface DocumentItem {
  id: string;
  tipo: TipoDocumento;
  nomeExibicao: string;
  descricao: string;
  obrigatorio: boolean;
  status: StatusDocumento;
  nomeArquivoOriginal?: string;
  storageUuid?: string;
  tamanhoBytes?: number;
  mimeType?: string;
  fileHashSha256?: string;
  dataEnvio?: string;
  validadeAte?: string; // ex: 2026-12-31 para Matrícula Semestral
  diasParaVencer?: number;
  justificativaRecusa?: string;
  aprovadoPor?: string;
  dataAvaliacao?: string;
  conteudoSensivelSimulado?: {
    rgNumero?: string;
    rgFiliacaoMae?: string;
    rgFiliacaoPai?: string;
    rgDataNascimento?: string;
    cpfNumero?: string;
    enderecoCompleto?: string;
    semestreAtual?: string;
    instituicaoEnsino?: string;
    empresaConcedente?: string;
    valorBolsa?: string;
  };
}

export interface Student {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  matricula: string;
  turmaId: string;
  turmaNome: string;
  curso: string;
  empresa: string;
  avatarUrl?: string;
  documentos: DocumentItem[];
  percentualConformidade: number; // 0 - 100
  nivelRisco: NivelRisco;
  statusGeral: 'REGULAR' | 'PENDENTE' | 'ALERTA_CRITICO';
}

export interface Turma {
  id: string;
  codigo: string;
  nomeCurso: string;
  periodo: string;
  totalAlunos: number;
  conformidadeMedia: number;
  alunosEmRisco: number;
  alunosRegulares: number;
}

export type AuditAction =
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_APPROVAL'
  | 'DOCUMENT_REJECTION'
  | 'DOCUMENT_VIEW_REDACTED'
  | 'DOCUMENT_VIEW_UNMASKED'
  | 'DOSSIER_BULK_DOWNLOAD'
  | 'LGPD_CONSENT_REGISTER'
  | 'SYSTEM_MAGIC_BYTES_VALIDATION';

export interface AuditLog {
  id: string;
  timestampUtc: string;
  userId: string;
  userNome: string;
  userRole: UserRole;
  action: AuditAction;
  resourceId: string;
  resourceTipo: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  detalhes: string;
  sha256Hash: string;
  storageUuid?: string;
}
