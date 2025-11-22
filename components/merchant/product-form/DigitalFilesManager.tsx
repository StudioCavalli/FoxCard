'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Download,
  Upload,
  Trash2,
  GripVertical,
  FileText,
  Music,
  Video,
  Image as ImageIcon,
  Archive,
  File,
  Plus,
  X,
  Loader2,
  RefreshCw,
  Key,
  Clock,
  Hash,
} from 'lucide-react'
import { formatFileSize } from '@/lib/digital/download-manager'

interface DigitalFile {
  id: string
  name: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  maxDownloads: number | null
  expiryDays: number | null
  licenseKey: string | null
  licenseType: string | null
  version: string | null
  releaseNotes: string | null
  isActive: boolean
  sortOrder: number
  formattedSize?: string
}

interface DigitalFilesManagerProps {
  productId: string
  isDigitalProduct: boolean
}

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

export function DigitalFilesManager({ productId, isDigitalProduct }: DigitalFilesManagerProps) {
  const [isAddingFile, setIsAddingFile] = useState(false)
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [newFile, setNewFile] = useState({
    name: '',
    fileName: '',
    fileUrl: '',
    fileSize: 0,
    mimeType: 'application/octet-stream',
    maxDownloads: '',
    expiryDays: '',
    licenseKey: '',
    licenseType: '',
    version: '',
    releaseNotes: '',
  })

  const utils = trpc.useUtils()

  const { data: files, isLoading } = trpc.digital.getProductFiles.useQuery(
    { productId },
    { enabled: !!productId && isDigitalProduct }
  )

  const createFile = trpc.digital.createFile.useMutation({
    onSuccess: () => {
      utils.digital.getProductFiles.invalidate({ productId })
      setIsAddingFile(false)
      resetNewFile()
    },
  })

  const updateFile = trpc.digital.updateFile.useMutation({
    onSuccess: () => {
      utils.digital.getProductFiles.invalidate({ productId })
      setEditingFile(null)
    },
  })

  const deleteFile = trpc.digital.deleteFile.useMutation({
    onSuccess: () => {
      utils.digital.getProductFiles.invalidate({ productId })
    },
  })

  const resetNewFile = () => {
    setNewFile({
      name: '',
      fileName: '',
      fileUrl: '',
      fileSize: 0,
      mimeType: 'application/octet-stream',
      maxDownloads: '',
      expiryDays: '',
      licenseKey: '',
      licenseType: '',
      version: '',
      releaseNotes: '',
    })
  }

  const handleCreateFile = () => {
    if (!newFile.name || !newFile.fileUrl || !newFile.fileName) return

    createFile.mutate({
      productId,
      name: newFile.name,
      fileName: newFile.fileName,
      fileUrl: newFile.fileUrl,
      fileSize: newFile.fileSize || 1,
      mimeType: newFile.mimeType,
      maxDownloads: newFile.maxDownloads ? parseInt(newFile.maxDownloads) : undefined,
      expiryDays: newFile.expiryDays ? parseInt(newFile.expiryDays) : undefined,
      licenseKey: newFile.licenseKey || undefined,
      licenseType: newFile.licenseType || undefined,
      version: newFile.version || undefined,
      releaseNotes: newFile.releaseNotes || undefined,
    })
  }

  const handleDeleteFile = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      deleteFile.mutate({ id })
    }
  }

  const handleToggleActive = (file: DigitalFile) => {
    updateFile.mutate({
      id: file.id,
      isActive: !file.isActive,
    })
  }

  if (!isDigitalProduct) {
    return null
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Fichiers téléchargeables
          </h2>
        </div>
        {!isAddingFile && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingFile(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter un fichier
          </Button>
        )}
      </div>

      {/* Files List */}
      {files && files.length > 0 ? (
        <div className="space-y-3 mb-4">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.mimeType)
            const isEditing = editingFile === file.id

            return (
              <div
                key={file.id}
                className={`border rounded-lg p-4 ${
                  file.isActive
                    ? 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700'
                    : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-grab mt-1" />
                  </div>
                  <div className="flex-shrink-0 p-2 bg-cyan-50 dark:bg-cyan-500/10 rounded-lg">
                    <FileIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </h3>
                      {file.version && (
                        <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 rounded">
                          v{file.version}
                        </span>
                      )}
                      {!file.isActive && (
                        <span className="px-1.5 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded">
                          Désactivé
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {file.fileName}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{file.formattedSize || formatFileSize(file.fileSize)}</span>
                      {file.maxDownloads && (
                        <span className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {file.maxDownloads} téléchargements max
                        </span>
                      )}
                      {file.expiryDays && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expire après {file.expiryDays} jours
                        </span>
                      )}
                      {file.licenseKey && (
                        <span className="flex items-center gap-1">
                          <Key className="w-3 h-3" />
                          Licence incluse
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(file)}
                      title={file.isActive ? 'Désactiver' : 'Activer'}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : !isAddingFile ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-lg">
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-3">
            Aucun fichier téléchargeable
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAddingFile(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter un fichier
          </Button>
        </div>
      ) : null}

      {/* Add New File Form */}
      {isAddingFile && (
        <div className="border border-cyan-200 dark:border-cyan-500/30 bg-cyan-50/50 dark:bg-cyan-500/5 rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Nouveau fichier
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsAddingFile(false)
                resetNewFile()
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Nom du fichier *</Label>
              <Input
                value={newFile.name}
                onChange={(e) => setNewFile({ ...newFile, name: e.target.value })}
                placeholder="Ex: Guide complet PDF"
              />
            </div>
            <div>
              <Label>Nom du fichier (pour téléchargement) *</Label>
              <Input
                value={newFile.fileName}
                onChange={(e) => setNewFile({ ...newFile, fileName: e.target.value })}
                placeholder="guide-complet.pdf"
              />
            </div>
            <div>
              <Label>Type MIME</Label>
              <select
                value={newFile.mimeType}
                onChange={(e) => setNewFile({ ...newFile, mimeType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              >
                <option value="application/pdf">PDF</option>
                <option value="application/zip">ZIP</option>
                <option value="audio/mpeg">MP3</option>
                <option value="audio/wav">WAV</option>
                <option value="video/mp4">MP4</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="application/octet-stream">Autre</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>URL du fichier *</Label>
              <Input
                value={newFile.fileUrl}
                onChange={(e) => setNewFile({ ...newFile, fileUrl: e.target.value })}
                placeholder="https://storage.example.com/files/guide.pdf"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL sécurisée vers le fichier (S3, CloudFlare R2, etc.)
              </p>
            </div>
            <div>
              <Label>Taille du fichier (bytes)</Label>
              <Input
                type="number"
                value={newFile.fileSize || ''}
                onChange={(e) => setNewFile({ ...newFile, fileSize: parseInt(e.target.value) || 0 })}
                placeholder="1048576"
              />
            </div>
            <div>
              <Label>Version</Label>
              <Input
                value={newFile.version}
                onChange={(e) => setNewFile({ ...newFile, version: e.target.value })}
                placeholder="1.0.0"
              />
            </div>
            <div>
              <Label>Limite de téléchargements</Label>
              <Input
                type="number"
                value={newFile.maxDownloads}
                onChange={(e) => setNewFile({ ...newFile, maxDownloads: e.target.value })}
                placeholder="Illimité si vide"
              />
            </div>
            <div>
              <Label>Expiration (jours après achat)</Label>
              <Input
                type="number"
                value={newFile.expiryDays}
                onChange={(e) => setNewFile({ ...newFile, expiryDays: e.target.value })}
                placeholder="Jamais si vide"
              />
            </div>
            <div>
              <Label>Clé de licence (optionnel)</Label>
              <Input
                value={newFile.licenseKey}
                onChange={(e) => setNewFile({ ...newFile, licenseKey: e.target.value })}
                placeholder="XXXX-XXXX-XXXX-XXXX"
              />
            </div>
            <div>
              <Label>Type de licence</Label>
              <select
                value={newFile.licenseType}
                onChange={(e) => setNewFile({ ...newFile, licenseType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              >
                <option value="">Non spécifié</option>
                <option value="personal">Usage personnel</option>
                <option value="commercial">Usage commercial</option>
                <option value="extended">Licence étendue</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>Notes de version</Label>
              <textarea
                value={newFile.releaseNotes}
                onChange={(e) => setNewFile({ ...newFile, releaseNotes: e.target.value })}
                placeholder="Nouveautés de cette version..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddingFile(false)
                resetNewFile()
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleCreateFile}
              disabled={createFile.isPending || !newFile.name || !newFile.fileUrl || !newFile.fileName}
            >
              {createFile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Ajout...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter le fichier
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Les fichiers seront accessibles aux clients après leur achat via un lien sécurisé.
      </p>
    </div>
  )
}
