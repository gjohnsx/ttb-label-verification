import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const publicSans = Public_Sans({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "TTB Label Verification",
  description: "AI-powered tool for TTB compliance agents to verify alcohol label applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={publicSans.variable}>
      <body
        className={`${publicSans.variable} antialiased`}
      >
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
