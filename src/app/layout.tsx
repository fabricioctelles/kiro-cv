import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { siteConfig } from '@/config/site';

const ogTitle = `${siteConfig.name} v${siteConfig.version}`;

export const metadata: Metadata = {
  title: `${siteConfig.name} - ${siteConfig.author}`,
  description: siteConfig.description,
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: ogTitle,
    description: siteConfig.description,
    type: 'website',
    url: siteConfig.url,
  },
  twitter: {
    card: 'summary_large_image',
    title: ogTitle,
    description: siteConfig.description,
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
      </body>
    </html>
  );
}
