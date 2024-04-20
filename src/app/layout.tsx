import type {Metadata} from "next"
import {Inter} from "next/font/google"
import "./globals.css"

const inter = Inter({subsets: ["latin"]})
import theme from "@/theme"
import {ThemeProvider} from "@mui/material"
import {AppRouterCacheProvider} from "@mui/material-nextjs/v14-appRouter"
import CssBaseline from "@mui/material/CssBaseline"

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
      <body className={inter.className}>{children}</body>
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body>
        <AppRouterCacheProvider options={{enableCssLayer: true}}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
