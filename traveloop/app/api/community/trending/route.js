import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const posts = await prisma.communityPost.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        destination: { not: null },
      },
      select: { destination: true },
    });

    const counts = {};
    for (const p of posts) {
      if (p.destination) {
        counts[p.destination] = (counts[p.destination] || 0) + 1;
      }
    }

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([destination, count]) => ({ destination, count }));

    // Fallback defaults if no posts yet
    if (sorted.length === 0) {
      return NextResponse.json([
        { destination: "Bali, Indonesia", count: 42 },
        { destination: "Paris, France", count: 38 },
        { destination: "Bangkok, Thailand", count: 31 },
        { destination: "Dubai, UAE", count: 27 },
        { destination: "Tokyo, Japan", count: 24 },
      ]);
    }

    return NextResponse.json(sorted);
  } catch (error) {
    console.error("Trending GET Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
