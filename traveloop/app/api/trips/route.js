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
            stopActivities: {
              include: {
                activity: true
              }
            },
          },
          orderBy: { order: "asc" }
        },
        sections: {
          include: {
            sectionBudgets: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const tripsWithMetadata = trips.map(trip => {
      const citiesCount = trip.stops.length;
      const activitiesCount = trip.stops.reduce((acc, stop) => acc + stop.stopActivities.length, 0);
      const totalBudget = trip.sections.reduce((acc, section) => {
        return acc + section.sectionBudgets.reduce((sAcc, b) => sAcc + (b.amount || 0), 0);
      }, 0);

      return {
        ...trip,
        citiesCount,
        activitiesCount,
        totalBudget
      };
    });

    return NextResponse.json(tripsWithMetadata);
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
    const { name, startDate, endDate, stops = [] } = body;

    if (!name || stops.length === 0) {
      return NextResponse.json({ error: "Missing required fields: name or stops" }, { status: 400 });
    }

    const trip = await prisma.$transaction(async (tx) => {
      // 1. Create the Trip record
      const newTrip = await tx.trip.create({
        data: {
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          userId: session.user.id,
        },
      });

      // 2. Create Stop records and their activities for each city
      for (let i = 0; i < stops.length; i++) {
        const stopData = stops[i];
        let finalCityId = stopData.cityId;

        // Handle external/dynamic city IDs if they start with ext_
        if (finalCityId.startsWith("ext_")) {
          const cityName = finalCityId.replace("ext_", "").split("-").map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(" ");

          const city = await tx.city.upsert({
            where: { id: finalCityId },
            create: {
              id: finalCityId,
              name: cityName,
              country: "Global",
              region: "Other",
              popularity: 50,
            },
            update: {},
          });
          finalCityId = city.id;
        }

        const stop = await tx.stop.create({
          data: {
            tripId: newTrip.id,
            cityId: finalCityId,
            order: i + 1,
            startDate: new Date(stopData.startDate),
            endDate: new Date(stopData.endDate),
          },
        });
        
        // 3. Create activities for THIS specific stop
        if (stopData.activityIds && stopData.activityIds.length > 0) {
          const realActivityIds = stopData.activityIds.filter(id => !id.startsWith("gen_"));
          if (realActivityIds.length > 0) {
            await tx.stopActivity.createMany({
              data: realActivityIds.map((actId) => ({
                stopId: stop.id,
                activityId: actId,
              })),
            });
          }
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
