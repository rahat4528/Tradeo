import './globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata = {
  title: 'Notion Clone — Block Document & Knowledge Base',
  description: 'Connected workspace where better, faster work happens with nested docs and modular blocks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-[#37352f]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
