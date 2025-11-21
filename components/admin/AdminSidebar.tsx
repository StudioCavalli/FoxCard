'use client'

import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Settings,
  Store,
  LogOut,
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
  Box
} from 'lucide-react'
import { SidebarGroup } from './SidebarGroup'
import { SidebarLink } from './SidebarLink'

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg"></div>
          <div>
            <h1 className="text-xl font-bold">FoxCard</h1>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Boutique Group */}
        <SidebarGroup title="Boutique" icon={Store}>
          <SidebarLink href="/admin" icon={LayoutDashboard}>
            Tableau de bord
          </SidebarLink>
          <SidebarLink href="/admin/store" icon={Settings}>
            Paramètres
          </SidebarLink>
          <SidebarLink href="/admin/themes" icon={Palette}>
            Thèmes
          </SidebarLink>
        </SidebarGroup>

        {/* Catalogue Group */}
        <SidebarGroup title="Catalogue" icon={Package}>
          <SidebarLink href="/admin/products" icon={Box}>
            Produits
          </SidebarLink>
          <SidebarLink href="/admin/categories" icon={FolderTree}>
            Catégories
          </SidebarLink>
          <SidebarLink href="/admin/warehouses" icon={Warehouse}>
            Entrepôts
          </SidebarLink>
          <SidebarLink href="/admin/allocation" icon={Package}>
            Allocation
          </SidebarLink>
        </SidebarGroup>

        {/* Ventes Group */}
        <SidebarGroup title="Ventes" icon={ShoppingCart}>
          <SidebarLink href="/admin/orders" icon={Package}>
            Commandes
          </SidebarLink>
          <SidebarLink href="/admin/customers" icon={Users}>
            Clients
          </SidebarLink>
          <SidebarLink href="/admin/abandoned-carts" icon={ShoppingCart}>
            Paniers abandonnés
          </SidebarLink>
          <SidebarLink href="/admin/discounts" icon={Percent}>
            Codes promo
          </SidebarLink>
        </SidebarGroup>

        {/* Expédition Group */}
        <SidebarGroup title="Expédition & Taxes" icon={Truck}>
          <SidebarLink href="/admin/shipping" icon={MapPin}>
            Zones de livraison
          </SidebarLink>
          <SidebarLink href="/admin/taxes" icon={Receipt}>
            Taxes
          </SidebarLink>
        </SidebarGroup>

        {/* Marketing Group */}
        <SidebarGroup title="Marketing" icon={Megaphone}>
          <SidebarLink href="/admin/emails" icon={Mail}>
            Emails
          </SidebarLink>
          <SidebarLink href="/admin/email-templates" icon={FileText}>
            Templates
          </SidebarLink>
          <SidebarLink href="/admin/newsletter" icon={Send}>
            Newsletter
          </SidebarLink>
          <SidebarLink href="/admin/ab-testing" icon={TestTube}>
            Tests A/B
          </SidebarLink>
        </SidebarGroup>

        {/* Analytics Group */}
        <SidebarGroup title="Analytics" icon={BarChart3}>
          <SidebarLink href="/admin/analytics" icon={TrendingUp}>
            Vue d'ensemble
          </SidebarLink>
          <SidebarLink href="/admin/reports" icon={FileText}>
            Rapports
          </SidebarLink>
          <SidebarLink href="/admin/forecast" icon={Activity}>
            Prévisions
          </SidebarLink>
          <SidebarLink href="/admin/inventory-reports" icon={Warehouse}>
            Stock
          </SidebarLink>
        </SidebarGroup>

        {/* Paiements Group */}
        <SidebarGroup title="Paiements" icon={CreditCard}>
          <SidebarLink href="/admin/payments" icon={DollarSign}>
            Vue d'ensemble
          </SidebarLink>
          <SidebarLink href="/admin/crsdpay" icon={CreditCard}>
            crsdpay Gateway
          </SidebarLink>
        </SidebarGroup>

        {/* Paramètres Group */}
        <SidebarGroup title="Système" icon={Settings}>
          <SidebarLink href="/admin/users" icon={UserCog}>
            Utilisateurs
          </SidebarLink>
          <SidebarLink href="/admin/roles" icon={Shield}>
            Rôles
          </SidebarLink>
          <SidebarLink href="/admin/audit" icon={Activity}>
            Journal d'audit
          </SidebarLink>
          <SidebarLink href="/admin/plugins" icon={Puzzle}>
            Plugins
          </SidebarLink>
          <SidebarLink href="/admin/marketplace" icon={ShoppingBag}>
            Marketplace
          </SidebarLink>
          <SidebarLink href="/admin/env-variables" icon={Key}>
            Variables ENV
          </SidebarLink>
          <SidebarLink href="/admin/settings" icon={Settings}>
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
  )
}
