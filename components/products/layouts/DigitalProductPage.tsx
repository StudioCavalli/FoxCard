'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import {
  ArrowLeft, Download, FileText, Play, Check, ShieldCheck, Clock,
  Infinity, File, FileArchive, FileImage, FileAudio, FileVideo,
  Star, Eye
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface DigitalProductPageProps {
  product: any
}

const fileTypeIcons: Record<string, any> = {
  pdf: FileText,
  zip: FileArchive,
  image: FileImage,
  audio: FileAudio,
  video: FileVideo,
  default: File,
}

export function DigitalProductPage({ product }: DigitalProductPageProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'fr'
  const t = useTranslations()
  const addItem = useCartStore((state) => state.addItem)

  const [showPreview, setShowPreview] = useState(false)

  const images = product.images?.length > 0
    ? product.images
    : product.thumbnail
    ? [product.thumbnail]
    : ['/placeholder-digital.png']
  const mainImage = images[0] || '/placeholder-digital.png'

  // Digital product metadata
  const fileType = product.metadata?.fileType || 'pdf'
  const fileSize = product.metadata?.fileSize || '15 MB'
  const format = product.metadata?.format || 'PDF'
  const version = product.metadata?.version || '1.0'
  const license = product.metadata?.license || 'personal'
  const hasPreview = product.metadata?.hasPreview || true
  const previewUrl = product.metadata?.previewUrl || null

  // Included files
  const includedFiles = product.metadata?.files || [
    { name: `${product.name}.${format.toLowerCase()}`, size: fileSize, type: fileType },
  ]

  const licenseFeatures = {
    personal: [
      t('product.digital.personalUse'),
      t('product.digital.noCommercial'),
      t('product.digital.singleUser'),
    ],
    commercial: [
      t('product.digital.personalUse'),
      t('product.digital.commercialUse'),
      t('product.digital.unlimitedProjects'),
    ],
    extended: [
      t('product.digital.personalUse'),
      t('product.digital.commercialUse'),
      t('product.digital.unlimitedProjects'),
      t('product.digital.resaleRights'),
    ],
  }

  const FileIcon = fileTypeIcons[fileType] || fileTypeIcons.default

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      productId: product.id,
      storeId: product.storeId,
      storeName: product.store?.name,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: mainImage,
      quantity: 1,
      maxQuantity: 1,
      productType: 'DIGITAL',
      attributes: {
        isDigital: true,
        license,
        fileType,
      },
    })
    router.push(`/${locale}/cart`)
  }

  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto px-6 lg:px-8 py-12" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        {/* Back Button */}
        <Link
          href={`/${locale}/products`}
          className="group inline-flex items-center text-theme-text-secondary hover:text-theme-primary mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
          {t('product.backToProducts')}
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Preview */}
          <div className="space-y-6">
            {/* Main Preview */}
            <div className="relative aspect-[4/3] bg-theme-surface border border-theme-border rounded-2xl overflow-hidden group">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="bg-theme-primary text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {t('product.digital.instantDownload')}
                </span>
                {product.featured && (
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    {t('product.digital.bestseller')}
                  </span>
                )}
              </div>

              {/* Preview Button */}
              {hasPreview && (
                <button
                  onClick={() => setShowPreview(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-all"
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all shadow-xl">
                    <Eye className="w-8 h-8 text-theme-primary" />
                  </div>
                </button>
              )}
            </div>

            {/* File Info Card */}
            <div className="bg-theme-surface border border-theme-border rounded-2xl p-6">
              <h3 className="font-semibold text-theme-text mb-4">{t('product.digital.includedFiles')}</h3>
              <div className="space-y-3">
                {includedFiles.map((file: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-theme-background border border-theme-border rounded-xl"
                  >
                    <div className="w-12 h-12 bg-theme-primary/10 rounded-xl flex items-center justify-center">
                      <FileIcon className="w-6 h-6 text-theme-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-theme-text">{file.name}</div>
                      <div className="text-sm text-theme-text-muted">{file.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-theme-surface border border-theme-border rounded-2xl p-6">
              <h3 className="font-semibold text-theme-text mb-4">{t('product.digital.specifications')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-theme-text-muted">{t('product.digital.format')}</div>
                    <div className="font-medium text-theme-text">{format}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-theme-text-muted">{t('product.digital.fileSize')}</div>
                    <div className="font-medium text-theme-text">{fileSize}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-theme-text-muted">{t('product.digital.version')}</div>
                    <div className="font-medium text-theme-text">v{version}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-theme-text-muted">{t('product.digital.license')}</div>
                    <div className="font-medium text-theme-text capitalize">{license}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Info & Purchase */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              {product.category && (
                <Link
                  href={`/products?category=${product.category.id}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-theme-primary/10 text-theme-primary font-medium rounded-full text-sm hover:bg-theme-primary/20 transition-colors duration-200 mb-4"
                >
                  {product.category.name}
                </Link>
              )}
              <h1
                className="text-3xl md:text-4xl font-bold text-theme-text mb-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {product.name}
              </h1>
              {product.store && (
                <p className="text-theme-text-secondary">{t('product.digital.by')} {product.store.name}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span
                className="text-4xl font-bold text-theme-text"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xl text-theme-text-muted line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-theme-border pt-6">
                <h3 className="font-semibold text-theme-text mb-3">{t('product.description')}</h3>
                <p className="text-theme-text-secondary leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {/* License Info */}
            <div className="bg-theme-surface border border-theme-border rounded-2xl p-6">
              <h3 className="font-semibold text-theme-text mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-theme-primary" />
                {t('product.digital.licenseTerms')}
              </h3>
              <ul className="space-y-3">
                {(licenseFeatures[license as keyof typeof licenseFeatures] || licenseFeatures.personal).map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-theme-text-secondary">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-theme-text-secondary">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium">{t('product.digital.instantAccess')}</span>
              </div>
              <div className="flex items-center gap-3 text-theme-text-secondary">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Infinity className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium">{t('product.digital.lifetimeAccess')}</span>
              </div>
              <div className="flex items-center gap-3 text-theme-text-secondary">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-medium">{t('product.digital.securePayment')}</span>
              </div>
            </div>

            {/* Buy Button */}
            <div className="border-t border-theme-border pt-6">
              <button
                onClick={handleBuyNow}
                className="w-full px-8 py-4 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold text-lg shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                <Download className="w-5 h-5" />
                {t('product.digital.buyNow')}
              </button>
              <p className="text-center text-sm text-theme-text-muted mt-3">
                {t('product.digital.downloadNote')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative bg-white dark:bg-theme-surface rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-theme-border flex items-center justify-between">
              <h3 className="font-semibold text-theme-text">{t('product.digital.preview')}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-theme-background rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-[4/3] bg-gray-100 dark:bg-theme-background flex items-center justify-center">
              {previewUrl ? (
                <iframe src={previewUrl} className="w-full h-full" />
              ) : (
                <div className="text-center p-8">
                  <Eye className="w-16 h-16 text-theme-text-muted mx-auto mb-4" />
                  <p className="text-theme-text-secondary">{t('product.digital.previewNotAvailable')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
