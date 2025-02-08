import "@/styles/globals.css";
import RootLayout from "./RootLayout";

export const metadata = {
  title: "Gintonic AI Agents",
  description: "Browse and create AI agents for your specific needs",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>;
}
