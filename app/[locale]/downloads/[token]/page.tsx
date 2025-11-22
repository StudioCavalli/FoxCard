'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import {
  Download,
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
  Clock,
  Hash,
  Key,
  Shield,
  ExternalLink,
} from 'lucide-react'
import { DigitalDownloadStatus } from '@prisma/client'

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

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusInfo(status: DigitalDownloadStatus) {
  switch (status) {
    case 'ACTIVE':
      return {
        label: 'Disponible',
        description: 'Ce fichier est disponible au téléchargement.',
        color: 'text-green-600 bg-green-100 dark:bg-green-500/20 dark:text-green-400',
        borderColor: 'border-green-200 dark:border-green-500/30',
        icon: CheckCircle,
        canDownload: true,
      }
    case 'EXPIRED':
      return {
        label: 'Lien expiré',
        description: 'Ce lien de téléchargement a expiré. Veuillez contacter le support.',
        color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-500/20 dark:text-yellow-400',
        borderColor: 'border-yellow-200 dark:border-yellow-500/30',
        icon: Clock,
        canDownload: false,
      }
    case 'EXHAUSTED':
      return {
        label: 'Limite atteinte',
        description: 'Vous avez atteint le nombre maximum de téléchargements.',
        color: 'text-orange-600 bg-orange-100 dark:bg-orange-500/20 dark:text-orange-400',
        borderColor: 'border-orange-200 dark:border-orange-500/30',
        icon: AlertTriangle,
        canDownload: false,
      }
    case 'REVOKED':
      return {
        label: 'Accès révoqué',
        description: 'L\'accès à ce téléchargement a été révoqué.',
        color: 'text-red-600 bg-red-100 dark:bg-red-500/20 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-500/30',
        icon: XCircle,
        canDownload: false,
      }
    default:
      return {
        label: status,
        description: '',
        color: 'text-gray-600 bg-gray-100',
        borderColor: 'border-gray-200',
        icon: File,
        canDownload: false,
      }
  }
}

export default function DownloadPage() {
  const params = useParams()
  const locale = params?.locale || 'fr'
  const token = params?.token as string
  const [isDownloading, setIsDownloading] = useState(false)

  const { data: downloadInfo, isLoading, error } = trpc.digital.getDownloadInfo.useQuery(
    { token },
    { enabled: !!token }
  )

  const handleDownload = async () => {
    if (!downloadInfo) return

    setIsDownloading(true)

    // Open download in new tab
    window.open(`/api/downloads/${token}`, '_blank')

    // Refresh the page data after a short delay to update download count
    setTimeout(() => {
      setIsDownloading(false)
      window.location.reload()
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Chargement des informations de téléchargement...
          </p>
        </div>
      </div>
    )
  }

  if (error || !downloadInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-500/30 p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Téléchargement non trouvé
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ce lien de téléchargement est invalide ou n'existe plus.
            </p>
            <Link href={`/${locale}/downloads`}>
              <Button variant="primary">
                Voir mes téléchargements
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(downloadInfo.status)
  const StatusIcon = statusInfo.icon
  const FileIcon = getFileIcon(downloadInfo.mimeType)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-100 dark:bg-cyan-500/20 rounded-full mb-4">
            <FileIcon className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {downloadInfo.fileName}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Commande #{downloadInfo.orderNumber}
          </p>
        </div>

        {/* Payment Check */}
        {!downloadInfo.isPaid && (
          <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                  Paiement en attente
                </h3>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                  Le paiement de cette commande n'a pas encore été confirmé. Le téléchargement sera disponible une fois le paiement validé.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className={`bg-white dark:bg-slate-800 rounded-xl border ${statusInfo.borderColor} p-6 mb-6`}>
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full ${statusInfo.color}`}>
              <StatusIcon className="w-4 h-4" />
              {statusInfo.label}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {statusInfo.description}
          </p>
        </div>

        {/* File Details */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            Détails du fichier
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
              <span className="text-gray-500 dark:text-gray-400">Taille</span>
              <span className="font-medium text-gray-900 dark:text-white">{downloadInfo.fileSize}</span>
            </div>
            {downloadInfo.version && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                <span className="text-gray-500 dark:text-gray-400">Version</span>
                <span className="font-medium text-gray-900 dark:text-white">v{downloadInfo.version}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Hash className="w-4 h-4" />
                Téléchargements
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {downloadInfo.downloadCount}
                {downloadInfo.maxDownloads && ` / ${downloadInfo.maxDownloads}`}
                {downloadInfo.downloadsRemaining !== null && downloadInfo.downloadsRemaining > 0 && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({downloadInfo.downloadsRemaining} restants)
                  </span>
                )}
              </span>
            </div>
            {downloadInfo.expiresAt && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Expiration
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(downloadInfo.expiresAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* License Key */}
        {downloadInfo.licenseKey && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Clé de licence
              </h2>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
              <code className="font-mono text-lg text-gray-900 dark:text-white break-all">
                {downloadInfo.licenseKey}
              </code>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Conservez cette clé en lieu sûr. Elle peut être nécessaire pour activer votre produit.
            </p>
          </div>
        )}

        {/* Release Notes */}
        {downloadInfo.releaseNotes && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
              Notes de version
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {downloadInfo.releaseNotes}
              </p>
            </div>
          </div>
        )}

        {/* Download Button */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleDownload}
            disabled={!statusInfo.canDownload || !downloadInfo.isPaid || isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Préparation du téléchargement...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Télécharger le fichier
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Téléchargement sécurisé</span>
          </div>
        </div>

        {/* Help Links */}
        <div className="mt-8 text-center space-y-2">
          <Link
            href={`/${locale}/downloads`}
            className="inline-flex items-center gap-1 text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Voir tous mes téléchargements
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Un problème ?{' '}
            <a href={`/${locale}/contact`} className="text-cyan-600 dark:text-cyan-400 hover:underline">
              Contactez le support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
