import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MiniProgramShell } from './components/miniprogram/MiniProgramShell';
import { AdminLayout } from './components/admin/AdminLayout';

const AppContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <div className="w-full min-h-screen">
      {activeView === 'miniprogram' ? <MiniProgramShell /> : <AdminLayout />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
