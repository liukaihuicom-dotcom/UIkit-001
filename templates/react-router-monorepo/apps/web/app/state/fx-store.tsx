import * as React from "react"

import type { FxOrder, FxPosition, FxQuote, FxSide } from "../lib/fx"
import { FX_PAIRS, seedQuotes, tickQuote, uid } from "../lib/fx"

type FxState = {
  quotes: Record<string, FxQuote>
  positions: Record<string, FxPosition>
  orders: FxOrder[]
  balances: Record<string, number>
}

type PlaceOrderInput = {
  symbol: string
  side: FxSide
  qty: number
}

type FxStore = FxState & {
  placeMarketOrder: (input: PlaceOrderInput) => void
  cancelAllOrders: () => void
}

const FxStoreContext = React.createContext<FxStore | null>(null)

function pnlForPosition(pos: FxPosition, quote: FxQuote) {
  const mid = (quote.bid + quote.ask) / 2
  const direction = pos.side === "buy" ? 1 : -1
  return (mid - pos.avgPrice) * pos.qty * direction
}

export function FxStoreProvider({ children }: { children: React.ReactNode }) {
  const [quotes, setQuotes] = React.useState<Record<string, FxQuote>>(() =>
    seedQuotes()
  )
  const [positions, setPositions] = React.useState<Record<string, FxPosition>>(
    {}
  )
  const [orders, setOrders] = React.useState<FxOrder[]>([])
  const [balances, setBalances] = React.useState<Record<string, number>>({
    USD: 10_000,
    EUR: 0,
    JPY: 0,
    GBP: 0,
    AUD: 0,
    CAD: 0,
  })

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setQuotes((prev) => {
        const next: Record<string, FxQuote> = { ...prev }
        for (const p of FX_PAIRS) {
          const q = next[p.symbol]
          if (q) next[p.symbol] = tickQuote(q, p.pip)
        }
        return next
      })
    }, 900)
    return () => window.clearInterval(id)
  }, [])

  React.useEffect(() => {
    setPositions((prev) => {
      const next: Record<string, FxPosition> = { ...prev }
      for (const symbol of Object.keys(next)) {
        const q = quotes[symbol]
        if (!q) continue
        next[symbol] = { ...next[symbol], unrealizedPnl: pnlForPosition(next[symbol], q) }
      }
      return next
    })
  }, [quotes])

  const placeMarketOrder = React.useCallback(
    ({ symbol, side, qty }: PlaceOrderInput) => {
      const q = quotes[symbol]
      if (!q) return

      const price = side === "buy" ? q.ask : q.bid
      const id = uid("ord")
      const now = Date.now()

      setOrders((prev) => [
        { id, symbol, side, qty, price, status: "filled", createdAt: now },
        ...prev,
      ])

      setPositions((prev) => {
        const existing = prev[symbol]
        if (!existing) {
          return {
            ...prev,
            [symbol]: {
              symbol,
              side,
              qty,
              avgPrice: price,
              unrealizedPnl: 0,
            },
          }
        }

        // 简化：同向加仓按加权均价；反向则净额对冲（不做复杂的平仓计费）
        if (existing.side === side) {
          const newQty = existing.qty + qty
          const avgPrice = (existing.avgPrice * existing.qty + price * qty) / newQty
          return {
            ...prev,
            [symbol]: { ...existing, qty: newQty, avgPrice },
          }
        }

        const netQty = existing.qty - qty
        if (netQty > 0) {
          return { ...prev, [symbol]: { ...existing, qty: netQty } }
        }
        if (netQty < 0) {
          return {
            ...prev,
            [symbol]: {
              symbol,
              side,
              qty: Math.abs(netQty),
              avgPrice: price,
              unrealizedPnl: 0,
            },
          }
        }
        const { [symbol]: _, ...rest } = prev
        return rest
      })

      // 简化：只更新报价货币余额（示意，不做真实保证金/杠杆）
      const pair = FX_PAIRS.find((p) => p.symbol === symbol)
      if (pair) {
        const cost = qty * price
        setBalances((b) => {
          const next = { ...b }
          if (side === "buy") {
            next[pair.quote] = (next[pair.quote] ?? 0) - cost
            next[pair.base] = (next[pair.base] ?? 0) + qty
          } else {
            next[pair.base] = (next[pair.base] ?? 0) - qty
            next[pair.quote] = (next[pair.quote] ?? 0) + cost
          }
          return next
        })
      }
    },
    [quotes]
  )

  const cancelAllOrders = React.useCallback(() => {
    setOrders((prev) =>
      prev.map((o) => (o.status === "filled" ? o : { ...o, status: "cancelled" }))
    )
  }, [])

  const value: FxStore = React.useMemo(
    () => ({
      quotes,
      positions,
      orders,
      balances,
      placeMarketOrder,
      cancelAllOrders,
    }),
    [quotes, positions, orders, balances, placeMarketOrder, cancelAllOrders]
  )

  return <FxStoreContext.Provider value={value}>{children}</FxStoreContext.Provider>
}

export function useFxStore() {
  const ctx = React.useContext(FxStoreContext)
  if (!ctx) throw new Error("useFxStore must be used within FxStoreProvider")
  return ctx
}

