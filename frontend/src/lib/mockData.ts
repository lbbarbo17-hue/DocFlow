import { Student, Turma, Empresa, Instituicao, AuditLog, SystemUser } from './types';

export const INITIAL_INSTITUICOES: Instituicao[] = [
  {
    id: 'inst-01',
    razaoSocial: 'ETEC Politécnica de São Paulo',
    nomeFantasia: 'ETEC Politécnica',
    cnpj: '62.823.257/0001-09',
    cidade: 'São Paulo/SP',
    codigoMec: '35004810',
  },
  {
    id: 'inst-02',
    razaoSocial: 'SENAI Roberto Simonsen',
    nomeFantasia: 'SENAI Brás',
    cnpj: '03.774.819/0001-02',
    cidade: 'São Paulo/SP',
    codigoMec: '35012944',
  },
  {
    id: 'inst-03',
    razaoSocial: 'FATEC São Paulo',
    nomeFantasia: 'FATEC-SP',
    cnpj: '62.823.257/0050-97',
    cidade: 'São Paulo/SP',
    codigoMec: '35000019',
  },
];

export const INITIAL_EMPRESAS: Empresa[] = [
  {
    id: 'emp-01',
    razaoSocial: 'TechCorp Soluções Digitais S.A.',
    nomeFantasia: 'TechCorp',
    cnpj: '12.345.678/0001-90',
    ramoAtuacao: 'Tecnologia da Informação',
    contatoRh: 'Mariana Duarte',
    emailRh: 'rh@techcorp.com.br',
    cidade: 'São Paulo/SP',
    cidadeUf: 'São Paulo/SP',
  },
  {
    id: 'emp-02',
    razaoSocial: 'Inovação & Sistemas Brasil Ltda',
    nomeFantasia: 'InovaTech',
    cnpj: '98.765.432/0001-10',
    ramoAtuacao: 'Consultoria e Software',
    contatoRh: 'Fernando Costa',
    emailRh: 'talentos@inovatech.com.br',
    cidade: 'São Paulo/SP',
    cidadeUf: 'São Paulo/SP',
  },
  {
    id: 'emp-03',
    razaoSocial: 'Alpha Logística & Distribuição',
    nomeFantasia: 'Alpha Log',
    cnpj: '45.123.789/0001-55',
    ramoAtuacao: 'Logística',
    contatoRh: 'Camila Peixoto',
    emailRh: 'rh@alphalog.com.br',
    cidade: 'Campinas/SP',
    cidadeUf: 'Campinas/SP',
  },
  {
    id: 'emp-04',
    razaoSocial: 'Nexus Engenharia e Projetos',
    nomeFantasia: 'Nexus',
    cnpj: '33.888.999/0001-44',
    ramoAtuacao: 'Engenharia',
    contatoRh: 'Rodrigo Lima',
    emailRh: 'contato@nexuseng.com.br',
    cidade: 'São Bernardo do Campo/SP',
    cidadeUf: 'São Bernardo do Campo/SP',
  },
];

export const INITIAL_TURMAS: Turma[] = [
  {
    id: 'turma-ds-01',
    codigo: 'DS-2026.1',
    nomeCurso: 'Técnico em Desenvolvimento de Sistemas',
    periodo: '2026.1 - Manhã',
    instituicao: 'ETEC Politécnica de São Paulo',
    totalAlunos: 0,
    alunosEmRisco: 0,
    alunosRegulares: 0,
    conformidadeMedia: 100,
  },
  {
    id: 'turma-adm-01',
    codigo: 'ADM-2026.1',
    nomeCurso: 'Técnico em Administração',
    periodo: '2026.1 - Tarde',
    instituicao: 'ETEC Politécnica de São Paulo',
    totalAlunos: 0,
    alunosEmRisco: 0,
    alunosRegulares: 0,
    conformidadeMedia: 100,
  },
  {
    id: 'turma-log-01',
    codigo: 'LOG-2026.1',
    nomeCurso: 'Técnico em Logística',
    periodo: '2026.1 - Noite',
    instituicao: 'ETEC Politécnica de São Paulo',
    totalAlunos: 0,
    alunosEmRisco: 0,
    alunosRegulares: 0,
    conformidadeMedia: 100,
  },
];

export const INITIAL_SYSTEM_USERS: SystemUser[] = [
  {
    id: 'usr-admin-01',
    nome: 'Super Administrador',
    email: 'admin@docflow.com.br',
    role: 'SUPERADMIN',
    cargo: 'Super Administrador do Sistema',
    status: 'ATIVO',
    ultimoAcesso: 'Agora mesmo',
    instituicao: 'Todas as Instituições (Global)',
  },
];

export const CURRENT_STUDENT: Student = {
  id: '',
  nome: '',
  cpf: '',
  email: '',
  matricula: '',
  tipoVinculo: 'ESTAGIARIO',
  dataNascimento: '',
  idade: 0,
  menorDeIdade: false,
  genero: 'M',
  dataAdmissao: '',
  turmaId: '',
  turmaNome: '',
  curso: '',
  empresa: '',
  instituicao: '',
  percentualConformidade: 100,
  nivelRisco: 'BAIXO',
  statusGeral: 'REGULAR',
  documentos: [],
};

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
