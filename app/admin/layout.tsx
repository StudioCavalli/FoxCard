import { StoreProvider } from '@/lib/context/store-context'

// Force dynamic rendering for all admin pages
export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StoreProvider>
      {children}
    </StoreProvider>
  )
}
