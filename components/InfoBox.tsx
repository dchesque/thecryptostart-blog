import { ReactNode } from 'react'
import { Lightbulb, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'

type InfoBoxType = 'tip' | 'warning' | 'info' | 'success'

interface InfoBoxProps {
  type?: InfoBoxType
  title?: string
  children: ReactNode
  className?: string
}

const typeConfig: Record<
  InfoBoxType,
  { Icon: typeof Lightbulb; accent: string; iconColor: string }
> = {
  tip:     { Icon: Lightbulb,    accent: 'border-l-accent',     iconColor: 'text-accent-deep' },
  warning: { Icon: AlertTriangle, accent: 'border-l-amber-500',  iconColor: 'text-amber-600' },
  info:    { Icon: Info,          accent: 'border-l-sky-500',    iconColor: 'text-sky-600' },
  success: { Icon: CheckCircle2,  accent: 'border-l-emerald-500', iconColor: 'text-emerald-700' },
}

export default function InfoBox({ type = 'info', title, children, className = '' }: InfoBoxProps) {
  const { Icon, accent, iconColor } = typeConfig[type]

  return (
    <aside
      className={`not-prose my-8 bg-cream border border-line ${accent} border-l-4 rounded-r-xl rounded-l-md p-5 ${className}`}
      role="note"
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} aria-hidden />
        <div className="flex-1 min-w-0">
          {title && (
            <p className="font-heading text-sm font-bold text-ink mb-1.5">
              {title}
            </p>
          )}
          <div className="text-[0.95rem] text-ink-soft leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </aside>
  )
}
