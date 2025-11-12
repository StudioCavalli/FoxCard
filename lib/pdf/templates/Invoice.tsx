import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  invoiceDetails: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    borderBottom: '1 solid #E5E7EB',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    color: '#6B7280',
    width: '30%',
  },
  value: {
    fontSize: 9,
    color: '#1F2937',
    width: '70%',
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
    borderBottom: '1 solid #E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #F3F4F6',
  },
  tableCol1: {
    width: '50%',
  },
  tableCol2: {
    width: '15%',
    textAlign: 'right',
  },
  tableCol3: {
    width: '15%',
    textAlign: 'right',
  },
  tableCol4: {
    width: '20%',
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 9,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 9,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    paddingHorizontal: 10,
    borderTop: '2 solid #1F2937',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9CA3AF',
    borderTop: '1 solid #E5E7EB',
    paddingTop: 10,
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 8,
    color: '#6B7280',
    lineHeight: 1.4,
  },
})

export interface InvoiceItem {
  name: string
  variantName?: string
  quantity: number
  price: number
  total: number
}

export interface Address {
  address?: string
  city?: string
  postalCode?: string
  country?: string
}

export interface InvoiceProps {
  invoiceNumber: string
  invoiceDate: string
  dueDate?: string

  // Merchant info
  merchantName: string
  merchantAddress?: Address
  merchantTax?: string

  // Customer info
  customerName: string
  customerEmail: string
  customerAddress?: Address

  // Order info
  orderNumber: string

  // Items
  items: InvoiceItem[]

  // Amounts
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number

  // Payment
  paymentStatus: string
  paidAt?: string

  // Notes
  notes?: string
}

export const InvoiceDocument = ({
  invoiceNumber,
  invoiceDate,
  dueDate,
  merchantName,
  merchantAddress,
  merchantTax,
  customerName,
  customerEmail,
  customerAddress,
  orderNumber,
  items,
  subtotal,
  tax,
  shipping,
  discount,
  total,
  paymentStatus,
  paidAt,
  notes,
}: InvoiceProps) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>{merchantName}</Text>
            {merchantAddress && (
              <View style={{ marginTop: 8 }}>
                {merchantAddress.address && (
                  <Text style={styles.invoiceDetails}>{merchantAddress.address}</Text>
                )}
                {(merchantAddress.postalCode || merchantAddress.city) && (
                  <Text style={styles.invoiceDetails}>
                    {merchantAddress.postalCode} {merchantAddress.city}
                  </Text>
                )}
                {merchantAddress.country && (
                  <Text style={styles.invoiceDetails}>{merchantAddress.country}</Text>
                )}
              </View>
            )}
            {merchantTax && (
              <Text style={[styles.invoiceDetails, { marginTop: 4 }]}>
                N° TVA: {merchantTax}
              </Text>
            )}
          </View>

          <View style={{ textAlign: 'right' }}>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <Text style={styles.invoiceDetails}>N° {invoiceNumber}</Text>
            <Text style={styles.invoiceDetails}>Date: {formatDate(invoiceDate)}</Text>
            {dueDate && (
              <Text style={styles.invoiceDetails}>
                Échéance: {formatDate(dueDate)}
              </Text>
            )}
            <Text style={[styles.invoiceDetails, { marginTop: 4 }]}>
              Commande: #{orderNumber}
            </Text>
          </View>
        </View>

        {/* Customer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facturation</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>{customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{customerEmail}</Text>
          </View>
          {customerAddress && (
            <>
              {customerAddress.address && (
                <View style={styles.row}>
                  <Text style={styles.label}>Adresse:</Text>
                  <Text style={styles.value}>{customerAddress.address}</Text>
                </View>
              )}
              {(customerAddress.postalCode || customerAddress.city) && (
                <View style={styles.row}>
                  <Text style={styles.label}>Ville:</Text>
                  <Text style={styles.value}>
                    {customerAddress.postalCode} {customerAddress.city}
                  </Text>
                </View>
              )}
              {customerAddress.country && (
                <View style={styles.row}>
                  <Text style={styles.label}>Pays:</Text>
                  <Text style={styles.value}>{customerAddress.country}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol1}>Description</Text>
            <Text style={styles.tableCol2}>Qté</Text>
            <Text style={styles.tableCol3}>Prix unit.</Text>
            <Text style={styles.tableCol4}>Total</Text>
          </View>

          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text>{item.name}</Text>
                {item.variantName && (
                  <Text style={{ fontSize: 8, color: '#6B7280', marginTop: 2 }}>
                    {item.variantName}
                  </Text>
                )}
              </View>
              <Text style={styles.tableCol2}>{item.quantity}</Text>
              <Text style={styles.tableCol3}>{formatPrice(item.price)}</Text>
              <Text style={styles.tableCol4}>{formatPrice(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total</Text>
            <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
          </View>

          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Remise</Text>
              <Text style={[styles.totalValue, { color: '#DC2626' }]}>
                -{formatPrice(discount)}
              </Text>
            </View>
          )}

          {shipping > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Frais de port</Text>
              <Text style={styles.totalValue}>{formatPrice(shipping)}</Text>
            </View>
          )}

          {tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA</Text>
              <Text style={styles.totalValue}>{formatPrice(tax)}</Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL</Text>
            <Text style={styles.grandTotalValue}>{formatPrice(total)}</Text>
          </View>
        </View>

        {/* Payment Status */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <View style={styles.row}>
            <Text style={styles.label}>Statut du paiement:</Text>
            <Text style={[styles.value, {
              color: paymentStatus === 'PAID' ? '#059669' : '#DC2626',
              fontWeight: 'bold'
            }]}>
              {paymentStatus === 'PAID' ? 'PAYÉ' :
               paymentStatus === 'PENDING' ? 'EN ATTENTE' :
               paymentStatus === 'FAILED' ? 'ÉCHOUÉ' : paymentStatus}
            </Text>
          </View>
          {paidAt && (
            <View style={styles.row}>
              <Text style={styles.label}>Date de paiement:</Text>
              <Text style={styles.value}>{formatDate(paidAt)}</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Merci pour votre commande !</Text>
          <Text style={{ marginTop: 4 }}>
            Document généré le {formatDate(new Date().toISOString())}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
