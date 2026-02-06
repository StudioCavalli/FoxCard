'use client'

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { trpc } from '@/lib/trpc/client'
import { useTranslations } from 'next-intl'
import { getCountryFlag, getCountryLabel } from '@/lib/countries'
import { useLocale } from 'next-intl'
import { Search, Filter, X, Store, MapPin, Star, Package, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Country coordinates (capital cities)
const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  FR: [48.8566, 2.3522], DE: [52.5200, 13.4050], ES: [40.4168, -3.7038],
  IT: [41.9028, 12.4964], GB: [51.5074, -0.1278], BE: [50.8503, 4.3517],
  NL: [52.3676, 4.9041], CH: [46.9480, 7.4474], AT: [48.2082, 16.3738],
  PT: [38.7223, -9.1393], SE: [59.3293, 18.0686], NO: [59.9139, 10.7522],
  DK: [55.6761, 12.5683], FI: [60.1699, 24.9384], PL: [52.2297, 21.0122],
  CZ: [50.0755, 14.4378], SK: [48.1486, 17.1077], HU: [47.4979, 19.0402],
  RO: [44.4268, 26.1025], BG: [42.6977, 23.3219], GR: [37.9838, 23.7275],
  IE: [53.3498, -6.2603], HR: [45.8150, 15.9819], SI: [46.0569, 14.5058],
  EE: [59.4370, 24.7536], LV: [56.9496, 24.1052], LT: [54.6872, 25.2797],
  LU: [49.6116, 6.1319], MT: [35.8989, 14.5146], CY: [35.1856, 33.3823],
  US: [38.9072, -77.0369], CA: [45.4215, -75.6972], MX: [19.4326, -99.1332],
  BR: [-15.8267, -47.9218], AR: [-34.6037, -58.3816], CL: [-33.4489, -70.6693],
  CO: [4.7110, -74.0721], PE: [-12.0464, -77.0428], VE: [10.4806, -66.9036],
  EC: [-0.1807, -78.4678], AU: [-35.2809, 149.1300], NZ: [-41.2865, 174.7762],
  JP: [35.6762, 139.6503], CN: [39.9042, 116.4074], IN: [28.6139, 77.2090],
  ZA: [-25.7479, 28.2293], RU: [55.7558, 37.6173], UA: [50.4501, 30.5234],
  TR: [39.9334, 32.8597], SA: [24.7136, 46.6753], AE: [24.4539, 54.3773],
  EG: [30.0444, 31.2357], MA: [33.9716, -6.8498], NG: [9.0765, 7.3986],
  KE: [-1.2921, 36.8219], IL: [31.7683, 35.2137], SG: [1.3521, 103.8198],
  MY: [3.1390, 101.6869], TH: [13.7563, 100.5018], VN: [21.0285, 105.8542],
  PH: [14.5995, 120.9842], ID: [-6.2088, 106.8456], KR: [37.5665, 126.9780],
}

const COMMERCE_TYPES = [
  'ALL', 'GENERAL', 'FOOD', 'ALCOHOL', 'FASHION', 'ELECTRONICS', 'BEAUTY',
  'HOME', 'SPORTS', 'TOYS', 'AUTOMOTIVE', 'BOOKS', 'PETS', 'DIGITAL',
  'SERVICES', 'SEASONAL', 'RESTAURANT', 'HOTEL', 'TRAVEL', 'RECREATION'
]

interface StoreLocation {
  id: string
  name: string
  slug: string
  countries: string[]
  logo?: string | null
  tagline?: string | null
  rating?: number | null
  reviewsCount?: number | null
  productsCount: number
  commerceType?: string | null
}

// Custom map center adjuster component
function MapCenterAdjuster({ center }: { center: LatLngExpression }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])

  return null
}

