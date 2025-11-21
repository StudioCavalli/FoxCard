'use client'

/**
 * crsdpay Settings Page - Configuration du gateway
 */

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/hooks/use-toast'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CrsdpaySettings() {
  const [storeId, setStoreId] = useState<string>('')
  const { toast } = useToast()

  const { data: config, isLoading, refetch } = trpc.crsdpay.getConfig.useQuery(
    { storeId },
    { enabled: !!storeId }
  )

  const updateConfigMutation = trpc.crsdpay.updateConfig.useMutation()

  useEffect(() => {
    const mockStoreId = '507f1f77bcf86cd799439011'
    setStoreId(mockStoreId)
  }, [])

  const [formData, setFormData] = useState({
    isEnabled: false,
    mode: 'test' as 'test' | 'live',
    require3DS: true,
    autoCapture: true,
    btcEnabled: false,
    ethEnabled: false,
    usdtEnabled: false,
    lightningEnabled: false,
    fraudDetectionEnabled: true,
    riskScoreThreshold: 75,
    webhookUrl: '',
    webhookSecret: '',
    brandName: '',
    brandLogoUrl: '',
    brandColor: '#6366f1',
    statementDescriptor: '',
  })

  useEffect(() => {
    if (config) {
      setFormData({
        isEnabled: config.isEnabled,
        mode: config.mode as 'test' | 'live',
        require3DS: config.require3DS,
        autoCapture: config.autoCapture,
        btcEnabled: config.btcEnabled,
        ethEnabled: config.ethEnabled,
        usdtEnabled: config.usdtEnabled,
        lightningEnabled: config.lightningEnabled,
        fraudDetectionEnabled: config.fraudDetectionEnabled,
        riskScoreThreshold: config.riskScoreThreshold,
        webhookUrl: config.webhookUrl || '',
        webhookSecret: config.webhookSecret || '',
        brandName: config.brandName || '',
        brandLogoUrl: config.brandLogoUrl || '',
        brandColor: config.brandColor || '#6366f1',
        statementDescriptor: config.statementDescriptor || '',
      })
    }
  }, [config])

  const handleSave = async () => {
    try {
      await updateConfigMutation.mutateAsync({
        storeId,
        ...formData,
      })

      toast({
        title: 'Configuration sauvegardée',
        description: 'Les paramètres de crsdpay ont été mis à jour',
      })

      await refetch()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la configuration',
        variant: 'destructive',
      })
    }
  }

  if (isLoading || !storeId) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <Link href="/admin/crsdpay">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Button>
        </Link>

        <h1 className="text-3xl font-bold">Configuration crsdpay</h1>
        <p className="text-gray-600">
          Configurez votre système de paiement personnalisé
        </p>
      </div>

      {/* Activation */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Activation</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isEnabled" className="text-base font-semibold">
                Activer crsdpay
              </Label>
              <p className="text-sm text-gray-600">
                Autoriser les paiements via crsdpay
              </p>
            </div>
            <Switch
              checked={formData.isEnabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isEnabled: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="mode" className="text-base font-semibold">
                Mode de production
              </Label>
              <p className="text-sm text-gray-600">
                {formData.mode === 'test' ? 'Mode Test' : 'Mode Production'}
              </p>
            </div>
            <Switch
              checked={formData.mode === 'live'}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, mode: checked ? 'live' : 'test' }))
              }
            />
          </div>
        </div>
      </Card>

      {/* Payment Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Paramètres de paiement</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="require3DS" className="text-base font-semibold">
                Exiger 3D Secure
              </Label>
              <p className="text-sm text-gray-600">
                Authentification forte recommandée pour la sécurité
              </p>
            </div>
            <Switch
              checked={formData.require3DS}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, require3DS: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoCapture" className="text-base font-semibold">
                Capture automatique
              </Label>
              <p className="text-sm text-gray-600">
                Capturer automatiquement les paiements autorisés
              </p>
            </div>
            <Switch
              checked={formData.autoCapture}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, autoCapture: checked }))
              }
            />
          </div>

          <div>
            <Label htmlFor="statementDescriptor">Descripteur de relevé</Label>
            <Input
              id="statementDescriptor"
              value={formData.statementDescriptor}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, statementDescriptor: e.target.value }))
              }
              placeholder="MA BOUTIQUE"
              maxLength={22}
            />
            <p className="text-sm text-gray-500 mt-1">
              Apparaît sur le relevé bancaire du client (22 caractères max)
            </p>
          </div>
        </div>
      </Card>

      {/* Cryptocurrency */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Cryptomonnaies</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="btcEnabled" className="text-base font-semibold">
                Bitcoin (BTC)
              </Label>
              <p className="text-sm text-gray-600">Accepter les paiements en Bitcoin</p>
            </div>
            <Switch
              checked={formData.btcEnabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, btcEnabled: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ethEnabled" className="text-base font-semibold">
                Ethereum (ETH)
              </Label>
              <p className="text-sm text-gray-600">Accepter les paiements en Ethereum</p>
            </div>
            <Switch
              checked={formData.ethEnabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, ethEnabled: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="usdtEnabled" className="text-base font-semibold">
                USDT/USDC
              </Label>
              <p className="text-sm text-gray-600">Accepter les stablecoins</p>
            </div>
            <Switch
              checked={formData.usdtEnabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, usdtEnabled: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="lightningEnabled" className="text-base font-semibold">
                Lightning Network
              </Label>
              <p className="text-sm text-gray-600">Paiements Bitcoin instantanés</p>
            </div>
            <Switch
              checked={formData.lightningEnabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, lightningEnabled: checked }))
              }
            />
          </div>
        </div>
      </Card>

      {/* Fraud Detection */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Détection de fraude</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="fraudDetectionEnabled" className="text-base font-semibold">
                Activer la détection de fraude
              </Label>
              <p className="text-sm text-gray-600">
                Analyse automatique des transactions suspectes
              </p>
            </div>
            <Switch
              checked={formData.fraudDetectionEnabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, fraudDetectionEnabled: checked }))
              }
            />
          </div>

          <div>
            <Label htmlFor="riskScoreThreshold">
              Seuil de score de risque: {formData.riskScoreThreshold}
            </Label>
            <input
              type="range"
              id="riskScoreThreshold"
              min="0"
              max="100"
              value={formData.riskScoreThreshold}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  riskScoreThreshold: parseInt(e.target.value),
                }))
              }
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Les transactions avec un score ≥ {formData.riskScoreThreshold} seront bloquées
            </p>
          </div>
        </div>
      </Card>

      {/* Webhooks */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Webhooks</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="webhookUrl">URL Webhook</Label>
            <Input
              id="webhookUrl"
              type="url"
              value={formData.webhookUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, webhookUrl: e.target.value }))
              }
              placeholder="https://votre-site.com/webhooks/crsdpay"
            />
            <p className="text-sm text-gray-500 mt-1">
              Recevoir les événements de paiement en temps réel
            </p>
          </div>

          <div>
            <Label htmlFor="webhookSecret">Secret Webhook</Label>
            <Input
              id="webhookSecret"
              type="password"
              value={formData.webhookSecret}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, webhookSecret: e.target.value }))
              }
              placeholder="whsec_..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Clé secrète pour vérifier l'authenticité des webhooks
            </p>
          </div>
        </div>
      </Card>

      {/* Branding */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Personnalisation</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="brandName">Nom de la marque</Label>
            <Input
              id="brandName"
              value={formData.brandName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, brandName: e.target.value }))
              }
              placeholder="Ma Boutique"
            />
          </div>

          <div>
            <Label htmlFor="brandLogoUrl">Logo (URL)</Label>
            <Input
              id="brandLogoUrl"
              type="url"
              value={formData.brandLogoUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, brandLogoUrl: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="brandColor">Couleur principale</Label>
            <div className="flex gap-2">
              <Input
                id="brandColor"
                type="color"
                value={formData.brandColor}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, brandColor: e.target.value }))
                }
                className="w-20"
              />
              <Input
                type="text"
                value={formData.brandColor}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, brandColor: e.target.value }))
                }
                placeholder="#6366f1"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateConfigMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateConfigMutation.isPending ? 'Enregistrement...' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  )
}
