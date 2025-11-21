'use client'

import { useState } from 'react'
import { commerceTypeThemes, generateCSSVariables } from '@/lib/themes/commerce-type-themes'
import { commerceTypeLabels, commerceTypeIcons } from '@/lib/commerce-types'
import type { CommerceType } from '@/lib/commerce-types'

export default function ThemePreviewPage() {
  const [selectedType, setSelectedType] = useState<CommerceType>('GENERAL')
  const theme = commerceTypeThemes[selectedType]
  const cssVariables = generateCSSVariables(theme)

  return (
    <div className="min-h-screen bg-gray-100">
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Preview des thèmes</h1>
          <p className="mt-2 text-gray-600">
            Visualisez le thème visuel pour chaque type d'e-commerce
          </p>
        </div>

        {/* Type selector */}
        <div className="mb-8 flex flex-wrap gap-2">
          {(Object.keys(commerceTypeThemes) as CommerceType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`
                px-4 py-2 rounded-lg flex items-center gap-2 transition-all
                ${selectedType === type
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span>{commerceTypeIcons[type]}</span>
              <span>{commerceTypeLabels[type]}</span>
            </button>
          ))}
        </div>

        {/* Theme preview */}
        <div
          className="rounded-xl overflow-hidden shadow-2xl"
          style={{
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            fontFamily: theme.fonts.body
          }}
        >
          {/* Header preview */}
          <header
            className="p-4 border-b"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.secondary + '33'
            }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: theme.fonts.heading }}
              >
                {commerceTypeIcons[selectedType]} Ma Boutique {commerceTypeLabels[selectedType]}
              </h2>
              <nav className="flex gap-4 text-sm">
                <a href="#" style={{ color: theme.colors.textMuted }}>Accueil</a>
                <a href="#" style={{ color: theme.colors.textMuted }}>Produits</a>
                <a href="#" style={{ color: theme.colors.textMuted }}>Contact</a>
              </nav>
            </div>
          </header>

          {/* Hero section */}
          <section
            className="p-8 text-center"
            style={{ backgroundColor: theme.colors.primary + '11' }}
          >
            <h1
              className="text-4xl font-bold mb-4"
              style={{
                fontFamily: theme.fonts.heading,
                color: theme.colors.primary
              }}
            >
              Bienvenue dans notre boutique
            </h1>
            <p style={{ color: theme.colors.textMuted }} className="mb-6 max-w-xl mx-auto">
              Découvrez notre sélection de produits de qualité, soigneusement choisis pour vous.
            </p>
            <button
              className="px-6 py-3 font-semibold transition-all"
              style={{
                backgroundColor: theme.colors.primary,
                color: '#FFFFFF',
                borderRadius: theme.ui.buttonStyle === 'pill'
                  ? theme.borderRadius.full
                  : theme.ui.buttonStyle === 'sharp'
                    ? '0'
                    : theme.borderRadius.medium,
                boxShadow: theme.shadows.medium
              }}
            >
              Découvrir nos produits
            </button>
          </section>

          {/* Product cards */}
          <section className="p-6">
            <h3
              className="text-xl font-bold mb-4"
              style={{ fontFamily: theme.fonts.heading }}
            >
              Produits populaires
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="overflow-hidden"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.large,
                    boxShadow: theme.ui.cardStyle === 'elevated'
                      ? theme.shadows.medium
                      : 'none',
                    border: theme.ui.cardStyle === 'bordered'
                      ? `1px solid ${theme.colors.secondary}33`
                      : 'none'
                  }}
                >
                  <div
                    className="h-40 flex items-center justify-center text-4xl"
                    style={{ backgroundColor: theme.colors.primary + '22' }}
                  >
                    {commerceTypeIcons[selectedType]}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-1">Produit {i}</h4>
                    <p
                      className="text-sm mb-3"
                      style={{ color: theme.colors.textMuted }}
                    >
                      Description du produit très attrayant
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="font-bold"
                        style={{ color: theme.colors.primary }}
                      >
                        {(19.99 * i).toFixed(2)} €
                      </span>
                      <button
                        className="px-3 py-1 text-sm font-medium"
                        style={{
                          backgroundColor: theme.colors.accent,
                          color: theme.colors.text,
                          borderRadius: theme.ui.buttonStyle === 'pill'
                            ? theme.borderRadius.full
                            : theme.ui.buttonStyle === 'sharp'
                              ? '0'
                              : theme.borderRadius.small
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

          {/* Color palette */}
          <section className="p-6 border-t" style={{ borderColor: theme.colors.secondary + '33' }}>
            <h3
              className="text-lg font-bold mb-4"
              style={{ fontFamily: theme.fonts.heading }}
            >
              Palette de couleurs
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(theme.colors).map(([name, color]) => (
                <div key={name} className="text-center">
                  <div
                    className="w-12 h-12 rounded-lg shadow-inner mb-1"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs" style={{ color: theme.colors.textMuted }}>
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Typography */}
          <section className="p-6 border-t" style={{ borderColor: theme.colors.secondary + '33' }}>
            <h3
              className="text-lg font-bold mb-4"
              style={{ fontFamily: theme.fonts.heading }}
            >
              Typographie
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm mb-2" style={{ color: theme.colors.textMuted }}>
                  Heading: {theme.fonts.heading}
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ fontFamily: theme.fonts.heading }}
                >
                  Titre exemple Aa Bb Cc
                </p>
              </div>
              <div>
                <p className="text-sm mb-2" style={{ color: theme.colors.textMuted }}>
                  Body: {theme.fonts.body}
                </p>
                <p style={{ fontFamily: theme.fonts.body }}>
                  Corps de texte exemple. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </div>
          </section>

          {/* UI Elements */}
          <section className="p-6 border-t" style={{ borderColor: theme.colors.secondary + '33' }}>
            <h3
              className="text-lg font-bold mb-4"
              style={{ fontFamily: theme.fonts.heading }}
            >
              Éléments UI
            </h3>
            <div className="flex flex-wrap gap-4">
              <div className="text-center">
                <p className="text-xs mb-2" style={{ color: theme.colors.textMuted }}>
                  Style bouton
                </p>
                <span
                  className="px-3 py-1 text-xs rounded"
                  style={{
                    backgroundColor: theme.colors.primary + '22',
                    color: theme.colors.primary
                  }}
                >
                  {theme.ui.buttonStyle}
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs mb-2" style={{ color: theme.colors.textMuted }}>
                  Style carte
                </p>
                <span
                  className="px-3 py-1 text-xs rounded"
                  style={{
                    backgroundColor: theme.colors.secondary + '22',
                    color: theme.colors.secondary
                  }}
                >
                  {theme.ui.cardStyle}
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs mb-2" style={{ color: theme.colors.textMuted }}>
                  Style header
                </p>
                <span
                  className="px-3 py-1 text-xs rounded"
                  style={{
                    backgroundColor: theme.colors.accent + '44',
                    color: theme.colors.text
                  }}
                >
                  {theme.ui.headerStyle}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* CSS Variables output */}
        <details className="mt-8 bg-white rounded-lg p-4 shadow">
          <summary className="cursor-pointer font-semibold text-gray-700">
            Variables CSS générées
          </summary>
          <pre className="mt-4 p-4 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto">
            {cssVariables}
          </pre>
        </details>
      </div>
    </div>
  )
}
