import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ role }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuClick={() => setIsMobileMenuOpen(true)} />
      <Sidebar role={user.role} isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />
      <main className="md:pl-64 pt-14 md:pt-16 pb-20 md:pb-0 transition-all duration-300">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
      <BottomNav role={user.role} />
    </div>
  );
};

export default MainLayout;
