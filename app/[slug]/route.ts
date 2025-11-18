import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find the short URL
    const shortUrl = await prisma.shortUrl.findUnique({
      where: { slug },
    });

    if (!shortUrl) {
      return NextResponse.json(
        { error: "Short URL not found" },
        { status: 404 }
      );
    }

    // Update click count and last accessed time
    await prisma.shortUrl.update({
      where: { slug },
      data: {
        clicks: {
          increment: 1,
        },
        lastAccessedAt: new Date(),
      },
    });

    // Redirect to the target URL
    return NextResponse.redirect(shortUrl.targetUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

