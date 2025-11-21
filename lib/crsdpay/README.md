# crsdpay - Custom Payment Gateway

**crsdpay** est votre système de paiement personnalisé, entièrement intégré à FoxCard. C'est votre propre équivalent de PayPal/Stripe, construit from scratch avec toutes les fonctionnalités d'une gateway professionnelle.

## 🚀 Fonctionnalités

### ✅ Implémenté

- **Tokenization PCI DSS Compliant**
  - Stockage sécurisé des cartes via tokens
  - Validation Luhn des numéros de carte
  - Détection automatique de la marque (Visa, Mastercard, Amex, etc.)
  - Gestion des cartes sauvegardées par client

- **Traitement des paiements**
  - Création de Payment Intents
  - Confirmation et capture automatique/manuelle
  - Support 3D Secure 2.0
  - Annulation de paiements
  - Remboursements (partiels et complets)

- **Détection de fraude**
  - Score de risque automatique (0-100)
  - Vérification de vélocité (nombre de transactions)
  - Analyse d'IP et device fingerprinting
  - Blocage automatique selon seuil configurable
  - Facteurs de risque détaillés

- **Interface admin complète**
  - Dashboard avec KPIs en temps réel
  - Liste des transactions avec filtres
  - Gestion des clients et cartes
  - Configuration du gateway
  - Statistiques et analytics

- **API tRPC type-safe**
  - Endpoints pour tous les cas d'usage
  - Validation Zod automatique
  - Gestion d'erreurs robuste

### 🔜 À implémenter (selon issues GitHub)

