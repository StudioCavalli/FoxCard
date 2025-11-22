/**
 * Restaurant Management System
 * Handles menus, tables, orders, and kitchen display
 */

import { prisma } from '@/lib/prisma'

// Types
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
export type KitchenStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED'
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING'

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  category: string
  image?: string
  allergens: string[]
  prepTime?: number
  spicyLevel?: number
  vegetarian?: boolean
  vegan?: boolean
  glutenFree?: boolean
  available: boolean
  options?: MenuOption[]
}

export interface MenuOption {
  name: string
  required: boolean
  maxSelections?: number
  choices: MenuChoice[]
}

export interface MenuChoice {
  id: string
  label: string
  price: number
}

export interface TableInfo {
  id: string
  number: string
  capacity: number
  status: TableStatus
  floor?: string
  section?: string
  reservedUntil?: Date
  currentOrderId?: string
}

export interface DeliverySlot {
  time: string
  available: boolean
  capacity: number
  booked: number
}

export interface KitchenOrder {
  id: string
  orderNumber: string
  orderType: OrderType
  tableNumber?: string
  items: KitchenOrderItem[]
  status: string
  createdAt: Date
  estimatedReady?: Date
  priority: number
  notes?: string
}

export interface KitchenOrderItem {
  id: string
  name: string
  quantity: number
  variantName?: string
  status: 'pending' | 'preparing' | 'ready'
}

// Menu Management
export async function getMenuByCategory(storeId: string): Promise<Record<string, MenuItem[]>> {
  const products = await prisma.product.findMany({
    where: {
      storeId,
      status: 'ACTIVE',
    },
    orderBy: { name: 'asc' },
  })

  const menu: Record<string, MenuItem[]> = {}

  for (const product of products) {
    const attributes = (product.attributes as Record<string, unknown>) || {}
    const category = (attributes.category as string) || 'Autres'

    if (!menu[category]) {
      menu[category] = []
    }

    menu[category].push({
      id: product.id,
      name: product.name,
      description: product.description || undefined,
      price: product.price,
      category,
      image: product.images[0] || undefined,
      allergens: (attributes.allergens as string[]) || [],
      prepTime: attributes.prepTime as number | undefined,
      spicyLevel: attributes.spicyLevel as number | undefined,
      vegetarian: attributes.vegetarian as boolean | undefined,
      vegan: attributes.vegan as boolean | undefined,
      glutenFree: attributes.glutenFree as boolean | undefined,
      available: product.quantity > 0 || !product.trackInventory,
      options: attributes.options as MenuOption[] | undefined,
    })
  }

  return menu
}

export function getMenuCategories(): string[] {
  return ['Entrées', 'Plats', 'Desserts', 'Boissons', 'Formules', 'Enfants', 'Suppléments']
}

// Allergens list
export const ALLERGENS = [
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
  { id: 'crustaceans', label: 'Crustacés', icon: '🦐' },
  { id: 'eggs', label: 'Œufs', icon: '🥚' },
  { id: 'fish', label: 'Poisson', icon: '🐟' },
  { id: 'peanuts', label: 'Arachides', icon: '🥜' },
  { id: 'soy', label: 'Soja', icon: '🫛' },
  { id: 'dairy', label: 'Lait', icon: '🥛' },
  { id: 'nuts', label: 'Fruits à coque', icon: '🌰' },
  { id: 'celery', label: 'Céleri', icon: '🥬' },
  { id: 'mustard', label: 'Moutarde', icon: '🟡' },
  { id: 'sesame', label: 'Sésame', icon: '⚪' },
  { id: 'sulfites', label: 'Sulfites', icon: '🍷' },
  { id: 'lupin', label: 'Lupin', icon: '🌸' },
  { id: 'mollusks', label: 'Mollusques', icon: '🦪' },
]

// Table Management (stored in store.settings)
export async function getTables(storeId: string): Promise<TableInfo[]> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  const settings = store?.settings as Record<string, unknown> | null
  const tables = (settings?.tables as TableInfo[]) || []

  return tables.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
}

