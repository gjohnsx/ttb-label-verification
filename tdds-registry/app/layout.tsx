import type { Metadata } from "next"
import { Merriweather, Public_Sans, Source_Code_Pro } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const merriweather = Merriweather({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
})

const publicSans = Public_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
})

const sourceCodePro = Source_Code_Pro({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "TDDS - Treasury Department Design System",
  description:
    "A shadcn/ui component registry implementing the Treasury Department Design System (TDDS) for federal React applications.",
  keywords: [
    "shadcn",
    "USWDS",
    "Treasury",
    "Federal",
    "Design System",
    "React",
    "Components",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${merriweather.variable} ${publicSans.variable} ${sourceCodePro.variable} antialiased font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}
