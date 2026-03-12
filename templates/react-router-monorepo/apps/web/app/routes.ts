import { index, route, type RouteConfig } from "@react-router/dev/routes"

export default [
  index("routes/index.tsx"),
  route("markets", "routes/markets.tsx"),
  route("trade", "routes/trade.tsx"),
  route("positions", "routes/positions.tsx"),
  route("orders", "routes/orders.tsx"),
  route("wallet", "routes/wallet.tsx"),
  route("settings", "routes/settings.tsx"),
] satisfies RouteConfig

