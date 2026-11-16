import './globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata = {
  title: 'API Testing Tool — Developer HTTP Workbench',
  description: 'Interactive API testing, dispatch proxy, environment substitution, and assertion automation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0d1117] text-[#c9d1d9] min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
