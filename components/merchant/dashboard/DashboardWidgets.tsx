'use client'

import { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import { useStoreCommerceType } from '@/lib/commerce-types/hooks'
import { formatPrice } from '@/lib/utils'
import {
  StatWidget,
  StatGrid,
} from '../ui'
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  BedDouble,
  CalendarCheck,
  UtensilsCrossed,
  Plane,
  Download,
  Ticket,
  Wine,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { CommerceType, commerceTypeConfigs } from '@/lib/commerce-types'

interface DashboardWidgetsProps {
  storeId: string
}

export function DashboardWidgets({ storeId }: DashboardWidgetsProps) {
  const { type: commerceType, isLoading: typeLoading } = useStoreCommerceType(storeId)

  if (typeLoading) {
    return (
      <StatGrid columns={4}>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatWidget key={i} title="" value="" loading />
        ))}
      </StatGrid>
    )
  }

  // Render specialized widgets based on commerce type
  switch (commerceType) {
    case 'HOTEL':
      return <HotelWidgets storeId={storeId} />
    case 'RESTAURANT':
      return <RestaurantWidgets storeId={storeId} />
    case 'TRAVEL':
      return <TravelWidgets storeId={storeId} />
    case 'DIGITAL':
      return <DigitalWidgets storeId={storeId} />
    case 'RECREATION':
    case 'SERVICES':
      return <RecreationWidgets storeId={storeId} />
    case 'ALCOHOL':
      return <AlcoholWidgets storeId={storeId} />
    default:
      return <EcommerceWidgets storeId={storeId} />
  }
}

// Standard E-commerce Widgets
function EcommerceWidgets({ storeId }: { storeId: string }) {
  const t = useTranslations('merchant')

  const { data: ordersData, isLoading: loadingOrders } = trpc.order.getAll.useQuery(
    { storeId, limit: 100 },
    { enabled: !!storeId }
  )

  const { data: products, isLoading: loadingProducts } = trpc.product.getAll.useQuery(
    { storeId, limit: 100 },
    { enabled: !!storeId }
  )

  const { data: customersData, isLoading: loadingCustomers } = trpc.customer.getAll.useQuery(
    { storeId, limit: 100 },
    { enabled: !!storeId }
  )

  const totalOrders = ordersData?.orders.length || 0
  const totalProducts = products?.products.length || 0
  const totalCustomers = customersData?.customers.length || 0
  const totalRevenue = ordersData?.orders
    .filter((o) => o.status === 'COMPLETED' || o.status === 'PROCESSING')
    .reduce((sum, o) => sum + o.total, 0) || 0

  const pendingOrders = ordersData?.orders.filter((o) => o.status === 'PENDING').length || 0
  const lowStockProducts = products?.products.filter((p) => (p.quantity || 0) < 10).length || 0

  return (
    <StatGrid columns={4}>
      <StatWidget
        title={t('revenue')}
        value={formatPrice(totalRevenue)}
        icon={DollarSign}
        iconColor="success"
        change={{ value: 12.5, period: t('last7Days') }}
        loading={loadingOrders}
      />
      <StatWidget
        title={t('todayOrders')}
        value={totalOrders}
        icon={ShoppingCart}
        iconColor="primary"
        loading={loadingOrders}
      />
      <StatWidget
        title={t('pendingOrders')}
        value={pendingOrders}
        icon={Clock}
        iconColor="warning"
        loading={loadingOrders}
      />
      <StatWidget
        title={t('lowStock')}
        value={lowStockProducts}
        icon={AlertTriangle}
        iconColor={lowStockProducts > 0 ? 'danger' : 'info'}
        loading={loadingProducts}
      />
    </StatGrid>
  )
}

// Hotel Widgets
function HotelWidgets({ storeId }: { storeId: string }) {
  const t = useTranslations('merchant.dashboard')

  // Mock data - in real app, this would come from tRPC
  const occupancyRate = 78
  const todayCheckIns = 12
  const todayCheckOuts = 8
  const availableRooms = 24

  return (
    <StatGrid columns={4}>
      <StatWidget
        title="Taux d'occupation"
        value={`${occupancyRate}%`}
        icon={BedDouble}
        iconColor="success"
        sparkline={[65, 70, 75, 72, 78, 80, 78]}
      />
      <StatWidget
        title="Check-ins aujourd'hui"
        value={todayCheckIns}
        icon={CalendarCheck}
        iconColor="primary"
      />
      <StatWidget
        title="Check-outs aujourd'hui"
        value={todayCheckOuts}
        icon={CalendarCheck}
        iconColor="warning"
      />
      <StatWidget
        title="Chambres disponibles"
        value={availableRooms}
        icon={BedDouble}
        iconColor="info"
      />
    </StatGrid>
  )
}

