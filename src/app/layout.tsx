import {ClientProviders} from "@/app/providers/client-providers"
import {ServerProviders} from "@/app/providers/server-providers"
import {TopNav} from "@/components/top-nav"
import {Container, Stack} from "@mui/material"
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
          <ClientProviders>
            <Container maxWidth="xl">
              <Stack>
                <TopNav />
                {children}
              </Stack>
            </Container>
          </ClientProviders>
        </ServerProviders>
      </body>
    </html>
  )
}
