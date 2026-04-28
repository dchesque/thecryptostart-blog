'use client'

import { useEffect, useRef, useState } from 'react'
import {
  BINANCE_STREAM_URL,
  BINANCE_TO_ID,
  type MarketCoin,
  formatChange,
  formatPrice,
} from '@/lib/market'

interface LiveTickerProps {
  initialCoins: MarketCoin[]
}

type FlashState = Record<string, 'up' | 'down' | undefined>

/**
 * Live crypto ticker.
 *
 * - Initial render uses server-fetched CoinGecko data (so the strip is
 *   populated even without JS).
 * - On mount, opens a Binance WebSocket stream (24hrTicker for our
 *   coin set). Each tick updates price + 24h change in place.
 * - Each price update briefly flashes green / red to telegraph movement.
 * - The list is duplicated into a continuous horizontal marquee so the
 *   prices "pass" by like a stock ticker. Marquee pauses on hover and
 *   respects prefers-reduced-motion.
 * - On disconnect, retries with exponential backoff (capped). The SSR
 *   data keeps the strip useful in the meantime.
 */
export default function LiveTicker({ initialCoins }: LiveTickerProps) {
  const [coins, setCoins] = useState<MarketCoin[]>(initialCoins)
  const [flash, setFlash] = useState<FlashState>({})
  const [isLive, setIsLive] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttempts = useRef(0)
  const flashTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    let cancelled = false

    const connect = () => {
      if (cancelled) return
      let ws: WebSocket
      try {
        ws = new WebSocket(BINANCE_STREAM_URL)
      } catch {
        scheduleReconnect()
        return
      }
      wsRef.current = ws

      ws.onopen = () => {
        if (cancelled) return
        setIsLive(true)
        reconnectAttempts.current = 0
      }

      ws.onmessage = (event: MessageEvent) => {
        if (cancelled) return
        try {
          const msg = JSON.parse(event.data as string)
          const data = msg?.data
          if (!data || data.e !== '24hrTicker') return

          const id = BINANCE_TO_ID[data.s]
          if (!id) return

          const price = Number.parseFloat(data.c)
          const change24h = Number.parseFloat(data.P)
          if (!Number.isFinite(price) || !Number.isFinite(change24h)) return

          setCoins((prev) => {
            const next = prev.map((coin) => {
              if (coin.id !== id) return coin

              // Flash if the price actually changed
              if (price !== coin.price) {
                const direction = price > coin.price ? 'up' : 'down'
                queueFlash(id, direction)
              }
              return { ...coin, price, change24h }
            })
            return next
          })
        } catch {
          // Ignore malformed messages
        }
      }

      ws.onclose = () => {
        if (cancelled) return
        setIsLive(false)
        scheduleReconnect()
      }

      ws.onerror = () => {
        // The `close` handler will fire next and trigger the reconnect.
        try {
          ws.close()
        } catch {
          /* noop */
        }
      }
    }

    const scheduleReconnect = () => {
      if (cancelled) return
      reconnectAttempts.current += 1
      // Cap at ~30s; back off exponentially.
      const delay = Math.min(30_000, 1500 * 2 ** Math.min(reconnectAttempts.current, 5))
      reconnectTimer.current = setTimeout(connect, delay)
    }

    const queueFlash = (id: string, direction: 'up' | 'down') => {
      setFlash((prev) => ({ ...prev, [id]: direction }))
      if (flashTimers.current[id]) clearTimeout(flashTimers.current[id])
      flashTimers.current[id] = setTimeout(() => {
        setFlash((prev) => ({ ...prev, [id]: undefined }))
      }, 700)
    }

    connect()

    return () => {
      cancelled = true
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      Object.values(flashTimers.current).forEach(clearTimeout)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [])

  // Duplicate the list so the CSS marquee can loop seamlessly.
  const loopedCoins = [...coins, ...coins]

  return (
    <div
      className="surface-dark border-b border-white/10"
      role="region"
      aria-label="Crypto market prices"
    >
      <div className="container-wide flex items-center gap-4 h-9 overflow-hidden">
        {/* Status pill */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 text-paper">
          <span
            className={`relative inline-flex w-1.5 h-1.5 rounded-full ${isLive ? 'bg-up' : 'bg-ink-faint'}`}
            aria-hidden
          >
            {isLive && (
              <span className="absolute inset-0 rounded-full bg-up animate-ping opacity-75" />
            )}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            {isLive ? 'Live' : 'Idle'}
          </span>
          <span className="w-px h-3 bg-white/10" aria-hidden />
        </div>

        {/* Marquee */}
        <div className="relative flex-1 overflow-hidden mask-fade">
          <ul
            className="flex items-center gap-7 whitespace-nowrap motion-safe:animate-ticker hover:[animation-play-state:paused] py-1"
            aria-live="off"
          >
            {loopedCoins.map((coin, idx) => {
              const up = coin.change24h > 0
              const flat = coin.change24h === 0
              const deltaCls = flat ? 'delta-flat' : up ? 'delta-up' : 'delta-down'
              const flashState = flash[coin.id]
              const flashCls =
                flashState === 'up'
                  ? 'bg-up/20 ring-1 ring-up/30'
                  : flashState === 'down'
                    ? 'bg-down/20 ring-1 ring-down/30'
                    : ''

              return (
                <li
                  key={`${coin.id}-${idx}`}
                  className="inline-flex items-center gap-2 shrink-0"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-paper/60">
                    {coin.symbol}
                  </span>
                  <span
                    className={`num text-paper text-[13px] font-semibold rounded px-1.5 py-0.5 transition-colors duration-700 ${flashCls}`}
                  >
                    ${formatPrice(coin.price)}
                  </span>
                  <span className={deltaCls}>{formatChange(coin.change24h)}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
