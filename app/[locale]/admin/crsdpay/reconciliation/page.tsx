'use client'

/**
 * Reconciliation Page - Réconciliation automatique des transactions
 */

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import { useStoreContext } from '@/lib/context/store-context'

export default function ReconciliationPage() {
  const { storeId } = useStoreContext()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reconciliationResult, setReconciliationResult] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {

    // Set default dates (last 30 days)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)

    setEndDate(end.toISOString().split('T')[0])
    setStartDate(start.toISOString().split('T')[0])
  }, [])

  const reconcileMutation = trpc.crsdpay.performReconciliation.useMutation()

  const handleReconcile = async () => {
    try {
      const result = await reconcileMutation.mutateAsync({
        storeId: storeId!,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      })

      setReconciliationResult(result.data)

      toast({
        title: 'Réconciliation effectuée',
        description: `${result.data.summary.matchedCount} transactions rapprochées sur ${result.data.summary.totalTransactions}`,
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDownloadReport = () => {
    if (!reconciliationResult) return

    // Generate text report
    const lines: string[] = []
    lines.push('='.repeat(80))
    lines.push('RAPPORT DE RÉCONCILIATION CRSDPAY')
    lines.push('='.repeat(80))
    lines.push('')
    lines.push(`Période: ${new Date(startDate).toLocaleDateString('fr-FR')} - ${new Date(endDate).toLocaleDateString('fr-FR')}`)
    lines.push('')
    lines.push('RÉSUMÉ:')
    lines.push(`  Total transactions: ${reconciliationResult.summary.totalTransactions}`)
    lines.push(`  Transactions rapprochées: ${reconciliationResult.summary.matchedCount}`)
    lines.push(`  Transactions non rapprochées: ${reconciliationResult.summary.unmatchedCount}`)
    lines.push(`  Écarts détectés: ${reconciliationResult.summary.discrepancyCount}`)
    lines.push(`  Taux de rapprochement: ${reconciliationResult.summary.matchRate.toFixed(2)}%`)
    lines.push('')

    if (reconciliationResult.unmatched.length > 0) {
      lines.push('TRANSACTIONS NON RAPPROCHÉES:')
      lines.push('-'.repeat(80))
      reconciliationResult.unmatched.forEach((item: any) => {
        lines.push(`  Transaction: ${item.transactionId}`)
        lines.push(`  Montant: ${(item.amount / 100).toFixed(2)}€`)
        lines.push(`  Raison: ${item.reason}`)
        lines.push('')
      })
    }

    if (reconciliationResult.discrepancies.length > 0) {
      lines.push('ÉCARTS DÉTECTÉS:')
      lines.push('-'.repeat(80))
      reconciliationResult.discrepancies.forEach((item: any) => {
        lines.push(`  Transaction: ${item.transactionId}`)
        lines.push(`  Commande: ${item.orderId}`)
        lines.push(`  Montant: ${(item.transactionAmount / 100).toFixed(2)}€`)
        lines.push(`  Raison: ${item.reason}`)
        lines.push('')
      })
    }

    lines.push('='.repeat(80))
    lines.push(`Rapport généré le ${new Date().toLocaleString('fr-FR')}`)
    lines.push('='.repeat(80))

    const reportText = lines.join('\n')

    // Download
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `reconciliation-${startDate}-${endDate}.txt`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Rapport téléchargé',
      description: 'Le rapport de réconciliation a été téléchargé',
    })
  }

  if (!storeId) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <Link href="/admin/crsdpay">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Button>
        </Link>

        <h1 className="text-3xl font-bold">Réconciliation Automatique</h1>
        <p className="text-gray-600">
          Rapprochez les transactions avec les commandes et identifiez les écarts
        </p>
      </div>

      {/* Configuration */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="startDate">Date de début</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="endDate">Date de fin</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleReconcile}
              disabled={reconcileMutation.isPending}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${reconcileMutation.isPending ? 'animate-spin' : ''}`} />
              {reconcileMutation.isPending ? 'Réconciliation...' : 'Lancer la réconciliation'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {reconciliationResult && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold">
                    {reconciliationResult.summary.totalTransactions}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rapprochées</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reconciliationResult.summary.matchedCount}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Non rapprochées</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {reconciliationResult.summary.unmatchedCount}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Écarts</p>
                  <p className="text-2xl font-bold text-red-600">
                    {reconciliationResult.summary.discrepancyCount}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Match Rate */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Taux de rapprochement</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all"
                  style={{ width: `${reconciliationResult.summary.matchRate}%` }}
                />
              </div>
              <span className="text-2xl font-bold">
                {reconciliationResult.summary.matchRate.toFixed(1)}%
              </span>
            </div>
          </Card>

          {/* Download Report */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Télécharger le rapport</h2>
                <p className="text-gray-600">Générez un rapport détaillé de la réconciliation</p>
              </div>
              <Button onClick={handleDownloadReport}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </Card>

          {/* Unmatched Transactions */}
          {reconciliationResult.unmatched.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-yellow-600" />
                Transactions non rapprochées ({reconciliationResult.unmatched.length})
              </h2>

              <div className="space-y-3">
                {reconciliationResult.unmatched.map((item: any, i: number) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">Transaction: {item.transactionId}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                        <p className="text-sm font-semibold mt-2">
                          Montant: {(item.amount / 100).toFixed(2)}€
                        </p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Non rapprochée</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Discrepancies */}
          {reconciliationResult.discrepancies.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Écarts détectés ({reconciliationResult.discrepancies.length})
              </h2>

              <div className="space-y-3">
                {reconciliationResult.discrepancies.map((item: any, i: number) => (
                  <div key={i} className="p-4 border rounded-lg border-red-200 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">Transaction: {item.transactionId}</p>
                        <p className="text-sm text-gray-600">Commande: {item.orderId}</p>
                        <p className="text-sm text-red-600 mt-1">{item.reason}</p>
                        <p className="text-sm font-semibold mt-2">
                          Montant: {(item.transactionAmount / 100).toFixed(2)}€
                        </p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Écart</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Matched Transactions */}
          {reconciliationResult.matched.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Transactions rapprochées ({reconciliationResult.matched.length})
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-2 font-semibold">Transaction ID</th>
                      <th className="pb-2 font-semibold">Commande ID</th>
                      <th className="pb-2 font-semibold">Montant</th>
                      <th className="pb-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reconciliationResult.matched.slice(0, 20).map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {item.transactionId.slice(0, 24)}...
                          </code>
                        </td>
                        <td className="py-2">
                          <code className="text-xs">{item.orderId}</code>
                        </td>
                        <td className="py-2 font-semibold">
                          {(item.amount / 100).toFixed(2)}€
                        </td>
                        <td className="py-2">
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Rapprochée
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {reconciliationResult.matched.length > 20 && (
                  <p className="text-sm text-gray-500 mt-4">
                    Affichage de 20 sur {reconciliationResult.matched.length} transactions
                    rapprochées.
                  </p>
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
