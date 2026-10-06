'use client';

import React from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Saudação, Perfil & Vínculo */}
      <AdminHeader />

      {/* Admin Dashboard */}
      <AdminDashboard />
    </div>
  );
}
