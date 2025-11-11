import { router } from '../trpc'
import { productRouter } from './product'
import { categoryRouter } from './category'
import { storeRouter } from './store'
import { orderRouter } from './order'

export const appRouter = router({
  product: productRouter,
  category: categoryRouter,
  store: storeRouter,
  order: orderRouter,
})

export type AppRouter = typeof appRouter
