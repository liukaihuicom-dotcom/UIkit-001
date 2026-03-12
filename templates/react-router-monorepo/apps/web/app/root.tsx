import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router"

import type { Route } from "./+types/root"
import "@workspace/ui/globals.css"
import { FxStoreProvider } from "./state/fx-store"
import { NavLink } from "react-router"
import * as React from "react"

const nav = [
  { to: "/markets", label: "行情" },
  { to: "/trade", label: "交易" },
  { to: "/positions", label: "持仓" },
  { to: "/orders", label: "订单" },
  { to: "/wallet", label: "资金" },
  { to: "/settings", label: "设置" },
] as const

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <FxStoreProvider>
          <div className="min-h-svh bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
              <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
                <div className="text-sm font-semibold tracking-wide">
                  FX Trader
                </div>
                <ThemeToggle />
              </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 pb-20 pt-4">
              {children}
            </main>

            <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/90 backdrop-blur">
              <div className="mx-auto grid max-w-5xl grid-cols-6 px-2">
                {nav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        "flex h-14 flex-col items-center justify-center gap-1 text-xs",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      ].join(" ")
                    }
                  >
                    <span className="h-1 w-8 rounded-full bg-transparent" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </nav>
          </div>
        </FxStoreProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    const saved = window.localStorage.getItem("theme")
    const dark = saved ? saved === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    setIsDark(!!dark)
  }, [])

  React.useEffect(() => {
    const root = document.documentElement
    if (isDark) root.classList.add("dark")
    else root.classList.remove("dark")
    window.localStorage.setItem("theme", isDark ? "dark" : "light")
  }, [isDark])

  return (
    <button
      type="button"
      onClick={() => setIsDark((v) => !v)}
      className="rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
    >
      {isDark ? "深色" : "浅色"}
    </button>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
