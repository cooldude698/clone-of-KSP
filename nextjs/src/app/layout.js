import "./globals.css";
import "leaflet/dist/leaflet.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata = {
  title: "DRISHTI ದೃಷ್ಟಿ — Karnataka State Police AI Co-Pilot",
  description: "AI-powered Crime Intelligence platform for Karnataka State Police. Real-time analytics, hotspot mapping, and ANPR surveillance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-void-000 text-paper-100 font-sans antialiased transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
