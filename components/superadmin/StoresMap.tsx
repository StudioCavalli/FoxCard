'use client'

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { Icon, LatLngExpression, DivIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { trpc } from '@/lib/trpc/client'
import { useTranslations } from 'next-intl'
import { getCountryFlag, getCountryLabel } from '@/lib/countries'
import { useLocale } from 'next-intl'
import { Loader2, Store, MapPin, Package, Phone, Mail, Building2 } from 'lucide-react'
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

// Zoom level handler component
function ZoomHandler({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom())
    },
  })

  useEffect(() => {
    onZoomChange(map.getZoom())
  }, [map, onZoomChange])

  return null
}


// Get location type icon and color
function getLocationTypeInfo(type: string, tMap: any) {
  switch (type) {
    case 'LEGAL_ADDRESS':
      return { icon: Building2, color: 'bg-amber-500', label: tMap('locationTypes.legalAddress') }
    case 'PHYSICAL_STORE':
      return { icon: Store, color: 'bg-primary-500', label: tMap('locationTypes.physicalStore') }
    case 'PICKUP_POINT':
      return { icon: Package, color: 'bg-green-500', label: tMap('locationTypes.pickupPoint') }
    case 'WAREHOUSE':
      return { icon: Package, color: 'bg-slate-500', label: tMap('locationTypes.warehouse') }
    default:
      return { icon: MapPin, color: 'bg-slate-500', label: type }
  }
}

