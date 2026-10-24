import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Chesstats - Advanced Chess Analytics & Tilt Telemetry',
  description:
    'Comprehensive chess analytics, Stockfish move evaluation, ACPL precision metrics, opening repertoire trees, and tilt telemetry for Chess.com and Lichess players.',
  keywords: ['chess', 'chess stats', 'chess analytics', 'chess accuracy', 'tilt detection', 'lichess', 'chess.com', 'stockfish'],
  authors: [{ name: 'Chesstats' }],
  openGraph: {
    title: 'Chesstats - Advanced Chess Analytics & Tilt Telemetry',
    description: 'Precision ACPL modeling, opening weaknesses, and real-time game review for competitive chess players.',
    siteName: 'Chesstats',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
