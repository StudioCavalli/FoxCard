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
import { inventoryReportRouter } from './inventory-report'
import { abandonedCartRouter } from './abandoned-cart'
import { loyaltyRouter } from './loyalty'
import { campaignRouter } from './campaign'
import { automationRouter } from './automation'
import { taxRouter } from './tax'
import { crsdpayRouter } from './crsdpay'
import { commerceTypeRouter } from './commerce-type'
import { paymentGatewayRouter } from './payment-gateway'
import { superadminRouter } from './superadmin'
import { teamRouter } from './team'
import { digitalRouter } from './digital'
import { bookingRouter } from './booking'
import { restaurantRouter } from './restaurant'
import { hotelRouter } from './hotel'
import { travelRouter } from './travel'
import { alcoholRouter } from './alcohol'
import { storeLocationRouter } from './storeLocation'
import { sunpayRouter } from './sunpay'

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
  inventoryReport: inventoryReportRouter,
  abandonedCart: abandonedCartRouter,
  loyalty: loyaltyRouter,
  campaign: campaignRouter,
  automation: automationRouter,
  tax: taxRouter,
  crsdpay: crsdpayRouter,
  commerceType: commerceTypeRouter,
  paymentGateway: paymentGatewayRouter,
  superadmin: superadminRouter,
  team: teamRouter,
  digital: digitalRouter,
  booking: bookingRouter,
  restaurant: restaurantRouter,
  hotel: hotelRouter,
  travel: travelRouter,
  alcohol: alcoholRouter,
  storeLocation: storeLocationRouter,
  sunpay: sunpayRouter,
})

export type AppRouter = typeof appRouter
