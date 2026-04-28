import { getMarketPrices } from '@/lib/market'
import LiveTicker from './LiveTicker'

/**
 * Top-of-page crypto ticker. Server-fetches an initial snapshot via
 * CoinGecko REST (so the strip is populated before JS), then hands off
 * to the Binance WebSocket-driven LiveTicker on the client.
 */
export default async function TickerBar() {
  const initialCoins = await getMarketPrices()
  return <LiveTicker initialCoins={initialCoins} />
}
