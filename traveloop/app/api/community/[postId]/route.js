import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId } = await params;
    const post = await prisma.communityPost.findUnique({ where: { id: postId } });

    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (post.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.communityPost.delete({ where: { id: postId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Post DELETE Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
