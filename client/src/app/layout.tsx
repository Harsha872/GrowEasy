import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GrowEasy CSV Importer',
  description: 'AI-powered CSV to CRM lead importer.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
