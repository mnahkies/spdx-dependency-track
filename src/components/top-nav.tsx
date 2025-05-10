"use client"

import {Tab, Tabs} from "@mui/material"
import Link from "next/link"
import {usePathname} from "next/navigation"
import type React from "react"

function useRouteMatch(pathname: string, patterns: readonly string[]) {
  const match = patterns
    .filter((it) => pathname.startsWith(it))
    .sort()
    .pop()
  return {match, isExact: match === pathname}
}

const topNavRoutes = [
  {label: "Scan", href: "/"},
  {label: "Repositories", href: "/repositories"},
  {label: "Known Licenses", href: "/known-licenses"},
]

export const TopNav: React.FC = () => {
  const pathname = usePathname()
  const {match: routeMatch, isExact} = useRouteMatch(
    pathname,
    topNavRoutes.map((it) => it.href),
  )

  return (
    <>
      <Tabs value={routeMatch} aria-label="main navigation">
        {topNavRoutes.map((it) => (
          <Tab
            label={it.label}
            key={it.href}
            value={it.href}
            href={it.href}
            component={Link}
          />
        ))}
      </Tabs>
    </>
  )
}
