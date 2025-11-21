'use client'

import { useState } from 'react'
import { Calendar, Users, Clock, Building2, Info } from 'lucide-react'
import { getBookingFieldsForType } from '@/lib/checkout/checkout-flow'
import { type CommerceType } from '@/lib/commerce-types'

export interface BookingData {
  checkInDate?: string
  checkOutDate?: string
  selectedDate?: string
  selectedTime?: string
  participants?: number
  adults?: number
  children?: number
  roomType?: string
  specialRequests?: string
}

interface BookingStepProps {
  commerceType: CommerceType
  bookingData: BookingData
  onChange: (data: BookingData) => void
  productName?: string
  availableTimeslots?: string[]
  roomTypes?: { id: string; name: string; price: number }[]
}

export function BookingStep({
  commerceType,
  bookingData,
  onChange,
  productName,
  availableTimeslots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
  roomTypes = [],
}: BookingStepProps) {
  const fields = getBookingFieldsForType(commerceType)

  // Get tomorrow's date as minimum
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const handleChange = (field: keyof BookingData, value: string | number) => {
    onChange({ ...bookingData, [field]: value })
  }

  return (
    <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2
            className="text-2xl font-bold text-theme-text"
            style={{ fontFamily: 'var(--theme-font-heading)' }}
          >
            Réservation
          </h2>
          {productName && (
            <p className="text-sm text-theme-text-muted">{productName}</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Hotel: Check-in / Check-out */}
        {fields.showCheckinCheckout && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-theme-text mb-2">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Date d'arrivée *
                </span>
              </label>
              <input
                type="date"
                required
                min={minDate}
                value={bookingData.checkInDate || ''}
                onChange={(e) => handleChange('checkInDate', e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-theme-text mb-2">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Date de départ *
                </span>
              </label>
              <input
                type="date"
                required
                min={bookingData.checkInDate || minDate}
                value={bookingData.checkOutDate || ''}
                onChange={(e) => handleChange('checkOutDate', e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Room type selection for hotels */}
        {fields.showRoomType && roomTypes.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-theme-text mb-2">
              Type de chambre *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roomTypes.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleChange('roomType', room.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    bookingData.roomType === room.id
                      ? 'border-theme-primary bg-theme-primary/5'
                      : 'border-theme-border hover:border-theme-border-light'
                  }`}
                >
                  <p className="font-semibold text-theme-text">{room.name}</p>
                  <p className="text-sm text-theme-primary font-bold mt-1">
                    {room.price.toLocaleString('fr-FR')} €/nuit
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Single date selection (for activities, restaurants) */}
        {fields.showDates && !fields.showCheckinCheckout && (
          <div>
            <label className="block text-sm font-semibold text-theme-text mb-2">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date *
              </span>
            </label>
            <input
              type="date"
              required
              min={minDate}
              value={bookingData.selectedDate || ''}
              onChange={(e) => handleChange('selectedDate', e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
            />
          </div>
        )}

        {/* Time slots */}
        {fields.showTimeslots && (
          <div>
            <label className="block text-sm font-semibold text-theme-text mb-2">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horaire *
              </span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {availableTimeslots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleChange('selectedTime', time)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    bookingData.selectedTime === time
                      ? 'bg-theme-primary text-theme-background'
                      : 'bg-theme-background border border-theme-border text-theme-text hover:border-theme-primary'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Participants */}
        {fields.showParticipants && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-theme-text mb-2">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Adultes *
                </span>
              </label>
              <input
                type="number"
                required
                min="1"
                max="20"
                value={bookingData.adults || 1}
                onChange={(e) => handleChange('adults', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-theme-text mb-2">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Enfants
                </span>
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={bookingData.children || 0}
                onChange={(e) => handleChange('children', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Special requests */}
        <div>
          <label className="block text-sm font-semibold text-theme-text mb-2">
            Demandes spéciales (optionnel)
          </label>
          <textarea
            value={bookingData.specialRequests || ''}
            onChange={(e) => handleChange('specialRequests', e.target.value)}
            placeholder="Allergies alimentaires, besoins spéciaux, préférences..."
            rows={3}
            className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all resize-none"
          />
        </div>

        {/* Info box */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Confirmation de réservation</p>
            <p className="text-blue-700">
              Vous recevrez un email de confirmation avec tous les détails de votre réservation après le paiement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
