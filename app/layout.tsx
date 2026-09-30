import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/providers/LanguageProvider";
import { ThemeProvider } from "@/lib/providers/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MobileCTABar } from "@/components/MobileCTABar";
import { CONTACT_INFO } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${CONTACT_INFO.website}`),
  title: "Redline Deco | Painting & Drywalling | Sebdou - Tlemcen",
  description:
    "Redline Deco provides professional drywall, painting, false ceilings, partitions and interior finishing services in Sebdou, Tlemcen and surrounding areas.",
  keywords: [
    "Redline Deco",
    "Sebdou",
    "Tlemcen",
    "Algeria",
    "drywall",
    "painting",
    "gypsum",
    "false ceilings",
    "partitions",
    "interior finishing",
    "renovation",
    "decorative painting",
  ],
  openGraph: {
    title: "Redline Deco | Painting & Drywalling | Sebdou - Tlemcen",
    description:
      "Redline Deco provides professional drywall, painting, false ceilings, partitions and interior finishing services in Sebdou, Tlemcen and surrounding areas.",
    siteName: "Redline Deco",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Redline Deco | Painting & Drywalling | Sebdou - Tlemcen",
    description:
      "Redline Deco provides professional drywall, painting, false ceilings, partitions and interior finishing services in Sebdou, Tlemcen and surrounding areas.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#B91C1C" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var t = localStorage.getItem('theme');
                  var sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (t === 'dark' || (!t && sys)) { document.documentElement.classList.add('dark'); document.documentElement.setAttribute('data-theme','dark'); }
                  var l = localStorage.getItem('language');
                  if (l === 'ar') { document.documentElement.setAttribute('dir','rtl'); document.documentElement.setAttribute('lang','ar'); }
                  else if (l) { document.documentElement.setAttribute('dir','ltr'); document.documentElement.setAttribute('lang', l); }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <LanguageProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[100] focus:bg-brand-red focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
            >
              Skip to content
            </a>
            <Header />
            <main id="main" className="pb-20 md:pb-0">
              {children}
            </main>
            <Footer />
            <WhatsAppButton />
            <MobileCTABar />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
