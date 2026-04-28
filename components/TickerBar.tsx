import { getMarketPrices, formatPrice, formatChange } from '@/lib/market'

/**
 * Live crypto ticker strip rendered above the site header. Server-side ISR
 * with a 60s revalidation window — cheap to render, falls back to seed
 * data if the upstream fetch fails.
 */
export default async function TickerBar() {
  const coins = await getMarketPrices()

  return (
    <div className="surface-dark border-b border-white/10" role="region" aria-label="Crypto market prices">
      <div className="container-wide flex items-center gap-6 h-9 overflow-hidden">
        <div className="hidden sm:flex items-center gap-2 shrink-0 text-paper">
          <span className="pulse-dot" aria-hidden />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Live
          </span>
        </div>

        <ul
          className="flex items-center gap-6 overflow-x-auto whitespace-nowrap text-xs scrollbar-none -mx-1 px-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {coins.map((coin) => {
            const up = coin.change24h > 0
            const flat = coin.change24h === 0
            const deltaCls = flat ? 'delta-flat' : up ? 'delta-up' : 'delta-down'
            return (
              <li
                key={coin.id}
                className="inline-flex items-center gap-2 shrink-0"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-paper/60">
                  {coin.symbol}
                </span>
                <span className="num text-paper text-[13px] font-semibold">
                  ${formatPrice(coin.price)}
                </span>
                <span className={deltaCls}>
                  {formatChange(coin.change24h)}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
