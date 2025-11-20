'use client'

import { useMemo } from 'react'
import { generateThemeCSS } from '@/lib/themes/presets'
import { Monitor, Tablet, Smartphone } from 'lucide-react'

interface ThemePreviewProps {
  config: any
  viewport: 'desktop' | 'tablet' | 'mobile'
  onViewportChange: (viewport: 'desktop' | 'tablet' | 'mobile') => void
}

export function ThemePreview({ config, viewport, onViewportChange }: ThemePreviewProps) {
  const themeCSS = useMemo(() => {
    return generateThemeCSS(config)
  }, [config])

  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  }

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Viewport selector */}
      <div className="flex items-center justify-center gap-2 p-3 bg-white border-b border-gray-200">
        <button
          onClick={() => onViewportChange('desktop')}
          className={`p-2 rounded-lg transition-colors ${
            viewport === 'desktop' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Desktop"
        >
          <Monitor className="w-5 h-5" />
        </button>
        <button
          onClick={() => onViewportChange('tablet')}
          className={`p-2 rounded-lg transition-colors ${
            viewport === 'tablet' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Tablet"
        >
          <Tablet className="w-5 h-5" />
        </button>
        <button
          onClick={() => onViewportChange('mobile')}
          className={`p-2 rounded-lg transition-colors ${
            viewport === 'mobile' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Mobile"
        >
          <Smartphone className="w-5 h-5" />
        </button>
      </div>

      {/* Preview container */}
      <div className="flex-1 p-4 overflow-auto">
        <div
          className="mx-auto bg-white shadow-xl rounded-lg overflow-hidden transition-all duration-300"
          style={{ width: viewportWidths[viewport], maxWidth: '100%' }}
        >
          <style dangerouslySetInnerHTML={{ __html: `:root { ${themeCSS} }` }} />

          {/* Mock storefront preview */}
          <div style={{
            backgroundColor: config.colors?.background || '#FFFFFF',
            minHeight: '600px'
          }}>
            {/* Header */}
            <header
              className="border-b"
              style={{
                borderColor: config.colors?.border || '#E5E5E5',
                backgroundColor: config.colors?.surface || '#FAFAFA'
              }}
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <h1
                    className="text-xl font-bold"
                    style={{
                      color: config.colors?.text || '#000000',
                      fontFamily: `${config.fonts?.heading || 'Inter'}, sans-serif`
                    }}
                  >
                    Ma Boutique
                  </h1>
                  <nav className="flex gap-4">
                    {['Accueil', 'Produits', 'À propos'].map((item) => (
                      <span
                        key={item}
                        className="text-sm"
                        style={{
                          color: config.colors?.textSecondary || '#6B7280',
                          fontFamily: `${config.fonts?.body || 'Inter'}, sans-serif`
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </nav>
                </div>
              </div>
            </header>

            {/* Hero section */}
            <section className="px-6 py-12">
              <h2
                className="text-3xl font-bold mb-4"
                style={{
                  color: config.colors?.text || '#000000',
                  fontFamily: `${config.fonts?.heading || 'Inter'}, sans-serif`
                }}
              >
                Bienvenue dans votre boutique
              </h2>
              <p
                className="text-lg mb-6"
                style={{
                  color: config.colors?.textSecondary || '#6B7280',
                  fontFamily: `${config.fonts?.body || 'Inter'}, sans-serif`
                }}
              >
                Découvrez notre collection de produits exceptionnels.
              </p>
              <button
                className="px-6 py-3 font-medium text-white transition-colors"
                style={{
                  backgroundColor: config.colors?.primary || '#3B82F6',
                  borderRadius: config.borderRadius || '0.5rem',
                  fontFamily: `${config.fonts?.body || 'Inter'}, sans-serif`
                }}
              >
                Voir les produits
              </button>
            </section>

            {/* Product grid */}
            <section className="px-6 py-8">
              <h3
                className="text-xl font-semibold mb-6"
                style={{
                  color: config.colors?.text || '#000000',
                  fontFamily: `${config.fonts?.heading || 'Inter'}, sans-serif`
                }}
              >
                Produits populaires
              </h3>
              <div className={`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border overflow-hidden"
                    style={{
                      borderColor: config.colors?.border || '#E5E5E5',
                      borderRadius: config.borderRadius || '0.5rem',
                      backgroundColor: config.colors?.surface || '#FAFAFA'
                    }}
                  >
                    <div
                      className="h-32"
                      style={{ backgroundColor: config.colors?.borderLight || '#F5F5F5' }}
                    />
                    <div className="p-4">
                      <h4
                        className="font-medium mb-1"
                        style={{
                          color: config.colors?.text || '#000000',
                          fontFamily: `${config.fonts?.body || 'Inter'}, sans-serif`
                        }}
                      >
                        Produit {i}
                      </h4>
                      <p
                        className="text-sm mb-2"
                        style={{
                          color: config.colors?.textMuted || config.colors?.textSecondary || '#9CA3AF',
                          fontFamily: `${config.fonts?.body || 'Inter'}, sans-serif`
                        }}
                      >
                        Description courte
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className="font-bold"
                          style={{
                            color: config.colors?.primary || '#3B82F6',
                            fontFamily: `${config.fonts?.body || 'Inter'}, sans-serif`
                          }}
                        >
                          29,99 €
                        </span>
                        <button
                          className="px-3 py-1.5 text-sm text-white"
                          style={{
                            backgroundColor: config.colors?.accent || config.colors?.primary || '#3B82F6',
                            borderRadius: config.borderRadius || '0.5rem',
                            fontFamily: `${config.fonts?.body || 'Inter'}, sans-serif`
                          }}
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Footer */}
            <footer
              className="px-6 py-8 mt-8 border-t"
              style={{
                borderColor: config.colors?.border || '#E5E5E5',
                backgroundColor: config.colors?.surface || '#FAFAFA'
              }}
            >
              <p
                className="text-sm text-center"
                style={{
                  color: config.colors?.textMuted || config.colors?.textSecondary || '#9CA3AF',
                  fontFamily: `${config.fonts?.body || 'Inter'}, sans-serif`
                }}
              >
                © 2024 Ma Boutique. Tous droits réservés.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
