import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId } = params;
  const body = await req.json();

  try {
    const updatedNote = await prisma.tripNote.update({
      where: { id: noteId },
      data: {
        title: body.title,
        content: body.content,
        linkedDay: body.linkedDay !== undefined ? (body.linkedDay ? parseInt(body.linkedDay) : null) : undefined,
        stopId: body.stopId !== undefined ? body.stopId : undefined,
        isPinned: body.isPinned !== undefined ? body.isPinned : undefined,
        isImportant: body.isImportant !== undefined ? body.isImportant : undefined,
      },
      include: {
        stop: {
          include: { city: true }
        }
      }
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Update Note Error:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId } = params;

  try {
    await prisma.tripNote.delete({
      where: { id: noteId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Note Error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
