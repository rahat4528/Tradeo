import './globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata = {
  title: 'Trello Clone — Visual Project & Team Boards',
  description: 'Organize projects, lists, and actionable cards with real-time drag-and-drop collaboration.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
