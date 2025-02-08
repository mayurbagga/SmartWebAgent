"use client";

import "@/styles/globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/ui/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/app/auth/Providers";
import { FunctionProvider } from "@/contexts/FunctionContext";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <FunctionProvider>
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
          </FunctionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