// Restaurant Widgets
function RestaurantWidgets({ storeId }: { storeId: string }) {
  const t = useTranslations('merchant.dashboard')

  const { data: ordersData, isLoading } = trpc.order.getAll.useQuery(
    { storeId, limit: 50 },
    { enabled: !!storeId }
  )

  const todayOrders = ordersData?.orders.filter((o) => {
    const today = new Date().toDateString()
    return new Date(o.createdAt).toDateString() === today
  }).length || 0

  const pendingOrders = ordersData?.orders.filter((o) => o.status === 'PENDING').length || 0
  const todayRevenue = ordersData?.orders
    .filter((o) => {
      const today = new Date().toDateString()
      return new Date(o.createdAt).toDateString() === today
    })
    .reduce((sum, o) => sum + o.total, 0) || 0

  return (
    <StatGrid columns={4}>
      <StatWidget
        title="CA aujourd'hui"
        value={formatPrice(todayRevenue)}
        icon={DollarSign}
        iconColor="success"
        loading={isLoading}
      />
      <StatWidget
        title="Commandes du jour"
        value={todayOrders}
        icon={UtensilsCrossed}
        iconColor="primary"
        loading={isLoading}
      />
      <StatWidget
        title="En préparation"
        value={pendingOrders}
        icon={Clock}
        iconColor="warning"
        loading={isLoading}
      />
      <StatWidget
        title="Temps moyen"
        value="18 min"
        icon={Clock}
        iconColor="info"
      />
    </StatGrid>
  )
}

// Travel Agency Widgets
function TravelWidgets({ storeId }: { storeId: string }) {
  return (
    <StatGrid columns={4}>
      <StatWidget
        title="Réservations ce mois"
        value={47}
        icon={Plane}
        iconColor="primary"
        change={{ value: 8.3, period: 'vs mois dernier' }}
      />
      <StatWidget
        title="Départs cette semaine"
        value={12}
        icon={CalendarCheck}
        iconColor="success"
      />
      <StatWidget
        title="Passagers en voyage"
        value={156}
        icon={Users}
        iconColor="info"
      />
      <StatWidget
        title="CA du mois"
        value={formatPrice(125000)}
        icon={DollarSign}
        iconColor="success"
      />
    </StatGrid>
  )
}

// Digital Products Widgets
function DigitalWidgets({ storeId }: { storeId: string }) {
  const { data: products, isLoading } = trpc.product.getAll.useQuery(
    { storeId, limit: 100 },
    { enabled: !!storeId }
  )

  const { data: ordersData } = trpc.order.getAll.useQuery(
    { storeId, limit: 100 },
    { enabled: !!storeId }
  )

  const totalDownloads = ordersData?.orders.length || 0
  const totalRevenue = ordersData?.orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.total, 0) || 0

  return (
    <StatGrid columns={4}>
      <StatWidget
        title="Téléchargements"
        value={totalDownloads}
        icon={Download}
        iconColor="primary"
        loading={isLoading}
      />
      <StatWidget
        title="Produits actifs"
        value={products?.products.length || 0}
        icon={Package}
        iconColor="info"
        loading={isLoading}
      />
      <StatWidget
        title="Revenus du mois"
        value={formatPrice(totalRevenue)}
        icon={DollarSign}
        iconColor="success"
      />
      <StatWidget
        title="Taux conversion"
        value="4.2%"
        icon={TrendingUp}
        iconColor="success"
      />
    </StatGrid>
  )
}

// Recreation/Activities Widgets
function RecreationWidgets({ storeId }: { storeId: string }) {
  return (
    <StatGrid columns={4}>
      <StatWidget
        title="Réservations aujourd'hui"
        value={28}
        icon={Ticket}
        iconColor="primary"
      />
      <StatWidget
        title="Participants attendus"
        value={84}
        icon={Users}
        iconColor="info"
      />
      <StatWidget
        title="Événements actifs"
        value={6}
        icon={CalendarCheck}
        iconColor="success"
      />
      <StatWidget
        title="CA du jour"
        value={formatPrice(3450)}
        icon={DollarSign}
        iconColor="success"
      />
    </StatGrid>
  )
}

// Alcohol/Wine Widgets
function AlcoholWidgets({ storeId }: { storeId: string }) {
  const { data: products, isLoading } = trpc.product.getAll.useQuery(
    { storeId, limit: 100 },
    { enabled: !!storeId }
  )

  const { data: ordersData } = trpc.order.getAll.useQuery(
    { storeId, limit: 100 },
    { enabled: !!storeId }
  )

  const totalProducts = products?.products.length || 0
  const totalRevenue = ordersData?.orders
    .filter((o) => o.status === 'COMPLETED' || o.status === 'PROCESSING')
    .reduce((sum, o) => sum + o.total, 0) || 0

  return (
    <StatGrid columns={4}>
      <StatWidget
        title="Références en cave"
        value={totalProducts}
        icon={Wine}
        iconColor="primary"
        loading={isLoading}
      />
      <StatWidget
        title="CA du mois"
        value={formatPrice(totalRevenue)}
        icon={DollarSign}
        iconColor="success"
      />
      <StatWidget
        title="Commandes en attente"
        value={ordersData?.orders.filter((o) => o.status === 'PENDING').length || 0}
        icon={Package}
        iconColor="warning"
      />
      <StatWidget
        title="Stock faible"
        value={products?.products.filter((p) => (p.quantity || 0) < 5).length || 0}
        icon={AlertTriangle}
        iconColor="danger"
        loading={isLoading}
      />
    </StatGrid>
  )
}
