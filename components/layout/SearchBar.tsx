'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, Clock, ArrowRight, FolderOpen, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { trpc } from '@/lib/trpc/client'
import { usePublicStore } from '@/lib/context/public-store-context'
import { formatPrice } from '@/lib/utils'

const RECENT_SEARCHES_KEY = 'gem-recent-searches'
const MAX_RECENT_SEARCHES = 6

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecentSearch(query: string) {
  const searches = getRecentSearches()
  const filtered = searches.filter((s) => s.toLowerCase() !== query.toLowerCase())
  const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
}

function removeRecentSearch(query: string) {
  const searches = getRecentSearches()
  const updated = searches.filter((s) => s !== query)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const t = useTranslations()
  const params = useParams()
  const locale = (params?.locale as string) || 'fr'
  const { selectedStore } = usePublicStore()

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // tRPC queries — only fire when dropdown is open and we have a debounced query
  const { data: productResults, isLoading: isLoadingProducts } = trpc.product.getAll.useQuery(
    {
      storeId: selectedStore === 'all' ? undefined : selectedStore,
      search: debouncedQuery,
      status: 'ACTIVE',
      limit: 5,
    },
    {
      enabled: isOpen && debouncedQuery.length >= 2,
    }
  )

  const { data: allCategories } = trpc.category.getAll.useQuery(
    {
      storeId: selectedStore === 'all' ? undefined : selectedStore,
    },
    {
      enabled: isOpen && debouncedQuery.length >= 2,
    }
  )

  // Filter categories client-side
  const matchingCategories = debouncedQuery.length >= 2
    ? (allCategories || [])
        .filter((cat) => cat.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
        .slice(0, 3)
    : []

  const products = productResults?.products ?? []
  const isSearching = debouncedQuery.length >= 2 && isLoadingProducts
  const hasResults = products.length > 0 || matchingCategories.length > 0
  const showRecentSearches = !debouncedQuery && recentSearches.length > 0
  const showDropdown = isOpen && (showRecentSearches || debouncedQuery.length >= 2)

  const navigateToSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return
    saveRecentSearch(searchTerm.trim())
    setRecentSearches(getRecentSearches())
    setIsOpen(false)
    setQuery('')
    router.push(`/${locale}/products?search=${encodeURIComponent(searchTerm.trim())}`)
  }, [router, locale])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigateToSearch(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const handleRemoveRecent = (e: React.MouseEvent, search: string) => {
    e.stopPropagation()
    removeRecentSearch(search)
    setRecentSearches(getRecentSearches())
  }

  const handleProductClick = () => {
    if (query.trim()) {
      saveRecentSearch(query.trim())
      setRecentSearches(getRecentSearches())
    }
    setIsOpen(false)
    setQuery('')
  }

  const handleCategoryClick = () => {
    if (query.trim()) {
      saveRecentSearch(query.trim())
      setRecentSearches(getRecentSearches())
    }
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl mx-4">
      <form onSubmit={handleSubmit}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-theme-text-muted" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={t('common.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsOpen(true)
            setRecentSearches(getRecentSearches())
          }}
          onKeyDown={handleKeyDown}
          className={`w-full pl-10 pr-10 py-2 rounded-xl bg-theme-surface border transition-all text-theme-text placeholder:text-theme-text-muted outline-none ${
            isOpen
              ? 'border-theme-primary ring-2 ring-theme-primary/20'
              : 'border-theme-border hover:border-theme-border-light'
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setDebouncedQuery('')
              inputRef.current?.focus()
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-text-muted hover:text-theme-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-theme-surface border border-theme-border rounded-xl shadow-2xl shadow-black/10 overflow-hidden z-50 max-h-[70vh] overflow-y-auto">

          {/* Recent Searches */}
          {showRecentSearches && (
            <div className="p-3">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-xs font-semibold text-theme-text-muted uppercase tracking-wider">
                  {t('common.recentSearches')}
                </span>
              </div>
              <div className="space-y-0.5">
                {recentSearches.map((search) => (
                  <div
                    key={search}
                    onClick={() => navigateToSearch(search)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-theme-primary/5 cursor-pointer group transition-colors"
                  >
                    <Clock className="w-4 h-4 text-theme-text-muted flex-shrink-0" />
                    <span className="flex-1 text-sm text-theme-text truncate">{search}</span>
                    <button
                      onClick={(e) => handleRemoveRecent(e, search)}
                      className="p-1 text-theme-text-muted hover:text-theme-text opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-theme-primary/10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {debouncedQuery.length >= 2 && (
            <div className="p-3">
              {/* Loading */}
              {isSearching && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-theme-primary animate-spin" />
                </div>
              )}

              {/* No Results */}
              {!isSearching && !hasResults && (
                <div className="text-center py-6">
                  <p className="text-sm text-theme-text-muted">{t('common.noResults')}</p>
                </div>
              )}

              {/* Categories */}
              {!isSearching && matchingCategories.length > 0 && (
                <div className="mb-3">
                  <span className="block px-2 mb-2 text-xs font-semibold text-theme-text-muted uppercase tracking-wider">
                    {t('common.categoriesResults')}
                  </span>
                  {matchingCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/${locale}/categories/${category.slug}`}
                      onClick={handleCategoryClick}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-theme-primary/5 transition-colors"
                    >
                      <FolderOpen className="w-4 h-4 text-theme-primary flex-shrink-0" />
                      <span className="flex-1 text-sm text-theme-text">{category.name}</span>
                      <span className="text-xs text-theme-text-muted">
                        {category._count.products} {t('common.products').toLowerCase()}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Products */}
              {!isSearching && products.length > 0 && (
                <div className="mb-3">
                  <span className="block px-2 mb-2 text-xs font-semibold text-theme-text-muted uppercase tracking-wider">
                    {t('common.productsResults')}
                  </span>
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/products/${product.slug}`}
                      onClick={handleProductClick}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-theme-primary/5 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-theme-background overflow-hidden flex-shrink-0 border border-theme-border">
                        <Image
                          src={product.thumbnail || product.images[0] || '/placeholder-product.png'}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-theme-text truncate">{product.name}</p>
                        {product.store && (
                          <p className="text-xs text-theme-text-muted truncate">{product.store.name}</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-theme-primary flex-shrink-0">
                        {formatPrice(product.price)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* See all results */}
              {!isSearching && hasResults && (
                <div className="border-t border-theme-border pt-2">
                  <button
                    onClick={() => navigateToSearch(debouncedQuery)}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-theme-primary hover:bg-theme-primary/5 transition-colors"
                  >
                    {t('common.seeAllResults')} «{debouncedQuery}»
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
