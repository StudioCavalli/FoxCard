'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Settings,
  Percent,
  Truck,
  Palette,
  Mail,
  FileText,
  Send,
  BarChart3,
  TrendingUp,
  Warehouse,
  MapPin,
  Eye,
  Box,
  X,
  Receipt,
  Store,
  CreditCard,
  Megaphone,
  TestTube
} from 'lucide-react'
import { SidebarGroup } from '../admin/SidebarGroup'
import { SidebarLink } from '../admin/SidebarLink'
import { useSidebar } from '@/lib/context/sidebar-context'
import { useStoreContext } from '@/lib/context/store-context'
import { cn } from '@/lib/utils'

export function MerchantSidebar() {
  const { isOpen, close } = useSidebar()
  const { storeName } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'

  const basePath = `/${locale}/merchant`

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo & Store Name */}
        <div className="p-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center justify-between">
            <Link href={basePath} className="flex items-center space-x-3" onClick={close}>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-bold truncate">{storeName || 'Ma Boutique'}</h1>
                <p className="text-xs text-slate-400">Espace Marchand</p>
              </div>
            </Link>
            {/* Mobile Close Button */}
            <button
              onClick={close}
              className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {/* Dashboard */}
          <SidebarLink href={basePath} icon={LayoutDashboard} onClick={close}>
            Tableau de bord
          </SidebarLink>

          {/* Catalogue Group */}
          <SidebarGroup title="Catalogue" icon={Package}>
            <SidebarLink href={`${basePath}/products`} icon={Box} onClick={close}>
              Produits
            </SidebarLink>
            <SidebarLink href={`${basePath}/categories`} icon={FolderTree} onClick={close}>
              Catégories
            </SidebarLink>
            <SidebarLink href={`${basePath}/warehouses`} icon={Warehouse} onClick={close}>
              Entrepôts
            </SidebarLink>
          </SidebarGroup>

          {/* Ventes Group */}
          <SidebarGroup title="Ventes" icon={ShoppingCart}>
            <SidebarLink href={`${basePath}/orders`} icon={Package} onClick={close}>
              Commandes
            </SidebarLink>
            <SidebarLink href={`${basePath}/customers`} icon={Users} onClick={close}>
              Clients
            </SidebarLink>
            <SidebarLink href={`${basePath}/abandoned-carts`} icon={ShoppingCart} onClick={close}>
              Paniers abandonnés
            </SidebarLink>
            <SidebarLink href={`${basePath}/discounts`} icon={Percent} onClick={close}>
              Codes promo
            </SidebarLink>
          </SidebarGroup>

          {/* Expédition & Taxes Group */}
          <SidebarGroup title="Expédition" icon={Truck}>
            <SidebarLink href={`${basePath}/shipping`} icon={MapPin} onClick={close}>
              Zones de livraison
            </SidebarLink>
            <SidebarLink href={`${basePath}/taxes`} icon={Receipt} onClick={close}>
              Taxes
            </SidebarLink>
          </SidebarGroup>

          {/* Marketing Group */}
          <SidebarGroup title="Marketing" icon={Megaphone}>
            <SidebarLink href={`${basePath}/emails`} icon={Mail} onClick={close}>
              Campagnes email
            </SidebarLink>
            <SidebarLink href={`${basePath}/email-templates`} icon={FileText} onClick={close}>
              Templates
            </SidebarLink>
            <SidebarLink href={`${basePath}/newsletter`} icon={Send} onClick={close}>
              Newsletter
            </SidebarLink>
            <SidebarLink href={`${basePath}/ab-testing`} icon={TestTube} onClick={close}>
              Tests A/B
            </SidebarLink>
          </SidebarGroup>

          {/* Analytics Group */}
          <SidebarGroup title="Analytics" icon={BarChart3}>
            <SidebarLink href={`${basePath}/analytics`} icon={TrendingUp} onClick={close}>
              Vue d'ensemble
            </SidebarLink>
            <SidebarLink href={`${basePath}/reports`} icon={FileText} onClick={close}>
              Rapports
            </SidebarLink>
          </SidebarGroup>

          {/* Paiements Group */}
          <SidebarGroup title="Paiements" icon={CreditCard}>
            <SidebarLink href={`${basePath}/payments`} icon={CreditCard} onClick={close}>
              Transactions
            </SidebarLink>
          </SidebarGroup>

          {/* Paramètres Group */}
          <SidebarGroup title="Paramètres" icon={Settings}>
            <SidebarLink href={`${basePath}/store`} icon={Store} onClick={close}>
              Ma boutique
            </SidebarLink>
            <SidebarLink href={`${basePath}/themes`} icon={Palette} onClick={close}>
              Thème
            </SidebarLink>
            <SidebarLink href={`${basePath}/settings`} icon={Settings} onClick={close}>
              Paramètres
            </SidebarLink>
          </SidebarGroup>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900">
          <Link
            href="/"
            target="_blank"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Voir ma boutique</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
