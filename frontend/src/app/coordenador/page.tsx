'use client';

import React from 'react';
import StudentMasterList from '@/components/coordinator/StudentMasterList';
import { UserCheck } from 'lucide-react';

export default function CoordenadorPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-[#065373]" />
          <h1 className="text-xl font-bold text-slate-900">
            Painel do Coordenador & RH — Gestão de Dossiês
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Analise documentos enviados pelos aprendizes, confira a minimização de dados LGPD e realize aprovações ou recusas fundamentadas.
        </p>
      </div>

      {/* Master-Detail Student List & Dossier Viewer */}
      <StudentMasterList />
    </div>
  );
}
