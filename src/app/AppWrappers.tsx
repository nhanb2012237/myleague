'use client';
import React, { ReactNode } from 'react';
import 'styles/App.css';
import 'styles/Contact.css';
// import '@asseinfo/react-kanban/dist/styles.css';
// import 'styles/Plugins.css';
import 'styles/MiniCalendar.css';
import 'styles/index.css';
import { ThemeProvider } from '@material-tailwind/react';

import dynamic from 'next/dynamic';

//Đây là một component đơn giản chỉ trả về children của nó.
// Nó được sử dụng như một wrapper để đảm bảo rằng các component con không được render trên server.
const _NoSSR = ({ children }) => <React.Fragment>{children}</React.Fragment>;

//Sử dụng dynamic từ next/dynamic để tạo một component không được render trên server.
//ssr: false đảm bảo rằng component này chỉ được render trên client.
const NoSSR = dynamic(() => Promise.resolve(_NoSSR), {
  ssr: false,
});

export default function AppWrappers({ children }: { children: ReactNode }) {
  return <NoSSR>{children}</NoSSR>;
}
