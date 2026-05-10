import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trips = await prisma.trip.findMany({
      where: { userId: session.user.id },
      include: {
        stops: {
          include: {
            city: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(trips);
  } catch (error) {
    console.error("Trips GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, cityId, startDate, endDate, preSelectedActivityIds = [] } = body;

    if (!name || !cityId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const trip = await prisma.$transaction(async (tx) => {
      let finalCityId = cityId;

      if (cityId.startsWith("ext_")) {
        const cityName = cityId.replace("ext_", "").split("-").map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ");

        const city = await tx.city.upsert({
          where: { id: cityId },
          create: {
            id: cityId,
            name: cityName,
            country: "Global",
            region: "Other",
            popularity: 50,
          },
          update: {},
        });
        finalCityId = city.id;
      }

      const newTrip = await tx.trip.create({
        data: {
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          userId: session.user.id,
        },
      });

      const stop = await tx.stop.create({
        data: {
          tripId: newTrip.id,
          cityId: finalCityId,
          order: 1,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });

      if (preSelectedActivityIds.length > 0) {
        const realActivityIds = preSelectedActivityIds.filter(id => !id.startsWith("gen_"));
        if (realActivityIds.length > 0) {
          await tx.stopActivity.createMany({
            data: realActivityIds.map((actId) => ({
              stopId: stop.id,
              activityId: actId,
            })),
          });
        }
      }

      return newTrip;
    });

    return NextResponse.json(trip);
  } catch (error) {
    console.error("Trip Creation API Error:", error);
    return NextResponse.json({ error: "Failed to create trip: " + error.message }, { status: 500 });
  }
}
