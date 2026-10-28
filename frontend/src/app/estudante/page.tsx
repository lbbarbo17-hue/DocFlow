'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import StudentHeader from '@/components/student/StudentHeader';
import StudentHealthCard from '@/components/student/StudentHealthCard';
import ExpirationAlert from '@/components/student/ExpirationAlert';
import UploadModal from '@/components/student/UploadModal';
import { DocumentItem } from '@/lib/types';

export default function EstudantePage() {
  const { student } = useApp();
  const [activeUploadDoc, setActiveUploadDoc] = useState<DocumentItem | null>(null);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header do Perfil Limpo */}
      <StudentHeader />

      {/* 2 & 3. Grid Lado a Lado: Status da Documentação + Central de Avisos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Status da Documentação (Lista por prioridade + barra fina) */}
        <StudentHealthCard onUploadClick={(doc) => setActiveUploadDoc(doc)} />

        {/* Central de Avisos (Alerta integrado minimalista + CTA sólido) */}
        <ExpirationAlert
          documents={student?.documentos || []}
          onUploadClick={(doc) => setActiveUploadDoc(doc)}
        />
      </div>

      {/* Modal de Upload Rápido */}
      {activeUploadDoc && (
        <UploadModal
          document={activeUploadDoc}
          onClose={() => setActiveUploadDoc(null)}
        />
      )}
    </div>
  );
}
