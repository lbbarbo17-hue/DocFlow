export type UserRole = 'ESTUDANTE' | 'COORDENADOR' | 'SUPERADMIN';

export type TipoVinculo = 'ESTAGIARIO' | 'APRENDIZ';

export type TipoDocumento =
  | 'RG'
  | 'CPF'
  | 'COMPROVANTE_RESIDENCIA'
  | 'COMPROVANTE_MATRICULA'
  | 'CONTRATO_TCE'
  | 'DOC_RESPONSAVEL'
  | 'TITULO_ELEITOR'
  | 'CERTIFICADO_RESERVISTA'
  | 'CARTEIRA_TRABALHO'
  | 'DADOS_BANCARIOS'
  | 'APOLICE_SEGURO'
  | 'OUTROS_ANEXOS';

export type StatusDocumento =
  | 'PENDENTE'
  | 'EM_ANALISE'
  | 'APROVADO'
  | 'RECUSADO'
  | 'EXPIRADO'
  | 'VENCENDO';

export type NivelRisco = 'BAIXO' | 'MEDIO' | 'CRITICO';

export interface DocumentItem {
  id: string;
  tipo: TipoDocumento;
  nomeExibicao: string;
  descricao: string;
  obrigatorio: boolean;
  status: StatusDocumento;
  condicional?: string; // ex: 'Necessário para menores de 18 anos', 'Necessário para +18 anos'
  categoria?: 'OBRIGATORIO' | 'IDENTIFICACAO_APOIO' | 'COMPLEMENTAR';
  recorrente?: boolean; // Para documentos periódicos (ex: Matrícula semestral)
  protecaoLgpd?: boolean; // Indicador de dados sensíveis e anonimização
  observacaoValidade?: string;
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
  tipoVinculo: TipoVinculo;
  dataNascimento?: string;
  idade?: number;
  genero?: 'M' | 'F' | 'OUTRO';
  menorDeIdade?: boolean;
  dataAdmissao?: string;
  turmaId: string;
  turmaNome: string;
  curso: string;
  empresa: string;
  instituicao?: string;
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
  instituicao?: string;
}

export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  ramoAtuacao: string;
  contatoRh: string;
  emailRh: string;
  telefone?: string;
  cidadeUf?: string;
}

export interface SystemUser {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  cargo: string;
  status: 'ATIVO' | 'INATIVO';
  ultimoAcesso: string;
  instituicao?: string;
}

export type AuditAction =
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_APPROVAL'
  | 'DOCUMENT_REJECTION'
  | 'DOCUMENT_VIEW_REDACTED'
  | 'DOCUMENT_VIEW_UNMASKED'
  | 'DOSSIER_BULK_DOWNLOAD'
  | 'USER_ROLE_CHANGED'
  | 'SYSTEM_CONFIG_UPDATED'
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