export async function updateTableStatus(
  storeId: string,
  tableId: string,
  status: TableStatus,
  orderId?: string
): Promise<TableInfo | null> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  const settings = (store?.settings as Record<string, unknown>) || {}
  const tables = (settings.tables as TableInfo[]) || []

  const tableIndex = tables.findIndex((t) => t.id === tableId)
  if (tableIndex === -1) return null

  tables[tableIndex] = {
    ...tables[tableIndex],
    status,
    currentOrderId: orderId,
    reservedUntil: undefined,
  }

  await prisma.store.update({
    where: { id: storeId },
    data: {
      settings: JSON.parse(JSON.stringify({
        ...settings,
        tables,
      })),
    },
  })

  return tables[tableIndex]
}

export async function createTable(
  storeId: string,
  table: Omit<TableInfo, 'id' | 'status' | 'currentOrderId'>
): Promise<TableInfo> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  const settings = (store?.settings as Record<string, unknown>) || {}
  const tables = (settings.tables as TableInfo[]) || []

  const newTable: TableInfo = {
    ...table,
    id: `table_${Date.now()}`,
    status: 'AVAILABLE',
  }

  tables.push(newTable)

  await prisma.store.update({
    where: { id: storeId },
    data: {
      settings: JSON.parse(JSON.stringify({
        ...settings,
        tables,
      })),
    },
  })

  return newTable
}

export async function deleteTable(storeId: string, tableId: string): Promise<boolean> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  const settings = (store?.settings as Record<string, unknown>) || {}
  const tables = (settings.tables as TableInfo[]) || []

  const filteredTables = tables.filter((t) => t.id !== tableId)

  if (filteredTables.length === tables.length) return false

  await prisma.store.update({
    where: { id: storeId },
    data: {
      settings: JSON.parse(JSON.stringify({
        ...settings,
        tables: filteredTables,
      })),
    },
  })

  return true
}

// Delivery Time Slots
export async function getDeliverySlots(
  storeId: string,
  date: Date,
  orderType: 'DELIVERY' | 'TAKEAWAY'
): Promise<DeliverySlot[]> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  const settings = store?.settings as Record<string, unknown> | null
  const deliveryConfig = settings?.delivery as {
    slots?: { time: string; capacity: number }[]
    preparationTime?: number
    deliveryRadius?: number
    minimumOrder?: number
  } | null

  const slots = deliveryConfig?.slots || generateDefaultSlots()

  // Get existing orders for this date (check notes for delivery info)
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const orders = await prisma.order.findMany({
    where: {
      storeId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: { notes: true },
  })

  // Count orders per slot (extract from notes which contains JSON data)
  const bookedSlots: Record<string, number> = {}
  for (const order of orders) {
    if (order.notes) {
      try {
        const noteData = JSON.parse(order.notes)
        const slot = noteData.deliverySlot as string
        if (slot && noteData.orderType === orderType) {
          bookedSlots[slot] = (bookedSlots[slot] || 0) + 1
        }
      } catch {
        // Not JSON, ignore
      }
    }
  }

  return slots.map((slot) => ({
    time: slot.time,
    capacity: slot.capacity,
    booked: bookedSlots[slot.time] || 0,
    available: (bookedSlots[slot.time] || 0) < slot.capacity,
  }))
}

function generateDefaultSlots(): { time: string; capacity: number }[] {
  const slots: { time: string; capacity: number }[] = []

  // Lunch slots (11:30 - 14:30)
  for (let h = 11; h <= 14; h++) {
    for (const m of h === 11 ? [30] : h === 14 ? [0, 30] : [0, 30]) {
      slots.push({
        time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
        capacity: 5,
      })
    }
  }

  // Dinner slots (18:30 - 22:00)
  for (let h = 18; h <= 22; h++) {
    for (const m of h === 18 ? [30] : h === 22 ? [0] : [0, 30]) {
      slots.push({
        time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
        capacity: 5,
      })
    }
  }

  return slots
}

