'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Download,
  Package,
  Clock,
  Hash,
  Key,
  FileText,
  Music,
  Video,
  Image as ImageIcon,
  Archive,
  File,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Mail,
} from 'lucide-react'
import { DigitalDownloadStatus } from '@prisma/client'
import { useTranslations } from 'next-intl'

const MIME_TYPE_ICONS: Record<string, typeof File> = {
  'application/pdf': FileText,
  'audio/mpeg': Music,
  'audio/mp3': Music,
  'audio/wav': Music,
  'video/mp4': Video,
  'image/jpeg': ImageIcon,
  'image/png': ImageIcon,
  'application/zip': Archive,
  'application/x-zip-compressed': Archive,
}

function getFileIcon(mimeType: string) {
  return MIME_TYPE_ICONS[mimeType] || File
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(date: Date | string, locale: string): string {
  const localeMap: Record<string, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    de: 'de-DE',
    es: 'es-ES',
    sk: 'sk-SK',
  }
  return new Date(date).toLocaleDateString(localeMap[locale] || 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getStatusInfo(status: DigitalDownloadStatus, t: (key: string) => string) {
  switch (status) {
    case 'ACTIVE':
      return {
        label: t('downloads.available'),
        color: 'text-green-600 bg-green-100 dark:bg-green-500/20 dark:text-green-400',
        icon: CheckCircle,
      }
    case 'EXPIRED':
      return {
        label: t('downloads.expired'),
        color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-500/20 dark:text-yellow-400',
        icon: Clock,
      }
    case 'EXHAUSTED':
      return {
        label: t('downloads.limitReached'),
        color: 'text-orange-600 bg-orange-100 dark:bg-orange-500/20 dark:text-orange-400',
        icon: AlertTriangle,
      }
    case 'REVOKED':
      return {
        label: t('downloads.revoked'),
        color: 'text-red-600 bg-red-100 dark:bg-red-500/20 dark:text-red-400',
        icon: XCircle,
      }
    default:
      return {
        label: status,
        color: 'text-gray-600 bg-gray-100',
        icon: File,
      }
  }
}

export default function CustomerDownloadsPage() {
  const params = useParams()
  const locale = params?.locale || 'fr'
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [searchedEmail, setSearchedEmail] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const { data, isLoading, error } = trpc.digital.getMyDownloads.useQuery(
    { email: searchedEmail },
    { enabled: !!searchedEmail }
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setIsSearching(true)
      setSearchedEmail(email.trim())
    }
  }

  const handleDownload = (downloadUrl: string) => {
    window.open(downloadUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 dark:bg-cyan-500/20 rounded-full mb-4">
            <Download className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('downloads.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('downloads.subtitle')}
          </p>
        </div>

        {/* Email Search Form */}
        {!searchedEmail && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 mb-8">
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-4 justify-center">
                <Mail className="w-5 h-5" />
                <span>{t('downloads.enterEmail')}</span>
              </div>
              <div className="flex gap-3">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('downloads.emailPlaceholder')}
                  required
                  className="flex-1"
                />
                <Button type="submit" variant="primary">
                  <Search className="w-4 h-4 mr-2" />
                  {t('downloads.searchButton')}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {searchedEmail && isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {t('downloads.searching')}
            </p>
          </div>
        )}

        {/* Error State */}
        {searchedEmail && error && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-500/30 p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('downloads.errorOccurred')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.message}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchedEmail('')
                setEmail('')
              }}
            >
              {t('downloads.retry')}
            </Button>
          </div>
        )}

        {/* Results */}
        {searchedEmail && data && !isLoading && (
          <>
            {/* Change Email Button */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('downloads.resultsFor')} <span className="font-medium text-gray-900 dark:text-white">{searchedEmail}</span>
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchedEmail('')
                  setEmail('')
                }}
              >
                {t('downloads.changeEmail')}
              </Button>
            </div>

            {data.downloads.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('downloads.noDownloadsTitle')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('downloads.noDownloadsDesc')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.downloads.map((download) => {
                  const statusInfo = getStatusInfo(download.status, t)
                  const StatusIcon = statusInfo.icon
                  const FileIcon = File // We don't have mimeType in the response

                  return (
                    <div
                      key={download.id}
                      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 p-3 bg-cyan-50 dark:bg-cyan-500/10 rounded-lg">
                          <FileIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {download.fileName}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            {t('downloads.orderNumber', { number: download.orderNumber })} • {t('downloads.purchasedOn', { date: formatDate(download.purchaseDate, locale as string) })}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Download className="w-4 h-4" />
                              {formatFileSize(download.fileSize)}
                            </span>
                            {download.maxDownloads && (
                              <span className="flex items-center gap-1">
                                <Hash className="w-4 h-4" />
                                {t('downloads.downloadCount', { current: download.downloadCount, max: download.maxDownloads })}
                              </span>
                            )}
                            {download.expiresAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {t('downloads.expiresOn', { date: formatDate(download.expiresAt, locale as string) })}
                              </span>
                            )}
                          </div>

                          {download.licenseKey && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                              <div className="flex items-center gap-2 text-sm">
                                <Key className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-400">{t('downloads.licenseKey')}</span>
                                <code className="font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-600 px-2 py-0.5 rounded">
                                  {download.licenseKey}
                                </code>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            variant="primary"
                            onClick={() => handleDownload(download.downloadUrl)}
                            disabled={download.status !== 'ACTIVE'}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {t('downloads.downloadButton')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('downloads.needHelp')}{' '}
            <a href={`/${locale}/contact`} className="text-cyan-600 dark:text-cyan-400 hover:underline">
              {t('common.contactUs')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
