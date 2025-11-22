'use client'

import { User, Baby, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { formatPrice } from '@/lib/utils'

interface GuestSelectorProps {
  adults: number
  children: number
  infants: number
  onAdultsChange: (value: number) => void
  onChildrenChange: (value: number) => void
  onInfantsChange: (value: number) => void
  maxGuests?: number
  maxAdults?: number
  maxChildren?: number
  maxInfants?: number
  minAdults?: number
  adultPrice?: number
  childPrice?: number
  infantPrice?: number
  showPrices?: boolean
  className?: string
}

export function GuestSelector({
  adults,
  children,
  infants,
  onAdultsChange,
  onChildrenChange,
  onInfantsChange,
  maxGuests = 10,
  maxAdults = 8,
  maxChildren = 6,
  maxInfants = 2,
  minAdults = 1,
  adultPrice,
  childPrice,
  infantPrice,
  showPrices = false,
  className,
}: GuestSelectorProps) {
  const t = useTranslations('booking')

  const totalGuests = adults + children + infants
  const canAddGuest = totalGuests < maxGuests

  const Counter = ({
    value,
    onDecrease,
    onIncrease,
    min,
    max,
    label,
    sublabel,
    icon: Icon,
    price,
  }: {
    value: number
    onDecrease: () => void
    onIncrease: () => void
    min: number
    max: number
    label: string
    sublabel: string
    icon: any
    price?: number
  }) => (
    <div className="flex items-center justify-between p-3 bg-theme-background border border-theme-border rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-theme-primary/10 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-theme-primary" />
        </div>
        <div>
          <div className="font-medium text-theme-text">{label}</div>
          <div className="text-xs text-theme-text-muted">{sublabel}</div>
          {showPrices && price !== undefined && (
            <div className="text-xs text-theme-primary font-medium">
              {formatPrice(price)} / {t('perPerson')}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDecrease}
          disabled={value <= min}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
            value <= min
              ? 'bg-theme-surface text-theme-text-muted cursor-not-allowed'
              : 'bg-theme-surface hover:bg-theme-primary/10 text-theme-text'
          )}
        >
          -
        </button>
        <span className="w-8 text-center font-semibold text-theme-text">{value}</span>
        <button
          onClick={onIncrease}
          disabled={value >= max || !canAddGuest}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
            value >= max || !canAddGuest
              ? 'bg-theme-surface text-theme-text-muted cursor-not-allowed'
              : 'bg-theme-surface hover:bg-theme-primary/10 text-theme-text'
          )}
        >
          +
        </button>
      </div>
    </div>
  )

  return (
    <div className={cn('space-y-3', className)}>
      <Counter
        value={adults}
        onDecrease={() => onAdultsChange(Math.max(minAdults, adults - 1))}
        onIncrease={() => onAdultsChange(Math.min(maxAdults, adults + 1))}
        min={minAdults}
        max={maxAdults}
        label={t('adults')}
        sublabel={t('adultsAge')}
        icon={User}
        price={adultPrice}
      />
      <Counter
        value={children}
        onDecrease={() => onChildrenChange(Math.max(0, children - 1))}
        onIncrease={() => onChildrenChange(Math.min(maxChildren, children + 1))}
        min={0}
        max={maxChildren}
        label={t('children')}
        sublabel={t('childrenAge')}
        icon={Users}
        price={childPrice}
      />
      <Counter
        value={infants}
        onDecrease={() => onInfantsChange(Math.max(0, infants - 1))}
        onIncrease={() => onInfantsChange(Math.min(maxInfants, infants + 1))}
        min={0}
        max={maxInfants}
        label={t('infants')}
        sublabel={t('infantsAge')}
        icon={Baby}
        price={infantPrice}
      />

      <div className="text-center text-sm text-theme-text-muted pt-2">
        {t('totalGuests', { count: totalGuests })} / {maxGuests} {t('max')}
      </div>
    </div>
  )
}
