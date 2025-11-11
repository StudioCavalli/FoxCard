import Link from 'next/link'
import { Facebook, Twitter, Instagram, Github, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                FoxCard
              </span>
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              La plateforme e-commerce 100% gratuite et open source qui redéfinit le commerce en ligne.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/StudioCavalli/FoxCard"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gray-700 hover:bg-primary-600 flex items-center justify-center transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-gray-700 hover:bg-blue-600 flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-gray-700 hover:bg-blue-400 flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-gray-700 hover:bg-secondary-600 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Produits
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Administration
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-lg mb-4">Catégories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=electronique" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Électronique
                </Link>
              </li>
              <li>
                <Link href="/products?category=mode" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Mode
                </Link>
              </li>
              <li>
                <Link href="/products?category=maison" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Maison & Décoration
                </Link>
              </li>
              <li>
                <Link href="/products?category=beaute" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Beauté & Santé
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <Mail className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:contact@foxcard.com" className="hover:text-primary-400 transition-colors">
                  contact@foxcard.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <Phone className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <MapPin className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <span>Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} FoxCard. Tous droits réservés. Open source sous licence MIT.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Mentions légales
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                CGV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
