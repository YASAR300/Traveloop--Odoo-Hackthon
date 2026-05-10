import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId } = await params;
    const userId = session.user.id;

    const existing = await prisma.communityLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await prisma.communityLike.delete({ where: { id: existing.id } });
      await prisma.communityPost.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.communityLike.create({ data: { postId, userId } });
      await prisma.communityPost.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Like toggle error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
