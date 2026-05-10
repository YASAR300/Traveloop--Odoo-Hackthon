import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { username } = await params;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        trips: {
          where: { isPublic: true },
          include: {
            stops: { include: { city: true } },
            sections: { include: { sectionBudgets: true } },
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Process Public Stats
    const tripsCount = user.trips.length;
    const uniqueCityIds = new Set();
    let activitiesCount = 0;
    let totalSpent = 0;

    user.trips.forEach(trip => {
      trip.stops.forEach(stop => uniqueCityIds.add(stop.cityId));
      trip.sections.forEach(section => {
        if (section.sectionType === "ACTIVITY") activitiesCount++;
        section.sectionBudgets.forEach(budget => totalSpent += budget.amount);
      });
    });

    const publicData = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      city: user.city,
      country: user.country,
      additionalInfo: user.additionalInfo,
      stats: {
        tripsCount,
        citiesCount: uniqueCityIds.size,
        activitiesCount,
        totalSpent
      },
      publicTrips: user.trips.map(t => ({
        id: t.id,
        name: t.name,
        startDate: t.startDate,
        endDate: t.endDate,
        coverImage: t.coverImage
      }))
    };

    return NextResponse.json(publicData);

  } catch (error) {
    console.error("Public Profile GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch public profile" }, { status: 500 });
  }
}
