'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserRole,
  TipoVinculo,
  Student,
  Turma,
  Empresa,
  AuditLog,
  DocumentItem,
  StatusDocumento,
  SystemUser,
  UserProfileData,
} from '@/lib/types';
import {
  CURRENT_STUDENT,
  INITIAL_STUDENTS,
  INITIAL_TURMAS,
  INITIAL_EMPRESAS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SYSTEM_USERS,
} from '@/lib/mockData';
import { computeSHA256, generateStorageUUID } from '@/lib/utils';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  student: Student;
  studentsList: Student[];
  allStudentsList: Student[];
  turmas: Turma[];
  allTurmas: Turma[];
  empresas: Empresa[];
  systemUsers: SystemUser[];
  auditLogs: AuditLog[];
  activeInstitution: string;
  setActiveInstitution: (institution: string) => void;
  superAdminInstitutionFilter: string;
  setSuperAdminInstitutionFilter: (filter: string) => void;
  availableInstitutions: string[];
  currentCoordinatorUser: SystemUser;
  isLgpdRedactionActive: boolean;
  setIsLgpdRedactionActive: (active: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  currentUserProfile: UserProfileData;
  updateCurrentUserProfile: (data: UserProfileData) => void;
  updateCurrentUserPassword: (currentPass: string, newPass: string) => Promise<boolean>;
  toastMessage: { title: string; desc: string; type: 'success' | 'error' | 'info' } | null;
  setToastMessage: (msg: { title: string; desc: string; type: 'success' | 'error' | 'info' } | null) => void;
  uploadStudentDocument: (docId: string, file: File) => Promise<boolean>;
  addNewDocumentToStudent: (newDoc: Omit<DocumentItem, 'id'>, file: File) => Promise<boolean>;
  evaluateDocument: (
    studentId: string,
    docId: string,
    newStatus: 'APROVADO' | 'RECUSADO',
    justificativa?: string
  ) => void;
  addAuditEntry: (entry: Omit<AuditLog, 'id' | 'timestampUtc'>) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  addNewTurma: (turma: Turma) => void;
  addNewEmpresa: (empresa: Empresa) => void;
  addNewSystemUser: (data: {
    nome: string;
    email: string;
    cargo: string;
    role: UserRole;
    instituicao: string;
    status?: 'ATIVO' | 'INATIVO';
  }) => SystemUser;
  addNewStudent: (data: {
    nome: string;
    cpf: string;
    email: string;
    matricula: string;
    tipoVinculo: TipoVinculo;
    dataAdmissao?: string;
    turmaId: string;
    curso?: string;
    empresa?: string;
    instituicao?: string;
  }) => Student;
  selectStudent: (studentId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('ESTUDANTE');
  const [student, setStudent] = useState<Student>(CURRENT_STUDENT);
  const [rawStudentsList, setRawStudentsList] = useState<Student[]>(INITIAL_STUDENTS);
  const [rawTurmas, setRawTurmas] = useState<Turma[]>(INITIAL_TURMAS);
  const [activeInstitution, setActiveInstitution] = useState<string>('ETEC Politécnica de São Paulo');
  const [superAdminInstitutionFilter, setSuperAdminInstitutionFilter] = useState<string>('ALL');
  const [empresas, setEmpresas] = useState<Empresa[]>(INITIAL_EMPRESAS);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(INITIAL_SYSTEM_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [isLgpdRedactionActive, setIsLgpdRedactionActive] = useState<boolean>(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    desc: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Available institutions discovered across students, turmas and system users
  const availableInstitutions = useMemo(() => {
    const set = new Set<string>();
    rawStudentsList.forEach((s) => s.instituicao && set.add(s.instituicao));
    rawTurmas.forEach((t) => t.instituicao && set.add(t.instituicao));
    systemUsers.forEach((u) => {
      if (u.instituicao && !u.instituicao.includes('Global')) {
        set.add(u.instituicao);
      }
    });
    return Array.from(set).sort();
  }, [rawStudentsList, rawTurmas, systemUsers]);

  // Current coordinator identity derived from active institution
  const currentCoordinatorUser = useMemo(() => {
    const found = systemUsers.find(
      (u) => u.role === 'COORDENADOR' && u.instituicao === activeInstitution
    );
    return (
      found || {
        id: 'usr-coord-generic',
        nome: 'Coordenação Geral',
        email: 'coordenacao@docflow.edu.br',
        role: 'COORDENADOR' as UserRole,
        cargo: 'Coordenador Pedagógico / RH',
        instituicao: activeInstitution,
        status: 'ATIVO' as const,
        ultimoAcesso: 'Hoje às 15:00',
      }
    );
  }, [systemUsers, activeInstitution]);

  // Filtered lists based on tenant role and active institution
  const allStudentsList = rawStudentsList;
  const allTurmas = rawTurmas;

  const studentsList = useMemo(() => {
    if (currentRole === 'SUPERADMIN') {
      if (superAdminInstitutionFilter === 'ALL') {
        return rawStudentsList;
      }
      return rawStudentsList.filter((s) => s.instituicao === superAdminInstitutionFilter);
    }
    // Coordinator: isolated strictly to their active institution
    return rawStudentsList.filter((s) => s.instituicao === activeInstitution);
  }, [rawStudentsList, currentRole, superAdminInstitutionFilter, activeInstitution]);

  const turmas = useMemo(() => {
    if (currentRole === 'SUPERADMIN') {
      if (superAdminInstitutionFilter === 'ALL') {
        return rawTurmas;
      }
      return rawTurmas.filter((t) => t.instituicao === superAdminInstitutionFilter);
    }
    // Coordinator: isolated strictly to their active institution
    return rawTurmas.filter((t) => t.instituicao === activeInstitution);
  }, [rawTurmas, currentRole, superAdminInstitutionFilter, activeInstitution]);

  // Responsive sidebar initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Initialize theme from localStorage / system preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('docflow_theme') as 'light' | 'dark' | null;
      if (saved === 'dark' || saved === 'light') {
        setThemeState(saved);
        if (saved === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeState('dark');
        document.documentElement.classList.add('dark');
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('docflow_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // Ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Auto clear toast after 4s
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const addAuditEntry = (entry: Omit<AuditLog, 'id' | 'timestampUtc'>) => {
    const newLog: AuditLog = {
      ...entry,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestampUtc: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const uploadStudentDocument = async (docId: string, file: File): Promise<boolean> => {
    // 1. Check size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setToastMessage({
        title: 'Bloqueio de Segurança (Payload Limit)',
        desc: 'O arquivo excede o limite máximo permitido de 10 MB.',
        type: 'error',
      });
      addAuditEntry({
        userId: student.id,
        userNome: student.nome,
        userRole: 'ESTUDANTE',
        action: 'SYSTEM_MAGIC_BYTES_VALIDATION',
        resourceId: docId,
        resourceTipo: `Tentativa Upload: ${file.name}`,
        ipAddress: '177.132.89.201',
        status: 'BLOCKED',
        detalhes: `Bloqueio: Tamanho de ${Math.round(file.size / 1024 / 1024)} MB excede o teto de 10 MB.`,
        sha256Hash: 'N/A - REJEITADO NO GATEWAY',
      });
      return false;
    }

    // 2. Compute SHA256 & UUID
    const sha256 = await computeSHA256(file);
    const ext = file.name.split('.').pop() || 'pdf';
    const storageUuid = generateStorageUUID(ext);

    // 3. Update active student & list
    const updateDocs = (docs: DocumentItem[]): DocumentItem[] => {
      return docs.map((d) => {
        if (d.id === docId) {
          return {
            ...d,
            status: 'EM_ANALISE' as StatusDocumento,
            nomeArquivoOriginal: file.name,
            storageUuid,
            tamanhoBytes: file.size,
            mimeType: file.type || 'application/pdf',
            fileHashSha256: sha256,
            dataEnvio: new Date().toISOString(),
            justificativaRecusa: undefined,
            conteudoSensivelSimulado: {
              rgNumero: '52.341.890-X',
              rgFiliacaoMae: 'Maria Helena da Silva',
              rgFiliacaoPai: 'Antônio Carlos da Silva',
              rgDataNascimento: '14/05/2005',
              cpfNumero: student.cpf,
              empresaConcedente: student.empresa,
              semestreAtual: '2º Semestre / 2026',
              instituicaoEnsino: student.instituicao || 'ETEC Central',
            },
          };
        }
        return d;
      });
    };

    const updatedDocuments = updateDocs(student.documentos);
    const essentialDocs = updatedDocuments.filter((d) => d.obrigatorio);
    const approvedOrReview = essentialDocs.filter(
      (d) => d.status === 'APROVADO' || d.status === 'EM_ANALISE'
    ).length;
    const newPercent = essentialDocs.length > 0 ? Math.round((approvedOrReview / essentialDocs.length) * 100) : 100;

    const updatedStudent: Student = {
      ...student,
      documentos: updatedDocuments,
      percentualConformidade: newPercent,
      statusGeral: newPercent === 100 ? 'REGULAR' : 'PENDENTE',
      nivelRisco: newPercent === 100 ? 'BAIXO' : newPercent >= 60 ? 'MEDIO' : 'CRITICO',
    };

    setStudent(updatedStudent);
    setRawStudentsList((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );

    // 4. Audit Log
    addAuditEntry({
      userId: student.id,
      userNome: student.nome,
      userRole: 'ESTUDANTE',
      action: 'DOCUMENT_UPLOAD',
      resourceId: docId,
      resourceTipo: `Documento: ${file.name}`,
      ipAddress: '177.132.89.201',
      status: 'SUCCESS',
      detalhes: `Upload com validação de formato e segurança. Armazenado sob UUID ${storageUuid}.`,
      sha256Hash: sha256,
      storageUuid,
    });

    setToastMessage({
      title: 'Documento Enviado com Sucesso!',
      desc: `Arquivo validado e registrado sob hash SHA-256 (${sha256.substring(0, 12)}...).`,
      type: 'success',
    });

    return true;
  };

  const addNewDocumentToStudent = async (
    newDocData: Omit<DocumentItem, 'id'>,
    file: File
  ): Promise<boolean> => {
    // 1. Check size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setToastMessage({
        title: 'Bloqueio de Segurança (Payload Limit)',
        desc: 'O arquivo excede o limite máximo permitido de 10 MB.',
        type: 'error',
      });
      return false;
    }

    const sha256 = await computeSHA256(file);
    const ext = file.name.split('.').pop() || 'pdf';
    const storageUuid = generateStorageUUID(ext);
    const newDocId = `doc-${Date.now()}`;

    const createdDoc: DocumentItem = {
      ...newDocData,
      id: newDocId,
      status: 'EM_ANALISE' as StatusDocumento,
      nomeArquivoOriginal: file.name,
      storageUuid,
      tamanhoBytes: file.size,
      mimeType: file.type || 'application/pdf',
      fileHashSha256: sha256,
      dataEnvio: new Date().toISOString(),
      justificativaRecusa: undefined,
    };

    const updatedDocs = [...student.documentos, createdDoc];
    const essentialDocs = updatedDocs.filter((d) => d.obrigatorio);
    const approvedOrReview = essentialDocs.filter(
      (d) => d.status === 'APROVADO' || d.status === 'EM_ANALISE'
    ).length;
    const newPercent = essentialDocs.length > 0 ? Math.round((approvedOrReview / essentialDocs.length) * 100) : 100;

    const updatedStudent: Student = {
      ...student,
      documentos: updatedDocs,
      percentualConformidade: newPercent,
      statusGeral: newPercent === 100 ? 'REGULAR' : 'PENDENTE',
      nivelRisco: newPercent === 100 ? 'BAIXO' : newPercent >= 60 ? 'MEDIO' : 'CRITICO',
    };

    setStudent(updatedStudent);
    setRawStudentsList((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );

    addAuditEntry({
      userId: student.id,
      userNome: student.nome,
      userRole: 'ESTUDANTE',
      action: 'DOCUMENT_UPLOAD',
      resourceId: newDocId,
      resourceTipo: `Novo Documento Adicionado: ${createdDoc.nomeExibicao}`,
      ipAddress: '177.132.89.201',
      status: 'SUCCESS',
      detalhes: `Novo documento '${createdDoc.nomeExibicao}' adicionado aos documentos. Hash SHA-256: ${sha256}.`,
      sha256Hash: sha256,
      storageUuid,
    });

    setToastMessage({
      title: 'Novo Documento Adicionado!',
      desc: `'${createdDoc.nomeExibicao}' foi registrado e enviado para análise da coordenação.`,
      type: 'success',
    });

    return true;
  };

  const evaluateDocument = (
    studentId: string,
    docId: string,
    newStatus: 'APROVADO' | 'RECUSADO',
    justificativa?: string
  ) => {
    setRawStudentsList((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const updatedDocs = s.documentos.map((d) => {
            if (d.id === docId) {
              return {
                ...d,
                status: newStatus,
                justificativaRecusa: newStatus === 'RECUSADO' ? justificativa : undefined,
                aprovadoPor:
                  currentRole === 'COORDENADOR'
                    ? `${currentCoordinatorUser.nome} (${activeInstitution})`
                    : 'Super Administrador',
                dataAvaliacao: new Date().toISOString(),
              };
            }
            return d;
          });

          const essentialDocs = updatedDocs.filter((d) => d.obrigatorio);
          const approvedCount = essentialDocs.filter((d) => d.status === 'APROVADO').length;
          const newPercent = essentialDocs.length > 0 ? Math.round((approvedCount / essentialDocs.length) * 100) : 100;
          const hasCritico = essentialDocs.some(
            (d) => d.status === 'EXPIRADO' || d.status === 'RECUSADO'
          );

          const updatedStudentObj: Student = {
            ...s,
            documentos: updatedDocs,
            percentualConformidade: newPercent,
            nivelRisco: hasCritico ? 'CRITICO' : newPercent === 100 ? 'BAIXO' : 'MEDIO',
            statusGeral: hasCritico ? 'ALERTA_CRITICO' : newPercent === 100 ? 'REGULAR' : 'PENDENTE',
          };

          if (s.id === student.id) {
            setStudent(updatedStudentObj);
          }

          return updatedStudentObj;
        }
        return s;
      })
    );

    // Add audit log
    const targetStudent = rawStudentsList.find((s) => s.id === studentId);
    const targetDoc = targetStudent?.documentos.find((d) => d.id === docId);

    addAuditEntry({
      userId: currentCoordinatorUser.id,
      userNome:
        currentRole === 'COORDENADOR'
          ? `${currentCoordinatorUser.nome} (${activeInstitution})`
          : 'Super Administrador',
      userRole: currentRole,
      action: newStatus === 'APROVADO' ? 'DOCUMENT_APPROVAL' : 'DOCUMENT_REJECTION',
      resourceId: docId,
      resourceTipo: `Documento: ${targetDoc?.nomeExibicao || docId} (${targetStudent?.nome || studentId})`,
      ipAddress: '189.45.112.44',
      status: 'SUCCESS',
      detalhes:
        newStatus === 'APROVADO'
          ? `Conferência de autenticidade documental aprovada pela coordenação (${activeInstitution}).`
          : `Recusa fundamentada: "${justificativa}". Notificação enviada ao estudante.`,
      sha256Hash: targetDoc?.fileHashSha256 || 'N/A',
      storageUuid: targetDoc?.storageUuid,
    });

    setToastMessage({
      title: newStatus === 'APROVADO' ? 'Documento Aprovado' : 'Documento Recusado',
      desc:
        newStatus === 'APROVADO'
          ? 'Status atualizado e registrado na trilha de auditoria.'
          : 'Justificativa gravada e notificação enviada ao estudante.',
      type: newStatus === 'APROVADO' ? 'success' : 'info',
    });
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setSystemUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    addAuditEntry({
      userId: 'usr-admin',
      userNome: 'Super Administrador',
      userRole: 'SUPERADMIN',
      action: 'USER_ROLE_CHANGED',
      resourceId: userId,
      resourceTipo: `Usuário do Sistema: ${userId}`,
      ipAddress: '200.180.99.12',
      status: 'SUCCESS',
      detalhes: `Perfil de acesso alterado para ${newRole}.`,
      sha256Hash: 'HASH-ALTERACAO-PERFIL',
    });
    setToastMessage({
      title: 'Perfil de Usuário Atualizado',
      desc: `O usuário agora possui acesso como ${newRole}.`,
      type: 'success',
    });
  };

  const addNewSystemUser = (data: {
    nome: string;
    email: string;
    cargo: string;
    role: UserRole;
    instituicao: string;
    status?: 'ATIVO' | 'INATIVO';
  }): SystemUser => {
    const newUserId = `usr-${Date.now()}`;
    const newUser: SystemUser = {
      id: newUserId,
      nome: data.nome,
      email: data.email,
      role: data.role,
      cargo: data.cargo,
      instituicao: data.instituicao,
      status: data.status || 'ATIVO',
      ultimoAcesso: 'Nunca acessou (Novo Cadastro)',
    };

    setSystemUsers((prev) => [newUser, ...prev]);

    addAuditEntry({
      userId: 'usr-admin',
      userNome: 'Super Administrador',
      userRole: 'SUPERADMIN',
      action: 'SYSTEM_CONFIG_UPDATED',
      resourceId: newUserId,
      resourceTipo: `Operador: ${data.nome} (${data.role})`,
      ipAddress: '200.180.99.12',
      status: 'SUCCESS',
      detalhes: `Novo operador cadastrado pelo Super Admin: ${data.nome} (${data.cargo}) vinculado à entidade '${data.instituicao}' com perfil ${data.role}.`,
      sha256Hash: `HASH-USER-${newUserId}`,
    });

    setToastMessage({
      title: 'Operador Cadastrado com Sucesso! 👤',
      desc: `${data.nome} foi cadastrado(a) como ${data.role} em ${data.instituicao}.`,
      type: 'success',
    });

    return newUser;
  };

  const addNewTurma = (turma: Turma) => {
    const turmaWithInstitution: Turma = {
      ...turma,
      instituicao:
        turma.instituicao ||
        (currentRole === 'COORDENADOR' ? activeInstitution : 'ETEC Politécnica de São Paulo'),
    };
    setRawTurmas((prev) => [turmaWithInstitution, ...prev]);
    setToastMessage({
      title: 'Turma Criada com Sucesso',
      desc: `Turma ${turma.codigo} cadastrada sob ${turmaWithInstitution.instituicao}.`,
      type: 'success',
    });
  };

  const addNewStudent = (data: {
    nome: string;
    cpf: string;
    email: string;
    matricula: string;
    tipoVinculo: TipoVinculo;
    dataAdmissao?: string;
    turmaId: string;
    curso?: string;
    empresa?: string;
    instituicao?: string;
  }): Student => {
    const selectedTurma = rawTurmas.find((t) => t.id === data.turmaId);
    const assignedInstitution =
      data.instituicao ||
      selectedTurma?.instituicao ||
      (currentRole === 'COORDENADOR' ? activeInstitution : 'ETEC Politécnica de São Paulo');

    const newStudentId = `std-${Date.now()}`;
    const newStudent: Student = {
      id: newStudentId,
      nome: data.nome,
      cpf: data.cpf,
      email: data.email,
      matricula: data.matricula,
      tipoVinculo: data.tipoVinculo,
      dataAdmissao: data.dataAdmissao || new Date().toISOString().split('T')[0],
      turmaId: data.turmaId,
      turmaNome: selectedTurma ? `${selectedTurma.codigo} — ${selectedTurma.nomeCurso}` : 'Turma Geral',
      curso: data.curso || (selectedTurma ? selectedTurma.nomeCurso : 'Curso Técnico'),
      empresa: data.empresa || 'Empresa Conveniada',
      instituicao: assignedInstitution,
      percentualConformidade: 0,
      nivelRisco: 'CRITICO',
      statusGeral: 'PENDENTE',
      documentos: [
        {
          id: `doc-rg-${Date.now()}`,
          tipo: 'RG',
          nomeExibicao: 'Carteira de Identidade (RG)',
          descricao: 'Frente e verso nítidos com foto visível e órgão expedidor legível.',
          obrigatorio: true,
          status: 'PENDENTE',
          conteudoSensivelSimulado: {
            cpfNumero: data.cpf,
          },
        },
        {
          id: `doc-cpf-${Date.now() + 1}`,
          tipo: 'CPF',
          nomeExibicao: 'Comprovante de Inscrição no CPF',
          descricao: 'Comprovante oficial da Receita Federal com QR Code ou cartão com CPF regular.',
          obrigatorio: true,
          status: 'PENDENTE',
          conteudoSensivelSimulado: {
            cpfNumero: data.cpf,
          },
        },
        {
          id: `doc-res-${Date.now() + 2}`,
          tipo: 'COMPROVANTE_RESIDENCIA',
          nomeExibicao: 'Comprovante de Residência Atualizado',
          descricao: 'Conta de consumo (água, luz, gás ou internet) emitida nos últimos 90 dias.',
          obrigatorio: true,
          status: 'PENDENTE',
        },
        {
          id: `doc-mat-${Date.now() + 3}`,
          tipo: 'COMPROVANTE_MATRICULA',
          nomeExibicao: 'Comprovante de Matrícula / Frequência Escolar',
          descricao: 'Declaração semestral oficial da instituição de ensino com período letivo atual.',
          obrigatorio: true,
          recorrente: true,
          status: 'PENDENTE',
        },
        {
          id: `doc-tce-${Date.now() + 4}`,
          tipo: 'CONTRATO_TCE',
          nomeExibicao:
            data.tipoVinculo === 'APRENDIZ'
              ? 'Contrato de Aprendizagem Profissional (CTPS / Registro)'
              : 'Termo de Compromisso de Estágio (TCE)',
          descricao: 'Documento assinado com vigência e dados da empresa e instituição concedente.',
          obrigatorio: true,
          status: 'PENDENTE',
        },
      ],
    };

    setRawStudentsList((prev) => [newStudent, ...prev]);

    if (data.turmaId) {
      setRawTurmas((prev) =>
        prev.map((t) =>
          t.id === data.turmaId
            ? { ...t, totalAlunos: t.totalAlunos + 1, alunosEmRisco: t.alunosEmRisco + 1 }
            : t
        )
      );
    }

    addAuditEntry({
      userId: currentCoordinatorUser.id,
      userNome: `${currentCoordinatorUser.nome} (${assignedInstitution})`,
      userRole: currentRole,
      action: 'USER_ROLE_CHANGED',
      resourceId: newStudentId,
      resourceTipo: `Aprendiz/Estagiário: ${data.nome}`,
      ipAddress: '187.54.12.88',
      status: 'SUCCESS',
      detalhes: `Novo aluno cadastrado sob a instituição '${assignedInstitution}' e associado à turma ${selectedTurma?.codigo || data.turmaId}.`,
      sha256Hash: `HASH-CADASTRO-${newStudentId}`,
    });

    setToastMessage({
      title: 'Aluno Cadastrado com Sucesso! 🎉',
      desc: `${data.nome} foi cadastrado(a) em ${assignedInstitution}.`,
      type: 'success',
    });

    return newStudent;
  };

  const addNewEmpresa = (empresa: Empresa) => {
    setEmpresas((prev) => [empresa, ...prev]);
    addAuditEntry({
      userId: currentCoordinatorUser.id,
      userNome: `${currentCoordinatorUser.nome} (${activeInstitution})`,
      userRole: currentRole,
      action: 'USER_ROLE_CHANGED',
      resourceId: empresa.id,
      resourceTipo: `Empresa Parceira: ${empresa.razaoSocial}`,
      ipAddress: '187.54.12.88',
      status: 'SUCCESS',
      detalhes: `Nova empresa concedente parceira cadastrada: ${empresa.razaoSocial} (CNPJ: ${empresa.cnpj}).`,
      sha256Hash: `HASH-EMPRESA-${empresa.id}`,
    });
    setToastMessage({
      title: 'Empresa Cadastrada com Sucesso! 🏢',
      desc: `${empresa.nomeFantasia || empresa.razaoSocial} foi adicionada ao catálogo de empresas conveniadas.`,
      type: 'success',
    });
  };

  const selectStudent = (studentId: string) => {
    const target = rawStudentsList.find((s) => s.id === studentId);
    if (target) {
      setStudent(target);
      setToastMessage({
        title: `Perfil Selecionado: ${target.nome}`,
        desc: `Visualizando como ${target.tipoVinculo === 'APRENDIZ' ? 'Jovem Aprendiz' : 'Estagiário'} (${target.instituicao || 'Instituição'}).`,
        type: 'info',
      });
    }
  };

  const currentUserProfile: UserProfileData = useMemo(() => {
    if (currentRole === 'ESTUDANTE') {
      return {
        nome: student.nome,
        email: student.email,
        telefone: student.telefone || '(11) 98765-4321',
        cpf: student.cpf,
        avatarUrl: student.avatarUrl || '',
        cargo: student.tipoVinculo === 'APRENDIZ' ? 'Jovem Aprendiz' : 'Estagiário',
      };
    }
    if (currentRole === 'COORDENADOR') {
      return {
        nome: currentCoordinatorUser.nome,
        email: currentCoordinatorUser.email,
        telefone: currentCoordinatorUser.telefone || '(11) 99876-5432',
        cpf: currentCoordinatorUser.cpf || '123.456.789-00',
        avatarUrl: currentCoordinatorUser.avatarUrl || '',
        cargo: currentCoordinatorUser.cargo,
      };
    }
    // SUPERADMIN
    const adminUser = systemUsers.find((u) => u.role === 'SUPERADMIN') || systemUsers[0];
    return {
      nome: adminUser?.nome || 'Super Administrador DocFlow',
      email: adminUser?.email || 'admin.global@docflow.com.br',
      telefone: adminUser?.telefone || '(11) 91234-5678',
      cpf: adminUser?.cpf || '000.111.222-33',
      avatarUrl: adminUser?.avatarUrl || '',
      cargo: adminUser?.cargo || 'Diretor de Conformidade & Tecnologia',
    };
  }, [currentRole, student, currentCoordinatorUser, systemUsers]);

  const updateCurrentUserProfile = (data: UserProfileData) => {
    const trimmedNome = data.nome.trim();
    const trimmedEmail = data.email.trim();
    const trimmedTelefone = data.telefone?.trim();
    const trimmedCpf = data.cpf?.trim();

    if (currentRole === 'ESTUDANTE') {
      setStudent((prev) => ({
        ...prev,
        nome: trimmedNome || prev.nome,
        email: trimmedEmail || prev.email,
        telefone: trimmedTelefone || prev.telefone,
        avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : prev.avatarUrl,
        cpf: trimmedCpf || prev.cpf,
      }));
      setRawStudentsList((prev) =>
        prev.map((s) =>
          s.id === student.id
            ? {
                ...s,
                nome: trimmedNome || s.nome,
                email: trimmedEmail || s.email,
                telefone: trimmedTelefone || s.telefone,
                avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : s.avatarUrl,
                cpf: trimmedCpf || s.cpf,
              }
            : s
        )
      );
    } else if (currentRole === 'COORDENADOR') {
      setSystemUsers((prev) =>
        prev.map((u) =>
          u.id === currentCoordinatorUser.id
            ? {
                ...u,
                nome: trimmedNome || u.nome,
                email: trimmedEmail || u.email,
                telefone: trimmedTelefone || u.telefone,
                avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : u.avatarUrl,
                cpf: trimmedCpf || u.cpf,
                cargo: data.cargo?.trim() || u.cargo,
              }
            : u
        )
      );
    } else {
      // SUPERADMIN
      setSystemUsers((prev) =>
        prev.map((u) =>
          u.role === 'SUPERADMIN'
            ? {
                ...u,
                nome: trimmedNome || u.nome,
                email: trimmedEmail || u.email,
                telefone: trimmedTelefone || u.telefone,
                avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : u.avatarUrl,
                cpf: trimmedCpf || u.cpf,
                cargo: data.cargo?.trim() || u.cargo,
              }
            : u
        )
      );
    }

    addAuditEntry({
      userId: currentRole === 'ESTUDANTE' ? student.id : currentCoordinatorUser.id,
      userNome: trimmedNome || currentUserProfile.nome,
      userRole: currentRole,
      action: 'SYSTEM_CONFIG_UPDATED',
      resourceId: currentRole === 'ESTUDANTE' ? student.id : currentCoordinatorUser.id,
      resourceTipo: 'Perfil Cadastral & Avatar',
      ipAddress: '189.45.112.55',
      status: 'SUCCESS',
      detalhes: `Atualização de perfil efetuada com sucesso: ${trimmedNome || currentUserProfile.nome} (${currentRole}).`,
      sha256Hash: `HASH-PERFIL-${Date.now()}`,
    });

    setToastMessage({
      title: 'Perfil Atualizado! 👤',
      desc: 'Suas informações cadastrais e foto foram salvas com sucesso.',
      type: 'success',
    });
  };

  const updateCurrentUserPassword = async (currentPass: string, newPass: string): Promise<boolean> => {
    if (!newPass || newPass.length < 6) {
      setToastMessage({
        title: 'Senha muito curta',
        desc: 'A nova senha deve ter no mínimo 6 caracteres.',
        type: 'error',
      });
      return false;
    }

    addAuditEntry({
      userId: currentRole === 'ESTUDANTE' ? student.id : currentCoordinatorUser.id,
      userNome: currentUserProfile.nome,
      userRole: currentRole,
      action: 'SYSTEM_CONFIG_UPDATED',
      resourceId: currentRole === 'ESTUDANTE' ? student.id : currentCoordinatorUser.id,
      resourceTipo: 'Credenciais de Acesso',
      ipAddress: '189.45.112.55',
      status: 'SUCCESS',
      detalhes: `Senha de acesso alterada com sucesso para o usuário ${currentUserProfile.nome}.`,
      sha256Hash: `HASH-PASSWORD-${Date.now()}`,
    });

    setToastMessage({
      title: 'Senha Alterada com Sucesso! 🔒',
      desc: 'Sua nova senha de acesso foi configurada e protegida.',
      type: 'success',
    });

    return true;
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        student,
        studentsList,
        allStudentsList,
        turmas,
        allTurmas,
        empresas,
        systemUsers,
        auditLogs,
        activeInstitution,
        setActiveInstitution,
        superAdminInstitutionFilter,
        setSuperAdminInstitutionFilter,
        availableInstitutions,
        currentCoordinatorUser,
        isLgpdRedactionActive,
        setIsLgpdRedactionActive,
        theme,
        setTheme,
        toggleTheme,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        closeSidebar,
        isProfileModalOpen,
        setIsProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        currentUserProfile,
        updateCurrentUserProfile,
        updateCurrentUserPassword,
        toastMessage,
        setToastMessage,
        uploadStudentDocument,
        addNewDocumentToStudent,
        evaluateDocument,
        addAuditEntry,
        updateUserRole,
        addNewSystemUser,
        addNewTurma,
        addNewEmpresa,
        addNewStudent,
        selectStudent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
