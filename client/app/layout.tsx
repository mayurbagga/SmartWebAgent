import "@/styles/globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/ui/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/app/auth/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Gintonic AI Agents",
  description: "Browse and create AI agents for your specific needs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // new code
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            {children}
            <Footer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
