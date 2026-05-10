import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// Rebuild trigger comment
export async function GET(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;

  try {
    let trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        user: true,
        stops: { include: { city: true } },
        sections: {
          include: { sectionBudgets: true }
        },
        budget: true
      }
    });

    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    // Auto-generate invoice fields if missing
    if (!trip.invoiceId || !trip.invoiceGeneratedAt) {
      const randomId = "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      trip = await prisma.trip.update({
        where: { id: tripId },
        data: {
          invoiceId: trip.invoiceId || randomId,
          invoiceGeneratedAt: trip.invoiceGeneratedAt || new Date()
        },
        include: {
          user: true,
          stops: { include: { city: true } },
          sections: {
            include: { sectionBudgets: true }
          },
          budget: true
        }
      });
    }

    // Flatten section budgets into line items
    const lineItems = trip.sections.flatMap(s => 
      s.sectionBudgets.map(sb => ({
        id: sb.id,
        category: sb.category,
        description: sb.description,
        billingDetails: sb.billingDetails,
        unitCost: sb.unitCost || (sb.amount / (sb.quantity || 1)),
        quantity: sb.quantity || 1,
        amount: sb.amount
      }))
    );

    const subtotal = lineItems.reduce((acc, item) => acc + item.amount, 0);
    const tax = subtotal * (trip.taxPercent / 100);
    const discount = trip.invoiceDiscount;
    const grandTotal = subtotal + tax - discount;

    return NextResponse.json({
      trip,
      lineItems,
      subtotal,
      tax,
      discount,
      grandTotal,
      budget: trip.budget || { totalBudget: 0 }
    });
  } catch (error) {
    console.error("Invoice GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;
  const body = await req.json();

  try {
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        invoiceStatus: body.status,
        taxPercent: body.taxPercent,
        invoiceDiscount: body.invoiceDiscount,
        travelerNames: body.travelerNames
      }
    });

    return NextResponse.json(updatedTrip);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
