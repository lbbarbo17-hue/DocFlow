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
      {/* 1. Saudação, Perfil & Vínculo */}
      <StudentHeader />

      {/* 2 & 3. Grid Lado a Lado: Saúde do Dossiê + Central de Avisos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Quadrado 1 (Lado Esquerdo) — Saúde do Dossiê */}
        <StudentHealthCard />

        {/* Quadrado 2 (Lado Direito) — Central de Avisos */}
        <ExpirationAlert
          documents={student.documentos}
          onUploadClick={(doc) => setActiveUploadDoc(doc)}
        />
      </div>

      {/* Modal de Upload Rápido (acionado ao clicar nos botões dos avisos) */}
      {activeUploadDoc && (
        <UploadModal
          document={activeUploadDoc}
          onClose={() => setActiveUploadDoc(null)}
        />
      )}
    </div>
  );
}
