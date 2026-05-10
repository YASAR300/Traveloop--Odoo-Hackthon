import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("cityId");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "6");

    let activities = [];

    if (search) {
      activities = await prisma.activity.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ]
        },
        include: { city: true },
        take: limit,
      });
    } else if (cityId) {
      activities = await prisma.activity.findMany({
        where: { cityId },
        include: { city: true },
        orderBy: { popularity: "desc" },
        take: limit,
      });
    } else {
      activities = await prisma.activity.findMany({
        include: { city: true },
        orderBy: { popularity: "desc" },
        take: limit,
      });
    }

    if (activities.length === 0) {
      // Extract city name from ID (ext_city-name -> City Name)
      const cityName = cityId.replace("ext_", "").split("-").map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(" ");

      const templates = [
        { name: "Famous Landmarks", type: "SIGHTSEEING", query: "landmark" },
        { name: "Local Street Food", type: "FOOD_DINING", query: "food" },
        { name: "Historical Museum", type: "CULTURE", query: "museum" },
        { name: "Beautiful Gardens", type: "NATURE", query: "nature" },
        { name: "Downtown Highlights", type: "SIGHTSEEING", query: "city" },
        { name: "Nightlife Highlights", type: "NIGHTLIFE", query: "nightlife" },
      ];

      const activityPromises = templates.map(async (t, i) => {
        // High-quality dynamic fallback using Unsplash
        let imageUrl = `https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80`;
        
        try {
          if (PEXELS_API_KEY) {
            const pexelsRes = await fetch(
              `https://api.pexels.com/v1/search?query=${encodeURIComponent(cityName + " " + t.query)}&per_page=1`,
              {
                headers: { Authorization: PEXELS_API_KEY },
                next: { revalidate: 3600 } // Cache for 1 hour
              }
            );
            if (pexelsRes.ok) {
              const data = await pexelsRes.json();
              if (data.photos && data.photos.length > 0) {
                imageUrl = data.photos[0].src.large;
              } else {
                // If no specific photo, use a keyword-based Unsplash photo
                imageUrl = `https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&q=80&w=800`;
              }
            }
          }
        } catch (err) {
          console.error(`Pexels error for ${t.name}:`, err);
        }

        return {
          id: `gen_${cityId}_${i}`,
          name: `${cityName} ${t.name}`,
          type: t.type,
          imageUrl,
          popularity: 95 - i * 5,
          description: `Experience the best of ${cityName} with this premium ${t.type.toLowerCase()} experience.`
        };
      });

      activities = await Promise.all(activityPromises);
    }

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Activities API Error:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}
