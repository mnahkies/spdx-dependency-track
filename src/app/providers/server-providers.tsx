"use server"

import {ThemeProvider} from "@mui/material"
import CssBaseline from "@mui/material/CssBaseline"
import {AppRouterCacheProvider} from "@mui/material-nextjs/v14-appRouter"
import type React from "react"
import theme from "@/theme"

export async function ServerProviders({children}: React.PropsWithChildren) {
  return (
    <AppRouterCacheProvider options={{enableCssLayer: true}}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
