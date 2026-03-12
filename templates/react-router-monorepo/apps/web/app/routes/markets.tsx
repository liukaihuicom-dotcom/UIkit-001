import { Link, useSearchParams } from "react-router"

import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { FX_PAIRS, formatPrice } from "../lib/fx"
import { useFxStore } from "../state/fx-store"

export default function Markets() {
  const { quotes } = useFxStore()
  const [params] = useSearchParams()
  const selected = params.get("symbol")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">行情</h1>
          <p className="text-sm text-muted-foreground">
            模拟报价每 ~900ms 刷新（用于搭 UI 与流程）
          </p>
        </div>
        <Badge variant="secondary">{FX_PAIRS.length} 个品种</Badge>
      </div>

      <div className="grid gap-3">
        {FX_PAIRS.map((p) => {
          const q = quotes[p.symbol]
          const change = q?.changePct24h ?? 0
          const isUp = change >= 0
          const isSelected = selected === p.symbol
          return (
            <Card
              key={p.symbol}
              className={isSelected ? "border-primary/50" : undefined}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <span className="tracking-wide">{p.base}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="tracking-wide">{p.quote}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.symbol}
                    </span>
                  </CardTitle>
                  <Badge
                    variant={isUp ? "secondary" : "destructive"}
                    className={isUp ? "bg-emerald-600 text-white" : undefined}
                  >
                    {isUp ? "+" : ""}
                    {change.toFixed(2)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <div className="grid">
                  <div className="text-xs text-muted-foreground">Bid / Ask</div>
                  <div className="font-mono text-sm">
                    {q ? (
                      <>
                        {formatPrice(p.symbol, q.bid)}{" "}
                        <span className="text-muted-foreground">/</span>{" "}
                        {formatPrice(p.symbol, q.ask)}
                      </>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/trade?symbol=${p.symbol}`}
                    className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
                  >
                    去交易
                  </Link>
                  <Link
                    to={`/markets?symbol=${p.symbol}`}
                    className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
                  >
                    选中
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

