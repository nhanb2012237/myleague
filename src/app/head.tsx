import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://valik3201-invoice-app.vercel.app/'),
  title: 'Invoices App',
  description:
    'Work smarter with the invoice app. Streamline your invoicing process with ease.',
  openGraph: {
    title: 'Invoices App',
    description:
      'Manage and view all your invoices in one place on the Invoices App.',
    type: 'website',
    url: 'https://valik3201-invoice-app.vercel.app/',
    siteName: 'Invoices App',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invoices App',
    description:
      'Manage and view all your invoices in one place on the Invoices App.',
  },
};
