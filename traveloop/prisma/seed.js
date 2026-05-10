const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

async function getPexelsUrl(query) {
  try {
    if (PEXELS_API_KEY) {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
        headers: { Authorization: PEXELS_API_KEY }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.photos && data.photos.length > 0) {
          return data.photos[0].src.large;
        }
      }
    }
  } catch (err) {
    console.error(`Pexels error for ${query}:`, err.message);
  }
  return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80"; // Fallback
}

async function main() {
  console.log("Starting final seed with Pexels live images...");

  try {
    const res = await fetch("https://api.geocoded.me/countries?limit=20"); // Reducing limit slightly for faster seeding with API calls
    const json = await res.json();
    const countries = json.data || [];

    for (const country of countries) {
      if (!country.capital || country.capital === "") continue;

      const cityName = country.capital;
      
      let city = await prisma.city.findFirst({
        where: { name: cityName }
      });

      const cityImage = await getPexelsUrl(`${cityName} city landmark`);

      const cityInfo = {
        name: cityName,
        country: country.name,
        region: country.region || "Other",
        popularity: Math.floor(Math.random() * 50) + 50,
        imageUrl: cityImage
      };

      if (city) {
        city = await prisma.city.update({
          where: { id: city.id },
          data: cityInfo
        });
      } else {
        city = await prisma.city.create({
          data: cityInfo
        });
      }

      await prisma.activity.deleteMany({ where: { cityId: city.id } });
      
      const activityTemplates = [
        { name: `${city.name} City Tour`, type: "SIGHTSEEING", query: "landmark" },
        { name: `${city.name} Historical Museum`, type: "CULTURE", query: "museum" },
        { name: `Street Food in ${city.name}`, type: "FOOD_DINING", query: "street food" },
        { name: `${city.name} Central Park Walk`, type: "NATURE", query: "park" },
        { name: `${city.name} Downtown Exploration`, type: "SIGHTSEEING", query: "downtown" },
        { name: `Nightlife in ${city.name}`, type: "NIGHTLIFE", query: "nightlife" },
      ];

      for (const act of activityTemplates) {
        const activityImage = await getPexelsUrl(`${city.name} ${act.query}`);
        await prisma.activity.create({
          data: {
            name: act.name,
            type: act.type,
            cityId: city.id,
            imageUrl: activityImage,
            popularity: Math.floor(Math.random() * 100),
            description: `Experience the essence of ${city.name} with our curated ${act.type.toLowerCase()} tour.`,
          },
        });
      }
      console.log(`Seeded: ${city.name}, ${country.name} with Pexels images.`);
    }
  } catch (err) {
    console.error("Error during seeding:", err.message);
  }

  console.log("Seed finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