export function StoresMap() {
  const t = useTranslations('superadmin')
  const tMap = useTranslations('superadmin.storesMap')
  const locale = useLocale()
  const [isMounted, setIsMounted] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(4)

  const { data: locations, isLoading } = trpc.superadmin.getStoreLocations.useQuery()

  // Only render map on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Group locations by country
  const locationsByCountry = useMemo(() => {
    const grouped: Record<string, any[]> = {}

    locations?.forEach((location) => {
      if (!grouped[location.country]) {
        grouped[location.country] = []
      }
      grouped[location.country].push(location)
    })

    return grouped
  }, [locations])

  // Create country cluster markers (shown when zoomed out)
  const countryMarkers = useMemo(() => {
    return Object.entries(locationsByCountry).map(([country, locs]) => {
      const coords = COUNTRY_COORDINATES[country] || [48.8566, 2.3522]
      const uniqueStores = new Set(locs.map(l => l.store?.id)).size

      return {
        id: `country-${country}`,
        country,
        position: coords as [number, number],
        count: locs.length,
        storeCount: uniqueStores,
        locations: locs,
      }
    })
  }, [locationsByCountry])

  // Create markers from locations with GPS coordinates
  const markers = useMemo(() => {
    return locations?.map((location: any) => ({
      id: location.id,
      position: [location.latitude, location.longitude] as [number, number],
      location,
      store: location.store,
    })) || []
  }, [locations])

  // Count unique stores
  const uniqueStores = new Set(locations?.map((loc: any) => loc.store.id) || []).size

  // Count unique countries
  const uniqueCountries = new Set(locations?.map((loc: any) => loc.country) || []).size

  // Default center: Europe
  const defaultCenter: LatLngExpression = [50.5, 10.5]
  const defaultZoom = 4

  // Determine whether to show clusters or individual markers based on zoom
  const showClusters = currentZoom < 7

  // Beautiful custom marker with shadow and modern design
  const createLocationIcon = () => {
    const size = 40
    return new Icon({
      iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size + 10}' viewBox='0 0 32 42'%3E%3Cdefs%3E%3Cfilter id='shadow' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeGaussianBlur in='SourceAlpha' stdDeviation='2'/%3E%3CfeOffset dx='0' dy='2' result='offsetblur'/%3E%3CfeFlood flood-color='%23000000' flood-opacity='0.3'/%3E%3CfeComposite in2='offsetblur' operator='in'/%3E%3CfeMerge%3E%3CfeMergeNode/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236366f1;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%234f46e5;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cg filter='url(%23shadow)'%3E%3Cpath d='M16 2 C10 2 5 7 5 13 C5 20 16 30 16 30 S27 20 27 13 C27 7 22 2 16 2 Z' fill='url(%23grad)' stroke='white' stroke-width='2'/%3E%3Ccircle cx='16' cy='13' r='6' fill='white' fill-opacity='0.4'/%3E%3C/g%3E%3C/svg%3E`,
      iconSize: [size, size + 10],
      iconAnchor: [size / 2, size + 10],
      popupAnchor: [0, -(size + 5)],
    })
  }

  // Create cluster icon with count
  const createClusterIcon = (count: number, storeCount: number) => {
    const placeLabel = count === 1 ? tMap('place') : tMap('places')
    return new DivIcon({
      html: `
        <div class="flex flex-col items-center">
          <div class="relative">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 shadow-lg flex items-center justify-center border-4 border-white">
              <div class="text-center">
                <div class="text-white font-bold text-lg">${storeCount}</div>
                <div class="text-white text-[9px] font-medium -mt-1">${placeLabel}</div>
              </div>
            </div>
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
          </div>
        </div>
      `,
      className: 'custom-cluster-icon',
      iconSize: [56, 66],
      iconAnchor: [28, 66],
      popupAnchor: [0, -60],
    })
  }

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

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {uniqueStores}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{tMap('totalStores')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {markers.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{tMap('locations')}</p>
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
                {uniqueCountries}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('countries')}</p>
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

            <ZoomHandler onZoomChange={setCurrentZoom} />

            {/* Show country clusters when zoomed out */}
            {showClusters && countryMarkers.map((cluster) => (
              <Marker
                key={cluster.id}
                position={cluster.position}
                icon={createClusterIcon(cluster.count, cluster.storeCount)}
              >
                <Popup maxWidth={300} className="country-cluster-popup">
                  <div className="p-0">
                    <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{getCountryFlag(cluster.country)}</div>
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-white">
                            {getCountryLabel(cluster.country, locale)}
                          </h3>
                          <p className="text-sm text-primary-100">
                            {cluster.storeCount} {cluster.storeCount === 1 ? tMap('shop') : tMap('shops')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="space-y-2">
                        {cluster.locations.slice(0, 3).map((loc: any) => (
                          <a
                            key={loc.id}
                            href={`/${locale}/superadmin/stores/${loc.store.id}`}
                            className="block p-2 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {loc.store?.logo ? (
                                <Image
                                  src={loc.store.logo}
                                  alt={loc.store.name}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                                  <Store className="w-4 h-4 text-slate-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{loc.store?.name}</p>
                                <p className="text-xs text-slate-500 truncate">{loc.city}</p>
                              </div>
                            </div>
                          </a>
                        ))}
                        {cluster.locations.length > 3 && (
                          <p className="text-xs text-center text-slate-500 pt-2 border-t">
                            +{cluster.locations.length - 3} {tMap('otherLocations')}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-center text-slate-500 mt-3 pt-3 border-t">
                        💡 {tMap('zoomForDetails')}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Show individual locations when zoomed in */}
            {!showClusters && markers.map((marker: any) => {
              const typeInfo = getLocationTypeInfo(marker.location.type, tMap)
              const TypeIcon = typeInfo.icon

              return (
                <Marker
                  key={marker.id}
                  position={marker.position}
                  icon={createLocationIcon()}
                >
                  <Popup maxWidth={320} className="location-popup">
                    <div className="overflow-hidden rounded-lg">
                      {/* Header with gradient background */}
                      <div className={`${typeInfo.color} px-4 py-3`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                            <TypeIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-white leading-snug">
                              {marker.store.name}
                            </h3>
                            <p className="text-xs text-white/80 truncate leading-snug">
                              {marker.location.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 bg-white">
                        <div className="space-y-3">
                          {/* Address */}
                          <div className="text-slate-700 text-sm">
                            <p className="font-medium flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              {marker.location.street}
                            </p>
                            <p className="pl-6">{marker.location.postalCode} {marker.location.city}</p>
                            <p className="pl-6">{getCountryLabel(marker.location.country, locale)}</p>
                          </div>

                          {/* Store Stats */}
                          {(marker.store?.rating || (marker.store as any)?._count?.products) && (
                            <div className="pt-3 border-t border-slate-100">
                              <div className="flex items-center gap-4 text-sm">
                                {marker.store?.rating && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-base">⭐</span>
                                    <span className="font-semibold text-slate-900">{marker.store.rating.toFixed(1)}</span>
                                    {marker.store?.reviewsCount && (
                                      <span className="text-slate-500">({marker.store.reviewsCount})</span>
                                    )}
                                  </div>
                                )}
                                {(marker.store as any)?._count?.products > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-base">📦</span>
                                    <span className="font-semibold text-slate-900">{(marker.store as any)._count.products}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Contact Info */}
                          {(marker.location.phone || marker.location.email) && (
                            <div className="pt-3 border-t border-slate-100 space-y-2">
                              {marker.location.phone && (
                                <a
                                  href={`tel:${marker.location.phone}`}
                                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                  <Phone className="w-4 h-4" />
                                  <span>{marker.location.phone}</span>
                                </a>
                              )}
                              {marker.location.email && (
                                <a
                                  href={`mailto:${marker.location.email}`}
                                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                  <Mail className="w-4 h-4" />
                                  <span className="truncate">{marker.location.email}</span>
                                </a>
                              )}
                            </div>
                          )}

                          {/* Type badge */}
                          <div className="pt-3 border-t border-slate-100">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                              {typeInfo.label.toUpperCase()}
                            </span>
                          </div>

                          {/* View store button */}
                          <a
                            href={`/${locale}/superadmin/stores/${marker.store.id}`}
                            className={`block w-full text-center px-4 py-2.5 ${typeInfo.color} rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold shadow-sm !text-white`}
                          >
                            {tMap('viewStore')}
                          </a>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
