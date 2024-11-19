/*
File AppWrappers.tsx định nghĩa một component React có tên là AppWrappers. 
Component này được sử dụng để bọc các component con của nó và đảm bảo rằng chúng không được render trên server (SSR - Server-Side Rendering).
*/
import type { Metadata } from 'next';
import React, { ReactNode } from 'react';
import AppWrappers from './AppWrappers';
// import '@asseinfo/react-kanban/dist/styles.css';
// import '/public/styles/Plugins.css';
import AuthProvider from '../providers/AuthProvider';
import StoreProvider from '../providers/StoreProvider';
import { Toaster, toast } from 'sonner';
import { ThemeProvider } from '@material-tailwind/react';
import dynamic from 'next/dynamic';
import SidebarHorizon from '../components/sidebar/index';
import Head from 'next/head';

export const metadata: Metadata = {
  metadataBase: new URL('https://valik3201-invoice-app.vercel.app/'),
  title: 'Football Manage App',
  description:
    '',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <Head>
        <title>{metadata.title as string}</title>
      </Head>
      <body id={'root'}>
        <StoreProvider>
          <AuthProvider>
            <Toaster />
            <AppWrappers>{children}</AppWrappers>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
