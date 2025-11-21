/**
 * Exchange Rates - Conversion crypto ↔ fiat
 * Récupère les taux de change en temps réel
 */

import { Cryptocurrency } from '../types'

interface ExchangeRate {
  cryptocurrency: Cryptocurrency
  fiat: string // EUR, USD, GBP, etc.
  rate: number
  timestamp: Date
  source: string
}

/**
 * Cache des taux de change (rafraîchi toutes les 60 secondes)
 */
const ratesCache = new Map<string, { rate: number; timestamp: number }>()
const CACHE_DURATION = 60 * 1000 // 60 secondes

/**
 * Récupère le taux de change actuel
 *
 * En production, intégrer avec:
 * - CoinGecko API
 * - CoinMarketCap API
 * - Binance API
 * - Kraken API
 * - Ou votre propre agrégateur
 */
export async function getExchangeRate(
  cryptocurrency: Cryptocurrency,
  fiatCurrency: string = 'EUR'
): Promise<ExchangeRate> {
  const cacheKey = `${cryptocurrency}_${fiatCurrency}`
  const cached = ratesCache.get(cacheKey)

  // Vérifier le cache
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return {
      cryptocurrency,
      fiat: fiatCurrency,
      rate: cached.rate,
      timestamp: new Date(cached.timestamp),
      source: 'cache',
    }
  }

  // En production, faire un appel API réel
  // Pour l'instant, utiliser des taux de test
  const rate = await fetchExchangeRateFromAPI(cryptocurrency, fiatCurrency)

  // Mettre en cache
  ratesCache.set(cacheKey, {
    rate,
    timestamp: Date.now(),
  })

  return {
    cryptocurrency,
    fiat: fiatCurrency,
    rate,
    timestamp: new Date(),
    source: 'api',
  }
}

/**
 * Récupère le taux depuis une API (simulation)
 */
async function fetchExchangeRateFromAPI(
  cryptocurrency: Cryptocurrency,
  fiatCurrency: string
): Promise<number> {
  // En production, utiliser une vraie API
  // Exemple avec CoinGecko:
  // const response = await fetch(
  //   `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=${fiatCurrency}`
  // )
  // const data = await response.json()
  // return data[cryptoId][fiatCurrency.toLowerCase()]

  // Pour l'instant, retourner des taux de test (approximatifs)
  const rates: Record<string, Record<string, number>> = {
    BTC: {
      EUR: 42000,
      USD: 46000,
      GBP: 36000,
    },
    ETH: {
      EUR: 2800,
      USD: 3100,
      GBP: 2500,
    },
    USDT: {
      EUR: 0.92,
      USD: 1.0,
      GBP: 0.8,
    },
    USDC: {
      EUR: 0.92,
      USD: 1.0,
      GBP: 0.8,
    },
    LTC: {
      EUR: 85,
      USD: 93,
      GBP: 75,
    },
    BCH: {
      EUR: 280,
      USD: 310,
      GBP: 245,
    },
  }

  return rates[cryptocurrency]?.[fiatCurrency] || 1
}

/**
 * Convertit un montant fiat en crypto
 */
export async function convertFiatToCrypto(
  fiatAmount: number,
  fiatCurrency: string,
  cryptocurrency: Cryptocurrency
): Promise<{
  cryptoAmount: number
  exchangeRate: number
  fiatAmount: number
  fiatCurrency: string
  cryptocurrency: Cryptocurrency
}> {
  const { rate } = await getExchangeRate(cryptocurrency, fiatCurrency)

  // Montant en crypto = montant fiat / taux
  const cryptoAmount = fiatAmount / rate

  return {
    cryptoAmount,
    exchangeRate: rate,
    fiatAmount,
    fiatCurrency,
    cryptocurrency,
  }
}

/**
 * Convertit un montant crypto en fiat
 */
export async function convertCryptoToFiat(
  cryptoAmount: number,
  cryptocurrency: Cryptocurrency,
  fiatCurrency: string
): Promise<{
  fiatAmount: number
  exchangeRate: number
  cryptoAmount: number
  cryptocurrency: Cryptocurrency
  fiatCurrency: string
}> {
  const { rate } = await getExchangeRate(cryptocurrency, fiatCurrency)

  // Montant fiat = montant crypto * taux
  const fiatAmount = cryptoAmount * rate

  return {
    fiatAmount,
    exchangeRate: rate,
    cryptoAmount,
    cryptocurrency,
    fiatCurrency,
  }
}

/**
 * Récupère plusieurs taux en une seule requête
 */
export async function getMultipleExchangeRates(
  cryptocurrencies: Cryptocurrency[],
  fiatCurrency: string = 'EUR'
): Promise<ExchangeRate[]> {
  const promises = cryptocurrencies.map((crypto) => getExchangeRate(crypto, fiatCurrency))
  return Promise.all(promises)
}

/**
 * Calcule le slippage acceptable pour un paiement crypto
 * (variation de prix acceptable pendant la durée de validité du paiement)
 */
export function calculateAcceptableSlippage(
  cryptocurrency: Cryptocurrency,
  durationMinutes: number = 15
): number {
  // Slippage en %
  // Plus volatile = plus de slippage acceptable
  const volatilityFactors: Record<Cryptocurrency, number> = {
    BTC: 0.5, // 0.5% pour 15 min
    ETH: 0.7, // 0.7% pour 15 min
    USDT: 0.1, // 0.1% pour les stablecoins
    USDC: 0.1,
    LTC: 0.8,
    BCH: 0.9,
  }

  const baseSlippage = volatilityFactors[cryptocurrency] || 0.5
  const durationFactor = durationMinutes / 15

  return baseSlippage * durationFactor
}

/**
 * Vérifie si le montant reçu est acceptable (slippage)
 */
export async function verifyPaymentAmount(
  expectedFiatAmount: number,
  receivedCryptoAmount: number,
  cryptocurrency: Cryptocurrency,
  fiatCurrency: string,
  originalExchangeRate: number
): Promise<{
  isAcceptable: boolean
  receivedFiatAmount: number
  expectedFiatAmount: number
  difference: number
  differencePercent: number
  slippageThreshold: number
}> {
  // Convertir le montant crypto reçu en fiat avec le taux actuel
  const { fiatAmount: receivedFiatAmount } = await convertCryptoToFiat(
    receivedCryptoAmount,
    cryptocurrency,
    fiatCurrency
  )

  const difference = receivedFiatAmount - expectedFiatAmount
  const differencePercent = (difference / expectedFiatAmount) * 100

  const slippageThreshold = calculateAcceptableSlippage(cryptocurrency)

  // Le montant est acceptable si:
  // 1. Il est égal ou supérieur au montant attendu
  // 2. Ou la différence négative est dans la limite du slippage acceptable
  const isAcceptable =
    receivedFiatAmount >= expectedFiatAmount ||
    Math.abs(differencePercent) <= slippageThreshold

  return {
    isAcceptable,
    receivedFiatAmount,
    expectedFiatAmount,
    difference,
    differencePercent,
    slippageThreshold,
  }
}
