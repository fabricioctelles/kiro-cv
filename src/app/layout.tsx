import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import './globals.css';
import { resume } from '@/lib/resume-data';

const siteTitle = resume.siteTitle || 'Terminal CV';
const siteDescription = resume.siteDescription || 'Interactive CLI-style portfolio';
const authorName = resume.basics?.name || 'Developer';
const siteUrl = resume.basics?.url || '';

export const metadata: Metadata = {
  title: `${siteTitle} - ${authorName}`,
  description: siteDescription,
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: 'website',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-text font-mono antialiased h-screen overflow-hidden">
        {children}
        <Analytics />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
