import type { Metadata } from "next"
import "./globals.css"
import ToasterProvider from "./toaster-provider"

export const metadata: Metadata = {
  title: "Voice Shopping Assistant",
  description: "AI-powered voice-controlled shopping list assistant",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToasterProvider />
      </body>
    </html>
  )
}
