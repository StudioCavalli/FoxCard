'use client'

import { useState } from 'react'

interface SpacingEditorProps {
  label: string
  value: string
  onChange: (value: string) => void
  presets?: string[]
  description?: string
}

const defaultPresets = ['0.25rem', '0.5rem', '1rem', '1.5rem', '2rem', '3rem', '4rem', '6rem', '8rem']
const containerPresets = ['1024px', '1152px', '1280px', '1440px', '1536px', '100%']

export function SpacingEditor({
  label,
  value,
  onChange,
  presets,
  description
}: SpacingEditorProps) {
  const [isCustom, setIsCustom] = useState(false)

  const effectivePresets = presets || (
    label.toLowerCase().includes('container') || label.toLowerCase().includes('width')
      ? containerPresets
      : defaultPresets
  )

  const isPresetValue = effectivePresets.includes(value)

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}
      </label>

      <div className="space-y-2">
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-1.5">
          {effectivePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                onChange(preset)
                setIsCustom(false)
              }}
              className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                value === preset
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsCustom(true)}
            className={`px-2.5 py-1 text-xs rounded-md transition-all ${
              isCustom || !isPresetValue
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Personnalisé
          </button>
        </div>

        {/* Custom input */}
        {(isCustom || !isPresetValue) && (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
            placeholder="ex: 2rem, 24px, 10%"
          />
        )}
      </div>

      {description && (
        <p className="mt-1.5 text-xs text-gray-500">{description}</p>
      )}
    </div>
  )
}

interface BorderRadiusEditorProps {
  value: string
  onChange: (value: string) => void
}

export function BorderRadiusEditor({ value, onChange }: BorderRadiusEditorProps) {
  const presets = [
    { value: '0', label: 'Carré' },
    { value: '0.25rem', label: 'Subtil' },
    { value: '0.5rem', label: 'Moyen' },
    { value: '0.75rem', label: 'Arrondi' },
    { value: '1rem', label: 'Très arrondi' },
    { value: '1.5rem', label: 'Pilule' },
    { value: '9999px', label: 'Cercle' },
  ]

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        Arrondi des angles
      </label>

      <div className="grid grid-cols-4 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
            className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
              value === preset.value
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div
              className="w-8 h-8 bg-gray-900 mb-1"
              style={{ borderRadius: preset.value }}
            />
            <span className="text-xs text-gray-600">{preset.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
          placeholder="ex: 0.5rem"
        />
      </div>
    </div>
  )
}
