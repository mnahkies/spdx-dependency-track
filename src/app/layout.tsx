import {ClientProviders} from "@/app/providers/client-providers"
import {ServerProviders} from "@/app/providers/server-providers"
import type {Metadata} from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "spdx-dependency-track",
  description: "SPDX compatible version of dependency-track",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body>
        <ServerProviders>
          <ClientProviders>{children}</ClientProviders>
        </ServerProviders>
      </body>
    </html>
  )
}
