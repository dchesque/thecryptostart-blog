/**
 * Lightweight market data fetcher for header ticker and market snapshot.
 *
 * Initial render uses the CoinGecko public REST API (server-side, ISR-cached).
 * The browser then upgrades to a live Binance WebSocket stream for real-time
 * updates — see components/LiveTicker.tsx.
 *
 * Falls back to a frozen snapshot if the network call fails so the UI never
 * breaks the page.
 */

export interface MarketCoin {
  id: string
  symbol: string         // display symbol, e.g. "BTC"
  binanceSymbol: string  // Binance pair, e.g. "BTCUSDT"
  name: string
  price: number
  change24h: number      // percentage, e.g. 1.42 = +1.42%
}

export const COINS: ReadonlyArray<{
  id: string
  symbol: string
  binanceSymbol: string
  name: string
}> = [
  { id: 'bitcoin',     symbol: 'BTC', binanceSymbol: 'BTCUSDT', name: 'Bitcoin' },
  { id: 'ethereum',    symbol: 'ETH', binanceSymbol: 'ETHUSDT', name: 'Ethereum' },
  { id: 'solana',      symbol: 'SOL', binanceSymbol: 'SOLUSDT', name: 'Solana' },
  { id: 'binancecoin', symbol: 'BNB', binanceSymbol: 'BNBUSDT', name: 'BNB' },
  { id: 'ripple',      symbol: 'XRP', binanceSymbol: 'XRPUSDT', name: 'XRP' },
  { id: 'cardano',     symbol: 'ADA', binanceSymbol: 'ADAUSDT', name: 'Cardano' },
]

/** Map Binance symbol back to internal coin id, used by the WS client. */
export const BINANCE_TO_ID: Record<string, string> = COINS.reduce(
  (acc, c) => {
    acc[c.binanceSymbol] = c.id
    return acc
  },
  {} as Record<string, string>
)

/** Combined Binance stream URL for all tracked coins. */
export const BINANCE_STREAM_URL = (() => {
  const streams = COINS.map((c) => `${c.binanceSymbol.toLowerCase()}@ticker`).join('/')
  return `wss://stream.binance.com:9443/stream?streams=${streams}`
})()

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

    return COINS.map(({ id, symbol, binanceSymbol, name }) => {
      const entry = data[id]
      const seed = SEED[id]
      return {
        id,
        symbol,
        binanceSymbol,
        name,
        price: typeof entry?.usd === 'number' ? entry.usd : seed.price,
        change24h:
          typeof entry?.usd_24h_change === 'number'
            ? entry.usd_24h_change
            : seed.change24h,
      }
    })
  } catch {
    return COINS.map(({ id, symbol, binanceSymbol, name }) => ({
      id,
      symbol,
      binanceSymbol,
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
