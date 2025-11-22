import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
  const t = await getTranslations('notFound')
  return (
    <div className="container mx-auto px-4 py-16 min-h-[70vh] flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <Card variant="default" className="p-12 text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-9xl font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-yellow-400 bg-clip-text text-transparent">
              404
            </div>
          </div>

          {/* Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {t('description')}
          </p>

          {/* Suggestions Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card variant="teal" className="p-6">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('home')}</h3>
              <p className="text-sm text-gray-600">{t('homeDesc')}</p>
            </Card>

            <Card variant="pink" className="p-6">
              <div className="w-12 h-12 bg-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('productsTitle')}</h3>
              <p className="text-sm text-gray-600">{t('productsDesc')}</p>
            </Card>

            <Card variant="yellow" className="p-6">
              <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ArrowLeft className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('back')}</h3>
              <p className="text-sm text-gray-600">{t('backDesc')}</p>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <Button variant="primary" size="lg">
                <Home className="w-5 h-5 mr-2" />
                {t('backToHome')}
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg">
                <Search className="w-5 h-5 mr-2" />
                {t('viewProducts')}
              </Button>
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {t('needHelp')}{' '}
              <a
                href="mailto:contact@foxcard.com"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {t('contactUs')}
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
