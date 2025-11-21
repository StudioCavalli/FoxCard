'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Settings,
  Store,
  Percent,
  Truck,
  Palette,
  DollarSign,
  Key,
  Mail,
  FileText,
  Send,
  Shield,
  UserCog,
  Activity,
  ShoppingBag,
  Receipt,
  CreditCard,
  BarChart3,
  TrendingUp,
  Megaphone,
  TestTube,
  Warehouse,
  MapPin,
  Puzzle,
  Eye,
  Box,
  X
} from 'lucide-react'
import { SidebarGroup } from './SidebarGroup'
import { SidebarLink } from './SidebarLink'
import { useSidebar } from '@/lib/context/sidebar-context'
import { cn } from '@/lib/utils'

export function AdminSidebar() {
  const { isOpen, close } = useSidebar()
  const pathname = usePathname()

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
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10 flex items-center justify-between">
          <Link href="/admin" className="flex items-center space-x-2" onClick={close}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg"></div>
            <div>
              <h1 className="text-xl font-bold">FoxCard</h1>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </Link>
          {/* Mobile Close Button */}
          <button
            onClick={close}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Boutique Group */}
          <SidebarGroup title="Boutique" icon={Store}>
            <SidebarLink href="/admin" icon={LayoutDashboard} onClick={close}>
              Tableau de bord
            </SidebarLink>
            <SidebarLink href="/admin/store" icon={Settings} onClick={close}>
              Paramètres
            </SidebarLink>
            <SidebarLink href="/admin/themes" icon={Palette} onClick={close}>
              Thèmes
            </SidebarLink>
          </SidebarGroup>

          {/* Catalogue Group */}
          <SidebarGroup title="Catalogue" icon={Package}>
            <SidebarLink href="/admin/products" icon={Box} onClick={close}>
              Produits
            </SidebarLink>
            <SidebarLink href="/admin/categories" icon={FolderTree} onClick={close}>
              Catégories
            </SidebarLink>
            <SidebarLink href="/admin/warehouses" icon={Warehouse} onClick={close}>
              Entrepôts
            </SidebarLink>
            <SidebarLink href="/admin/allocation" icon={Package} onClick={close}>
              Allocation
            </SidebarLink>
          </SidebarGroup>

          {/* Ventes Group */}
          <SidebarGroup title="Ventes" icon={ShoppingCart}>
            <SidebarLink href="/admin/orders" icon={Package} onClick={close}>
              Commandes
            </SidebarLink>
            <SidebarLink href="/admin/customers" icon={Users} onClick={close}>
              Clients
            </SidebarLink>
            <SidebarLink href="/admin/abandoned-carts" icon={ShoppingCart} onClick={close}>
              Paniers abandonnés
            </SidebarLink>
            <SidebarLink href="/admin/discounts" icon={Percent} onClick={close}>
              Codes promo
            </SidebarLink>
          </SidebarGroup>

          {/* Expédition Group */}
          <SidebarGroup title="Expédition & Taxes" icon={Truck}>
            <SidebarLink href="/admin/shipping" icon={MapPin} onClick={close}>
              Zones de livraison
            </SidebarLink>
            <SidebarLink href="/admin/taxes" icon={Receipt} onClick={close}>
              Taxes
            </SidebarLink>
          </SidebarGroup>

          {/* Marketing Group */}
          <SidebarGroup title="Marketing" icon={Megaphone}>
            <SidebarLink href="/admin/emails" icon={Mail} onClick={close}>
              Emails
            </SidebarLink>
            <SidebarLink href="/admin/email-templates" icon={FileText} onClick={close}>
              Templates
            </SidebarLink>
            <SidebarLink href="/admin/newsletter" icon={Send} onClick={close}>
              Newsletter
            </SidebarLink>
            <SidebarLink href="/admin/ab-testing" icon={TestTube} onClick={close}>
              Tests A/B
            </SidebarLink>
          </SidebarGroup>

          {/* Analytics Group */}
          <SidebarGroup title="Analytics" icon={BarChart3}>
            <SidebarLink href="/admin/analytics" icon={TrendingUp} onClick={close}>
              Vue d'ensemble
            </SidebarLink>
            <SidebarLink href="/admin/reports" icon={FileText} onClick={close}>
              Rapports
            </SidebarLink>
            <SidebarLink href="/admin/forecast" icon={Activity} onClick={close}>
              Prévisions
            </SidebarLink>
            <SidebarLink href="/admin/inventory-reports" icon={Warehouse} onClick={close}>
              Stock
            </SidebarLink>
          </SidebarGroup>

          {/* Paiements Group */}
          <SidebarGroup title="Paiements" icon={CreditCard}>
            <SidebarLink href="/admin/payments" icon={DollarSign} onClick={close}>
              Vue d'ensemble
            </SidebarLink>
            <SidebarLink href="/admin/crsdpay" icon={CreditCard} onClick={close}>
              crsdpay Gateway
            </SidebarLink>
          </SidebarGroup>

          {/* Paramètres Group */}
          <SidebarGroup title="Système" icon={Settings}>
            <SidebarLink href="/admin/users" icon={UserCog} onClick={close}>
              Utilisateurs
            </SidebarLink>
            <SidebarLink href="/admin/roles" icon={Shield} onClick={close}>
              Rôles
            </SidebarLink>
            <SidebarLink href="/admin/audit" icon={Activity} onClick={close}>
              Journal d'audit
            </SidebarLink>
            <SidebarLink href="/admin/plugins" icon={Puzzle} onClick={close}>
              Plugins
            </SidebarLink>
            <SidebarLink href="/admin/marketplace" icon={ShoppingBag} onClick={close}>
              Marketplace
            </SidebarLink>
            <SidebarLink href="/admin/env-variables" icon={Key} onClick={close}>
              Variables ENV
            </SidebarLink>
            <SidebarLink href="/admin/settings" icon={Settings} onClick={close}>
              Paramètres
            </SidebarLink>
          </SidebarGroup>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <Link
            href="/"
            target="_blank"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Eye className="w-5 h-5" />
            <span>Voir le site</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