// Kitchen Order Display
export async function getKitchenOrders(storeId: string): Promise<KitchenOrder[]> {
  const orders = await prisma.order.findMany({
    where: {
      storeId,
      status: {
        in: ['PENDING', 'PROCESSING'],
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: [
      { createdAt: 'asc' },
    ],
  })

  return orders.map((order, index) => {
    // Try to parse restaurant-specific data from notes
    let restaurantData: Record<string, unknown> = {}
    if (order.notes) {
      try {
        restaurantData = JSON.parse(order.notes)
      } catch {
        // Not JSON, use empty object
      }
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber || `#${order.id.slice(-6).toUpperCase()}`,
      orderType: (restaurantData.orderType as OrderType) || 'DINE_IN',
      tableNumber: restaurantData.tableNumber as string | undefined,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.product?.name || item.name,
        quantity: item.quantity,
        variantName: item.variantName || undefined,
        status: 'pending' as const,
      })),
      status: order.status,
      createdAt: order.createdAt,
      estimatedReady: restaurantData.estimatedReady
        ? new Date(restaurantData.estimatedReady as string)
        : undefined,
      priority: index + 1,
      notes: typeof restaurantData.customerNotes === 'string' ? restaurantData.customerNotes : undefined,
    }
  })
}

export async function updateKitchenOrderStatus(
  orderId: string,
  status: KitchenStatus
): Promise<void> {
  const statusMap: Record<KitchenStatus, 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'> = {
    PENDING: 'PENDING',
    CONFIRMED: 'PROCESSING',
    PREPARING: 'PROCESSING',
    READY: 'PROCESSING',
    DELIVERED: 'COMPLETED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: statusMap[status] || 'PROCESSING',
    },
  })
}

// Order statistics
export async function getRestaurantStats(
  storeId: string,
  date: Date
): Promise<{
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  revenue: number
  averageOrderValue: number
  ordersByType: Record<OrderType, number>
  peakHours: { hour: string; count: number }[]
}> {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const orders = await prisma.order.findMany({
    where: {
      storeId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      notes: true,
    },
  })

  const completedOrders = orders.filter((o) =>
    ['DELIVERED', 'COMPLETED'].includes(o.status)
  )
  const pendingOrders = orders.filter((o) =>
    ['PENDING', 'PROCESSING'].includes(o.status)
  )

  const ordersByType: Record<OrderType, number> = {
    DINE_IN: 0,
    TAKEAWAY: 0,
    DELIVERY: 0,
  }

  const ordersByHour: Record<string, number> = {}

  for (const order of orders) {
    // Try to parse order type from notes
    let orderType: OrderType = 'DINE_IN'
    if (order.notes) {
      try {
        const noteData = JSON.parse(order.notes)
        orderType = (noteData.orderType as OrderType) || 'DINE_IN'
      } catch {
        // Not JSON
      }
    }
    ordersByType[orderType]++

    const hour = order.createdAt.getHours().toString().padStart(2, '0')
    ordersByHour[hour] = (ordersByHour[hour] || 0) + 1
  }

  const revenue = completedOrders.reduce((sum, o) => sum + o.total, 0)

  return {
    totalOrders: orders.length,
    pendingOrders: pendingOrders.length,
    completedOrders: completedOrders.length,
    revenue,
    averageOrderValue: completedOrders.length > 0 ? revenue / completedOrders.length : 0,
    ordersByType,
    peakHours: Object.entries(ordersByHour)
      .map(([hour, count]) => ({ hour: `${hour}:00`, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  }
}

// Calculate estimated preparation time
export function calculateEstimatedPrepTime(items: { prepTime?: number; quantity: number }[]): number {
  // Base time + max item prep time + additional time for quantity
  let maxPrepTime = 0
  let totalItems = 0

  for (const item of items) {
    if (item.prepTime && item.prepTime > maxPrepTime) {
      maxPrepTime = item.prepTime
    }
    totalItems += item.quantity
  }

  // Add 2 minutes per additional item beyond the first
  const additionalTime = Math.max(0, (totalItems - 1) * 2)

  return maxPrepTime + additionalTime
}

// Format order for kitchen display
export function formatKitchenDisplay(order: KitchenOrder): string {
  const lines: string[] = []

  lines.push(`=== COMMANDE ${order.orderNumber} ===`)
  lines.push(`Type: ${order.orderType}`)
  if (order.tableNumber) {
    lines.push(`Table: ${order.tableNumber}`)
  }
  lines.push('')

  for (const item of order.items) {
    lines.push(`${item.quantity}x ${item.name}`)
    if (item.variantName) {
      lines.push(`   ${item.variantName}`)
    }
  }

  if (order.notes) {
    lines.push('')
    lines.push(`NOTES: ${order.notes}`)
  }

  return lines.join('\n')
}
