/**
 * Lightweight market data fetcher for header ticker and market snapshot.
 *
 * Source: CoinGecko public API (no key required). Falls back to a frozen
 * snapshot if the network call fails so the UI never breaks the page.
 *
 * Cached on the server with `next` revalidation so we hit CoinGecko at most
 * once per minute regardless of traffic.
 */

export interface MarketCoin {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number   // percentage, e.g. 1.42 = +1.42%
}

const COINS: ReadonlyArray<{ id: string; symbol: string; name: string }> = [
  { id: 'bitcoin',      symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum',     symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana',       symbol: 'SOL', name: 'Solana' },
  { id: 'binancecoin',  symbol: 'BNB', name: 'BNB' },
  { id: 'ripple',       symbol: 'XRP', name: 'XRP' },
  { id: 'cardano',      symbol: 'ADA', name: 'Cardano' },
]

// Frozen seed used when the upstream call fails. Numbers are illustrative —
// they only render until the first successful fetch revalidates them.
const SEED: Record<string, { price: number; change24h: number }> = {
  bitcoin:     { price: 96420, change24h: 1.32 },
  ethereum:    { price: 3340,  change24h: 0.84 },
  solana:      { price: 178,   change24h: -1.05 },
  binancecoin: { price: 612,   change24h: 0.42 },
  ripple:      { price: 2.18,  change24h: -0.28 },
  cardano:     { price: 0.94,  change24h: 1.74 },
}

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price' +
  `?ids=${COINS.map((c) => c.id).join(',')}` +
  '&vs_currencies=usd&include_24hr_change=true'

export async function getMarketPrices(): Promise<MarketCoin[]> {
  try {
    const res = await fetch(COINGECKO_URL, {
      // ISR: cache the response for 60s server-side
      next: { revalidate: 60 },
      headers: { accept: 'application/json' },
    })

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`)
    const data = (await res.json()) as Record<
      string,
      { usd?: number; usd_24h_change?: number }
    >

    return COINS.map(({ id, symbol, name }) => {
      const entry = data[id]
      const seed = SEED[id]
      return {
        id,
        symbol,
        name,
        price: typeof entry?.usd === 'number' ? entry.usd : seed.price,
        change24h:
          typeof entry?.usd_24h_change === 'number'
            ? entry.usd_24h_change
            : seed.change24h,
      }
    })
  } catch {
    return COINS.map(({ id, symbol, name }) => ({
      id,
      symbol,
      name,
      price: SEED[id].price,
      change24h: SEED[id].change24h,
    }))
  }
}

/** Format USD price with a sensible number of decimals. */
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  if (price >= 1) {
    return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return price.toLocaleString('en-US', { maximumFractionDigits: 4 })
}

/** Format 24h change with sign. */
export function formatChange(change: number): string {
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}
