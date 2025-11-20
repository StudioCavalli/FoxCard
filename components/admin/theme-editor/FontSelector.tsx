'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface FontSelectorProps {
  label: string
  value: string
  onChange: (value: string) => void
  fonts?: FontOption[]
}

interface FontOption {
  name: string
  category: string
  preview?: string
}

const defaultFonts: FontOption[] = [
  { name: 'Inter', category: 'Sans-serif', preview: 'Modern & Clean' },
  { name: 'Roboto', category: 'Sans-serif', preview: 'Friendly & Open' },
  { name: 'Open Sans', category: 'Sans-serif', preview: 'Neutral & Readable' },
  { name: 'Montserrat', category: 'Sans-serif', preview: 'Geometric & Bold' },
  { name: 'Poppins', category: 'Sans-serif', preview: 'Rounded & Friendly' },
  { name: 'Playfair Display', category: 'Serif', preview: 'Elegant & Classic' },
  { name: 'Lora', category: 'Serif', preview: 'Contemporary Serif' },
  { name: 'Merriweather', category: 'Serif', preview: 'Traditional & Warm' },
  { name: 'Source Sans Pro', category: 'Sans-serif', preview: 'Adobe\'s Open Source' },
  { name: 'Nunito', category: 'Sans-serif', preview: 'Balanced & Rounded' },
  { name: 'Raleway', category: 'Sans-serif', preview: 'Elegant Sans' },
  { name: 'Work Sans', category: 'Sans-serif', preview: 'Optimized for Screens' },
]

export function FontSelector({ label, value, onChange, fonts = defaultFonts }: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredFonts = fonts.filter(font =>
    font.name.toLowerCase().includes(search.toLowerCase()) ||
    font.category.toLowerCase().includes(search.toLowerCase())
  )

  const selectedFont = fonts.find(f => f.name === value) || { name: value, category: 'Custom' }

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-left transition-all hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <div>
          <span className="font-medium text-gray-900" style={{ fontFamily: value }}>
            {selectedFont.name}
          </span>
          <span className="ml-2 text-xs text-gray-500">
            {selectedFont.category}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une police..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredFonts.map((font) => (
              <button
                key={font.name}
                type="button"
                onClick={() => {
                  onChange(font.name)
                  setIsOpen(false)
                  setSearch('')
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                  value === font.name ? 'bg-primary-50' : ''
                }`}
              >
                <div>
                  <span
                    className="font-medium text-gray-900"
                    style={{ fontFamily: font.name }}
                  >
                    {font.name}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {font.preview || font.category}
                  </span>
                </div>
                {value === font.name && (
                  <Check className="w-4 h-4 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
