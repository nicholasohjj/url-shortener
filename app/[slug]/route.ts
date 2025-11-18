import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find the short URL to get the target URL
    const shortUrl = await prisma.shortUrl.findUnique({
      where: { slug },
    });

    if (!shortUrl) {
      return NextResponse.json(
        { error: "Short URL not found" },
        { status: 404 }
      );
    }

    // Update click count and last accessed time asynchronously (fire-and-forget)
    // Don't await - let it run in the background so redirect is instant
    prisma.shortUrl
      .update({
        where: { slug },
        data: {
          clicks: {
            increment: 1,
          },
          lastAccessedAt: new Date(),
        },
      })
      .catch((error) => {
        // Log errors but don't block the redirect
        console.error("Error updating click count:", error);
      });

    // Redirect immediately without waiting for the update
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

