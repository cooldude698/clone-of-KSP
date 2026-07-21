import "./globals.css";
import "leaflet/dist/leaflet.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata = {
  title: "DRISHTI ದೃಷ್ಟಿ — Karnataka State Police AI Co-Pilot",
  description: "AI-powered Crime Intelligence platform for Karnataka State Police. Real-time analytics, hotspot mapping, and ANPR surveillance.",
};

// Inline script that runs synchronously BEFORE any content renders.
// Reads localStorage theme preference and immediately applies the class to <html>,
// preventing the Flash of Unstyled Content (FOUC) where the sidebar and other
// themed elements appear as plain/unstyled before React hydrates.
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Default to dark (covers 'dark', null, undefined, 'system')
      document.documentElement.classList.add('dark');
    }
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking script prevents FOUC — runs before CSS paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-void-000 text-paper-100 font-sans antialiased transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
