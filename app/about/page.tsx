import { Card } from '@/components/ui/Card'
import { Heart, Package, Shield, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          À propos de{' '}
          <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            FoxCard
          </span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          La plateforme e-commerce 100% gratuite et open source qui redéfinit le commerce en ligne.
        </p>
      </div>

      {/* Mission */}
      <Card variant="teal" className="p-12 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Démocratiser le commerce en ligne en offrant une alternative gratuite, puissante et
            accessible à tous. Nous croyons que chaque entrepreneur mérite les meilleurs outils
            pour réussir, sans barrières financières.
          </p>
        </div>
      </Card>

      {/* Values */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Card variant="teal" className="p-6 text-center">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Open Source</h3>
          <p className="text-sm text-gray-600">
            Code 100% ouvert et transparent sous licence MIT
          </p>
        </Card>

        <Card variant="pink" className="p-6 text-center">
          <div className="w-12 h-12 bg-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Gratuit</h3>
          <p className="text-sm text-gray-600">
            Vraiment gratuit, sans frais cachés ni commissions
          </p>
        </Card>

        <Card variant="yellow" className="p-6 text-center">
          <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Sécurisé</h3>
          <p className="text-sm text-gray-600">
            Protection maximale de vos données et transactions
          </p>
        </Card>

        <Card variant="blue" className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Communauté</h3>
          <p className="text-sm text-gray-600">
            Soutenue par une communauté active de développeurs
          </p>
        </Card>
      </div>

      {/* Technology Stack */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Technologies Modernes
        </h2>
        <Card className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Frontend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Next.js 14+ avec App Router</li>
                <li>• React 18+ avec TypeScript</li>
                <li>• Tailwind CSS pour le design</li>
                <li>• Zustand pour l'état global</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Backend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• tRPC pour APIs type-safe</li>
                <li>• Prisma ORM avec MongoDB</li>
                <li>• NextAuth.js pour l'authentification</li>
                <li>• Support multi-tenant natif</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl p-12 text-center text-white">
        <h2 className="text-4xl font-bold mb-4">Rejoignez la Révolution E-commerce</h2>
        <p className="text-xl mb-8 opacity-90">
          Créez votre boutique en ligne gratuitement, dès maintenant
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="https://github.com/StudioCavalli/FoxCard"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-gray-900 px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            Voir sur GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
