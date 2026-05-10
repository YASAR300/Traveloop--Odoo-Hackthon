import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { startOfDay } from "date-fns";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const today = startOfDay(new Date());

    // Fetch user with all relations needed for stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        trips: {
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

    // Process Trips
    const upcomingTrips = user.trips.filter(t => t.startDate && new Date(t.startDate) > today).slice(0, 6);
    const completedTrips = user.trips.filter(t => t.endDate && new Date(t.endDate) < today).slice(0, 6);

    // Calculate Stats
    const tripsCount = user.trips.length;
    
    const uniqueCityIds = new Set();
    let activitiesCount = 0;
    let totalSpent = 0;
    const visitedCitiesMap = new Map();

    user.trips.forEach(trip => {
      // Cities & Activities (Activities simplified to section count for now or stop activities)
      trip.stops.forEach(stop => {
        uniqueCityIds.add(stop.cityId);
        if (trip.endDate && new Date(trip.endDate) < today) {
          visitedCitiesMap.set(stop.cityId, stop.city);
        }
      });

      // Total Spent from section budgets
      trip.sections.forEach(section => {
        if (section.sectionType === "ACTIVITY") activitiesCount++;
        section.sectionBudgets.forEach(budget => {
          totalSpent += budget.amount;
        });
      });
    });

    const stats = {
      tripsCount,
      citiesCount: uniqueCityIds.size,
      activitiesCount,
      totalSpent
    };

    const visitedCities = Array.from(visitedCitiesMap.values());

    // Remove password from user object before sending
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      upcomingTrips,
      completedTrips,
      stats,
      visitedCities
    });

  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const userId = session.user.id;

    // Filter out undefined fields to avoid overwriting with null
    const updateData = {};
    const allowedFields = [
      "firstName", "lastName", "email", "phone", 
      "city", "country", "language", "additionalInfo", "profileImage"
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error("Profile PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
