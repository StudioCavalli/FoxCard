/**
 * Legal Compliance Manager
 * Handles legal requirements by commerce type including GDPR, terms, disclaimers, and policies
 */

import { CommerceType } from '@/lib/commerce-types'

// All commerce types for iteration
const COMMERCE_TYPES: CommerceType[] = [
  'GENERAL', 'FOOD', 'ALCOHOL', 'FASHION', 'ELECTRONICS', 'BEAUTY',
  'HOME', 'SPORTS', 'TOYS', 'AUTOMOTIVE', 'BOOKS', 'PETS',
  'DIGITAL', 'SERVICES', 'SEASONAL', 'RESTAURANT', 'HOTEL', 'TRAVEL', 'RECREATION'
]

// Types
export interface LegalRequirement {
  id: string
  type: 'REQUIRED' | 'RECOMMENDED' | 'OPTIONAL'
  category: 'GDPR' | 'TERMS' | 'PRIVACY' | 'DISCLAIMER' | 'AGE_VERIFICATION' | 'COOKIE' | 'REFUND' | 'TAX' | 'LICENSE'
  title: string
  description: string
  template?: string
  checklistItems: string[]
  regulations?: string[]
}

export interface CommerceCompliance {
  commerceType: CommerceType
  requirements: LegalRequirement[]
  ageRestriction?: {
    minimumAge: number
    verificationRequired: boolean
    verificationMethods: ('CHECKBOX' | 'DATE_OF_BIRTH' | 'ID_VERIFICATION')[]
  }
  mandatoryDisclosures: string[]
  dataCategories: DataCategory[]
  retentionPeriods: RetentionPeriod[]
  specialRegulations: string[]
}

export interface DataCategory {
  name: string
  description: string
  lawfulBasis: 'CONSENT' | 'CONTRACT' | 'LEGAL_OBLIGATION' | 'VITAL_INTERESTS' | 'PUBLIC_TASK' | 'LEGITIMATE_INTERESTS'
  retentionPeriod: string
  sensitiveData: boolean
}

export interface RetentionPeriod {
  dataType: string
  period: string
  reason: string
}

export interface PolicyTemplate {
  id: string
  title: string
  sections: PolicySection[]
  commerceTypes: CommerceType[]
  lastUpdated: string
}

export interface PolicySection {
  title: string
  content: string
  required: boolean
}

// Legal requirement templates by category
const GDPR_REQUIREMENTS: LegalRequirement = {
  id: 'gdpr_compliance',
  type: 'REQUIRED',
  category: 'GDPR',
  title: 'Conformité RGPD',
  description: 'Exigences du Règlement Général sur la Protection des Données',
  checklistItems: [
    'Politique de confidentialité accessible',
    'Consentement explicite pour les cookies',
    'Droit d\'accès aux données personnelles',
    'Droit à l\'effacement (droit à l\'oubli)',
    'Droit à la portabilité des données',
    'Délégué à la protection des données (si applicable)',
    'Registre des traitements',
    'Notification des violations de données',
  ],
  regulations: ['RGPD', 'Loi Informatique et Libertés'],
}

const COOKIE_REQUIREMENTS: LegalRequirement = {
  id: 'cookie_consent',
  type: 'REQUIRED',
  category: 'COOKIE',
  title: 'Consentement aux cookies',
  description: 'Conformité directive ePrivacy',
  checklistItems: [
    'Bannière de consentement visible',
    'Options de refus disponibles',
    'Liste détaillée des cookies utilisés',
    'Durée de conservation des cookies indiquée',
    'Possibilité de retirer le consentement',
  ],
  regulations: ['Directive ePrivacy', 'CNIL'],
}

