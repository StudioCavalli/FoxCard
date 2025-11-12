'use client'

import { useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { EmailEditorProps } from 'react-email-editor'
import type EmailEditor from 'react-email-editor'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loader2, Eye, Save, Download } from 'lucide-react'

// Dynamically import EmailEditor to avoid SSR issues
const EmailEditorComponent = dynamic(
  () => import('react-email-editor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    ),
  }
)

export interface EmailTemplateEditorProps {
  initialDesign?: any // Unlayer design JSON
  mergeTagsConfig?: {
    label: string
    value: string
    sample?: string
  }[]
  onSave?: (design: any, html: string) => void | Promise<void>
  onExport?: (html: string) => void
  readOnly?: boolean
}

export const EmailTemplateEditor = ({
  initialDesign,
  mergeTagsConfig = [],
  onSave,
  onExport,
  readOnly = false,
}: EmailTemplateEditorProps) => {
  const emailEditorRef = useRef<EmailEditor>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')

  // Load the design when editor is ready
  const onReady = useCallback(() => {
    if (initialDesign && emailEditorRef.current) {
      emailEditorRef.current.loadDesign(initialDesign)
    }
  }, [initialDesign])

  // Export HTML from editor
  const exportHtml = useCallback((): Promise<{ design: any; html: string }> => {
    return new Promise((resolve, reject) => {
      if (!emailEditorRef.current) {
        reject(new Error('Editor not ready'))
        return
      }

      emailEditorRef.current.exportHtml((data) => {
        const { design, html } = data
        resolve({ design, html })
      })
    })
  }, [])

  // Handle save
  const handleSave = async () => {
    if (!onSave) return

    try {
      setIsLoading(true)
      const { design, html } = await exportHtml()
      await onSave(design, html)
    } catch (error) {
      console.error('Failed to save template:', error)
      alert('Erreur lors de la sauvegarde du template')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle preview
  const handlePreview = async () => {
    try {
      const { html } = await exportHtml()
      setPreviewHtml(html)
      setShowPreview(true)
    } catch (error) {
      console.error('Failed to preview template:', error)
      alert('Erreur lors de la génération de la prévisualisation')
    }
  }

  // Handle export
  const handleExport = async () => {
    try {
      const { html } = await exportHtml()

      if (onExport) {
        onExport(html)
      } else {
        // Default: download as HTML file
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `email-template-${Date.now()}.html`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export template:', error)
      alert('Erreur lors de l\'export du template')
    }
  }

  // Configure Unlayer options
  const editorOptions: EmailEditorProps['options'] = {
    displayMode: readOnly ? 'email' : 'email',
    mergeTags: mergeTagsConfig.length > 0 ? {
      order_confirmation: mergeTagsConfig.map(tag => ({
        name: tag.label,
        value: tag.value,
        sample: tag.sample || tag.value,
      })),
    } : undefined,
    features: {
      preview: true,
      imageEditor: true,
      undoRedo: true,
      stockImages: false, // Disable to avoid external API calls
    },
    appearance: {
      theme: 'modern_light',
    },
    tools: {
      form: {
        enabled: false, // Disable form tools for transactional emails
      },
    },
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card variant="default" className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Éditeur de template email
            </h3>
            {readOnly && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                Lecture seule
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={handlePreview}
              disabled={isLoading}
            >
              <Eye className="w-4 h-4 mr-2" />
              Aperçu
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={handleExport}
              disabled={isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter HTML
            </Button>

            {!readOnly && onSave && (
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Editor */}
      <Card variant="default" className="overflow-hidden">
        <div style={{ height: '700px' }}>
          <EmailEditorComponent
            ref={emailEditorRef}
            onReady={onReady}
            options={editorOptions}
          />
        </div>
      </Card>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Aperçu du template</h3>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Fermer
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <div className="bg-white rounded-lg shadow-sm">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-[600px] border-0"
                  title="Email Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
