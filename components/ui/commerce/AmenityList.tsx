'use client'

import {
  Wifi, Car, Coffee, Utensils, Waves, Dumbbell, Briefcase, Wind,
  Tv, Lock, Bath, Mountain, Palmtree, PawPrint, Baby, Accessibility,
  Wine, Music, Camera, Umbrella, Thermometer, Fan, Flame,
  LucideIcon, Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

type AmenityIconType =
  | 'wifi' | 'parking' | 'breakfast' | 'restaurant' | 'pool' | 'gym'
  | 'business' | 'ac' | 'tv' | 'safe' | 'spa' | 'view' | 'beach'
  | 'pets' | 'kids' | 'accessible' | 'bar' | 'music' | 'photo'
  | 'beach-umbrella' | 'heating' | 'fan' | 'fireplace'

interface Amenity {
  id: string
  name: string
  icon?: AmenityIconType
  included?: boolean
}

interface AmenityListProps {
  amenities: Amenity[]
  variant?: 'grid' | 'list' | 'tags' | 'compact'
  columns?: 2 | 3 | 4
  showIcons?: boolean
  className?: string
}

const iconMap: Record<AmenityIconType, LucideIcon> = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
  restaurant: Utensils,
  pool: Waves,
  gym: Dumbbell,
  business: Briefcase,
  ac: Wind,
  tv: Tv,
  safe: Lock,
  spa: Bath,
  view: Mountain,
  beach: Palmtree,
  pets: PawPrint,
  kids: Baby,
  accessible: Accessibility,
  bar: Wine,
  music: Music,
  photo: Camera,
  'beach-umbrella': Umbrella,
  heating: Thermometer,
  fan: Fan,
  fireplace: Flame,
}

export function AmenityList({
  amenities,
  variant = 'grid',
  columns = 3,
  showIcons = true,
  className,
}: AmenityListProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  if (variant === 'tags') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {amenities.map((amenity) => {
          const Icon = amenity.icon ? iconMap[amenity.icon] : Check
          return (
            <span
              key={amenity.id}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm',
                amenity.included !== false
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-50 text-gray-500 border border-gray-200 line-through'
              )}
            >
              {showIcons && Icon && <Icon className="w-3.5 h-3.5" />}
              {amenity.name}
            </span>
          )
        })}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-3', className)}>
        {amenities.map((amenity) => {
          const Icon = amenity.icon ? iconMap[amenity.icon] : Check
          return (
            <div
              key={amenity.id}
              className="flex items-center gap-1 text-sm text-gray-600"
              title={amenity.name}
            >
              {showIcons && Icon && <Icon className="w-4 h-4" />}
              <span className="hidden sm:inline">{amenity.name}</span>
            </div>
          )
        })}
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <ul className={cn('space-y-2', className)}>
        {amenities.map((amenity) => {
          const Icon = amenity.icon ? iconMap[amenity.icon] : Check
          return (
            <li
              key={amenity.id}
              className={cn(
                'flex items-center gap-2 text-sm',
                amenity.included !== false ? 'text-gray-700' : 'text-gray-400 line-through'
              )}
            >
              {showIcons && Icon && (
                <Icon className={cn(
                  'w-4 h-4',
                  amenity.included !== false ? 'text-green-500' : 'text-gray-300'
                )} />
              )}
              {amenity.name}
            </li>
          )
        })}
      </ul>
    )
  }

  // Grid variant (default)
  return (
    <div className={cn(`grid gap-3 ${gridCols[columns]}`, className)}>
      {amenities.map((amenity) => {
        const Icon = amenity.icon ? iconMap[amenity.icon] : Check
        return (
          <div
            key={amenity.id}
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg text-sm',
              amenity.included !== false
                ? 'bg-gray-50 text-gray-700'
                : 'bg-gray-50/50 text-gray-400'
            )}
          >
            {showIcons && Icon && (
              <Icon className={cn(
                'w-4 h-4 flex-shrink-0',
                amenity.included !== false ? 'text-gray-500' : 'text-gray-300'
              )} />
            )}
            <span className={amenity.included === false ? 'line-through' : ''}>
              {amenity.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
