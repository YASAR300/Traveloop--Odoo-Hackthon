import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Default seeded cities if no search
    if (!search || search.length < 2) {
      const cities = await prisma.city.findMany({
        orderBy: { popularity: "desc" },
        take: 10,
      });
      return NextResponse.json(cities);
    }

    // Live search from geocoded.me
    const externalRes = await fetch(`https://api.geocoded.me/search?q=${encodeURIComponent(search)}&type=city&limit=10`);
    
    if (!externalRes.ok) {
      throw new Error("External API failed");
    }

    const externalData = await externalRes.json();
    const liveCities = externalData.data || [];

    const mappedCities = liveCities.map(city => {
      // Use slug for easier identification in Activities API
      const slug = city.name.toLowerCase().replace(/\s+/g, '-');
      return {
        id: `ext_${slug}`,
        name: city.name,
        country: city.countryName || city.countryCode,
        region: city.region || "Other",
        isExternal: true
      };
    });

    return NextResponse.json(mappedCities);
  } catch (error) {
    console.error("Cities API Error:", error);
    // Local fallback
    const search = new URL(request.url).searchParams.get("search") || "";
    const localCities = await prisma.city.findMany({
      where: {
        name: { contains: search, mode: "insensitive" }
      },
      take: 10
    });
    return NextResponse.json(localCities);
  }
}
