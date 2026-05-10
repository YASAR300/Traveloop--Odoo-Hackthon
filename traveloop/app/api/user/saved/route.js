import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const savedActivities = await prisma.savedActivity.findMany({
      where: { userId: session.user.id },
      include: { activity: true }
    });

    const savedCities = await prisma.savedCity.findMany({
      where: { userId: session.user.id },
      include: { city: true }
    });

    return NextResponse.json({
      activities: savedActivities.map(s => s.activity),
      cities: savedCities.map(s => s.city)
    });
  } catch (error) {
    console.error("Saved Items Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch saved items" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { activityId, cityId } = await request.json();

    if (activityId) {
      const existing = await prisma.savedActivity.findUnique({
        where: {
          userId_activityId: {
            userId: session.user.id,
            activityId: activityId
          }
        }
      });

      if (existing) {
        await prisma.savedActivity.delete({ where: { id: existing.id } });
        return NextResponse.json({ status: "removed", type: "activity" });
      } else {
        await prisma.savedActivity.create({
          data: { userId: session.user.id, activityId: activityId }
        });
        return NextResponse.json({ status: "saved", type: "activity" });
      }
    }

    if (cityId) {
      const existing = await prisma.savedCity.findUnique({
        where: {
          userId_cityId: {
            userId: session.user.id,
            cityId: cityId
          }
        }
      });

      if (existing) {
        await prisma.savedCity.delete({ where: { id: existing.id } });
        return NextResponse.json({ status: "removed", type: "city" });
      } else {
        await prisma.savedCity.create({
          data: { userId: session.user.id, cityId: cityId }
        });
        return NextResponse.json({ status: "saved", type: "city" });
      }
    }

    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  } catch (error) {
    console.error("Save Toggle Error:", error);
    return NextResponse.json({ error: "Failed to toggle save" }, { status: 500 });
  }
}
