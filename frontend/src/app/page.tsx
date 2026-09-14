'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { currentRole } = useApp();

  useEffect(() => {
    if (currentRole === 'ESTUDANTE') {
      router.replace('/estudante');
    } else if (currentRole === 'COORDENADOR') {
      router.replace('/coordenador');
    } else if (currentRole === 'SUPERADMIN') {
      router.replace('/admin');
    } else {
      router.replace('/login');
    }
  }, [currentRole, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-[#065373]" />
      <p className="text-xs font-bold text-slate-600">
        Carregando seu portal exclusivo...
      </p>
    </div>
  );
}
