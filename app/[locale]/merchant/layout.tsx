import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MerchantSidebar } from '@/components/merchant/MerchantSidebar'
import { MerchantHeader } from '@/components/merchant/MerchantHeader'
import { MerchantContent } from '@/components/merchant/MerchantContent'
import { ImpersonationBanner } from '@/components/merchant/ImpersonationBanner'
import { StoreProvider } from '@/lib/context/store-context'
import { SidebarProvider } from '@/lib/context/sidebar-context'

// Force dynamic rendering for all merchant pages
export const dynamic = 'force-dynamic'

export default async function MerchantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getServerSession(authOptions)

  // Redirect if not authenticated
  if (!session?.user) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/merchant`)
  }

  // Check if user has access to merchant space
  // ADMIN role = store owner/staff, SUPER_ADMIN can also access
  const allowedRoles = ['ADMIN', 'SUPER_ADMIN']
  if (!allowedRoles.includes(session.user.role as string)) {
    redirect(`/${locale}/account`)
  }

  return (
    <StoreProvider>
      <SidebarProvider>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <ImpersonationBanner />
          <div className="flex flex-1">
            <MerchantSidebar />
            <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
              <MerchantHeader />
              <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
                <MerchantContent>
                  {children}
                </MerchantContent>
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </StoreProvider>
  )
}
