import type { Metadata } from "next";
import { Public_Sans, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { NuqsAdapter } from 'nuqs/adapters/next/app'

const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-sans' });
const sourceCodePro = Source_Code_Pro({ subsets: ['latin'], variable: '--font-mono' });

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
    <html lang="en" className={`${publicSans.variable} ${sourceCodePro.variable}`}>
      <body
        className={`${publicSans.variable} antialiased`}
      >
        <NuqsAdapter>
          {children}
        </NuqsAdapter>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