// Commerce-specific requirements
const ALCOHOL_REQUIREMENTS: LegalRequirement[] = [
  {
    id: 'alcohol_age',
    type: 'REQUIRED',
    category: 'AGE_VERIFICATION',
    title: 'Vérification de l\'âge',
    description: 'Vérification obligatoire pour la vente d\'alcool',
    checklistItems: [
      'Vérification de l\'âge à l\'entrée du site',
      'Vérification de l\'âge à la commande',
      'Conservation des preuves de vérification',
      'Refus de vente aux mineurs',
    ],
    regulations: ['Code de la santé publique L3342-1'],
  },
  {
    id: 'alcohol_disclaimer',
    type: 'REQUIRED',
    category: 'DISCLAIMER',
    title: 'Avertissements sanitaires',
    description: 'Mentions obligatoires pour les boissons alcoolisées',
    template: 'L\'abus d\'alcool est dangereux pour la santé, à consommer avec modération.',
    checklistItems: [
      'Message sanitaire visible',
      'Interdiction de vente aux mineurs affichée',
      'Information sur les risques de l\'alcool',
      'Pictogramme femme enceinte (si applicable)',
    ],
    regulations: ['Code de la santé publique'],
  },
  {
    id: 'alcohol_license',
    type: 'REQUIRED',
    category: 'LICENSE',
    title: 'Licence de vente d\'alcool',
    description: 'Licence obligatoire pour la vente à distance',
    checklistItems: [
      'Licence de vente à emporter ou à distance',
      'Déclaration en préfecture',
      'Formation PVBAN si applicable',
      'Numéro de licence affiché',
    ],
    regulations: ['Code de la santé publique L3331-4'],
  },
]

const FOOD_REQUIREMENTS: LegalRequirement[] = [
  {
    id: 'food_allergens',
    type: 'REQUIRED',
    category: 'DISCLAIMER',
    title: 'Information allergènes',
    description: 'Déclaration obligatoire des allergènes',
    checklistItems: [
      'Liste des 14 allergènes majeurs',
      'Allergènes indiqués par produit',
      'Information facilement accessible',
      'Mise à jour régulière',
    ],
    regulations: ['Règlement INCO 1169/2011'],
  },
  {
    id: 'food_nutrition',
    type: 'REQUIRED',
    category: 'DISCLAIMER',
    title: 'Informations nutritionnelles',
    description: 'Déclaration nutritionnelle obligatoire',
    checklistItems: [
      'Valeur énergétique',
      'Matières grasses',
      'Glucides et sucres',
      'Protéines',
      'Sel',
    ],
    regulations: ['Règlement INCO 1169/2011'],
  },
  {
    id: 'food_traceability',
    type: 'REQUIRED',
    category: 'LICENSE',
    title: 'Traçabilité alimentaire',
    description: 'Système de traçabilité des denrées',
    checklistItems: [
      'Identification des fournisseurs',
      'Numéros de lot',
      'Dates de péremption',
      'Conservation des documents 5 ans',
    ],
    regulations: ['Règlement CE 178/2002'],
  },
]

const PHARMACY_REQUIREMENTS: LegalRequirement[] = [
  {
    id: 'pharmacy_license',
    type: 'REQUIRED',
    category: 'LICENSE',
    title: 'Autorisation de vente en ligne',
    description: 'Autorisation ARS pour vente de médicaments',
    checklistItems: [
      'Pharmacie physique existante',
      'Autorisation ARS',
      'Logo commun européen',
      'Pharmacien responsable identifié',
    ],
    regulations: ['Code de la santé publique L5125-33'],
  },
  {
    id: 'pharmacy_disclaimer',
    type: 'REQUIRED',
    category: 'DISCLAIMER',
    title: 'Mentions pharmaceutiques',
    description: 'Avertissements obligatoires',
    template: 'En cas de doute, demandez conseil à votre pharmacien. Ceci est un médicament.',
    checklistItems: [
      'Conseil pharmaceutique disponible',
      'Lien vers notice',
      'Effets secondaires mentionnés',
      'Contre-indications visibles',
    ],
  },
]

const DIGITAL_REQUIREMENTS: LegalRequirement[] = [
  {
    id: 'digital_withdrawal',
    type: 'REQUIRED',
    category: 'REFUND',
    title: 'Droit de rétractation numérique',
    description: 'Conditions spécifiques pour contenus numériques',
    checklistItems: [
      'Information sur la perte du droit de rétractation',
      'Consentement express avant exécution',
      'Accusé de réception du consentement',
      'Délai de 14 jours avant exécution sans consentement',
    ],
    regulations: ['Directive 2011/83/UE', 'Code de la consommation L221-28'],
  },
]

const SERVICES_REQUIREMENTS: LegalRequirement[] = [
  {
    id: 'service_contract',
    type: 'REQUIRED',
    category: 'TERMS',
    title: 'Conditions de prestation',
    description: 'Contrat de service obligatoire',
    checklistItems: [
      'Description précise des services',
      'Conditions d\'exécution',
      'Délais de réalisation',
      'Obligations des parties',
      'Garanties applicables',
    ],
  },
]

