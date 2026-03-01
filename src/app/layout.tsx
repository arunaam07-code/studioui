import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BIOVALOUR | Waste to Wealth',
  description: 'AI-powered real-time monitoring for biovalorisation processes. Converting waste into biological wealth.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@100;400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
