import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Conference Connect',
  description: 'Network smarter at conferences — find your perfect connections.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