const TRAVEL_REQUIREMENTS: LegalRequirement[] = [
  {
    id: 'travel_license',
    type: 'REQUIRED',
    category: 'LICENSE',
    title: 'Immatriculation Atout France',
    description: 'Immatriculation obligatoire pour vente de voyages',
    checklistItems: [
      'Numéro d\'immatriculation Atout France',
      'Garantie financière',
      'Assurance responsabilité civile professionnelle',
      'Affichage des informations légales',
    ],
    regulations: ['Code du tourisme L211-1'],
  },
  {
    id: 'travel_information',
    type: 'REQUIRED',
    category: 'DISCLAIMER',
    title: 'Information précontractuelle',
    description: 'Informations obligatoires avant réservation',
    checklistItems: [
      'Caractéristiques principales du voyage',
      'Prix total et modalités de paiement',
      'Nombre minimum de participants',
      'Informations sur les passeports et visas',
      'Conditions d\'annulation',
      'Assurances facultatives',
    ],
    regulations: ['Code du tourisme R211-3'],
  },
]

const HOTEL_REQUIREMENTS: LegalRequirement[] = [
  {
    id: 'hotel_classification',
    type: 'RECOMMENDED',
    category: 'DISCLAIMER',
    title: 'Classification hôtelière',
    description: 'Affichage de la classification officielle',
    checklistItems: [
      'Étoiles officielles Atout France',
      'Date de classement',
      'Critères de classement disponibles',
    ],
    regulations: ['Code du tourisme D311-6'],
  },
  {
    id: 'hotel_rates',
    type: 'REQUIRED',
    category: 'DISCLAIMER',
    title: 'Affichage des tarifs',
    description: 'Transparence des prix hôteliers',
    checklistItems: [
      'Prix TTC affiché',
      'Taxe de séjour séparée',
      'Conditions d\'annulation claires',
      'Frais supplémentaires indiqués',
    ],
  },
]

const RESTAURANT_REQUIREMENTS: LegalRequirement[] = [
  {
    id: 'restaurant_origin',
    type: 'REQUIRED',
    category: 'DISCLAIMER',
    title: 'Origine des viandes',
    description: 'Affichage obligatoire origine viande bovine',
    checklistItems: [
      'Origine viande bovine indiquée',
      'Pays de naissance',
      'Pays d\'élevage',
      'Pays d\'abattage',
    ],
    regulations: ['Décret n°2002-1465'],
  },
  {
    id: 'restaurant_homemade',
    type: 'RECOMMENDED',
    category: 'DISCLAIMER',
    title: 'Mention fait maison',
    description: 'Logo fait maison pour plats élaborés sur place',
    checklistItems: [
      'Logo officiel utilisé',
      'Critères respectés',
      'Information visible sur menu',
    ],
    regulations: ['Décret n°2014-797'],
  },
]

