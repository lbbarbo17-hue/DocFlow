'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import StudentHeader from '@/components/student/StudentHeader';
import StudentHealthCard from '@/components/student/StudentHealthCard';
import ExpirationAlert from '@/components/student/ExpirationAlert';
import DocumentChecklist from '@/components/student/DocumentChecklist';
import UploadModal from '@/components/student/UploadModal';
import { DocumentItem } from '@/lib/types';

export default function EstudantePage() {
  const { student } = useApp();
  const [activeUploadDoc, setActiveUploadDoc] = useState<DocumentItem | null>(null);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Cabeçalho de Identificação & Vínculo */}
      <StudentHeader />

      {/* 2. Saúde do Dossiê / Conformidade Visual */}
      <StudentHealthCard />

      {/* 3. Central de Avisos e Lembretes Importantes (Aviso de Renovação Recorrente / Vencimento) */}
      <ExpirationAlert
        documents={student.documentos}
        onUploadClick={(doc) => setActiveUploadDoc(doc)}
      />

      {/* 4. Checklist Organizado com Proteção LGPD e Ações Rápidas */}
      <DocumentChecklist />

      {/* 5. Modal de Upload Rápido e Seguro */}
      {activeUploadDoc && (
        <UploadModal
          document={activeUploadDoc}
          onClose={() => setActiveUploadDoc(null)}
        />
      )}
    </div>
  );
}
