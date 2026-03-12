export type FxSide = "buy" | "sell"

export type FxPair = {
  symbol: string
  base: string
  quote: string
  pip: number
}

export type FxQuote = {
  symbol: string
  bid: number
  ask: number
  changePct24h: number
  ts: number
}

export type FxOrder = {
  id: string
  symbol: string
  side: FxSide
  qty: number
  price: number
  status: "filled" | "cancelled"
  createdAt: number
}

export type FxPosition = {
  symbol: string
  side: FxSide
  qty: number
  avgPrice: number
  unrealizedPnl: number
}

export const FX_PAIRS: FxPair[] = [
  { symbol: "EURUSD", base: "EUR", quote: "USD", pip: 0.0001 },
  { symbol: "USDJPY", base: "USD", quote: "JPY", pip: 0.01 },
  { symbol: "GBPUSD", base: "GBP", quote: "USD", pip: 0.0001 },
  { symbol: "AUDUSD", base: "AUD", quote: "USD", pip: 0.0001 },
  { symbol: "USDCAD", base: "USD", quote: "CAD", pip: 0.0001 },
]

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function roundTo(n: number, step: number) {
  const inv = 1 / step
  return Math.round(n * inv) / inv
}

export function formatPrice(symbol: string, price: number) {
  const pair = FX_PAIRS.find((p) => p.symbol === symbol)
  const pip = pair?.pip ?? 0.0001
  const decimals = Math.max(0, Math.round(Math.log10(1 / pip)))
  return price.toFixed(decimals)
}

export function seedQuotes(now = Date.now()): Record<string, FxQuote> {
  const base: Record<string, FxQuote> = {
    EURUSD: { symbol: "EURUSD", bid: 1.0872, ask: 1.0874, changePct24h: 0.18, ts: now },
    USDJPY: { symbol: "USDJPY", bid: 148.62, ask: 148.64, changePct24h: -0.12, ts: now },
    GBPUSD: { symbol: "GBPUSD", bid: 1.2741, ask: 1.2744, changePct24h: 0.05, ts: now },
    AUDUSD: { symbol: "AUDUSD", bid: 0.6584, ask: 0.6586, changePct24h: 0.22, ts: now },
    USDCAD: { symbol: "USDCAD", bid: 1.3521, ask: 1.3524, changePct24h: -0.08, ts: now },
  }
  return base
}

export function tickQuote(q: FxQuote, pip: number): FxQuote {
  const spread = Math.max(pip * 1.5, (q.ask - q.bid) * 0.98)
  const mid = (q.ask + q.bid) / 2
  const drift = (Math.random() - 0.5) * pip * 8
  const nextMid = clamp(mid + drift, mid * 0.9, mid * 1.1)
  const bid = roundTo(nextMid - spread / 2, pip)
  const ask = roundTo(nextMid + spread / 2, pip)
  const change = ((nextMid - mid) / mid) * 100
  return {
    ...q,
    bid,
    ask,
    changePct24h: clamp(q.changePct24h + change * 0.02, -5, 5),
    ts: Date.now(),
  }
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

