import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete user (cascade will handle trips, stops, etc. if configured in prisma)
    // Based on the schema provided earlier, relations have onDelete: Cascade
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ message: "Account deleted successfully" });

  } catch (error) {
    console.error("Delete Account Error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
