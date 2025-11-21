// Force dynamic rendering for all newsletter pages (using useSearchParams)
export const dynamic = 'force-dynamic'

export default function NewsletterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
