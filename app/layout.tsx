import type {Metadata} from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'KampusKreatif AI - Social Media & Visual Art Director Mahasiswa',
  description: 'Asisten Kreatif, Copywriter, dan Strategi Visual Kampus Ter-Estetik, Ramah, dan Kekinian!',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className={`${inter.variable} ${plusJakarta.className}`}>
      <body className="bg-[#FAF9F5] text-[#2C2C2C] selection:bg-pink-100 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
