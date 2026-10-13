import { Student, Turma, Empresa, AuditLog, SystemUser } from './types';

// Empresas cadastradas no sistema (inicia limpo)
export const INITIAL_EMPRESAS: Empresa[] = [];

// Turmas cadastradas no sistema (inicia limpo)
export const INITIAL_TURMAS: Turma[] = [];

// Usuários do sistema (apenas o Super Administrador oficial ativo)
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

// Modelo de estudante limpo (sem dados fictícios)
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

// Lista de estudantes cadastrados no sistema (inicia limpo)
export const INITIAL_STUDENTS: Student[] = [];

// Histórico de atividades do sistema (inicia limpo)
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