// Build compliance configurations
export function getComplianceForCommerceType(commerceType: CommerceType): CommerceCompliance {
  const baseRequirements: LegalRequirement[] = [GDPR_REQUIREMENTS, COOKIE_REQUIREMENTS]

  const compliance: CommerceCompliance = {
    commerceType,
    requirements: [...baseRequirements],
    mandatoryDisclosures: [
      'Mentions légales complètes',
      'Conditions générales de vente',
      'Politique de confidentialité',
    ],
    dataCategories: getDataCategoriesForType(commerceType),
    retentionPeriods: getRetentionPeriodsForType(commerceType),
    specialRegulations: [],
  }

  // Add commerce-specific requirements
  switch (commerceType) {
    case 'ALCOHOL':
      compliance.requirements.push(...ALCOHOL_REQUIREMENTS)
      compliance.ageRestriction = {
        minimumAge: 18,
        verificationRequired: true,
        verificationMethods: ['CHECKBOX', 'DATE_OF_BIRTH'],
      }
      compliance.specialRegulations.push('Code de la santé publique', 'Loi Évin')
      break

    case 'FOOD':
      compliance.requirements.push(...FOOD_REQUIREMENTS)
      compliance.specialRegulations.push('Règlement INCO', 'Règlement CE 178/2002')
      break

    case 'BEAUTY': // Also covers pharmacy-type products
      compliance.requirements.push(...PHARMACY_REQUIREMENTS)
      compliance.ageRestriction = {
        minimumAge: 18,
        verificationRequired: false,
        verificationMethods: ['CHECKBOX'],
      }
      compliance.specialRegulations.push('Code de la santé publique', 'Ordre des pharmaciens')
      break

    case 'DIGITAL':
      compliance.requirements.push(...DIGITAL_REQUIREMENTS)
      break

    case 'SERVICES':
      compliance.requirements.push(...SERVICES_REQUIREMENTS)
      break

    case 'TRAVEL':
      compliance.requirements.push(...TRAVEL_REQUIREMENTS)
      compliance.specialRegulations.push('Code du tourisme', 'Directive EU 2015/2302')
      break

    case 'HOTEL':
      compliance.requirements.push(...HOTEL_REQUIREMENTS)
      compliance.specialRegulations.push('Code du tourisme')
      break

    case 'RESTAURANT':
      compliance.requirements.push(...RESTAURANT_REQUIREMENTS, ...FOOD_REQUIREMENTS)
      compliance.specialRegulations.push('Code de la consommation', 'Hygiène alimentaire HACCP')
      break

    case 'SEASONAL':
      // Seasonal products may have special promotional rules
      break

    case 'RECREATION':
      compliance.requirements.push({
        id: 'recreation_safety',
        type: 'REQUIRED',
        category: 'DISCLAIMER',
        title: 'Informations de sécurité',
        description: 'Avertissements et conditions de participation',
        checklistItems: [
          'Conditions physiques requises',
          'Équipement nécessaire',
          'Risques potentiels',
          'Assurance recommandée',
        ],
      })
      break
  }

  // Add standard e-commerce requirements
  compliance.requirements.push({
    id: 'ecommerce_withdrawal',
    type: 'REQUIRED',
    category: 'REFUND',
    title: 'Droit de rétractation',
    description: 'Délai de 14 jours pour les consommateurs',
    checklistItems: [
      'Délai de 14 jours mentionné',
      'Formulaire de rétractation fourni',
      'Exceptions clairement indiquées',
      'Modalités de remboursement',
    ],
    regulations: ['Code de la consommation L221-18'],
  })

  compliance.requirements.push({
    id: 'ecommerce_guarantee',
    type: 'REQUIRED',
    category: 'TERMS',
    title: 'Garantie légale de conformité',
    description: 'Garantie de 2 ans minimum',
    checklistItems: [
      'Durée de garantie mentionnée',
      'Procédure de réclamation',
      'Garantie commerciale distincte si applicable',
    ],
    regulations: ['Code de la consommation L217-3'],
  })

  return compliance
}

function getDataCategoriesForType(commerceType: CommerceType): DataCategory[] {
  const baseCategories: DataCategory[] = [
    {
      name: 'Données d\'identification',
      description: 'Nom, prénom, email, téléphone',
      lawfulBasis: 'CONTRACT',
      retentionPeriod: '3 ans après dernière interaction',
      sensitiveData: false,
    },
    {
      name: 'Données de commande',
      description: 'Historique des achats, paniers',
      lawfulBasis: 'CONTRACT',
      retentionPeriod: '10 ans (obligation comptable)',
      sensitiveData: false,
    },
    {
      name: 'Adresse de livraison',
      description: 'Adresses postales',
      lawfulBasis: 'CONTRACT',
      retentionPeriod: '3 ans après dernière commande',
      sensitiveData: false,
    },
    {
      name: 'Données de paiement',
      description: 'Méthodes de paiement (tokenisées)',
      lawfulBasis: 'CONTRACT',
      retentionPeriod: 'Durée de la relation commerciale',
      sensitiveData: false,
    },
  ]

  const typeSpecificCategories: DataCategory[] = []

  switch (commerceType) {
    case 'BEAUTY': // Includes pharmacy-type health data
      typeSpecificCategories.push({
        name: 'Données de santé',
        description: 'Historique de dispensation (si applicable)',
        lawfulBasis: 'LEGAL_OBLIGATION',
        retentionPeriod: '3 ans',
        sensitiveData: true,
      })
      break

    case 'TRAVEL':
    case 'HOTEL':
      typeSpecificCategories.push({
        name: 'Données de voyage',
        description: 'Passeport, nationalité, préférences',
        lawfulBasis: 'CONTRACT',
        retentionPeriod: '3 ans après voyage',
        sensitiveData: false,
      })
      break

    case 'ALCOHOL':
      typeSpecificCategories.push({
        name: 'Preuve de majorité',
        description: 'Date de naissance, vérification',
        lawfulBasis: 'LEGAL_OBLIGATION',
        retentionPeriod: '1 an',
        sensitiveData: false,
      })
      break
  }

  return [...baseCategories, ...typeSpecificCategories]
}

