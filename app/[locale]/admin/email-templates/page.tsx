'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { Mail, Plus, Edit, Trash2, Copy, Eye, Power } from 'lucide-react'
import { EmailTemplateEditor } from '@/components/admin/email/EmailTemplateEditor'

export default function AdminEmailTemplatesPage() {
  const DEMO_STORE_ID = '000000000000000000000001'
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)

  // Get all templates
  const { data: templates, isLoading, refetch } = trpc.email.getTemplates.useQuery({
    storeId: DEMO_STORE_ID,
    includeInactive: true,
  })

  // Mutations
  const createMutation = trpc.email.createTemplate.useMutation()
  const updateMutation = trpc.email.updateTemplate.useMutation()
  const deleteMutation = trpc.email.deleteTemplate.useMutation()
  const cloneMutation = trpc.email.cloneTemplate.useMutation()

  // Predefined template types with their variables
  const templateTypes = {
    order_confirmation: {
      label: 'Confirmation de commande',
      variables: ['customerName', 'orderNumber', 'orderDate', 'items', 'subtotal', 'shipping', 'tax', 'discount', 'total', 'shippingAddress', 'trackingUrl'],
    },
    order_status_update: {
      label: 'Mise à jour de commande',
      variables: ['customerName', 'orderNumber', 'status', 'statusMessage', 'trackingUrl'],
    },
    welcome_email: {
      label: 'Email de bienvenue',
      variables: ['customerName', 'storeName', 'loginUrl'],
    },
    reset_password: {
      label: 'Réinitialisation mot de passe',
      variables: ['customerName', 'resetUrl', 'expiresIn'],
    },
    custom: {
      label: 'Template personnalisé',
      variables: [],
    },
  }

  const handleSaveTemplate = async (design: any, html: string) => {
    try {
      if (editingTemplate) {
        // Update existing template
        await updateMutation.mutateAsync({
          id: editingTemplate.id,
          htmlBody: html,
          designJson: design,
          subject: editingTemplate.subject, // Keep existing subject
        })
        alert('Template mis à jour avec succès !')
      } else {
        // Create new template - this will be handled by a form modal
        throw new Error('Creating templates requires additional info')
      }

      setShowEditor(false)
      setEditingTemplate(null)
      refetch()
    } catch (error) {
      console.error('Error saving template:', error)
      throw error // Re-throw to let editor handle it
    }
  }

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template)
    setShowEditor(true)
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      return
    }

    try {
      await deleteMutation.mutateAsync({ id })
      alert('Template supprimé avec succès !')
      refetch()
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la suppression du template')
    }
  }

  const handleCloneTemplate = async (id: string, currentName: string) => {
    const newName = prompt('Nom du nouveau template :', `${currentName}_copie`)
    if (!newName) return

    try {
      await cloneMutation.mutateAsync({ id, newName })
      alert('Template dupliqué avec succès !')
      refetch()
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la duplication du template')
    }
  }

  const handleToggleActive = async (template: any) => {
    try {
      await updateMutation.mutateAsync({
        id: template.id,
        isActive: !template.isActive,
      })
      refetch()
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la modification du statut')
    }
  }

  const handlePreview = (template: any) => {
    setPreviewTemplate(template)
    setShowPreview(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates Email</h1>
          <p className="text-gray-600">Gérez vos templates d'emails personnalisés</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau template
        </Button>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Chargement des templates...</p>
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Mail className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    {template.description && (
                      <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(template)}
                  className={`p-1 rounded ${
                    template.isActive
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={template.isActive ? 'Actif' : 'Inactif'}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Sujet</p>
                  <p className="text-sm text-gray-900 truncate">{template.subject}</p>
                </div>
                {template.variables && template.variables.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Variables disponibles</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map((variable: string) => (
                        <span
                          key={variable}
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
                        >
                          {variable}
                        </span>
                      ))}
                      {template.variables.length > 3 && (
                        <span className="text-xs px-2 py-0.5 text-gray-500">
                          +{template.variables.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePreview(template)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Aperçu
                </Button>

                {!template.isDefault && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Éditer
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCloneTemplate(template.id, template.name)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {template.isDefault && (
                  <span className="text-xs text-gray-500 px-2">Template par défaut</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun template personnalisé
          </h3>
          <p className="text-gray-600 mb-6">
            Créez votre premier template personnalisé pour vos emails
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Créer un template
          </Button>
        </Card>
      )}

      {/* Editor Modal */}
      {showEditor && editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-auto">
          <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Éditer: {editingTemplate.name}
                  </h2>
                  <Button variant="outline" onClick={() => {
                    setShowEditor(false)
                    setEditingTemplate(null)
                  }}>
                    Fermer
                  </Button>
                </div>

                <EmailTemplateEditor
                  initialDesign={editingTemplate.designJson}
                  mergeTagsConfig={editingTemplate.variables.map((v: string) => ({
                    label: v,
                    value: `{{${v}}}`,
                    sample: `Exemple ${v}`,
                  }))}
                  onSave={handleSaveTemplate}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{previewTemplate.name}</h3>
                <p className="text-sm text-gray-600">{previewTemplate.subject}</p>
              </div>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Fermer
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <div className="bg-white rounded-lg shadow-sm">
                <iframe
                  srcDoc={previewTemplate.htmlBody}
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

// Create Modal component would go here
function setShowCreateModal(show: boolean) {
  // Placeholder - would implement full creation modal
  alert('La création de templates via modal sera implémentée prochainement')
}
