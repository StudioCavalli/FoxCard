'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Store, ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface PageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export default function StoreContactPage({ params }: PageProps) {
  const { slug } = use(params)

  const { data: store, isLoading } = trpc.store.getBySlug.useQuery({ slug })
  const sendMessageMutation = trpc.store.sendContactMessage.useMutation()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!store?.id) return

    try {
      await sendMessageMutation.mutateAsync({
        storeId: store.id,
        ...formData,
      })

      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })

      // Reset after 5 seconds
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="h-8 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-12 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Boutique introuvable</h1>
          <p className="text-gray-600 mb-6">La boutique que vous recherchez n'existe pas</p>
          <Link href="/stores">
            <Button>Retour aux boutiques</Button>
          </Link>
        </div>
      </div>
    )
  }

  const publicAddress = store.publicAddress as Record<string, string> | null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/stores" className="hover:text-indigo-600">
              Boutiques
            </Link>
            <span>/</span>
            <Link href={`/stores/${slug}`} className="hover:text-indigo-600">
              {store.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Contact</span>
          </nav>

          {/* Store Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {store.logo ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image src={store.logo} alt={store.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Store className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                <p className="text-gray-600">Contactez-nous</p>
              </div>
            </div>

            <Link href={`/stores/${slug}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la boutique
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Message envoyé avec succès!</h3>
                    <p className="text-green-700">
                      Votre message a été transmis à {store.name}. Nous vous répondrons dans les plus brefs délais.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Jean Dupont"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jean.dupont@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Sujet *
                    </label>
                    <Input
                      id="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="À propos de..."
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Votre message..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      minLength={10}
                    />
                    <p className="mt-2 text-sm text-gray-500">Minimum 10 caractères</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={sendMessageMutation.isPending}
                    className="w-full"
                  >
                    {sendMessageMutation.isPending ? (
                      'Envoi en cours...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </Button>

                  {sendMessageMutation.isError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                      Erreur lors de l'envoi du message. Veuillez réessayer.
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Informations de contact</h3>

                <div className="space-y-4">
                  {store.publicEmail && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Mail className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">Email</p>
                        <a
                          href={`mailto:${store.publicEmail}`}
                          className="text-sm text-indigo-600 hover:underline break-all"
                        >
                          {store.publicEmail}
                        </a>
                      </div>
                    </div>
                  )}

                  {store.publicPhone && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">Téléphone</p>
                        <a
                          href={`tel:${store.publicPhone}`}
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          {store.publicPhone}
                        </a>
                      </div>
                    </div>
                  )}

                  {publicAddress && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">Adresse</p>
                        <div className="text-sm text-gray-600">
                          {publicAddress.street && <div>{publicAddress.street}</div>}
                          {(publicAddress.city || publicAddress.postalCode) && (
                            <div>
                              {publicAddress.postalCode} {publicAddress.city}
                            </div>
                          )}
                          {publicAddress.country && <div>{publicAddress.country}</div>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-900">Temps de réponse:</strong> Nous répondons généralement sous 24 heures ouvrables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
