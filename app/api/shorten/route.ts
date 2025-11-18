import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, slug: customSlug } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Generate slug or use custom one
    let slug = customSlug || nanoid(8);

    // Ensure slug is unique
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.shortUrl.findUnique({
        where: { slug },
      });

      if (!existing) {
        break;
      }

      slug = customSlug ? `${customSlug}-${nanoid(4)}` : nanoid(8);
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: "Failed to generate unique slug" },
        { status: 500 }
      );
    }

    // Create short URL
    const shortUrl = await prisma.shortUrl.create({
      data: {
        slug,
        targetUrl: url,
      },
    });

    return NextResponse.json({
      slug: shortUrl.slug,
      shortUrl: `${request.nextUrl.origin}/${shortUrl.slug}`,
      targetUrl: shortUrl.targetUrl,
    });
  } catch (error) {
    console.error("Error creating short URL:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error("Error details:", errorDetails);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: errorMessage,
        ...(process.env.NODE_ENV === "development" && { details: errorDetails })
      },
      { status: 500 }
    );
  }
}

