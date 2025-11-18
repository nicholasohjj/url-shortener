import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Update click count and last accessed time, and get targetUrl in one query
    const shortUrl = await prisma.shortUrl.update({
      where: { slug },
      data: {
        clicks: {
          increment: 1,
        },
        lastAccessedAt: new Date(),
      },
      select: {
        targetUrl: true,
      },
    });

    // Redirect to the target URL
    return NextResponse.redirect(shortUrl.targetUrl);
  } catch (error) {
    // Handle case where short URL is not found
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Short URL not found" },
        { status: 404 }
      );
    }

    console.error("Error redirecting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

