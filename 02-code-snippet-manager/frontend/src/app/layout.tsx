import './globals.css';
import { AuthProvider } from '../lib/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tradeo Code Snippet Manager | Developer Editor Workspace',
  description: 'Multi-language code snippet manager with Monaco editor, revision snapshots, tags, and search.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-editor-dark text-slate-200 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
