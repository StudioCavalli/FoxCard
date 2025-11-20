'use client'

import { useState, useRef, useEffect } from 'react'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  description?: string
}

export function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue)
    }
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  // Calculate contrast for text color
  const getContrastColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  return (
    <div ref={pickerRef} className="relative">
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg border-2 border-gray-200 shadow-sm transition-all hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          style={{ backgroundColor: value }}
          title={value}
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
          placeholder="#000000"
        />
      </div>
      {description && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-2 p-3 bg-white rounded-xl shadow-lg border border-gray-200">
          <input
            type="color"
            value={value}
            onChange={handleColorChange}
            className="w-48 h-48 cursor-pointer rounded-lg"
          />
          <div
            className="mt-2 p-2 rounded-lg text-center text-sm font-medium"
            style={{
              backgroundColor: value,
              color: getContrastColor(value)
            }}
          >
            {value}
          </div>
        </div>
      )}
    </div>
  )
}
