// components/admin/AdminLayout.tsx
import React from 'react';
import Sidebar from './sidebar';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100 w-full">
      <Sidebar /> {/* Sidebar navigation */}
      <div className="flex flex-col flex-1 bg-gray-100">
        <main className="p-6">{children}</main> {/* Main content area */}
      </div>
    </div>
  );
};

export default AdminLayout;