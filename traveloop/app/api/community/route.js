import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q") || "";
    const destination = searchParams.get("destination") || "";
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const filter = searchParams.get("filter") || "all";

    const skip = (page - 1) * limit;

    const where = {};
    if (q) where.content = { contains: q, mode: "insensitive" };
    if (destination) where.destination = { contains: destination, mode: "insensitive" };
    if (filter === "mine" && session?.user?.id) where.userId = session.user.id;

    let orderBy = { createdAt: "desc" };
    if (sortBy === "mostLiked") orderBy = { likesCount: "desc" };
    if (sortBy === "mostCommented") orderBy = { commentsCount: "desc" };
    if (sortBy === "oldest") orderBy = { createdAt: "asc" };

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, username: true, profileImage: true } },
          trip: { select: { id: true, name: true } },
          likes: session?.user?.id ? { where: { userId: session.user.id }, select: { id: true } } : false,
        },
      }),
      prisma.communityPost.count({ where }),
    ]);

    const postsWithMeta = await Promise.all(posts.map(async (p) => {
      // Logic for Verified Traveler: at least 1 completed trip in that destination
      let isVerified = false;
      if (p.destination) {
        const completedTrip = await prisma.trip.findFirst({
          where: {
            userId: p.userId,
            endDate: { lt: new Date() },
            stops: {
              some: {
                city: {
                  name: { contains: p.destination.split(",")[0], mode: "insensitive" }
                }
              }
            }
          }
        });
        isVerified = !!completedTrip;
      }

      return {
        ...p,
        isLikedByCurrentUser: session?.user?.id ? p.likes?.length > 0 : false,
        isVerified,
      };
    }));

    return NextResponse.json({ posts: postsWithMeta, total, page, limit });
  } catch (error) {
    console.error("Community GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { tripId, content, images = [], destination } = body;

    if (!content || content.trim().length < 5) {
      return NextResponse.json({ error: "Content too short" }, { status: 400 });
    }

    const post = await prisma.communityPost.create({
      data: {
        userId: session.user.id,
        tripId: tripId || null,
        content: content.trim(),
        images,
        destination: destination || null,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, username: true, profileImage: true } },
        trip: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ ...post, isLikedByCurrentUser: false });
  } catch (error) {
    console.error("Community POST Error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
