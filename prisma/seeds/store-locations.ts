import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Real GPS coordinates for major cities by country
const CITY_COORDINATES: Record<string, Array<{ name: string; lat: number; lng: number }>> = {
  FR: [
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Lyon', lat: 45.7640, lng: 4.8357 },
    { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
    { name: 'Toulouse', lat: 43.6047, lng: 1.4442 },
    { name: 'Nice', lat: 43.7102, lng: 7.2620 },
    { name: 'Nantes', lat: 47.2184, lng: -1.5536 },
    { name: 'Bordeaux', lat: 44.8378, lng: -0.5792 },
    { name: 'Lille', lat: 50.6292, lng: 3.0573 },
    { name: 'Strasbourg', lat: 48.5734, lng: 7.7521 },
    { name: 'Rennes', lat: 48.1173, lng: -1.6778 },
  ],
  DE: [
    { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
    { name: 'Munich', lat: 48.1351, lng: 11.5820 },
    { name: 'Hamburg', lat: 53.5511, lng: 9.9937 },
    { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
    { name: 'Cologne', lat: 50.9375, lng: 6.9603 },
  ],
  ES: [
    { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
    { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
    { name: 'Valencia', lat: 39.4699, lng: -0.3763 },
    { name: 'Seville', lat: 37.3891, lng: -5.9845 },
    { name: 'Bilbao', lat: 43.2630, lng: -2.9350 },
  ],
  IT: [
    { name: 'Rome', lat: 41.9028, lng: 12.4964 },
    { name: 'Milan', lat: 45.4642, lng: 9.1900 },
    { name: 'Naples', lat: 40.8518, lng: 14.2681 },
    { name: 'Turin', lat: 45.0703, lng: 7.6869 },
    { name: 'Florence', lat: 43.7696, lng: 11.2558 },
  ],
  GB: [
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Manchester', lat: 53.4808, lng: -2.2426 },
    { name: 'Birmingham', lat: 52.4862, lng: -1.8904 },
    { name: 'Edinburgh', lat: 55.9533, lng: -3.1883 },
    { name: 'Glasgow', lat: 55.8642, lng: -4.2518 },
  ],
  BE: [
    { name: 'Brussels', lat: 50.8503, lng: 4.3517 },
    { name: 'Antwerp', lat: 51.2194, lng: 4.4025 },
    { name: 'Ghent', lat: 51.0543, lng: 3.7174 },
  ],
  NL: [
    { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
    { name: 'Rotterdam', lat: 51.9225, lng: 4.47917 },
    { name: 'Utrecht', lat: 52.0907, lng: 5.1214 },
  ],
  CH: [
    { name: 'Zurich', lat: 47.3769, lng: 8.5417 },
    { name: 'Geneva', lat: 46.2044, lng: 6.1432 },
    { name: 'Bern', lat: 46.9480, lng: 7.4474 },
  ],
  US: [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
    { name: 'Miami', lat: 25.7617, lng: -80.1918 },
  ],
  HU: [
    { name: 'Budapest', lat: 47.4979, lng: 19.0402 },
    { name: 'Debrecen', lat: 47.5316, lng: 21.6273 },
    { name: 'Szeged', lat: 46.2530, lng: 20.1414 },
  ],
  LT: [
    { name: 'Vilnius', lat: 54.6872, lng: 25.2797 },
    { name: 'Kaunas', lat: 54.8985, lng: 23.9036 },
    { name: 'Klaipeda', lat: 55.7033, lng: 21.1443 },
  ],
  SI: [
    { name: 'Ljubljana', lat: 46.0569, lng: 14.5058 },
    { name: 'Maribor', lat: 46.5547, lng: 15.6459 },
    { name: 'Celje', lat: 46.2397, lng: 15.2677 },
  ],
  RO: [
    { name: 'Bucharest', lat: 44.4268, lng: 26.1025 },
    { name: 'Cluj-Napoca', lat: 46.7712, lng: 23.6236 },
    { name: 'Timisoara', lat: 45.7489, lng: 21.2087 },
  ],
  BG: [
    { name: 'Sofia', lat: 42.6977, lng: 23.3219 },
    { name: 'Plovdiv', lat: 42.1354, lng: 24.7453 },
    { name: 'Varna', lat: 43.2141, lng: 27.9147 },
  ],
  HR: [
    { name: 'Zagreb', lat: 45.8150, lng: 15.9819 },
    { name: 'Split', lat: 43.5081, lng: 16.4402 },
    { name: 'Rijeka', lat: 45.3271, lng: 14.4422 },
  ],
  LV: [
    { name: 'Riga', lat: 56.9496, lng: 24.1052 },
    { name: 'Daugavpils', lat: 55.8747, lng: 26.5364 },
    { name: 'Liepaja', lat: 56.5046, lng: 21.0110 },
  ],
  PL: [
    { name: 'Warsaw', lat: 52.2297, lng: 21.0122 },
    { name: 'Krakow', lat: 50.0647, lng: 19.9450 },
    { name: 'Wroclaw', lat: 51.1079, lng: 17.0385 },
    { name: 'Gdansk', lat: 54.3520, lng: 18.6466 },
  ],
}

const STREET_NAMES = {
  FR: ['Rue de la République', 'Avenue des Champs-Élysées', 'Boulevard Saint-Germain', 'Rue du Commerce', 'Place de la Liberté'],
  DE: ['Hauptstraße', 'Bahnhofstraße', 'Kirchstraße', 'Marktplatz', 'Königstraße'],
  ES: ['Calle Mayor', 'Avenida de la Constitución', 'Plaza Mayor', 'Calle del Sol', 'Paseo de Gracia'],
  IT: ['Via Roma', 'Corso Vittorio Emanuele', 'Piazza del Duomo', 'Via Dante', 'Corso Italia'],
  GB: ['High Street', 'Station Road', 'Church Street', 'Market Place', 'King Street'],
  BE: ['Grand Place', 'Rue de la Loi', 'Avenue Louise', 'Chaussée de Charleroi', 'Rue Neuve'],
  NL: ['Hoofdstraat', 'Stationsstraat', 'Marktplein', 'Kerkstraat', 'Nieuwstraat'],
  CH: ['Bahnhofstrasse', 'Rue du Marché', 'Hauptgasse', 'Place de la Gare', 'Via Principale'],
  US: ['Main Street', 'Broadway', 'Market Street', 'Park Avenue', 'Oak Street'],
  HU: ['Andrássy út', 'Váci utca', 'Kossuth Lajos tér', 'Deák Ferenc utca', 'Petőfi Sándor utca'],
  LT: ['Gedimino prospektas', 'Vilniaus gatvė', 'Laisvės alėja', 'Maironio gatvė', 'Rotušės aikštė'],
  SI: ['Slovenska cesta', 'Čopova ulica', 'Prešernov trg', 'Mestni trg', 'Cankarjeva cesta'],
  RO: ['Calea Victoriei', 'Bulevardul Unirii', 'Strada Republicii', 'Piața Unirii', 'Bulevardul Eroilor'],
  BG: ['Булевард Витоша', 'Улица Граф Игнатиев', 'Площад Независимост', 'Улица Оборище', 'Булевард Цар Освободител'],
  HR: ['Ilica', 'Trg bana Josipa Jelačića', 'Vlaška ulica', 'Masarykova ulica', 'Tkalčićeva ulica'],
  LV: ['Brīvības iela', 'Elizabetes iela', 'Krišjāņa Barona iela', 'Rātslaukums', 'Alberta iela'],
  PL: ['Ulica Marszałkowska', 'Nowy Świat', 'Plac Zamkowy', 'Aleje Jerozolimskie', 'Krakowskie Przedmieście'],
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Add small random offset to coordinates (within ~500m radius)
function addRandomOffset(coord: number, isLat: boolean): number {
  const offset = (Math.random() - 0.5) * 0.01 // ~500m
  return Number((coord + offset).toFixed(6))
}

async function seedStoreLocations() {
  console.log('🌍 Starting store locations seed...')

  // Get all stores
  const stores = await prisma.store.findMany({
    select: {
      id: true,
      name: true,
      countries: true,
      locations: true,
    },
  })

  console.log(`📊 Found ${stores.length} stores`)

  let createdCount = 0
  let skippedCount = 0

  for (const store of stores) {
    // Skip if store already has locations
    if (store.locations && store.locations.length > 0) {
      console.log(`⏭️  Skipping ${store.name} (already has ${store.locations.length} locations)`)
      skippedCount++
      continue
    }

    // Skip if store has no countries
    if (!store.countries || store.countries.length === 0) {
      console.log(`⚠️  Skipping ${store.name} (no countries defined)`)
      skippedCount++
      continue
    }

    // Get primary country
    const primaryCountry = store.countries[0]
    const cities = CITY_COORDINATES[primaryCountry]
    const streets = STREET_NAMES[primaryCountry as keyof typeof STREET_NAMES]

    if (!cities || !streets) {
      console.log(`⚠️  No city data for country ${primaryCountry}, skipping ${store.name}`)
      skippedCount++
      continue
    }

    // Pick a random city
    const city = getRandomElement(cities)
    const streetName = getRandomElement(streets)

    // Create 1-3 locations per store
    const numLocations = getRandomNumber(1, 3)
    const locationTypes: Array<'LEGAL_ADDRESS' | 'PHYSICAL_STORE' | 'PICKUP_POINT' | 'WAREHOUSE'> =
      ['LEGAL_ADDRESS', 'PHYSICAL_STORE', 'PICKUP_POINT', 'WAREHOUSE']

    for (let i = 0; i < numLocations; i++) {
      const locationType = i === 0 ? 'LEGAL_ADDRESS' : getRandomElement(locationTypes.slice(1))
      const streetNumber = getRandomNumber(1, 200)

      const locationData = {
        storeId: store.id,
        type: locationType,
        name: i === 0 ? `${store.name} - Siège Social` : `${store.name} - ${city.name}`,
        street: `${streetNumber} ${streetName}`,
        city: city.name,
        postalCode: getRandomNumber(10000, 99999).toString(),
        country: primaryCountry,
        latitude: addRandomOffset(city.lat, true),
        longitude: addRandomOffset(city.lng, false),
        isActive: true,
        isPrimary: i === 0,
        isPublic: true,
        displayOrder: i,
      }

      await prisma.storeLocation.create({ data: locationData })
      createdCount++
    }

    console.log(`✅ Created ${numLocations} location(s) for ${store.name} in ${city.name}, ${primaryCountry}`)
  }

  console.log(`\n📈 Summary:`)
  console.log(`   ✅ Created: ${createdCount} locations`)
  console.log(`   ⏭️  Skipped: ${skippedCount} stores`)
  console.log(`\n🎉 Store locations seed completed!`)
}

seedStoreLocations()
  .catch((e) => {
    console.error('❌ Error seeding store locations:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