- **Paiements cryptocurrency** (Issue #109)
  - Bitcoin, Ethereum, USDT/USDC
  - Lightning Network
  - Génération d'adresses et QR codes
  - Conversion automatique crypto → fiat

- **Documentation complète** (Issue #110)
  - API REST documentation
  - Guides d'intégration
  - Architecture technique
  - SDK documentation

- **API publique REST + SDKs** (Issue #111)
  - API REST v1 publique
  - SDK JavaScript/TypeScript
  - SDK PHP
  - SDK Python

- **Tests et sécurité** (Issue #112)
  - Tests unitaires (90%+ coverage)
  - Tests E2E
  - Load testing
  - Security scans (OWASP ZAP)

## 📁 Structure du code

```
lib/crsdpay/
├── core/
│   └── payment-processor.ts    # Logique de traitement des paiements
├── tokenization/
│   ├── tokenizer.ts            # Tokenization des cartes
│   └── card-validator.ts       # Validation des données de carte
├── fraud/
│   └── fraud-detector.ts       # Détection de fraude
└── types/
    └── index.ts                # Types TypeScript

components/crsdpay/
├── payment/
│   ├── PaymentMethod.tsx       # Composant principal de paiement
│   ├── CardForm.tsx            # Formulaire de carte
│   └── SavedCards.tsx          # Liste des cartes sauvegardées
└── admin/
    └── (pages admin)

app/[locale]/admin/crsdpay/
├── page.tsx                    # Dashboard principal
├── settings/
│   └── page.tsx                # Configuration
└── transactions/
    └── (pages transactions)

lib/trpc/routers/crsdpay/
└── index.ts                    # Router tRPC
```

## 🔧 Utilisation

### 1. Configuration initiale

Allez dans `/admin/crsdpay/settings` et configurez :

- **Activation** : Activer crsdpay et choisir le mode (test/live)
- **Paiements** : 3D Secure, capture automatique, descripteur de relevé
- **Crypto** : Activer Bitcoin, Ethereum, USDT, Lightning
- **Anti-fraude** : Activer la détection et définir le seuil de risque
- **Webhooks** : URL et secret pour recevoir les événements
- **Branding** : Nom, logo, couleur de marque

### 2. Intégration dans le checkout

```tsx
import { PaymentMethod } from '@/components/crsdpay/payment/PaymentMethod'

function CheckoutPage() {
  return (
    <PaymentMethod
      storeId={storeId}
      customerId={customerId}
      amount={totalAmount} // En centimes (ex: 1000 = 10.00€)
      currency="EUR"
      orderId={orderId}
      onPaymentSuccess={(transactionId) => {
        // Rediriger vers la page de confirmation
        router.push(`/order/${orderId}/success`)
      }}
      onPaymentError={(error) => {
        // Afficher l'erreur
        toast.error(error)
      }}
    />
  )
}
```

### 3. Utilisation de l'API tRPC

```tsx
import { trpc } from '@/lib/trpc/client'

// Créer un paiement
const createPayment = trpc.crsdpay.createPayment.useMutation()

await createPayment.mutateAsync({
  storeId,
  amount: 5000, // 50.00€
  currency: 'EUR',
  paymentMethod: 'card',
  cardToken: 'crsd_card_xxx',
  customerId,
  orderId,
})

// Lister les transactions
const { data: transactions } = trpc.crsdpay.listTransactions.useQuery({
  storeId,
  status: 'succeeded',
  limit: 20,
})

// Créer un remboursement
const createRefund = trpc.crsdpay.createRefund.useMutation()

await createRefund.mutateAsync({
  transactionId: 'crsd_tx_xxx',
  amount: 2500, // Remboursement partiel de 25€
  reason: 'requested_by_customer',
})
```

### 4. Tokenization de carte (backend)

```typescript
import { tokenizeCard } from '@/lib/crsdpay/tokenization/tokenizer'

const tokenized = await tokenizeCard(
  {
    number: '4242424242424242',
    expMonth: 12,
    expYear: 2025,
    cvc: '123',
    holderName: 'JEAN DUPONT',
  },
  {
    customerId: 'customer_xxx',
    storeId: 'store_xxx',
    isDefault: true,
  }
)

// tokenized.token = 'crsd_card_xxx'
// JAMAIS stocké : numéro complet, CVC
// Stocké : token, brand, last4, expiration
```

### 5. Traitement de paiement (backend)

```typescript
import { createPaymentIntent, confirmPayment } from '@/lib/crsdpay/core/payment-processor'

// 1. Créer le payment intent
const intent = await createPaymentIntent({
  storeId,
  amount: 10000,
  currency: 'EUR',
  paymentMethod: 'card',
  cardToken: 'crsd_card_xxx',
  customerId,
  orderId,
  customerIP: '1.2.3.4',
  userAgent: req.headers['user-agent'],
})

// 2. Confirmer le paiement
const result = await confirmPayment(intent.clientSecret.replace('crsd_secret_', ''))

if (result.status === 'succeeded') {
  // Paiement réussi !
}
```

## 🔒 Sécurité

### PCI DSS Compliance

- **Aucune donnée de carte stockée** : Seuls les tokens sont conservés
- **Données chiffrées** : Fingerprints et tokens sécurisés
- **Scope minimal** : Les données de carte ne transitent jamais par le serveur en clair
- **Validation stricte** : Algorithme de Luhn, validation d'expiration

### Anti-fraude

Le système de détection analyse plusieurs facteurs :

- **Vélocité** : Nombre de transactions par client/IP/device
- **Montant** : Transactions inhabituellement élevées
- **IP** : Détection de proxies/VPN, historique de l'IP
- **Device fingerprinting** : Détection de comportements suspects
- **Score de risque** : 0-100, blocage automatique si > seuil

## 📊 Modèle de données

### CrsdpayTransaction

Stocke toutes les transactions avec :
- Montants (total, capturé, remboursé)
- Status (pending, processing, succeeded, failed, canceled)
- Méthode de paiement et carte associée
- Données anti-fraude (IP, user agent, device fingerprint, score)
- Métadonnées personnalisées

### CrsdpayCard

Cartes tokenisées :
- Token sécurisé unique
- Informations safe (brand, last4, expiration)
- Fingerprint pour détecter les doublons
- Pas de données sensibles !

### CrsdpayCustomer

Clients du gateway :
- Email, nom, téléphone
- Relations avec cartes et transactions
- Métadonnées personnalisées

### CrsdpayRefund

Remboursements :
- Montant et raison
- Status (pending, succeeded, failed)
- Lien avec la transaction d'origine

### CrsdpayFraudCheck

Vérifications anti-fraude :
- Score de risque (0-100)
- Décision (approve, review, decline)
- Facteurs de risque détectés
- Données d'analyse (IP, email, etc.)

### CrsdpayWebhookEvent

Événements webhook :
- Type d'événement (payment.succeeded, etc.)
- Status de livraison
- Retry automatique en cas d'échec
- Payload et réponse

### CrsdpayConfig

Configuration par store :
- Activation et mode (test/live)
- Méthodes de paiement activées
- Paramètres 3DS et capture
- Configuration crypto
- Seuils anti-fraude
- Webhooks et branding

## 🎯 Prochaines étapes

Selon le milestone M9 (issues #69-72, #109-113) :

1. **Support cryptocurrency complet** (#109)
   - Intégration Bitcoin Core / Electrum
   - Nodes Ethereum / Infura
   - Lightning Network
   - Génération d'adresses et QR codes
   - Monitoring blockchain et confirmations

2. **Documentation technique** (#110)
   - Site de docs avec exemples de code
   - Guides d'intégration pas-à-pas
   - Diagrammes d'architecture
   - API reference complète

3. **API REST publique + SDKs** (#111)
   - Endpoints REST v1
   - Packages NPM/Composer/PyPI
   - Spécification OpenAPI
   - Exemples d'intégration

4. **Tests et sécurité** (#112)
   - Suite de tests complète
   - CI/CD avec gates de sécurité
   - Load testing 1000 req/s
   - Pentests et scans OWASP

5. **Dashboard admin avancé** (#113)
   - Analytics en temps réel
   - Rapports financiers
   - Réconciliation automatique
   - Export de données

## 📝 License

MIT - Voir LICENSE pour plus de détails

---

**crsdpay** - Votre gateway de paiement, sous votre contrôle 🦊
