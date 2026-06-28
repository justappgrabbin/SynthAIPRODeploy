import type { Metadata } from 'next';
import { PyodideProvider } from '@/components/pyodide/PyodideProvider';
import { SupabaseProvider } from '@/components/supabase/SupabaseProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'AION - Autonomous Intelligence Operating Network',
  description: 'Living substrate for autonomous intelligence ecosystems',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          <PyodideProvider>
            {children}
          </PyodideProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
