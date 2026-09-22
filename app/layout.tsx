import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { AuthProvider } from "@/lib/auth/context";
import { ResumeStoreProvider } from "@/lib/store/context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Resume Builder",
    template: "%s · Resume Builder",
  },
  description: "Pick a template, fill in a form with a live preview, and download a clean A4 PDF resume.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900">
        <AuthProvider>
          <ResumeStoreProvider>
            <SiteHeader />
            <div className="flex flex-1 flex-col">{children}</div>
          </ResumeStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
