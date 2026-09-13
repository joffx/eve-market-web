import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AppProviders } from "@/components/providers/app-providers"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "EVE Mining Market",
    template: "%s · EVE Mining Market",
  },
  description:
    "Live market data, mining locations and tools for smarter decisions across New Eden.",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/logo-square.png", type: "image/png" }],
    apple: "/logo-square.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn("dark antialiased", geistSans.variable, geistMono.variable, "font-sans")}
    >
      <body className="flex min-h-svh flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AppProviders>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}