function getRetentionPeriodsForType(commerceType: CommerceType): RetentionPeriod[] {
  const baseRetention: RetentionPeriod[] = [
    {
      dataType: 'Factures et documents comptables',
      period: '10 ans',
      reason: 'Obligation légale (Code de commerce)',
    },
    {
      dataType: 'Contrats et CGV acceptées',
      period: '5 ans',
      reason: 'Prescription civile',
    },
    {
      dataType: 'Données de prospection',
      period: '3 ans',
      reason: 'Recommandation CNIL',
    },
    {
      dataType: 'Logs de connexion',
      period: '1 an',
      reason: 'Obligation légale (LCEN)',
    },
  ]

  return baseRetention
}

// Policy Templates
export function getPrivacyPolicyTemplate(commerceType: CommerceType): PolicyTemplate {
  const compliance = getComplianceForCommerceType(commerceType)

  return {
    id: `privacy_${commerceType.toLowerCase()}`,
    title: 'Politique de Confidentialité',
    commerceTypes: [commerceType],
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        title: 'Responsable du traitement',
        content: '[Nom de l\'entreprise], [Adresse], [Email], [SIRET]',
        required: true,
      },
      {
        title: 'Données collectées',
        content: compliance.dataCategories
          .map((dc) => `- ${dc.name}: ${dc.description}`)
          .join('\n'),
        required: true,
      },
      {
        title: 'Finalités du traitement',
        content: `Les données sont collectées pour:
- L'exécution des commandes
- La gestion de la relation client
- L'amélioration de nos services
- Le respect de nos obligations légales`,
        required: true,
      },
      {
        title: 'Base légale',
        content: 'Les traitements sont fondés sur: l\'exécution du contrat, le consentement, l\'obligation légale, ou l\'intérêt légitime.',
        required: true,
      },
      {
        title: 'Durée de conservation',
        content: compliance.retentionPeriods
          .map((rp) => `- ${rp.dataType}: ${rp.period} (${rp.reason})`)
          .join('\n'),
        required: true,
      },
      {
        title: 'Vos droits',
        content: `Conformément au RGPD, vous disposez des droits suivants:
- Droit d'accès
- Droit de rectification
- Droit à l'effacement
- Droit à la limitation
- Droit à la portabilité
- Droit d'opposition

Pour exercer ces droits, contactez-nous à [email].`,
        required: true,
      },
      {
        title: 'Cookies',
        content: 'Nous utilisons des cookies pour améliorer votre expérience. Consultez notre politique cookies pour plus d\'informations.',
        required: true,
      },
    ],
  }
}

export function getTermsTemplate(commerceType: CommerceType): PolicyTemplate {
  const compliance = getComplianceForCommerceType(commerceType)
  const sections: PolicySection[] = [
    {
      title: 'Objet',
      content: 'Les présentes conditions générales de vente régissent les relations contractuelles entre [Entreprise] et ses clients.',
      required: true,
    },
    {
      title: 'Prix',
      content: 'Les prix sont indiqués en euros TTC. [Entreprise] se réserve le droit de modifier ses prix à tout moment.',
      required: true,
    },
    {
      title: 'Commande',
      content: 'La validation de la commande vaut acceptation des présentes CGV et forme le contrat.',
      required: true,
    },
    {
      title: 'Paiement',
      content: 'Le paiement s\'effectue au moment de la commande par les moyens proposés sur le site.',
      required: true,
    },
    {
      title: 'Livraison',
      content: 'Les délais de livraison sont donnés à titre indicatif. Un retard ne peut justifier l\'annulation de la commande.',
      required: true,
    },
    {
      title: 'Droit de rétractation',
      content: `Conformément à l'article L221-18 du Code de la consommation, vous disposez d'un délai de 14 jours pour exercer votre droit de rétractation.

Exceptions: ${commerceType === 'DIGITAL' ? 'Les contenus numériques sont exclus du droit de rétractation dès leur téléchargement avec votre accord.' : 'Produits périssables, personnalisés, ou descellés.'}`,
      required: true,
    },
    {
      title: 'Garanties',
      content: 'Les produits bénéficient de la garantie légale de conformité (2 ans) et de la garantie des vices cachés.',
      required: true,
    },
    {
      title: 'Responsabilité',
      content: 'La responsabilité de [Entreprise] est limitée au montant de la commande.',
      required: true,
    },
    {
      title: 'Données personnelles',
      content: 'Vos données sont traitées conformément à notre politique de confidentialité.',
      required: true,
    },
    {
      title: 'Litiges',
      content: 'En cas de litige, une solution amiable sera recherchée. Le médiateur compétent est [Médiateur]. Tribunal compétent: [Ville].',
      required: true,
    },
  ]

  // Add commerce-specific sections
  if (compliance.ageRestriction) {
    sections.push({
      title: 'Restriction d\'âge',
      content: `L'achat sur ce site est réservé aux personnes de ${compliance.ageRestriction.minimumAge} ans et plus. Une vérification sera effectuée.`,
      required: true,
    })
  }

  if (commerceType === 'TRAVEL') {
    sections.push({
      title: 'Conditions spécifiques voyages',
      content: `Les prestations de voyage sont soumises aux dispositions du Code du tourisme.
- Assurance annulation recommandée
- Documents de voyage requis
- Conditions d'annulation spécifiques`,
      required: true,
    })
  }

  return {
    id: `terms_${commerceType.toLowerCase()}`,
    title: 'Conditions Générales de Vente',
    commerceTypes: [commerceType],
    lastUpdated: new Date().toISOString(),
    sections,
  }
}

