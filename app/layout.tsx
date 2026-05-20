import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { auth } from '@/lib/auth';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'opsz'],
  variable: '--font-fraunces',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  title: {
    default: 'The Court — Tout se joue ici',
    template: '%s · The Court',
  },
  description:
    "La plateforme française des sports de raquette. Tournois, partenaires, paiement, résultats — pour le joueur, le club, le juge-arbitre.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'The Court — Tout se joue ici',
    description: 'La plateforme française des sports de raquette.',
    locale: 'fr_FR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f1ede5' },
    { media: '(prefers-color-scheme: dark)', color: '#082b21' },
  ],
};

/* Script exécuté avant hydration pour éviter le flash de thème */
const themeScript = `
(function(){
  try{
    var t=localStorage.getItem('tc-theme');
    if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);return;}
    // Pas de préférence stockée : suit le système
    if(window.matchMedia('(prefers-color-scheme: dark)').matches){
      document.documentElement.setAttribute('data-theme','dark');
    }
  }catch(e){}
})();
`.trim();

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  /* Récupère la session côté serveur pour l'injecter dans SessionProvider
     sans flash "déconnecté" au premier rendu client. */
  const session = await auth();

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-page text-primary antialiased">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
