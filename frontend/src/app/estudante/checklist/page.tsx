'use client';

import React from 'react';
import StudentHeader from '@/components/student/StudentHeader';
import DocumentChecklist from '@/components/student/DocumentChecklist';

export default function StudentChecklistPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho de Identificação & Vínculo */}
      <StudentHeader />

      {/* Checklist Completo de Documentos */}
      <DocumentChecklist />
    </div>
  );
}
