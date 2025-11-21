import { router } from '../trpc'
import { productRouter } from './product'
import { categoryRouter } from './category'
import { storeRouter } from './store'
import { orderRouter } from './order'
import { userRouter } from './user'
import { customerRouter } from './customer'
import { paymentRouter } from './payment'
import { discountRouter } from './discount'
import { shippingRouter } from './shipping'
import { mediaRouter } from './media'
import { exportRouter } from './export'
import { webhookRouter } from './webhook'
import { apiKeyRouter } from './apiKey'
import { themeRouter } from './theme'
import { installRouter } from './install'
import { envVariableRouter } from './envVariable'
import { emailRouter } from './email'
import { newsletterRouter } from './newsletter'
import { roleRouter } from './role'
import { auditRouter } from './audit'
import { pluginRouter } from './plugin'
import { analyticsRouter } from './analytics'
import { reportRouter } from './report'
import { forecastRouter } from './forecast'
import { abtestRouter } from './abtest'
import { warehouseRouter } from './warehouse'
import { allocationRouter } from './allocation'
import { inventoryRouter } from './inventory'
import { inventoryReportRouter } from './inventory-report'
import { abandonedCartRouter } from './abandoned-cart'
import { loyaltyRouter } from './loyalty'
import { campaignRouter } from './campaign'
import { automationRouter } from './automation'
import { taxRouter } from './tax'
import { commerceTypeRouter } from './commerce-type'
import { paymentGatewayRouter } from './payment-gateway'

export const appRouter = router({
  product: productRouter,
  category: categoryRouter,
  store: storeRouter,
  order: orderRouter,
  user: userRouter,
  customer: customerRouter,
  payment: paymentRouter,
  discount: discountRouter,
  shipping: shippingRouter,
  media: mediaRouter,
  export: exportRouter,
  webhook: webhookRouter,
  apiKey: apiKeyRouter,
  theme: themeRouter,
  install: installRouter,
  envVariable: envVariableRouter,
  email: emailRouter,
  newsletter: newsletterRouter,
  role: roleRouter,
  audit: auditRouter,
  plugin: pluginRouter,
  analytics: analyticsRouter,
  report: reportRouter,
  forecast: forecastRouter,
  abtest: abtestRouter,
  warehouse: warehouseRouter,
  allocation: allocationRouter,
  inventory: inventoryRouter,
  inventoryReport: inventoryReportRouter,
  abandonedCart: abandonedCartRouter,
  loyalty: loyaltyRouter,
  campaign: campaignRouter,
  automation: automationRouter,
  tax: taxRouter,
  commerceType: commerceTypeRouter,
  paymentGateway: paymentGatewayRouter,
})

export type AppRouter = typeof appRouter