export function getRefundPolicyTemplate(commerceType: CommerceType): PolicyTemplate {
  let specificContent = ''

  switch (commerceType) {
    case 'DIGITAL':
      specificContent = `Les produits numériques ne sont pas remboursables une fois téléchargés, sauf défaut technique avéré.`
      break
    case 'FOOD':
    case 'RESTAURANT':
      specificContent = `Les produits alimentaires périssables ne sont pas remboursables sauf défaut de conformité.`
      break
    case 'SERVICES':
      specificContent = `Les services exécutés ne peuvent être remboursés. Annulation possible avant exécution selon conditions.`
      break
    case 'TRAVEL':
    case 'HOTEL':
      specificContent = `Les conditions d'annulation varient selon le tarif choisi. Consultez les conditions spécifiques de votre réservation.`
      break
    default:
      specificContent = `Remboursement intégral sous 14 jours après retour du produit dans son état d'origine.`
  }

  return {
    id: `refund_${commerceType.toLowerCase()}`,
    title: 'Politique de Remboursement',
    commerceTypes: [commerceType],
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        title: 'Délai de rétractation',
        content: 'Vous disposez de 14 jours à compter de la réception pour retourner votre commande.',
        required: true,
      },
      {
        title: 'Conditions de retour',
        content: 'Les produits doivent être retournés dans leur emballage d\'origine, non utilisés.',
        required: true,
      },
      {
        title: 'Exceptions',
        content: specificContent,
        required: true,
      },
      {
        title: 'Procédure',
        content: `1. Contactez notre service client
2. Recevez votre numéro de retour
3. Expédiez le produit
4. Remboursement sous 14 jours après réception`,
        required: true,
      },
      {
        title: 'Frais de retour',
        content: 'Les frais de retour sont à la charge du client, sauf produit défectueux.',
        required: true,
      },
    ],
  }
}

// Compliance Checker
export function checkCompliance(
  commerceType: CommerceType,
  checkedItems: Record<string, boolean>
): {
  compliant: boolean
  score: number
  missingRequired: string[]
  missingRecommended: string[]
} {
  const compliance = getComplianceForCommerceType(commerceType)

  const missingRequired: string[] = []
  const missingRecommended: string[] = []
  let totalRequired = 0
  let checkedRequired = 0

  for (const req of compliance.requirements) {
    for (const item of req.checklistItems) {
      const key = `${req.id}_${item}`

      if (req.type === 'REQUIRED') {
        totalRequired++
        if (checkedItems[key]) {
          checkedRequired++
        } else {
          missingRequired.push(`${req.title}: ${item}`)
        }
      } else if (req.type === 'RECOMMENDED' && !checkedItems[key]) {
        missingRecommended.push(`${req.title}: ${item}`)
      }
    }
  }

  return {
    compliant: missingRequired.length === 0,
    score: totalRequired > 0 ? Math.round((checkedRequired / totalRequired) * 100) : 100,
    missingRequired,
    missingRecommended,
  }
}

// Export all compliance data
export function getAllCommerceCompliance(): Record<CommerceType, CommerceCompliance> {
  const result: Partial<Record<CommerceType, CommerceCompliance>> = {}

  for (const type of Object.keys(COMMERCE_TYPES) as CommerceType[]) {
    result[type] = getComplianceForCommerceType(type)
  }

  return result as Record<CommerceType, CommerceCompliance>
}
