/**
 * Reconciliation Utility - Rapproche les transactions avec les commandes
 */

import { prisma } from '@/lib/prisma'

export interface ReconciliationResult {
  matched: Array<{
    transactionId: string
    orderId: string
    amount: number
    status: 'matched'
  }>
  unmatched: Array<{
    transactionId: string
    orderId: string | null
    amount: number
    status: 'unmatched'
    reason: string
  }>
  discrepancies: Array<{
    transactionId: string
    orderId: string
    transactionAmount: number
    orderAmount?: number
    status: 'discrepancy'
    reason: string
  }>
  summary: {
    totalTransactions: number
    matchedCount: number
    unmatchedCount: number
    discrepancyCount: number
    matchRate: number
  }
}

/**
 * Effectue la réconciliation automatique des transactions
 */
export async function performReconciliation(
  storeId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ReconciliationResult> {
  const where: any = {
    storeId,
    status: 'succeeded', // Only reconcile succeeded transactions
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  // Get all transactions for the period
  const transactions = await prisma.crsdpayTransaction.findMany({
    where,
    select: {
      id: true,
      transactionId: true,
      orderId: true,
      amount: true,
      amountCaptured: true,
      currency: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const result: ReconciliationResult = {
    matched: [],
    unmatched: [],
    discrepancies: [],
    summary: {
      totalTransactions: transactions.length,
      matchedCount: 0,
      unmatchedCount: 0,
      discrepancyCount: 0,
      matchRate: 0,
    },
  }

  for (const transaction of transactions) {
    // Check if transaction has an orderId
    if (!transaction.orderId) {
      result.unmatched.push({
        transactionId: transaction.transactionId,
        orderId: null,
        amount: transaction.amountCaptured,
        status: 'unmatched',
        reason: 'Aucun orderId associé',
      })
      result.summary.unmatchedCount++
      continue
    }

    // Try to find the order (placeholder - would need actual Order model)
    // For now, we assume if orderId exists, it's matched
    // In real implementation, would check against Order model

    // Check for amount discrepancies
    // This is a simplified check - in real implementation would compare with actual order amount
    if (transaction.amount !== transaction.amountCaptured) {
      result.discrepancies.push({
        transactionId: transaction.transactionId,
        orderId: transaction.orderId,
        transactionAmount: transaction.amountCaptured,
        status: 'discrepancy',
        reason: 'Montant capturé différent du montant autorisé',
      })
      result.summary.discrepancyCount++
    } else {
      result.matched.push({
        transactionId: transaction.transactionId,
        orderId: transaction.orderId,
        amount: transaction.amountCaptured,
        status: 'matched',
      })
      result.summary.matchedCount++
    }
  }

  // Calculate match rate
  result.summary.matchRate =
    result.summary.totalTransactions > 0
      ? (result.summary.matchedCount / result.summary.totalTransactions) * 100
      : 0

  return result
}

/**
 * Génère un rapport de réconciliation
 */
export function generateReconciliationReport(result: ReconciliationResult): string {
  const lines: string[] = []

  lines.push('='.repeat(80))
  lines.push('RAPPORT DE RÉCONCILIATION CRSDPAY')
  lines.push('='.repeat(80))
  lines.push('')

  lines.push('RÉSUMÉ:')
  lines.push(`  Total transactions: ${result.summary.totalTransactions}`)
  lines.push(`  Transactions rapprochées: ${result.summary.matchedCount}`)
  lines.push(`  Transactions non rapprochées: ${result.summary.unmatchedCount}`)
  lines.push(`  Écarts détectés: ${result.summary.discrepancyCount}`)
  lines.push(`  Taux de rapprochement: ${result.summary.matchRate.toFixed(2)}%`)
  lines.push('')

  if (result.unmatched.length > 0) {
    lines.push('TRANSACTIONS NON RAPPROCHÉES:')
    lines.push('-'.repeat(80))
    result.unmatched.forEach((item) => {
      lines.push(`  Transaction: ${item.transactionId}`)
      lines.push(`  Montant: ${(item.amount / 100).toFixed(2)}€`)
      lines.push(`  Raison: ${item.reason}`)
      lines.push('')
    })
  }

  if (result.discrepancies.length > 0) {
    lines.push('ÉCARTS DÉTECTÉS:')
    lines.push('-'.repeat(80))
    result.discrepancies.forEach((item) => {
      lines.push(`  Transaction: ${item.transactionId}`)
      lines.push(`  Commande: ${item.orderId}`)
      lines.push(`  Montant transaction: ${(item.transactionAmount / 100).toFixed(2)}€`)
      if (item.orderAmount) {
        lines.push(`  Montant commande: ${(item.orderAmount / 100).toFixed(2)}€`)
      }
      lines.push(`  Raison: ${item.reason}`)
      lines.push('')
    })
  }

  lines.push('='.repeat(80))
  lines.push(`Rapport généré le ${new Date().toLocaleString('fr-FR')}`)
  lines.push('='.repeat(80))

  return lines.join('\n')
}
