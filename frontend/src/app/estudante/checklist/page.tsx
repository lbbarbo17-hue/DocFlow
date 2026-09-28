'use client';

import React from 'react';
import DocumentChecklist from '@/components/student/DocumentChecklist';

export default function StudentChecklistPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Checklist Completo de Documentos */}
      <DocumentChecklist />
    </div>
  );
}
