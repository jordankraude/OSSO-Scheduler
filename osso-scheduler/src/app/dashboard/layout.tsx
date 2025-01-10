// app/admin/layout.tsx
import React from 'react';
import AdminLayout from '@/components/admin/admin-layout';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
