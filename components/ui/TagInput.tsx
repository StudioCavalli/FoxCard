'use client'

import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function TagInput({ value = [], onChange, placeholder = 'Ajouter un tag...', disabled = false }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // Remove last tag on backspace if input is empty
      onChange(value.slice(0, -1))
    }
  }

  const addTag = () => {
    const tag = inputValue.trim()
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-xl focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-opacity-20 transition-all">
        {value.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-sm"
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-primary-200 rounded p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="flex-1 min-w-[120px] outline-none bg-transparent"
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Appuyez sur Entrée pour ajouter un tag
      </p>
    </div>
  )
}
