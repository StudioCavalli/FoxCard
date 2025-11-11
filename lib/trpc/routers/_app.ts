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
})

export type AppRouter = typeof appRouter
