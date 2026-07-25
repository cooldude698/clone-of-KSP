import { Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import ThemeProvider from "@/components/ThemeProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const googleSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-google-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "DRISHTI ದೃಷ್ಟಿ — Karnataka State Police AI Co-Pilot",
  description: "AI-powered Crime Intelligence platform for Karnataka State Police. Real-time analytics, hotspot mapping, and ANPR surveillance.",
};

// Inline script that runs synchronously BEFORE any content renders.
const themeScript = `
(function() {
  try {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  } catch(e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${googleSans.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300..900;1,300..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />
        {/* Blocking script prevents FOUC — runs before CSS paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-void-000 text-paper-100 font-sans antialiased transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

