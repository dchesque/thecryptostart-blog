import Link from 'next/link'
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react'
import { getMarketPrices, formatPrice, formatChange } from '@/lib/market'

interface MarketSnapshotProps {
  className?: string
  limit?: number
}

/**
 * Compact market snapshot for the home page. Shows the top crypto assets
 * with price + 24h change in a card grid. Server-rendered, ISR-cached.
 */
export default async function MarketSnapshot({ className = '', limit = 4 }: MarketSnapshotProps) {
  const coins = (await getMarketPrices()).slice(0, limit)

  return (
    <section className={className}>
      <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <span className="eyebrow">Market snapshot</span>
          <h2 className="mt-2 section-title">Where the market sits today.</h2>
          <p className="mt-2 text-ink-mute text-sm">
            Spot prices and 24h moves. Updated every minute.
          </p>
        </div>
        <Link
          href="/blog?category=investing-and-strategy"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-ink-mute hover:text-ink transition-colors whitespace-nowrap shrink-0"
        >
          Strategy guides <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {coins.map((coin) => {
          const up = coin.change24h > 0
          const flat = coin.change24h === 0
          const Icon = flat ? null : up ? TrendingUp : TrendingDown
          const deltaCls = flat ? 'text-ink-mute' : up ? 'text-up' : 'text-down'
          const chipBg = flat ? 'bg-cream' : up ? 'bg-up-soft' : 'bg-down-soft'

          return (
            <article
              key={coin.id}
              className="rounded-xl sm:rounded-2xl border border-line bg-paper p-4 sm:p-5 flex flex-col gap-3 sm:gap-4"
            >
              <header className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-mute">
                    {coin.symbol} · USD
                  </div>
                  <div className="font-heading text-sm sm:text-base font-semibold text-ink mt-0.5 truncate">
                    {coin.name}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${chipBg} ${deltaCls} text-[10px] sm:text-[11px] font-semibold num shrink-0`}
                >
                  {Icon && <Icon className="w-3 h-3" aria-hidden />}
                  {formatChange(coin.change24h)}
                </span>
              </header>

              <div className="num font-heading text-xl sm:text-2xl font-bold text-ink leading-none">
                ${formatPrice(coin.price)}
              </div>

              <div className="text-[10px] sm:text-[11px] text-ink-mute">
                24h change · USD spot
              </div>
            </article>
          )
        })}
      </div>

      <p className="mt-4 text-[11px] text-ink-faint">
        Data via CoinGecko. Indicative only — not financial advice.
      </p>
    </section>
  )
}
