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

    const items = await prisma.packingItem.findMany({
      where: { tripId },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Packing GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch packing items" }, { status: 500 });
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
    const { name, category } = body;

    const newItem = await prisma.packingItem.create({
      data: {
        tripId,
        name,
        category: category || "OTHER",
      }
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Packing POST Error:", error);
    return NextResponse.json({ error: "Failed to add packing item" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, isPacked, name, category } = body;

    const updatedItem = await prisma.packingItem.update({
      where: { id },
      data: {
        ...(isPacked !== undefined && { isPacked }),
        ...(name && { name }),
        ...(category && { category }),
      }
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Packing PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update packing item" }, { status: 500 });
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

    await prisma.packingItem.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Packing DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
