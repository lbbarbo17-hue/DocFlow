'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import DocumentChecklist from '@/components/student/DocumentChecklist';
import ExpirationAlert from '@/components/student/ExpirationAlert';
import UploadModal from '@/components/student/UploadModal';
import { DocumentItem } from '@/lib/types';
import { GraduationCap } from 'lucide-react';

export default function EstudantePage() {
  const { student } = useApp();
  const [activeUploadDoc, setActiveUploadDoc] = useState<DocumentItem | null>(null);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#065373]" />
            <h1 className="text-xl font-bold text-slate-900">Portal do Estudante & Aprendiz</h1>
          </div>
          <p className="text-xs text-slate-500">
            Acompanhe o checklist dos seus documentos obrigatórios e fique atento aos prazos de renovação semestral.
          </p>
        </div>
      </div>

      {/* Expiration Countdown Alert */}
      <ExpirationAlert
        documents={student.documentos}
        onUploadClick={(doc) => setActiveUploadDoc(doc)}
      />

      {/* Document Checklist */}
      <DocumentChecklist />

      {/* Active Upload Modal */}
      {activeUploadDoc && (
        <UploadModal
          document={activeUploadDoc}
          onClose={() => setActiveUploadDoc(null)}
        />
      )}
    </div>
  );
}
