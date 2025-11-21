import { SuperAdminSidebar } from '@/components/superadmin/SuperAdminSidebar'
import { SuperAdminHeader } from '@/components/superadmin/SuperAdminHeader'

// Force dynamic rendering for all superadmin pages
export const dynamic = 'force-dynamic'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col">
        <SuperAdminHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
