'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { Check, AlertCircle, Loader2, Rocket, Database, Settings, CheckCircle } from 'lucide-react'

type Step = 'welcome' | 'prerequisites' | 'database' | 'configuration' | 'success'

interface InstallData {
  databaseUrl: string
  nextAuthUrl: string
  stripeSecretKey?: string
  stripePublishableKey?: string
  stripeWebhookSecret?: string
  r2AccountId?: string
  r2AccessKeyId?: string
  r2SecretAccessKey?: string
  r2BucketName?: string
}

export default function InstallPage() {
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [installData, setInstallData] = useState<InstallData>({
    databaseUrl: '',
    nextAuthUrl: typeof window !== 'undefined' ? window.location.origin : '',
  })
  const [error, setError] = useState<string>('')
  const [generatedSecret, setGeneratedSecret] = useState<string>('')

  const { data: installed, isLoading: checkingInstall } = trpc.install.checkInstallation.useQuery()
  const { data: prerequisites } = trpc.install.checkPrerequisites.useQuery()
  const testDatabase = trpc.install.testDatabase.useMutation()
  const install = trpc.install.install.useMutation()

  // Redirect si déjà installé
  if (installed?.installed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">GoldenEra est déjà installé</h2>
          <p className="text-gray-600 mb-6">Votre installation est complète et opérationnelle.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/'}>
              Aller au site
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => window.location.href = '/admin'}>
              Accéder à l'admin
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (checkingInstall) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const handleTestDatabase = async () => {
    if (!installData.databaseUrl) {
      setError('Veuillez entrer l\'URL de la base de données')
      return
    }

    setError('')
    const result = await testDatabase.mutateAsync({ databaseUrl: installData.databaseUrl })

    if (result.success) {
      setCurrentStep('configuration')
    } else {
      setError(result.error || 'Erreur de connexion')
    }
  }

  const handleInstall = async () => {
    setError('')
    try {
      const result = await install.mutateAsync(installData)
      if (result.success) {
        setGeneratedSecret(result.nextAuthSecret)
        setCurrentStep('success')
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'installation')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-4">
            <Rocket className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-gray-900">GoldenEra Installation</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentStep === 'welcome' && 'Bienvenue sur GoldenEra'}
            {currentStep === 'prerequisites' && 'Vérification des prérequis'}
            {currentStep === 'database' && 'Configuration de la base de données'}
            {currentStep === 'configuration' && 'Configuration optionnelle'}
            {currentStep === 'success' && 'Installation terminée !'}
          </h1>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['welcome', 'prerequisites', 'database', 'configuration', 'success'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep === step ? 'bg-primary-600 text-white' :
                ['welcome', 'prerequisites', 'database', 'configuration', 'success'].indexOf(currentStep) > index
                  ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {['welcome', 'prerequisites', 'database', 'configuration', 'success'].indexOf(currentStep) > index ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 4 && <div className="w-12 h-1 bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        <Card className="p-8">
          {/* Welcome Step */}
          {currentStep === 'welcome' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-10 h-10 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Installez GoldenEra en quelques minutes
              </h2>
              <p className="text-gray-600 mb-6">
                Cet assistant va vous guider pas à pas pour configurer votre boutique en ligne.
                L'installation complète prend moins de 5 minutes.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-2">Ce dont vous aurez besoin :</h3>
                <ul className="space-y-2 text-blue-800 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Une base de données MongoDB (URL de connexion)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Optionnel : Clés API Stripe pour les paiements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Optionnel : Configuration Cloudflare R2 pour le stockage</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setCurrentStep('prerequisites')}
              >
                Commencer l'installation
              </Button>
            </div>
          )}

          {/* Prerequisites Step */}
          {currentStep === 'prerequisites' && prerequisites && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Vérification de l'environnement</h2>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Node.js</p>
                    <p className="text-sm text-gray-600">
                      Version {prerequisites.node.version} • Requis: {prerequisites.node.required}
                    </p>
                  </div>
                  {prerequisites.node.compatible ? (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Système d'exploitation</p>
                    <p className="text-sm text-gray-600">
                      {prerequisites.os.platform} ({prerequisites.os.arch})
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              {!prerequisites.node.compatible && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800 text-sm">
                    Votre version de Node.js est trop ancienne. Veuillez installer Node.js 18 ou supérieur
                    depuis <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="underline">nodejs.org</a>
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCurrentStep('welcome')}
                >
                  Retour
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => setCurrentStep('database')}
                  disabled={!prerequisites.node.compatible}
                >
                  Continuer
                </Button>
              </div>
            </div>
          )}

          {/* Database Step */}
          {currentStep === 'database' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Base de données MongoDB</h2>
                  <p className="text-sm text-gray-600">Configurez votre connexion MongoDB</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de connexion MongoDB
                  </label>
                  <Input
                    type="text"
                    placeholder="mongodb://localhost:27017/foxcard ou mongodb+srv://..."
                    value={installData.databaseUrl}
                    onChange={(e) => setInstallData({ ...installData, databaseUrl: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Exemple : mongodb+srv://user:password@cluster.mongodb.net/foxcard
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm">Besoin d'aide ?</h3>
                  <ul className="space-y-1 text-blue-800 text-xs">
                    <li>• Utilisez MongoDB Atlas (gratuit) : <a href="https://www.mongodb.com/cloud/atlas" target="_blank" rel="noopener noreferrer" className="underline">mongodb.com/atlas</a></li>
                    <li>• Ou installez MongoDB localement</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCurrentStep('prerequisites')}
                >
                  Retour
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleTestDatabase}
                  disabled={!installData.databaseUrl || testDatabase.isPending}
                >
                  {testDatabase.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Test en cours...
                    </>
                  ) : (
                    'Tester et continuer'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Configuration Step */}
          {currentStep === 'configuration' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Configuration optionnelle</h2>
                  <p className="text-sm text-gray-600">Vous pouvez configurer ces services plus tard</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-6 mb-6">
                {/* Stripe */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Stripe (Paiements)</h3>
                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Secret Key (sk_...)"
                      value={installData.stripeSecretKey || ''}
                      onChange={(e) => setInstallData({ ...installData, stripeSecretKey: e.target.value })}
                    />
                    <Input
                      type="text"
                      placeholder="Publishable Key (pk_...)"
                      value={installData.stripePublishableKey || ''}
                      onChange={(e) => setInstallData({ ...installData, stripePublishableKey: e.target.value })}
                    />
                    <Input
                      type="text"
                      placeholder="Webhook Secret (whsec_...)"
                      value={installData.stripeWebhookSecret || ''}
                      onChange={(e) => setInstallData({ ...installData, stripeWebhookSecret: e.target.value })}
                    />
                  </div>
                </div>

                {/* Cloudflare R2 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Cloudflare R2 (Stockage)</h3>
                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Account ID"
                      value={installData.r2AccountId || ''}
                      onChange={(e) => setInstallData({ ...installData, r2AccountId: e.target.value })}
                    />
                    <Input
                      type="text"
                      placeholder="Access Key ID"
                      value={installData.r2AccessKeyId || ''}
                      onChange={(e) => setInstallData({ ...installData, r2AccessKeyId: e.target.value })}
                    />
                    <Input
                      type="text"
                      placeholder="Secret Access Key"
                      value={installData.r2SecretAccessKey || ''}
                      onChange={(e) => setInstallData({ ...installData, r2SecretAccessKey: e.target.value })}
                    />
                    <Input
                      type="text"
                      placeholder="Bucket Name"
                      value={installData.r2BucketName || ''}
                      onChange={(e) => setInstallData({ ...installData, r2BucketName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCurrentStep('database')}
                >
                  Retour
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleInstall}
                  disabled={install.isPending}
                >
                  {install.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Installation...
                    </>
                  ) : (
                    'Terminer l\'installation'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {currentStep === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Installation terminée avec succès !
              </h2>
              <p className="text-gray-600 mb-6">
                GoldenEra est maintenant installé et prêt à l'emploi. Vous pouvez accéder à votre boutique et à l'interface d'administration.
              </p>

              {generatedSecret && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                  <p className="font-semibold text-yellow-900 mb-2 text-sm">
                    ⚠️ Important : Sauvegardez votre NEXTAUTH_SECRET
                  </p>
                  <div className="bg-white rounded p-2 font-mono text-xs break-all text-gray-800">
                    {generatedSecret}
                  </div>
                  <p className="text-yellow-800 text-xs mt-2">
                    Ce secret a été généré automatiquement et sauvegardé dans votre fichier .env
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-2">Prochaines étapes :</h3>
                <ul className="space-y-2 text-blue-800 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Créez votre compte administrateur</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Configurez votre boutique (nom, logo, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Ajoutez vos premiers produits</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.location.href = '/'}
                >
                  Voir le site
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => window.location.href = '/admin'}
                >
                  Accéder à l'admin
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          GoldenEra • E-commerce Open Source
        </p>
      </div>
    </div>
  )
}
