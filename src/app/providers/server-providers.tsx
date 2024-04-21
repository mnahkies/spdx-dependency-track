"use server"

import theme from "@/theme"
import {ThemeProvider} from "@mui/material"
import {AppRouterCacheProvider} from "@mui/material-nextjs/v14-appRouter"
import CssBaseline from "@mui/material/CssBaseline"
import React from "react"

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
