import { Heart, Package, Shield, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto px-6 lg:px-8 py-16" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1
            className="text-5xl md:text-6xl font-bold text-theme-text mb-6"
            style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em' }}
          >
            À propos de{' '}
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-theme-primary to-theme-accent blur-xl opacity-30" />
              <span className="relative bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent">
                FoxCard
              </span>
            </span>
          </h1>
          <p className="text-xl text-theme-text-secondary leading-relaxed">
            La plateforme e-commerce 100% gratuite et open source qui redéfinit le commerce en ligne.
          </p>
        </div>

        {/* Mission */}
        <div className="p-12 bg-theme-surface border border-theme-border rounded-2xl mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-theme-primary/5 rounded-full blur-3xl" />
          <div className="relative max-w-3xl mx-auto text-center">
            <h2
              className="text-3xl md:text-4xl font-bold text-theme-text mb-4"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              Notre Mission
            </h2>
            <p className="text-lg text-theme-text-secondary leading-relaxed">
              Démocratiser le commerce en ligne en offrant une alternative gratuite, puissante et
              accessible à tous. Nous croyons que chaque entrepreneur mérite les meilleurs outils
              pour réussir, sans barrières financières.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="group p-6 bg-theme-surface border border-theme-border rounded-2xl text-center hover:shadow-xl hover:shadow-theme-primary/10 transition-all duration-300 hover:-translate-y-1">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-red-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3
              className="font-bold text-theme-text mb-2"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              Open Source
            </h3>
            <p className="text-sm text-theme-text-secondary">
              Code 100% ouvert et transparent sous licence MIT
            </p>
          </div>

          <div className="group p-6 bg-theme-surface border border-theme-border rounded-2xl text-center hover:shadow-xl hover:shadow-theme-primary/10 transition-all duration-300 hover:-translate-y-1">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-theme-accent/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-accent rounded-xl flex items-center justify-center mx-auto">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3
              className="font-bold text-theme-text mb-2"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              Gratuit
            </h3>
            <p className="text-sm text-theme-text-secondary">
              Vraiment gratuit, sans frais cachés ni commissions
            </p>
          </div>

          <div className="group p-6 bg-theme-surface border border-theme-border rounded-2xl text-center hover:shadow-xl hover:shadow-theme-primary/10 transition-all duration-300 hover:-translate-y-1">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-yellow-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3
              className="font-bold text-theme-text mb-2"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              Sécurisé
            </h3>
            <p className="text-sm text-theme-text-secondary">
              Protection maximale de vos données et transactions
            </p>
          </div>

          <div className="group p-6 bg-theme-surface border border-theme-border rounded-2xl text-center hover:shadow-xl hover:shadow-theme-primary/10 transition-all duration-300 hover:-translate-y-1">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3
              className="font-bold text-theme-text mb-2"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              Communauté
            </h3>
            <p className="text-sm text-theme-text-secondary">
              Soutenue par une communauté active de développeurs
            </p>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-theme-text mb-8 text-center"
            style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
          >
            Technologies Modernes
          </h2>
          <div className="p-8 bg-theme-surface border border-theme-border rounded-2xl">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3
                  className="font-bold text-theme-text text-xl mb-4"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Frontend
                </h3>
                <ul className="space-y-2 text-theme-text-secondary">
                  <li>• Next.js 14+ avec App Router</li>
                  <li>• React 18+ avec TypeScript</li>
                  <li>• Tailwind CSS pour le design</li>
                  <li>• Zustand pour l'état global</li>
                </ul>
              </div>
              <div>
                <h3
                  className="font-bold text-theme-text text-xl mb-4"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Backend
                </h3>
                <ul className="space-y-2 text-theme-text-secondary">
                  <li>• tRPC pour APIs type-safe</li>
                  <li>• Prisma ORM avec MongoDB</li>
                  <li>• NextAuth.js pour l'authentification</li>
                  <li>• Support multi-tenant natif</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="relative p-12 bg-gradient-to-r from-theme-primary to-theme-accent rounded-3xl text-center text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              Rejoignez la Révolution E-commerce
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Créez votre boutique en ligne gratuitement, dès maintenant
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://github.com/StudioCavalli/FoxCard"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                Voir sur GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
