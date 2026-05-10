import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 1. Fetch original trip with sections and budgets
    const originalTrip = await prisma.trip.findUnique({
      where: { 
        id,
        userId: session.user.id 
      },
      include: {
        stops: {
          include: {
            stopActivities: true
          }
        },
        sections: {
          include: {
            sectionBudgets: true
          }
        },
        budget: true,
        packingItems: true,
        tripNotes: true
      }
    });

    if (!originalTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // 2. Create the duplicate trip in a transaction
    const duplicatedTrip = await prisma.$transaction(async (tx) => {
      // Create new trip
      const newTrip = await tx.trip.create({
        data: {
          name: `Copy of ${originalTrip.name}`,
          description: originalTrip.description,
          coverImage: originalTrip.coverImage,
          startDate: originalTrip.startDate ? new Date(new Date(originalTrip.startDate).setFullYear(new Date(originalTrip.startDate).getFullYear() + 1)) : null,
          endDate: originalTrip.endDate ? new Date(new Date(originalTrip.endDate).setFullYear(new Date(originalTrip.endDate).getFullYear() + 1)) : null,
          userId: session.user.id,
          isPublic: false,
        }
      });

      // Duplicate Stops & Activities
      for (const stop of originalTrip.stops) {
        const newStop = await tx.stop.create({
          data: {
            tripId: newTrip.id,
            cityId: stop.cityId,
            order: stop.order,
            startDate: stop.startDate ? new Date(new Date(stop.startDate).setFullYear(new Date(stop.startDate).getFullYear() + 1)) : null,
            endDate: stop.endDate ? new Date(new Date(stop.endDate).setFullYear(new Date(stop.endDate).getFullYear() + 1)) : null,
          }
        });

        if (stop.stopActivities.length > 0) {
          await tx.stopActivity.createMany({
            data: stop.stopActivities.map(sa => ({
              stopId: newStop.id,
              activityId: sa.activityId,
              scheduledTime: sa.scheduledTime,
              notes: sa.notes
            }))
          });
        }
      }

      // Duplicate Sections & Budgets
      for (const section of originalTrip.sections) {
        const newSection = await tx.section.create({
          data: {
            tripId: newTrip.id,
            order: section.order,
            title: section.title,
            description: section.description,
            sectionType: section.sectionType,
            startDate: section.startDate ? new Date(new Date(section.startDate).setFullYear(new Date(section.startDate).getFullYear() + 1)) : null,
            endDate: section.endDate ? new Date(new Date(section.endDate).setFullYear(new Date(section.endDate).getFullYear() + 1)) : null,
            isPlanned: section.isPlanned,
            attachmentUrl: section.attachmentUrl,
          }
        });

        if (section.sectionBudgets.length > 0) {
          await tx.sectionBudget.createMany({
            data: section.sectionBudgets.map(sb => ({
              sectionId: newSection.id,
              category: sb.category,
              amount: sb.amount,
              description: sb.description,
              unitCost: sb.unitCost,
              quantity: sb.quantity
            }))
          });
        }
      }

      // Duplicate Packing Items
      if (originalTrip.packingItems.length > 0) {
        await tx.packingItem.createMany({
          data: originalTrip.packingItems.map(pi => ({
            tripId: newTrip.id,
            name: pi.name,
            category: pi.category,
            isPacked: false
          }))
        });
      }

      return newTrip;
    });

    return NextResponse.json(duplicatedTrip);
  } catch (error) {
    console.error("Trip Duplication Error:", error);
    return NextResponse.json({ error: "Failed to duplicate trip" }, { status: 500 });
  }
}
