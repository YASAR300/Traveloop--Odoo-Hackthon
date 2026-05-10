import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { differenceInDays, addDays, startOfDay } from "date-fns";

export async function GET(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        stops: { include: { city: true } },
        sections: {
          include: { sectionBudgets: true },
          orderBy: { order: "asc" }
        },
        budget: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Group sections by day
    const dayMap = {};
    const tripStart = trip.startDate ? startOfDay(new Date(trip.startDate)) : null;

    trip.sections.forEach(section => {
      let day = "Unscheduled";
      if (tripStart && section.startDate) {
        const sectionStart = startOfDay(new Date(section.startDate));
        const dayDiff = differenceInDays(sectionStart, tripStart) + 1;
        day = dayDiff > 0 ? `Day ${dayDiff}` : "Day 1";
      }
      
      if (!dayMap[day]) dayMap[day] = [];
      dayMap[day].push({
        ...section,
        totalCost: section.sectionBudgets.reduce((sum, b) => sum + (b.amount || 0), 0)
      });
    });

    // Sort days numerically
    const sortedDays = Object.keys(dayMap).sort((a, b) => {
      if (a === "Unscheduled") return 1;
      if (b === "Unscheduled") return -1;
      return parseInt(a.replace("Day ", "")) - parseInt(b.replace("Day ", ""));
    });

    return NextResponse.json({
      trip,
      dayMap,
      sortedDays,
      totalSpent: trip.sections.reduce((sum, s) => 
        sum + s.sectionBudgets.reduce((bsum, b) => bsum + (b.amount || 0), 0), 0
      )
    });
  } catch (error) {
    console.error("Trip API Error:", error);
    return NextResponse.json({ error: "Failed to fetch trip details" }, { status: 500 });
  }
}
