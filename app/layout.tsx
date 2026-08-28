import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

export const metadata: Metadata = {
  title: 'LifeOS — The Unified Operating System for Your Ambition, Habits & Life',
  description: 'Master your daily focus, atomic habits, financial runway, and life goals in one beautifully crafted, distraction-free operating system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
