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
    // Full-screen overlay to isolate from parent layout
    <div className="fixed inset-0 z-[100] flex bg-slate-50 dark:bg-slate-900">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SuperAdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
