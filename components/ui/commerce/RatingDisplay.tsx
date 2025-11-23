'use client'

import { Star, StarHalf } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingDisplayProps {
  rating: number
  maxRating?: number
  showValue?: boolean
  showCount?: boolean
  count?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'stars' | 'score'
  className?: string
}

export function RatingDisplay({
  rating,
  maxRating = 5,
  showValue = false,
  showCount = false,
  count = 0,
  size = 'md',
  variant = 'stars',
  className,
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: { star: 'w-3 h-3', text: 'text-xs' },
    md: { star: 'w-4 h-4', text: 'text-sm' },
    lg: { star: 'w-5 h-5', text: 'text-base' },
  }

  const sizes = sizeClasses[size]

  if (variant === 'score') {
    // Wine/critic score display (0-100)
    const scoreColor = rating >= 90
      ? 'bg-green-100 text-green-800'
      : rating >= 80
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-gray-100 text-gray-800'

    return (
      <div className={cn('flex items-center gap-1', className)}>
        <span className={cn('px-2 py-0.5 rounded font-bold', scoreColor, sizes.text)}>
          {rating}
        </span>
        {showValue && (
          <span className={cn('text-gray-500', sizes.text)}>
            /{maxRating}
          </span>
        )}
      </div>
    )
  }

  // Stars display
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={cn(sizes.star, 'text-yellow-400 fill-yellow-400')}
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className={cn(sizes.star, 'text-gray-200')} />
            <StarHalf
              className={cn(sizes.star, 'absolute top-0 left-0 text-yellow-400 fill-yellow-400')}
            />
          </div>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn(sizes.star, 'text-gray-200')}
          />
        ))}
      </div>

      {showValue && (
        <span className={cn('text-gray-700 font-medium', sizes.text)}>
          {rating.toFixed(1)}
        </span>
      )}

      {showCount && count > 0 && (
        <span className={cn('text-gray-500', sizes.text)}>
          ({count})
        </span>
      )}
    </div>
  )
}
