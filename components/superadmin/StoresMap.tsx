'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon, LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { trpc } from '@/lib/trpc/client'
import { useTranslations } from 'next-intl'
import { getCountryFlag, getCountryLabel } from '@/lib/countries'
import { useLocale } from 'next-intl'
import { Loader2, Store, MapPin, Star, Package } from 'lucide-react'
import Image from 'next/image'

// Country coordinates (capital cities for simplicity)
const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  FR: [48.8566, 2.3522], // Paris
  DE: [52.5200, 13.4050], // Berlin
  ES: [40.4168, -3.7038], // Madrid
  IT: [41.9028, 12.4964], // Rome
  GB: [51.5074, -0.1278], // London
  BE: [50.8503, 4.3517], // Brussels
  NL: [52.3676, 4.9041], // Amsterdam
  CH: [46.9480, 7.4474], // Bern
  AT: [48.2082, 16.3738], // Vienna
  PT: [38.7223, -9.1393], // Lisbon
  SE: [59.3293, 18.0686], // Stockholm
  NO: [59.9139, 10.7522], // Oslo
  DK: [55.6761, 12.5683], // Copenhagen
  FI: [60.1699, 24.9384], // Helsinki
  PL: [52.2297, 21.0122], // Warsaw
  CZ: [50.0755, 14.4378], // Prague
  SK: [48.1486, 17.1077], // Bratislava
  HU: [47.4979, 19.0402], // Budapest
  RO: [44.4268, 26.1025], // Bucharest
  BG: [42.6977, 23.3219], // Sofia
  GR: [37.9838, 23.7275], // Athens
  IE: [53.3498, -6.2603], // Dublin
  HR: [45.8150, 15.9819], // Zagreb
  SI: [46.0569, 14.5058], // Ljubljana
  EE: [59.4370, 24.7536], // Tallinn
  LV: [56.9496, 24.1052], // Riga
  LT: [54.6872, 25.2797], // Vilnius
  LU: [49.6116, 6.1319], // Luxembourg
  MT: [35.8989, 14.5146], // Valletta
  CY: [35.1856, 33.3823], // Nicosia
  US: [38.9072, -77.0369], // Washington DC
  CA: [45.4215, -75.6972], // Ottawa
  MX: [19.4326, -99.1332], // Mexico City
  BR: [-15.8267, -47.9218], // Brasília
  AR: [-34.6037, -58.3816], // Buenos Aires
  CL: [-33.4489, -70.6693], // Santiago
  CO: [4.7110, -74.0721], // Bogotá
  PE: [-12.0464, -77.0428], // Lima
  VE: [10.4806, -66.9036], // Caracas
  EC: [-0.1807, -78.4678], // Quito
  AU: [-35.2809, 149.1300], // Canberra
  NZ: [-41.2865, 174.7762], // Wellington
  JP: [35.6762, 139.6503], // Tokyo
  CN: [39.9042, 116.4074], // Beijing
  IN: [28.6139, 77.2090], // New Delhi
  ZA: [-25.7479, 28.2293], // Pretoria
  RU: [55.7558, 37.6173], // Moscow
  UA: [50.4501, 30.5234], // Kyiv
  TR: [39.9334, 32.8597], // Ankara
  SA: [24.7136, 46.6753], // Riyadh
  AE: [24.4539, 54.3773], // Abu Dhabi
  EG: [30.0444, 31.2357], // Cairo
  MA: [33.9716, -6.8498], // Rabat
  NG: [9.0765, 7.3986], // Abuja
  KE: [-1.2921, 36.8219], // Nairobi
  IL: [31.7683, 35.2137], // Jerusalem
  SG: [1.3521, 103.8198], // Singapore
  MY: [3.1390, 101.6869], // Kuala Lumpur
  TH: [13.7563, 100.5018], // Bangkok
  VN: [21.0285, 105.8542], // Hanoi
  PH: [14.5995, 120.9842], // Manila
  ID: [-6.2088, 106.8456], // Jakarta
  KR: [37.5665, 126.9780], // Seoul
}

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
}

// Custom map center adjuster component
function MapCenterAdjuster({ center }: { center: LatLngExpression }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])

  return null
}

