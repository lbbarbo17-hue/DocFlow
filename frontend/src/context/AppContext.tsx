'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Student,
  Turma,
  AuditLog,
  DocumentItem,
  StatusDocumento,
} from '@/lib/types';
import {
  CURRENT_STUDENT,
  INITIAL_STUDENTS,
  INITIAL_TURMAS,
  INITIAL_AUDIT_LOGS,
} from '@/lib/mockData';
import { computeSHA256, generateStorageUUID } from '@/lib/utils';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  student: Student;
  studentsList: Student[];
  turmas: Turma[];
  auditLogs: AuditLog[];
  isLgpdRedactionActive: boolean;
  setIsLgpdRedactionActive: (active: boolean) => void;
  toastMessage: { title: string; desc: string; type: 'success' | 'error' | 'info' } | null;
  setToastMessage: (msg: { title: string; desc: string; type: 'success' | 'error' | 'info' } | null) => void;
  uploadStudentDocument: (docId: string, file: File) => Promise<boolean>;
  evaluateDocument: (
    studentId: string,
    docId: string,
    newStatus: 'APROVADO' | 'RECUSADO',
    justificativa?: string
  ) => void;
  addAuditEntry: (entry: Omit<AuditLog, 'id' | 'timestampUtc'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('ESTUDANTE');
  const [student, setStudent] = useState<Student>(CURRENT_STUDENT);
  const [studentsList, setStudentsList] = useState<Student[]>(INITIAL_STUDENTS);
  const [turmas] = useState<Turma[]>(INITIAL_TURMAS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [isLgpdRedactionActive, setIsLgpdRedactionActive] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    desc: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

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
              instituicaoEnsino: 'ETEC Central',
            },
          };
        }
        return d;
      });
    };

    const updatedDocuments = updateDocs(student.documentos);
    const approvedOrReview = updatedDocuments.filter(
      (d) => d.status === 'APROVADO' || d.status === 'EM_ANALISE'
    ).length;
    const newPercent = Math.round((approvedOrReview / updatedDocuments.length) * 100);

    const updatedStudent: Student = {
      ...student,
      documentos: updatedDocuments,
      percentualConformidade: newPercent,
      statusGeral: newPercent === 100 ? 'REGULAR' : 'PENDENTE',
      nivelRisco: newPercent === 100 ? 'BAIXO' : newPercent >= 60 ? 'MEDIO' : 'CRITICO',
    };

    setStudent(updatedStudent);
    setStudentsList((prev) =>
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
      detalhes: `Upload com inspeção de Magic Bytes aprovada. Armazenado sob UUID ${storageUuid}.`,
      sha256Hash: sha256,
      storageUuid,
    });

    setToastMessage({
      title: 'Documento Enviado com Sucesso!',
      desc: `Magic Bytes validados e hash SHA-256 gerado (${sha256.substring(0, 12)}...).`,
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
    setStudentsList((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const updatedDocs = s.documentos.map((d) => {
            if (d.id === docId) {
              return {
                ...d,
                status: newStatus,
                justificativaRecusa: newStatus === 'RECUSADO' ? justificativa : undefined,
                aprovadoPor: currentRole === 'COORDENADOR' ? 'Coordenação de Curso' : 'Gestão de RH',
                dataAvaliacao: new Date().toISOString(),
              };
            }
            return d;
          });

          const approvedCount = updatedDocs.filter((d) => d.status === 'APROVADO').length;
          const newPercent = Math.round((approvedCount / updatedDocs.length) * 100);
          const hasCritico = updatedDocs.some(
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
    const targetStudent = studentsList.find((s) => s.id === studentId);
    const targetDoc = targetStudent?.documentos.find((d) => d.id === docId);

    addAuditEntry({
      userId: 'usr-evaluator',
      userNome: currentRole === 'COORDENADOR' ? 'Coordenação Acadêmica' : 'Gestão Corporativa RH',
      userRole: currentRole,
      action: newStatus === 'APROVADO' ? 'DOCUMENT_APPROVAL' : 'DOCUMENT_REJECTION',
      resourceId: docId,
      resourceTipo: `Documento: ${targetDoc?.nomeExibicao || docId} (${targetStudent?.nome || studentId})`,
      ipAddress: '189.45.112.44',
      status: 'SUCCESS',
      detalhes:
        newStatus === 'APROVADO'
          ? 'Conferência de autenticidade documental aprovada.'
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

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        student,
        studentsList,
        turmas,
        auditLogs,
        isLgpdRedactionActive,
        setIsLgpdRedactionActive,
        toastMessage,
        setToastMessage,
        uploadStudentDocument,
        evaluateDocument,
        addAuditEntry,
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
