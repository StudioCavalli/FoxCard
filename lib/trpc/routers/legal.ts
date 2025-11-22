/**
 * Legal Compliance tRPC Router
 * Handles legal requirements, policy templates, and compliance checking
 */

import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  getComplianceForCommerceType,
  getAllCommerceCompliance,
  getPrivacyPolicyTemplate,
  getTermsTemplate,
  getRefundPolicyTemplate,
  checkCompliance,
} from '@/lib/legal/compliance-manager'
import { CommerceType } from '@/lib/commerce-types'

const CommerceTypeEnum = z.enum([
  'GENERAL',
  'FOOD',
  'ALCOHOL',
  'FASHION',
  'ELECTRONICS',
  'BEAUTY',
  'HOME',
  'SPORTS',
  'TOYS',
  'AUTOMOTIVE',
  'BOOKS',
  'PETS',
  'DIGITAL',
  'SERVICES',
  'SEASONAL',
  'RESTAURANT',
  'HOTEL',
  'TRAVEL',
  'RECREATION',
] as const)

export const legalRouter = router({
  // ============ PUBLIC PROCEDURES ============

  /**
   * Get compliance requirements for a commerce type
   */
  getCompliance: publicProcedure
    .input(z.object({
      commerceType: CommerceTypeEnum,
    }))
    .query(({ input }) => {
      return getComplianceForCommerceType(input.commerceType as CommerceType)
    }),

  /**
   * Get all commerce compliance configurations
   */
  getAllCompliance: publicProcedure.query(() => {
    return getAllCommerceCompliance()
  }),

  /**
   * Get privacy policy template
   */
  getPrivacyTemplate: publicProcedure
    .input(z.object({
      commerceType: CommerceTypeEnum,
    }))
    .query(({ input }) => {
      return getPrivacyPolicyTemplate(input.commerceType as CommerceType)
    }),

  /**
   * Get terms and conditions template
   */
  getTermsTemplate: publicProcedure
    .input(z.object({
      commerceType: CommerceTypeEnum,
    }))
    .query(({ input }) => {
      return getTermsTemplate(input.commerceType as CommerceType)
    }),

  /**
   * Get refund policy template
   */
  getRefundTemplate: publicProcedure
    .input(z.object({
      commerceType: CommerceTypeEnum,
    }))
    .query(({ input }) => {
      return getRefundPolicyTemplate(input.commerceType as CommerceType)
    }),

  /**
   * Get all policy templates for a commerce type
   */
  getAllTemplates: publicProcedure
    .input(z.object({
      commerceType: CommerceTypeEnum,
    }))
    .query(({ input }) => {
      const commerceType = input.commerceType as CommerceType
      return {
        privacy: getPrivacyPolicyTemplate(commerceType),
        terms: getTermsTemplate(commerceType),
        refund: getRefundPolicyTemplate(commerceType),
      }
    }),

  /**
   * Check compliance status
   */
  checkCompliance: publicProcedure
    .input(z.object({
      commerceType: CommerceTypeEnum,
      checkedItems: z.record(z.string(), z.boolean()),
    }))
    .query(({ input }) => {
      return checkCompliance(input.commerceType as CommerceType, input.checkedItems as Record<string, boolean>)
    }),

  /**
   * Get age verification requirements
   */
  getAgeRequirements: publicProcedure
    .input(z.object({
      commerceType: CommerceTypeEnum,
    }))
    .query(({ input }) => {
      const compliance = getComplianceForCommerceType(input.commerceType as CommerceType)
      return compliance.ageRestriction || null
    }),

  /**
   * Get mandatory disclosures for commerce type
   */
  getMandatoryDisclosures: publicProcedure
    .input(z.object({
      commerceType: CommerceTypeEnum,
    }))
    .query(({ input }) => {
      const compliance = getComplianceForCommerceType(input.commerceType as CommerceType)
      return {
        disclosures: compliance.mandatoryDisclosures,
        regulations: compliance.specialRegulations,
      }
    }),

  // ============ ADMIN PROCEDURES ============

  /**
   * Get store compliance status
   */
  getStoreCompliance: adminProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
        select: {
          id: true,
          name: true,
          settings: true,
        },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const settings = (store.settings as Record<string, unknown>) || {}
      const commerceType = (settings.commerceType as CommerceType) || 'GENERAL'
      const checkedItems = (settings.complianceChecklist as Record<string, boolean>) || {}

      const compliance = getComplianceForCommerceType(commerceType)
      const status = checkCompliance(commerceType, checkedItems)

      return {
        store: { id: store.id, name: store.name },
        commerceType,
        compliance,
        status,
        checkedItems,
      }
    }),

  /**
   * Update store compliance checklist
   */
  updateComplianceChecklist: adminProcedure
    .input(z.object({
      storeId: z.string(),
      checkedItems: z.record(z.string(), z.boolean()),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
        select: { settings: true },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const settings = (store.settings as Record<string, unknown>) || {}

      await ctx.prisma.store.update({
        where: { id: input.storeId },
        data: {
          settings: JSON.parse(JSON.stringify({
            ...settings,
            complianceChecklist: input.checkedItems,
            complianceUpdatedAt: new Date().toISOString(),
          })),
        },
      })

      const commerceType = (settings.commerceType as CommerceType) || 'GENERAL'
      return checkCompliance(commerceType, input.checkedItems as Record<string, boolean>)
    }),

  /**
   * Save custom policy
   */
  savePolicy: adminProcedure
    .input(z.object({
      storeId: z.string(),
      policyType: z.enum(['privacy', 'terms', 'refund', 'cookies', 'custom']),
      title: z.string(),
      content: z.string(),
      active: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
        select: { settings: true },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const settings = (store.settings as Record<string, unknown>) || {}
      const policies = (settings.policies as Record<string, unknown>) || {}

      policies[input.policyType] = {
        title: input.title,
        content: input.content,
        active: input.active,
        updatedAt: new Date().toISOString(),
      }

      await ctx.prisma.store.update({
        where: { id: input.storeId },
        data: {
          settings: JSON.parse(JSON.stringify({
            ...settings,
            policies,
          })),
        },
      })

      return { success: true }
    }),

  /**
   * Get store policies
   */
  getStorePolicies: adminProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
        select: { settings: true },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const settings = (store.settings as Record<string, unknown>) || {}
      return (settings.policies as Record<string, unknown>) || {}
    }),

  /**
   * Generate policy from template
   */
  generatePolicy: adminProcedure
    .input(z.object({
      storeId: z.string(),
      policyType: z.enum(['privacy', 'terms', 'refund']),
      companyName: z.string(),
      companyAddress: z.string(),
      companyEmail: z.string(),
      companySiret: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
        select: { settings: true },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const settings = (store.settings as Record<string, unknown>) || {}
      const commerceType = (settings.commerceType as CommerceType) || 'GENERAL'

      let template
      switch (input.policyType) {
        case 'privacy':
          template = getPrivacyPolicyTemplate(commerceType)
          break
        case 'terms':
          template = getTermsTemplate(commerceType)
          break
        case 'refund':
          template = getRefundPolicyTemplate(commerceType)
          break
      }

      // Replace placeholders
      let content = template.sections
        .map((s) => `## ${s.title}\n\n${s.content}`)
        .join('\n\n')

      content = content
        .replace(/\[Entreprise\]/g, input.companyName)
        .replace(/\[Nom de l'entreprise\]/g, input.companyName)
        .replace(/\[Adresse\]/g, input.companyAddress)
        .replace(/\[Email\]/g, input.companyEmail)
        .replace(/\[email\]/g, input.companyEmail)
        .replace(/\[SIRET\]/g, input.companySiret || '')

      return {
        title: template.title,
        content,
        commerceType,
      }
    }),

  /**
   * Get GDPR data export for a customer
   */
  exportCustomerData: adminProcedure
    .input(z.object({
      storeId: z.string(),
      customerId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      // Get customer data
      const customer = await ctx.prisma.user.findUnique({
        where: { id: input.customerId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      })

      if (!customer) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' })
      }

      // Get customer orders
      const orders = await ctx.prisma.order.findMany({
        where: {
          storeId: input.storeId,
          customerId: input.customerId,
        },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
          shippingAddress: true,
        },
      })

      return {
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          accountCreatedAt: customer.createdAt,
        },
        orders: orders.map((o) => ({
          orderNumber: o.orderNumber,
          total: o.total,
          status: o.status,
          date: o.createdAt,
          shippingAddress: o.shippingAddress,
        })),
        exportedAt: new Date().toISOString(),
        exportedBy: ctx.session.user.id,
      }
    }),

  /**
   * Delete customer data (GDPR right to erasure)
   */
  deleteCustomerData: adminProcedure
    .input(z.object({
      storeId: z.string(),
      customerId: z.string(),
      retainOrderHistory: z.boolean().default(true), // For legal/accounting purposes
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      if (input.retainOrderHistory) {
        // Anonymize orders instead of deleting
        await ctx.prisma.order.updateMany({
          where: {
            storeId: input.storeId,
            customerId: input.customerId,
          },
          data: {
            customerEmail: 'anonymized@deleted.user',
            shippingAddress: JSON.parse(JSON.stringify({
              name: 'Anonymized',
              address: 'Deleted per GDPR request',
              city: '-',
              postalCode: '-',
              country: '-',
            })),
            billingAddress: JSON.parse(JSON.stringify({
              name: 'Anonymized',
              address: 'Deleted per GDPR request',
              city: '-',
              postalCode: '-',
              country: '-',
            })),
          },
        })
      } else {
        // Full deletion (not recommended for legal reasons)
        await ctx.prisma.order.deleteMany({
          where: {
            storeId: input.storeId,
            customerId: input.customerId,
          },
        })
      }

      // Log the deletion for audit
      await ctx.prisma.auditLog.create({
        data: {
          storeId: input.storeId,
          userId: ctx.session.user.id,
          action: 'GDPR_DATA_DELETION',
          entity: 'USER',
          entityId: input.customerId,
          metadata: JSON.parse(JSON.stringify({
            retainedOrderHistory: input.retainOrderHistory,
            deletedAt: new Date().toISOString(),
          })),
        },
      })

      return {
        success: true,
        message: input.retainOrderHistory
          ? 'Customer data anonymized, order history retained for legal purposes'
          : 'Customer data fully deleted',
      }
    }),
})
