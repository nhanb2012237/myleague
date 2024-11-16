'use client';
// Layout components
import { usePathname } from 'next/navigation';
import { useContext, useState } from 'react';
import routes from 'routes';
import {
  getActiveNavbar,
  getActiveRoute,
  isWindowAvailable,
} from 'utils/navigation';
import React from 'react';
import { Portal } from '@chakra-ui/portal';
import Navbar from 'components/navbar';
import Sidebar from 'components/sidebar';
import Footer from 'components/footer/Footer';

export default function Admin({ children }: { children: React.ReactNode }) {
  // states and functions
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Điều kiện để bỏ qua layout cho trang cụ thể
  if (pathname === '/admin/tournaments') {
    return <>{children}</>;
  }
  const handleClose = () => {
    setOpen(false);
  };
  if (isWindowAvailable()) document.documentElement.dir = 'ltr'; // nếu có window thì set direction cho html tag
  return (
    <div className="flex h-full w-full bg-background-100 dark:bg-background-900">
      <Sidebar
        routes={routes}
        open={open}
        setOpen={setOpen}
        variant="admin"
        onClose={handleClose}
      />
      {/* Navbar & Main Content */}
      <div className="h-full w-full font-dm dark:bg-navy-900">
        {/* Main Content */}
        <main
          className={`mx-2.5  flex-none transition-all dark:bg-navy-900 
              md:pr-2 xl:ml-[323px]`}
        >
          {/* Routes */}
          <div>
            <Navbar
              onOpenSidenav={() => setOpen(!open)}
              brandText={getActiveRoute(routes, pathname)}
              secondary={getActiveNavbar(routes, pathname)}
            />
            <div className="mx-auto min-h-screen p-2 !pt-[10px] md:p-2">
              {children}
            </div>
            <div className="p-3">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