export function StoresMap() {
  const t = useTranslations('superadmin')
  const tMap = useTranslations('superadmin.storesMap')
  const locale = useLocale()
  const [isMounted, setIsMounted] = useState(false)

  const { data: stores, isLoading } = trpc.superadmin.getStoreLocations.useQuery()

  // Only render map on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-slate-50 dark:bg-slate-900 rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-slate-50 dark:bg-slate-900 rounded-xl gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <p className="text-sm text-slate-600 dark:text-slate-400">{tMap('loading')}</p>
      </div>
    )
  }

  // Create markers for each store based on their countries
  const markers: Array<{
    position: [number, number]
    country: string
    stores: StoreLocation[]
  }> = []

  if (stores) {
    // Group stores by country
    const storesByCountry = new Map<string, StoreLocation[]>()

    stores.forEach(store => {
      store.countries.forEach(country => {
        if (!storesByCountry.has(country)) {
          storesByCountry.set(country, [])
        }
        storesByCountry.get(country)!.push(store)
      })
    })

    // Create markers for each country with stores
    storesByCountry.forEach((countryStores, country) => {
      const coordinates = COUNTRY_COORDINATES[country]
      if (coordinates) {
        markers.push({
          position: coordinates,
          country,
          stores: countryStores,
        })
      }
    })
  }

  // Default center: Europe
  const defaultCenter: LatLngExpression = [50.5, 10.5]
  const defaultZoom = 4

  // Beautiful custom marker with shadow and modern design
  const createCustomIcon = (count: number) => {
    const size = Math.min(45 + count * 3, 70)
    return new Icon({
      iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size + 10}' viewBox='0 0 32 42'%3E%3Cdefs%3E%3Cfilter id='shadow' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeGaussianBlur in='SourceAlpha' stdDeviation='2'/%3E%3CfeOffset dx='0' dy='2' result='offsetblur'/%3E%3CfeFlood flood-color='%23000000' flood-opacity='0.3'/%3E%3CfeComposite in2='offsetblur' operator='in'/%3E%3CfeMerge%3E%3CfeMergeNode/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236366f1;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%234f46e5;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg filter='url(%23shadow)'%3E%3Cpath d='M16 2 C10 2 5 7 5 13 C5 20 16 30 16 30 S27 20 27 13 C27 7 22 2 16 2 Z' fill='url(%23grad)' stroke='white' stroke-width='2'/%3E%3Ccircle cx='16' cy='13' r='8' fill='white' fill-opacity='0.3'/%3E%3Ctext x='16' y='17' text-anchor='middle' font-family='Inter, system-ui, sans-serif' font-size='9' font-weight='700' fill='white'%3E${count}%3C/text%3E%3C/g%3E%3C/svg%3E`,
      iconSize: [size, size + 10],
      iconAnchor: [size / 2, size + 10],
      popupAnchor: [0, -(size + 5)],
    })
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stores?.length || 0}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{tMap('totalStores')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {markers.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{tMap('countriesWithStores')}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Map */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{tMap('title')}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{tMap('description')}</p>
        </div>

        <div className="h-[600px] relative">
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapCenterAdjuster center={defaultCenter} />

            {markers.map((marker, idx) => (
              <Marker
                key={`${marker.country}-${idx}`}
                position={marker.position}
                icon={createCustomIcon(marker.stores.length)}
              >
                <Popup maxWidth={280} className="map-popup">
                  <div className="p-0">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-3 py-2.5 flex items-center gap-2">
                      <span className="text-xl">{getCountryFlag(marker.country)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">
                          {getCountryLabel(marker.country, locale)}
                        </h3>
                        <p className="text-xs text-primary-100">
                          {marker.stores.length} {marker.stores.length === 1 ? tMap('store') : tMap('stores')}
                        </p>
                      </div>
                    </div>

                    {/* Stores list */}
                    <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
                      <div className="space-y-1.5">
                        {marker.stores.map(store => (
                          <a
                            key={store.id}
                            href={`/${locale}/superadmin/stores/${store.id}`}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                          >
                            {/* Logo */}
                            {store.logo ? (
                              <Image
                                src={store.logo}
                                alt={store.name}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-md bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                                <Store className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                              </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate leading-tight">
                                {store.name}
                              </p>

                              {/* Stats */}
                              <div className="flex items-center gap-2 mt-0.5">
                                {store.rating && store.rating > 0 && (
                                  <div className="flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 text-amber-500 fill-current" />
                                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">{store.rating.toFixed(1)}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-0.5">
                                  <Package className="w-2.5 h-2.5 text-slate-400" />
                                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">{store.productsCount}</span>
                                </div>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
