import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { totalBudget } = await request.json();

  try {
    const updatedBudget = await prisma.budget.upsert({
      where: { tripId: id },
      update: { totalBudget: parseFloat(totalBudget) },
      create: {
        tripId: id,
        totalBudget: parseFloat(totalBudget),
        transport: 0,
        accommodation: 0,
        activities: 0,
        meals: 0,
        miscellaneous: 0
      }
    });

    return NextResponse.json(updatedBudget);
  } catch (error) {
    console.error("Budget Update Error:", error);
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 });
  }
}
