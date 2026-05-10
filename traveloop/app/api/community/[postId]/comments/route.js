import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { postId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;

    const comments = await prisma.communityComment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, username: true, profileImage: true } },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Comments GET Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId } = await params;
    const { content } = await request.json();

    if (!content?.trim()) return NextResponse.json({ error: "Empty comment" }, { status: 400 });

    const [comment] = await prisma.$transaction([
      prisma.communityComment.create({
        data: { postId, userId: session.user.id, content: content.trim() },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, username: true, profileImage: true } },
        },
      }),
      prisma.communityPost.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Comments POST Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
