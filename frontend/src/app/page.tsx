'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-[#065373]" />
      <p className="text-xs font-bold text-slate-600">
        Carregando seu portal exclusivo...
      </p>
    </div>
  );
}
