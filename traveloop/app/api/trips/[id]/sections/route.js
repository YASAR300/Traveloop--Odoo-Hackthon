import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tripId } = await params;

    const sections = await prisma.section.findMany({
      where: { tripId },
      include: {
        sectionBudgets: true,
        trip: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error("Sections GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tripId } = await params;
    const body = await request.json();
    const { 
      title, 
      description, 
      sectionType, 
      startDate, 
      endDate, 
      order,
      isPlanned,
      attachmentUrl
    } = body;

    const section = await prisma.section.create({
      data: {
        tripId,
        title: title || "New Section",
        description: description || "",
        sectionType: sectionType || "GENERAL",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isPlanned: isPlanned || false,
        attachmentUrl: attachmentUrl || "",
        order: order || 0,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("Section POST Error:", error);
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
