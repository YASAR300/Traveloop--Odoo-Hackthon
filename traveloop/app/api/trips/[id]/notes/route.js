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

    const notes = await prisma.tripNote.findMany({
      where: { tripId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Notes GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
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
    const { title, content } = body;

    const note = await prisma.tripNote.create({
      data: {
        tripId,
        title,
        content,
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Notes POST Error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.tripNote.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notes DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
