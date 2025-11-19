import Event, { IEvent } from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// Shape of the dynamic route parameters for this handler
type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

// GET /api/events/[slug]
// Returns a single event by its slug
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { slug } = (await params) ?? {};

    // Basic validation of the slug parameter
    if (!slug || typeof slug !== "string" || !slug.trim()) {
      return NextResponse.json(
        {
          message: "Invalid slug parameter",
          error: "Slug is required and must be a non-empty string.",
        },
        { status: 400 }
      );
    }

    // Sanitize slug: Mongoose schema stores slug in lowercase & trimmed
    const sanitizedSlug = slug.toLowerCase().trim();

    const event: IEvent | null = await Event.findOne({ slug: sanitizedSlug });

    if (!event) {
      return NextResponse.json(
        {
          message: "Event not found",
          error: `No event found for slug '${sanitizedSlug}'.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Event retrieved successfully",
        event,
      },
      { status: 200 }
    );
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/events/[slug]] Error:", e);
    }

    if (e instanceof Error) {
      if (e.message.includes("MONGODB_URI")) {
        return NextResponse.json(
          {
            message: "Database configuration error",
            error: "MONGODB_URI is not set or invalid.",
          },
          { status: 500 }
        );
      }

      if (e.message.includes("connect ECONNREFUSED")) {
        return NextResponse.json(
          {
            message: "Database connection error",
            error: "Unable to connect to the database. Please try again later.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Failed to retrieve event",
        error: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
