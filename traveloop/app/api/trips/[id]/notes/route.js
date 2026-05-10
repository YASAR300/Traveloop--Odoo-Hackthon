import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;
  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") || "all";
  const q = searchParams.get("q") || "";
  const sortBy = searchParams.get("sortBy") || "newest";

  try {
    const where = {
      tripId,
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ]
    };

    let orderBy = {};
    if (sortBy === "newest") orderBy = { createdAt: "desc" };
    else if (sortBy === "oldest") orderBy = { createdAt: "asc" };
    else if (sortBy === "day") orderBy = { linkedDay: "asc" };
    else if (sortBy === "alphabetical") orderBy = { title: "asc" };

    const notes = await prisma.tripNote.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        orderBy
      ],
      include: {
        stop: {
          include: { city: true }
        }
      }
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Fetch Notes Error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;
  const body = await req.json();

  try {
    const note = await prisma.tripNote.create({
      data: {
        tripId,
        title: body.title || "",
        content: body.content,
        linkedDay: body.linkedDay ? parseInt(body.linkedDay) : null,
        stopId: body.stopId || null,
        isPinned: body.isPinned || false,
      },
      include: {
        stop: {
          include: { city: true }
        }
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Create Note Error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