export function ExploreStores() {
  const t = useTranslations('explore')
  const locale = useLocale()
  const [isMounted, setIsMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [commerceType, setCommerceType] = useState('ALL')
  const [showFilters, setShowFilters] = useState(false)

  const { data: storesData, isLoading } = trpc.store.exploreStores.useQuery({
    limit: 100,
    search: search || undefined,
    countries: selectedCountries.length > 0 ? selectedCountries : undefined,
    commerceType: commerceType !== 'ALL' ? commerceType : undefined,
  })

  const stores = storesData?.stores || []
  const availableCountries = storesData?.availableCountries || []

  // Only render map on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Create markers for each country with stores
  const markers = useMemo(() => {
    const result: Array<{
      position: [number, number]
      country: string
      stores: StoreLocation[]
    }> = []

    if (stores.length > 0) {
      const storesByCountry = new Map<string, StoreLocation[]>()

      stores.forEach(store => {
        store.countries?.forEach(country => {
          if (!storesByCountry.has(country)) {
            storesByCountry.set(country, [])
          }
          const countryStores = storesByCountry.get(country)
          if (countryStores) {
            countryStores.push(store)
          }
        })
      })

      storesByCountry.forEach((countryStores, country) => {
        const coordinates = COUNTRY_COORDINATES[country]
        if (coordinates) {
          result.push({
            position: coordinates,
            country,
            stores: countryStores,
          })
        }
      })
    }

    return result
  }, [stores])

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    )
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCountries([])
    setCommerceType('ALL')
  }

  const hasActiveFilters = search || selectedCountries.length > 0 || commerceType !== 'ALL'

  // Default center: Europe
  const defaultCenter: LatLngExpression = [50.5, 10.5]
  const defaultZoom = 4

  // Custom marker icon
  const createCustomIcon = (count: number) => {
    const size = Math.min(40 + count * 2, 60)
    return new Icon({
      iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%236366f1' opacity='0.2'/%3E%3Ccircle cx='12' cy='12' r='8' fill='%236366f1'/%3E%3Ctext x='12' y='16' text-anchor='middle' font-size='10' font-weight='bold' fill='white'%3E${count}%3C/text%3E%3C/svg%3E`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    })
  }

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-theme-primary" />
      </div>
    )
  }

  return (
    <div className="relative h-screen flex flex-col">
      {/* Header with Search and Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Commerce Type */}
            <select
              value={commerceType}
              onChange={(e) => setCommerceType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {COMMERCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`commerceTypes.${type.toLowerCase()}`)}
                </option>
              ))}
            </select>

            {/* Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-theme-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Filter className="w-5 h-5" />
              {t('filters')}
              {hasActiveFilters && (
                <span className="bg-black/20 text-xs px-2 py-0.5 rounded-full">
                  {[search, ...selectedCountries, commerceType !== 'ALL' ? commerceType : null].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('countries')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableCountries.map((country) => (
                      <button
                        key={country}
                        type="button"
                        onClick={() => toggleCountry(country)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedCountries.includes(country)
                            ? 'bg-theme-primary text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {getCountryFlag(country)} {getCountryLabel(country, locale)}
                      </button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-theme-primary hover:underline self-start"
                  >
                    <X className="w-4 h-4" />
                    {t('clearFilters')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              <span>{t('resultsCount', { count: stores.length })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{markers.length} {markers.length === 1 ? 'country' : 'countries'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-theme-primary mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('loading')}</p>
            </div>
          </div>
        ) : stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
            <Store className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">{t('noStores')}</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-theme-primary hover:underline"
              >
                {t('clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapCenterAdjuster center={defaultCenter} />

            {markers.map((marker, idx) => (
              <Marker
                key={`${marker.country}-${idx}`}
                position={marker.position}
                icon={createCustomIcon(marker.stores.length)}
              >
                <Popup maxWidth={320} className="custom-popup">
                  <div className="p-2">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                      <span className="text-2xl">{getCountryFlag(marker.country)}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {getCountryLabel(marker.country, locale)}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {marker.stores.length} {marker.stores.length === 1 ? 'store' : 'stores'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {marker.stores.map(store => (
                        <Link
                          key={store.id}
                          href={`/${locale}/store/${store.slug}`}
                          className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-md transition-colors group border border-transparent hover:border-slate-200 hover:shadow-sm"
                        >
                          {/* Logo */}
                          <div className="flex-shrink-0">
                            {store.logo ? (
                              <Image
                                src={store.logo}
                                alt={store.name}
                                width={36}
                                height={36}
                                className="w-9 h-9 rounded-md object-cover"
                              />
                            ) : (
                              <div className="w-9 h-9 bg-theme-primary/10 rounded-md flex items-center justify-center">
                                <Store className="w-4 h-4 text-theme-primary" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-theme-primary transition-colors truncate">
                              {store.name}
                            </p>
                            {store.tagline && (
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                {store.tagline}
                              </p>
                            )}

                            {/* Stats & Countries */}
                            <div className="flex items-center gap-2 mt-1">
                              {store.rating && store.rating > 0 && (
                                <>
                                  <div className="flex items-center gap-0.5 text-xs text-gray-600">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span className="font-medium">{store.rating.toFixed(1)}</span>
                                  </div>
                                  <span className="text-gray-300">•</span>
                                </>
                              )}
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Package className="w-3 h-3" />
                                <span>{store.productsCount}</span>
                              </div>
                              <span className="text-gray-300">•</span>
                              <div className="flex items-center gap-0.5">
                                {store.countries?.slice(0, 3).map(c => (
                                  <span key={c} className="text-sm leading-none">
                                    {getCountryFlag(c)}
                                  </span>
                                ))}
                                {store.countries && store.countries.length > 3 && (
                                  <span className="text-xs text-gray-500 ml-0.5">+{store.countries.length - 3}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  )
}
