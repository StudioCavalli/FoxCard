import { PrismaClient, CommerceType } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// Product data for each commerce type
const productData: Record<CommerceType, { name: string; slug: string; price: number; category: string; image: string }[]> = {
  ELECTRONICS: [
    { name: 'MacBook Pro 16"', slug: 'macbook-pro-16', price: 249999, category: 'laptops', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500' },
    { name: 'Dell UltraSharp 27"', slug: 'dell-ultrasharp-27', price: 59999, category: 'monitors', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500' },
    { name: 'iPhone 15 Pro', slug: 'iphone-15-pro', price: 119999, category: 'smartphones', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500' },
    { name: 'iPad Air', slug: 'ipad-air', price: 69999, category: 'tablets', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500' },
    { name: 'Apple Watch Series 9', slug: 'apple-watch-9', price: 44999, category: 'smartwatches', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500' },
    { name: 'Sony WH-1000XM5', slug: 'sony-wh1000xm5', price: 37999, category: 'headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
    { name: 'AirPods Pro 2', slug: 'airpods-pro-2', price: 27999, category: 'earbuds', image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500' },
    { name: 'Canon EOS R6', slug: 'canon-eos-r6', price: 249999, category: 'digital-cameras', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500' },
  ],
  FASHION: [
    { name: 'T-Shirt Premium Coton', slug: 'tshirt-premium-coton', price: 2999, category: 'mens-tshirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500' },
    { name: 'Jean Slim Fit', slug: 'jean-slim-fit', price: 7999, category: 'mens-pants', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500' },
    { name: 'Robe Elegante Noire', slug: 'robe-elegante-noire', price: 12999, category: 'womens-dresses', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500' },
    { name: 'Blazer Femme', slug: 'blazer-femme', price: 14999, category: 'womens-outerwear', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500' },
    { name: 'Sneakers Urban', slug: 'sneakers-urban', price: 9999, category: 'sneakers', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' },
    { name: 'Sac a Main Cuir', slug: 'sac-main-cuir', price: 15999, category: 'bags-purses', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500' },
    { name: 'Montre Classique', slug: 'montre-classique', price: 19999, category: 'watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500' },
    { name: 'Ceinture Cuir', slug: 'ceinture-cuir', price: 4999, category: 'belts', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' },
  ],
  HOME: [
    { name: 'Canape 3 Places', slug: 'canape-3-places', price: 89999, category: 'living-room-furniture', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500' },
    { name: 'Lit King Size', slug: 'lit-king-size', price: 79999, category: 'bedroom-furniture', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500' },
    { name: 'Bureau Design', slug: 'bureau-design', price: 34999, category: 'office-furniture', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500' },
    { name: 'Lampe Design', slug: 'lampe-design', price: 12999, category: 'lighting', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500' },
    { name: 'Tapis Berbere', slug: 'tapis-berbere', price: 24999, category: 'rugs-carpets', image: 'https://images.unsplash.com/photo-1531835551805-16d864c8d311?w=500' },
    { name: 'Kit Outils Jardin', slug: 'kit-outils-jardin', price: 4999, category: 'garden-tools', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500' },
  ],
  BEAUTY: [
    { name: 'Serum Vitamine C', slug: 'serum-vitamine-c', price: 3999, category: 'skincare-products', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500' },
    { name: 'Shampoing Bio', slug: 'shampoing-bio', price: 1499, category: 'hair-care-products', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500' },
    { name: 'Fond de Teint', slug: 'fond-de-teint', price: 4499, category: 'face-makeup', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500' },
    { name: 'Palette Ombres', slug: 'palette-ombres', price: 5999, category: 'eye-makeup', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500' },
    { name: 'Rouge a Levres Mat', slug: 'rouge-levres-mat', price: 2499, category: 'lip-products', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500' },
    { name: 'Multivitamines', slug: 'multivitamines', price: 2999, category: 'vitamins-minerals', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500' },
  ],
  SPORTS: [
    { name: 'Halteres 10kg', slug: 'halteres-10kg', price: 4999, category: 'weights-resistance-bands', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500' },
    { name: 'Tapis de Course', slug: 'tapis-course', price: 79999, category: 'cardio-machines', image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500' },
    { name: 'Tente 4 Personnes', slug: 'tente-4-personnes', price: 19999, category: 'camping-equipment', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500' },
    { name: 'Chaussures Randonnee', slug: 'chaussures-randonnee', price: 12999, category: 'hiking-gear', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=500' },
    { name: 'Ballon Football Pro', slug: 'ballon-football-pro', price: 3999, category: 'balls', image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=500' },
  ],
  TOYS: [
    { name: 'LEGO Star Wars', slug: 'lego-star-wars', price: 7999, category: 'action-figures', image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500' },
    { name: 'Poupee Interactive', slug: 'poupee-interactive', price: 4999, category: 'dolls-plush-toys', image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500' },
    { name: 'Monopoly Edition Deluxe', slug: 'monopoly-deluxe', price: 3999, category: 'board-games-puzzles', image: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=500' },
    { name: 'PlayStation 5', slug: 'playstation-5', price: 49999, category: 'video-games-consoles', image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500' },
  ],
  AUTOMOTIVE: [
    { name: 'Pneus Michelin 205/55', slug: 'pneus-michelin', price: 12999, category: 'tires-wheels', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500' },
    { name: 'Dashcam 4K', slug: 'dashcam-4k', price: 14999, category: 'car-electronics', image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=500' },
    { name: 'Perceuse Sans Fil', slug: 'perceuse-sans-fil', price: 14999, category: 'power-tools', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500' },
    { name: 'Kit Tournevis Pro', slug: 'kit-tournevis-pro', price: 4999, category: 'hand-tools', image: 'https://images.unsplash.com/photo-1586864387789-628af9feed72?w=500' },
  ],
  BOOKS: [
    { name: 'Le Petit Prince', slug: 'le-petit-prince', price: 999, category: 'fiction-non-fiction', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500' },
    { name: 'Dictionnaire Larousse', slug: 'dictionnaire-larousse', price: 2999, category: 'textbooks', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500' },
    { name: 'Carnet Moleskine', slug: 'carnet-moleskine', price: 1999, category: 'notebooks', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500' },
    { name: 'Stylo Mont Blanc', slug: 'stylo-mont-blanc', price: 39999, category: 'writing-instruments', image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500' },
  ],
  PETS: [
    { name: 'Croquettes Premium Chien', slug: 'croquettes-chien', price: 4999, category: 'pet-food', image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=500' },
    { name: 'Arbre a Chat Deluxe', slug: 'arbre-chat', price: 8999, category: 'pet-accessories', image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500' },
    { name: 'Antiparasitaire', slug: 'antiparasitaire', price: 2999, category: 'pet-health-products', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500' },
  ],
  FOOD: [
    { name: 'Chips Artisanales', slug: 'chips-artisanales', price: 499, category: 'snacks', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500' },
    { name: 'Jus Orange Presse', slug: 'jus-orange', price: 399, category: 'beverages', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500' },
    { name: 'Huile Olive Extra Vierge', slug: 'huile-olive', price: 1299, category: 'cooking-ingredients', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500' },
  ],
  ALCOHOL: [
    { name: 'Chateau Margaux 2018', slug: 'chateau-margaux', price: 34999, category: 'red-wine', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500' },
    { name: 'Chablis Premier Cru', slug: 'chablis-premier-cru', price: 2999, category: 'white-wine', image: 'https://images.unsplash.com/photo-1566754436309-f0e7e27c5d4c?w=500' },
    { name: 'Whisky Macallan 18', slug: 'whisky-macallan-18', price: 24999, category: 'whisky', image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=500' },
    { name: 'Gin Hendricks', slug: 'gin-hendricks', price: 3999, category: 'gin', image: 'https://images.unsplash.com/photo-1608885898957-a559228e8749?w=500' },
  ],
  DIGITAL: [
    { name: 'Pack Adobe Creative', slug: 'pack-adobe', price: 5999, category: 'software-applications', image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500' },
    { name: 'Formation Web Dev', slug: 'formation-web-dev', price: 19999, category: 'online-courses', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500' },
    { name: 'E-book Marketing', slug: 'ebook-marketing', price: 1999, category: 'ebooks', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500' },
  ],
  SERVICES: [
    { name: 'Netflix 1 An', slug: 'netflix-1-an', price: 15588, category: 'subscription-services', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500' },
    { name: 'Carte Cadeau 50€', slug: 'carte-cadeau-50', price: 5000, category: 'gift-cards', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500' },
  ],
  SEASONAL: [
    { name: 'Sapin de Noel 180cm', slug: 'sapin-noel-180', price: 7999, category: 'holiday-decorations', image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=500' },
    { name: 'Guirlandes LED', slug: 'guirlandes-led', price: 1999, category: 'holiday-decorations', image: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?w=500' },
    { name: 'Pull Noel', slug: 'pull-noel', price: 2999, category: 'seasonal-clothing', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500' },
  ],
  RESTAURANT: [
    { name: 'Menu Gastronomique', slug: 'menu-gastronomique', price: 8999, category: 'fine-dining', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500' },
    { name: 'Pizza Margherita', slug: 'pizza-margherita', price: 1499, category: 'italian', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500' },
    { name: 'Sushi Box 24pcs', slug: 'sushi-box-24', price: 3499, category: 'asian', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500' },
    { name: 'Menu Vegan', slug: 'menu-vegan', price: 1999, category: 'vegetarian-vegan', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500' },
  ],
  HOTEL: [
    { name: 'Chambre Deluxe', slug: 'chambre-deluxe', price: 15999, category: 'hotels', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500' },
    { name: 'Suite Prestige', slug: 'suite-prestige', price: 35999, category: 'hotels', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500' },
    { name: 'Chambre B&B', slug: 'chambre-bb', price: 7999, category: 'bed-breakfasts', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500' },
    { name: 'Appartement Vacances', slug: 'appartement-vacances', price: 12999, category: 'vacation-rentals', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500' },
  ],
  TRAVEL: [
    { name: 'Vol Paris-NYC', slug: 'vol-paris-nyc', price: 45999, category: 'flights', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500' },
    { name: 'Eurostar Paris-Londres', slug: 'eurostar-paris-londres', price: 8999, category: 'trains', image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=500' },
    { name: 'Location SUV 7 jours', slug: 'location-suv-7j', price: 34999, category: 'car-rentals', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500' },
    { name: 'Sejour All-Inclusive', slug: 'sejour-all-inclusive', price: 129999, category: 'all-inclusive-resorts', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500' },
    { name: 'Valise Cabine', slug: 'valise-cabine', price: 9999, category: 'luggage-bags', image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=500' },
  ],
  RECREATION: [
    { name: 'Randonnee Guidee', slug: 'randonnee-guidee', price: 4999, category: 'hiking-camping', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=500' },
    { name: 'Location VTT', slug: 'location-vtt', price: 2999, category: 'biking-cycling', image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=500' },
    { name: 'Cours Surf', slug: 'cours-surf', price: 5999, category: 'water-sports', image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=500' },
    { name: 'Escape Room 4 pers', slug: 'escape-room-4', price: 7999, category: 'escape-rooms', image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500' },
    { name: 'Entree Musee', slug: 'entree-musee', price: 1499, category: 'museums-galleries', image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=500' },
    { name: 'Billet Concert', slug: 'billet-concert', price: 5999, category: 'concerts-festivals', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500' },
  ],
  GENERAL: [
    { name: 'Produit Generique', slug: 'produit-generique', price: 999, category: 'products', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
  ],
}

// Category data for each commerce type
const categoryData: Record<CommerceType, { name: string; slug: string; children: { name: string; slug: string }[] }[]> = {
  ELECTRONICS: [
    { name: 'Computers & Accessories', slug: 'computers-accessories', children: [
      { name: 'Laptops', slug: 'laptops' },
      { name: 'Desktops', slug: 'desktops' },
      { name: 'Monitors', slug: 'monitors' },
      { name: 'Keyboards & Mice', slug: 'keyboards-mice' },
      { name: 'External Drives', slug: 'external-drives' },
      { name: 'Networking Equipment', slug: 'networking-equipment' },
    ]},
    { name: 'Mobile Devices', slug: 'mobile-devices', children: [
      { name: 'Smartphones', slug: 'smartphones' },
      { name: 'Tablets', slug: 'tablets' },
      { name: 'Smartwatches', slug: 'smartwatches' },
    ]},
    { name: 'Home Appliances', slug: 'home-appliances', children: [
      { name: 'Refrigerators', slug: 'refrigerators' },
      { name: 'Washing Machines', slug: 'washing-machines' },
      { name: 'Microwave Ovens', slug: 'microwave-ovens' },
      { name: 'Coffee Makers', slug: 'coffee-makers' },
    ]},
    { name: 'Audio & Headphones', slug: 'audio-headphones', children: [
      { name: 'Speakers', slug: 'speakers' },
      { name: 'Headphones', slug: 'headphones' },
      { name: 'Earbuds', slug: 'earbuds' },
      { name: 'Home Theater Systems', slug: 'home-theater-systems' },
    ]},
    { name: 'Cameras & Photography', slug: 'cameras-photography', children: [
      { name: 'Digital Cameras', slug: 'digital-cameras' },
      { name: 'Camcorders', slug: 'camcorders' },
      { name: 'Lenses', slug: 'lenses' },
      { name: 'Tripods & Accessories', slug: 'tripods-accessories' },
    ]},
  ],
  FASHION: [
    { name: "Men's Clothing", slug: 'mens-clothing', children: [
      { name: 'T-Shirts', slug: 'mens-tshirts' },
      { name: 'Pants', slug: 'mens-pants' },
      { name: 'Suits', slug: 'mens-suits' },
      { name: 'Jackets', slug: 'mens-jackets' },
    ]},
    { name: "Women's Clothing", slug: 'womens-clothing', children: [
      { name: 'Dresses', slug: 'womens-dresses' },
      { name: 'Tops', slug: 'womens-tops' },
      { name: 'Skirts', slug: 'womens-skirts' },
      { name: 'Outerwear', slug: 'womens-outerwear' },
    ]},
    { name: 'Footwear', slug: 'footwear', children: [
      { name: 'Sneakers', slug: 'sneakers' },
      { name: 'Boots', slug: 'boots' },
      { name: 'Sandals', slug: 'sandals' },
    ]},
    { name: 'Accessories', slug: 'accessories', children: [
      { name: 'Bags & Purses', slug: 'bags-purses' },
      { name: 'Belts', slug: 'belts' },
      { name: 'Jewelry', slug: 'jewelry' },
    ]},
    { name: 'Watches', slug: 'watches', children: [] },
  ],
  HOME: [
    { name: 'Furniture', slug: 'furniture', children: [
      { name: 'Living Room Furniture', slug: 'living-room-furniture' },
      { name: 'Bedroom Furniture', slug: 'bedroom-furniture' },
      { name: 'Office Furniture', slug: 'office-furniture' },
    ]},
    { name: 'Home Decor', slug: 'home-decor', children: [
      { name: 'Lighting', slug: 'lighting' },
      { name: 'Rugs & Carpets', slug: 'rugs-carpets' },
      { name: 'Wall Art & Mirrors', slug: 'wall-art-mirrors' },
    ]},
    { name: 'Garden Supplies', slug: 'garden-supplies', children: [
      { name: 'Plants & Seeds', slug: 'plants-seeds' },
      { name: 'Garden Tools', slug: 'garden-tools' },
      { name: 'Outdoor Furniture', slug: 'outdoor-furniture' },
    ]},
  ],
  BEAUTY: [
    { name: 'Personal Care', slug: 'personal-care', children: [
      { name: 'Skincare Products', slug: 'skincare-products' },
      { name: 'Hair Care Products', slug: 'hair-care-products' },
      { name: 'Oral Care Products', slug: 'oral-care-products' },
    ]},
    { name: 'Makeup', slug: 'makeup', children: [
      { name: 'Face Makeup', slug: 'face-makeup' },
      { name: 'Eye Makeup', slug: 'eye-makeup' },
      { name: 'Lip Products', slug: 'lip-products' },
    ]},
    { name: 'Health Supplements', slug: 'health-supplements', children: [
      { name: 'Vitamins & Minerals', slug: 'vitamins-minerals' },
      { name: 'Protein Powders', slug: 'protein-powders' },
    ]},
  ],
  SPORTS: [
    { name: 'Fitness Equipment', slug: 'fitness-equipment', children: [
      { name: 'Weights & Resistance Bands', slug: 'weights-resistance-bands' },
      { name: 'Cardio Machines', slug: 'cardio-machines' },
    ]},
    { name: 'Outdoor Gear', slug: 'outdoor-gear', children: [
      { name: 'Camping Equipment', slug: 'camping-equipment' },
      { name: 'Hiking Gear', slug: 'hiking-gear' },
    ]},
    { name: 'Team Sports Equipment', slug: 'team-sports-equipment', children: [
      { name: 'Balls', slug: 'balls' },
      { name: 'Protective Gear', slug: 'protective-gear' },
    ]},
  ],
  TOYS: [
    { name: "Kids' Toys", slug: 'kids-toys', children: [
      { name: 'Action Figures', slug: 'action-figures' },
      { name: 'Dolls & Plush Toys', slug: 'dolls-plush-toys' },
    ]},
    { name: 'Board Games & Puzzles', slug: 'board-games-puzzles', children: [] },
    { name: 'Video Games & Consoles', slug: 'video-games-consoles', children: [] },
  ],
  AUTOMOTIVE: [
    { name: 'Automotive Parts & Accessories', slug: 'automotive-parts-accessories', children: [
      { name: 'Tires & Wheels', slug: 'tires-wheels' },
      { name: 'Car Electronics', slug: 'car-electronics' },
    ]},
    { name: 'Tools & Home Improvement', slug: 'tools-home-improvement', children: [
      { name: 'Power Tools', slug: 'power-tools' },
      { name: 'Hand Tools', slug: 'hand-tools' },
    ]},
  ],
  BOOKS: [
    { name: 'Books', slug: 'books', children: [
      { name: 'Fiction & Non-Fiction', slug: 'fiction-non-fiction' },
      { name: 'Textbooks', slug: 'textbooks' },
    ]},
    { name: 'Stationery Supplies', slug: 'stationery-supplies', children: [
      { name: 'Notebooks', slug: 'notebooks' },
      { name: 'Writing Instruments', slug: 'writing-instruments' },
    ]},
  ],
  PETS: [
    { name: 'Pet Food', slug: 'pet-food', children: [] },
    { name: 'Pet Accessories', slug: 'pet-accessories', children: [] },
    { name: 'Pet Health Products', slug: 'pet-health-products', children: [] },
  ],
  FOOD: [
    { name: 'Snacks', slug: 'snacks', children: [] },
    { name: 'Beverages', slug: 'beverages', children: [] },
    { name: 'Cooking Ingredients', slug: 'cooking-ingredients', children: [] },
  ],
  ALCOHOL: [
    { name: 'Wines', slug: 'wines', children: [
      { name: 'Red Wine', slug: 'red-wine' },
      { name: 'White Wine', slug: 'white-wine' },
      { name: 'Rose Wine', slug: 'rose-wine' },
    ]},
    { name: 'Spirits', slug: 'spirits', children: [
      { name: 'Whisky', slug: 'whisky' },
      { name: 'Vodka', slug: 'vodka' },
      { name: 'Gin', slug: 'gin' },
    ]},
    { name: 'Beers', slug: 'beers', children: [] },
  ],
  DIGITAL: [
    { name: 'E-books', slug: 'ebooks', children: [] },
    { name: 'Software & Applications', slug: 'software-applications', children: [] },
    { name: 'Online Courses', slug: 'online-courses', children: [] },
  ],
  SERVICES: [
    { name: 'Subscription Services', slug: 'subscription-services', children: [] },
    { name: 'Gift Cards', slug: 'gift-cards', children: [] },
  ],
  SEASONAL: [
    { name: 'Holiday Decorations', slug: 'holiday-decorations', children: [] },
    { name: 'Seasonal Clothing', slug: 'seasonal-clothing', children: [] },
  ],
  RESTAURANT: [
    { name: 'Restaurants', slug: 'restaurants', children: [
      { name: 'Fine Dining', slug: 'fine-dining' },
      { name: 'Casual Dining', slug: 'casual-dining' },
      { name: 'Fast Food', slug: 'fast-food' },
      { name: 'Cafes & Bakeries', slug: 'cafes-bakeries' },
    ]},
    { name: 'Cuisines', slug: 'cuisines', children: [
      { name: 'Italian', slug: 'italian' },
      { name: 'Asian', slug: 'asian' },
      { name: 'Mexican', slug: 'mexican' },
      { name: 'Mediterranean', slug: 'mediterranean' },
    ]},
    { name: 'Special Dietary Options', slug: 'special-dietary', children: [
      { name: 'Vegetarian & Vegan', slug: 'vegetarian-vegan' },
      { name: 'Gluten-Free', slug: 'gluten-free' },
      { name: 'Organic', slug: 'organic' },
    ]},
  ],
  HOTEL: [
    { name: 'Types of Accommodations', slug: 'accommodations', children: [
      { name: 'Hotels', slug: 'hotels' },
      { name: 'Motels', slug: 'motels' },
      { name: 'Bed & Breakfasts', slug: 'bed-breakfasts' },
      { name: 'Hostels', slug: 'hostels' },
      { name: 'Vacation Rentals', slug: 'vacation-rentals' },
    ]},
    { name: 'Amenities', slug: 'amenities', children: [
      { name: 'Pool & Spa Facilities', slug: 'pool-spa' },
      { name: 'Conference Rooms', slug: 'conference-rooms' },
      { name: 'Restaurants & Bars', slug: 'restaurants-bars' },
    ]},
  ],
  TRAVEL: [
    { name: 'Transportation', slug: 'transportation', children: [
      { name: 'Flights', slug: 'flights' },
      { name: 'Trains', slug: 'trains' },
      { name: 'Car Rentals', slug: 'car-rentals' },
      { name: 'Buses & Coaches', slug: 'buses-coaches' },
    ]},
    { name: 'Travel Packages', slug: 'travel-packages', children: [
      { name: 'All-Inclusive Resorts', slug: 'all-inclusive-resorts' },
      { name: 'Guided Tours', slug: 'guided-tours' },
      { name: 'Adventure Travel', slug: 'adventure-travel' },
    ]},
    { name: 'Travel Accessories', slug: 'travel-accessories', children: [
      { name: 'Luggage & Bags', slug: 'luggage-bags' },
      { name: 'Travel Gadgets', slug: 'travel-gadgets' },
    ]},
  ],
  RECREATION: [
    { name: 'Outdoor Activities', slug: 'outdoor-activities', children: [
      { name: 'Hiking & Camping', slug: 'hiking-camping' },
      { name: 'Biking & Cycling', slug: 'biking-cycling' },
      { name: 'Water Sports', slug: 'water-sports' },
    ]},
    { name: 'Indoor Activities', slug: 'indoor-activities', children: [
      { name: 'Bowling & Billiards', slug: 'bowling-billiards' },
      { name: 'Escape Rooms', slug: 'escape-rooms' },
      { name: 'Trampoline Parks', slug: 'trampoline-parks' },
    ]},
    { name: 'Cultural Activities', slug: 'cultural-activities', children: [
      { name: 'Museums & Galleries', slug: 'museums-galleries' },
      { name: 'Concerts & Festivals', slug: 'concerts-festivals' },
      { name: 'Theater & Performing Arts', slug: 'theater-performing-arts' },
    ]},
  ],
  GENERAL: [
    { name: 'Products', slug: 'products', children: [] },
    { name: 'Services', slug: 'services', children: [] },
  ],
}

// Demo stores configuration
const demoStores = [
  { name: 'TechZone Electronics', slug: 'techzone', domain: 'techzone.foxcard.demo', description: 'Your one-stop shop for the latest electronics and gadgets', commerceType: 'ELECTRONICS' as CommerceType, merchantEmail: 'merchant.tech@foxcard.demo', merchantName: 'Alex Tech', country: 'FR', currency: 'EUR' },
  { name: 'Urban Style Fashion', slug: 'urban-style', domain: 'urbanstyle.foxcard.demo', description: 'Trendy fashion for modern lifestyles', commerceType: 'FASHION' as CommerceType, merchantEmail: 'merchant.fashion@foxcard.demo', merchantName: 'Sophie Mode', country: 'FR', currency: 'EUR' },
  { name: 'Casa & Garden', slug: 'casa-garden', domain: 'casagarden.foxcard.demo', description: 'Beautiful furniture and garden supplies for your home', commerceType: 'HOME' as CommerceType, merchantEmail: 'merchant.home@foxcard.demo', merchantName: 'Marc Maison', country: 'ES', currency: 'EUR' },
  { name: 'Glow Beauty', slug: 'glow-beauty', domain: 'glowbeauty.foxcard.demo', description: 'Premium skincare, makeup and wellness products', commerceType: 'BEAUTY' as CommerceType, merchantEmail: 'merchant.beauty@foxcard.demo', merchantName: 'Emma Beaute', country: 'FR', currency: 'EUR' },
  { name: 'SportMax Outdoor', slug: 'sportmax', domain: 'sportmax.foxcard.demo', description: 'Equipment for athletes and outdoor enthusiasts', commerceType: 'SPORTS' as CommerceType, merchantEmail: 'merchant.sports@foxcard.demo', merchantName: 'Lucas Sport', country: 'DE', currency: 'EUR' },
  { name: 'ToyWorld Kids', slug: 'toyworld', domain: 'toyworld.foxcard.demo', description: 'Toys, games and fun for all ages', commerceType: 'TOYS' as CommerceType, merchantEmail: 'merchant.toys@foxcard.demo', merchantName: 'Marie Jouets', country: 'FR', currency: 'EUR' },
  { name: 'AutoParts Plus', slug: 'autoparts-plus', domain: 'autoparts.foxcard.demo', description: 'Quality automotive parts and tools', commerceType: 'AUTOMOTIVE' as CommerceType, merchantEmail: 'merchant.auto@foxcard.demo', merchantName: 'Pierre Auto', country: 'FR', currency: 'EUR' },
  { name: 'BookHaven', slug: 'bookhaven', domain: 'bookhaven.foxcard.demo', description: 'Books and stationery for curious minds', commerceType: 'BOOKS' as CommerceType, merchantEmail: 'merchant.books@foxcard.demo', merchantName: 'Claire Livres', country: 'GB', currency: 'GBP' },
  { name: 'PetPals Store', slug: 'petpals', domain: 'petpals.foxcard.demo', description: 'Everything your furry friends need', commerceType: 'PETS' as CommerceType, merchantEmail: 'merchant.pets@foxcard.demo', merchantName: 'Thomas Animaux', country: 'FR', currency: 'EUR' },
  { name: 'FreshMart Grocery', slug: 'freshmart', domain: 'freshmart.foxcard.demo', description: 'Fresh groceries and gourmet food delivered', commerceType: 'FOOD' as CommerceType, merchantEmail: 'merchant.food@foxcard.demo', merchantName: 'Julie Fresh', country: 'FR', currency: 'EUR' },
  { name: 'Cave des Vignerons', slug: 'cave-vignerons', domain: 'cavevignerons.foxcard.demo', description: 'Fine wines and spirits from around the world', commerceType: 'ALCOHOL' as CommerceType, merchantEmail: 'merchant.wine@foxcard.demo', merchantName: 'Antoine Vins', country: 'FR', currency: 'EUR' },
  { name: 'DigiStore', slug: 'digistore', domain: 'digistore.foxcard.demo', description: 'Digital products, software and online courses', commerceType: 'DIGITAL' as CommerceType, merchantEmail: 'merchant.digital@foxcard.demo', merchantName: 'Nicolas Digital', country: 'US', currency: 'USD' },
  { name: 'Fetes & Saisons', slug: 'fetes-saisons', domain: 'fetes-saisons.foxcard.demo', description: 'Decorations and seasonal products for all occasions', commerceType: 'SEASONAL' as CommerceType, merchantEmail: 'merchant.seasonal@foxcard.demo', merchantName: 'Noel Saisons', country: 'FR', currency: 'EUR' },
  { name: 'Saveurs du Monde', slug: 'saveurs-monde', domain: 'saveurs-monde.foxcard.demo', description: 'Restaurant delivery and gourmet food experiences', commerceType: 'RESTAURANT' as CommerceType, merchantEmail: 'merchant.restaurant@foxcard.demo', merchantName: 'Chef Martin', country: 'FR', currency: 'EUR' },
  { name: 'StayEasy Hotels', slug: 'stayeasy', domain: 'stayeasy.foxcard.demo', description: 'Hotels and accommodations booking platform', commerceType: 'HOTEL' as CommerceType, merchantEmail: 'merchant.hotel@foxcard.demo', merchantName: 'Henri Hotelier', country: 'FR', currency: 'EUR' },
  { name: 'Voyage Express', slug: 'voyage-express', domain: 'voyage-express.foxcard.demo', description: 'Book flights, trains, car rentals and travel packages', commerceType: 'TRAVEL' as CommerceType, merchantEmail: 'merchant.travel@foxcard.demo', merchantName: 'Paul Voyageur', country: 'FR', currency: 'EUR' },
  { name: 'FunZone Activities', slug: 'funzone', domain: 'funzone.foxcard.demo', description: 'Book outdoor, indoor and cultural activities', commerceType: 'RECREATION' as CommerceType, merchantEmail: 'merchant.recreation@foxcard.demo', merchantName: 'Laura Loisirs', country: 'FR', currency: 'EUR' },
]

async function cleanDatabase() {
  console.log('🧹 Cleaning database...')
  try { await prisma.orderItem.deleteMany({}) } catch {}
  try { await prisma.order.deleteMany({}) } catch {}
  try { await prisma.productVariant.deleteMany({}) } catch {}
  try { await prisma.product.deleteMany({}) } catch {}
  try { await prisma.category.deleteMany({ where: { parentId: { not: null } } }) } catch {}
  try { await prisma.category.deleteMany({}) } catch {}
  try { await prisma.customer.deleteMany({}) } catch {}
  try { await prisma.discountCode.deleteMany({}) } catch {}
  try { await prisma.shippingZone.deleteMany({}) } catch {}
  try { await prisma.storeUser.deleteMany({}) } catch {}
  try { await prisma.suspensionAppeal.deleteMany({}) } catch {}
  try { await prisma.auditLog.deleteMany({}) } catch {}
  try { await prisma.store.deleteMany({}) } catch {}
  await prisma.user.deleteMany({ where: { role: { not: 'SUPER_ADMIN' } } })
  console.log('✅ Database cleaned')
}

async function createCategoriesForStore(storeId: string, commerceType: CommerceType): Promise<Record<string, string>> {
  const categories = categoryData[commerceType] || categoryData.GENERAL
  const categoryMap: Record<string, string> = {}

  for (const cat of categories) {
    const parentCategory = await prisma.category.create({
      data: { storeId, name: cat.name, slug: cat.slug, description: `${cat.name} category` }
    })
    categoryMap[cat.slug] = parentCategory.id

    for (const child of cat.children) {
      const childCat = await prisma.category.create({
        data: { storeId, name: child.name, slug: child.slug, parentId: parentCategory.id, description: `${child.name} subcategory` }
      })
      categoryMap[child.slug] = childCat.id
    }
  }
  return categoryMap
}

async function createProductsForStore(storeId: string, commerceType: CommerceType, categoryMap: Record<string, string>) {
  const products = productData[commerceType] || productData.GENERAL
  let count = 0

  for (const prod of products) {
    const categoryId = categoryMap[prod.category]
    if (!categoryId) continue

    await prisma.product.create({
      data: {
        storeId,
        name: prod.name,
        slug: prod.slug,
        description: `${prod.name} - Produit de qualite`,
        price: prod.price,
        quantity: Math.floor(Math.random() * 100) + 10,
        images: [prod.image],
        thumbnail: prod.image,
        status: 'ACTIVE',
        featured: Math.random() > 0.7,
        sku: `${commerceType.substring(0, 3)}-${prod.slug.substring(0, 5)}-${Math.floor(Math.random() * 1000)}`,
        categoryId,
      }
    })
    count++
  }
  return count
}

async function main() {
  console.log('🌱 Starting FoxCard complete seed...')
  await cleanDatabase()

  const hashedPassword = await hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@foxcard.com' },
    update: {},
    create: { email: 'admin@foxcard.com', name: 'Super Admin', password: hashedPassword, role: 'SUPER_ADMIN' },
  })
  console.log('✅ Admin user ready:', adminUser.email)

  let totalProducts = 0

  for (const storeConfig of demoStores) {
    const merchant = await prisma.user.create({
      data: { email: storeConfig.merchantEmail, name: storeConfig.merchantName, password: hashedPassword, role: 'ADMIN' }
    })

    const store = await prisma.store.create({
      data: {
        name: storeConfig.name,
        slug: storeConfig.slug,
        domain: storeConfig.domain,
        description: storeConfig.description,
        commerceType: storeConfig.commerceType,
        ownerId: merchant.id,
        status: 'ACTIVE',
        showOnDirectory: true,
        settings: {
          locale: storeConfig.country === 'GB' ? 'en' : storeConfig.country === 'US' ? 'en' : storeConfig.country === 'ES' ? 'es' : storeConfig.country === 'DE' ? 'de' : 'fr',
          country: storeConfig.country,
          currency: storeConfig.currency,
        },
      }
    })

    const categoryMap = await createCategoriesForStore(store.id, storeConfig.commerceType)
    const productCount = await createProductsForStore(store.id, storeConfig.commerceType, categoryMap)
    totalProducts += productCount

    console.log(`✅ ${store.name} (${storeConfig.commerceType}): ${Object.keys(categoryMap).length} categories, ${productCount} products`)
  }

  console.log('\n🎉 Seed completed successfully!')
  console.log(`📊 Created ${demoStores.length} stores with ${totalProducts} products total`)
  console.log('\n🔐 Admin: admin@foxcard.com / admin123')
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
