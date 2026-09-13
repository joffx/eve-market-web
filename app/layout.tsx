import type { Metadata } from "next"
import { Geist_Mono, Outfit } from "next/font/google"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AppProviders } from "@/components/providers/app-providers"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

import "./globals.css"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "EVE Mining Market",
    template: "%s · EVE Mining Market",
  },
  description:
    "Herramienta sencilla de mercado minero de EVE Online usando la API oficial ESI.",
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
      className={cn("dark antialiased", fontMono.variable, "font-sans", outfit.variable)}
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
