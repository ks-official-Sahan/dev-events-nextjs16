/* eslint-disable @typescript-eslint/no-explicit-any */
import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    let event;

    try {
      event = Object.fromEntries(formData.entries());
    } catch (e) {
      return NextResponse.json(
        { message: "Invalid Form Data" },
        { status: 400 }
      );
    }

    const tags = JSON.parse((formData.get("tags") as string) || "[]");
    const agenda = JSON.parse((formData.get("agenda") as string) || "[]");

    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "DevEvents",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;

    try {
      const createdEvent = await Event.create({ ...event, tags, agenda });

      return NextResponse.json(
        { message: "Event Created Successfully", event: createdEvent },
        { status: 201 }
      );
    } catch (e) {
      // If we uploaded an image but creation failed, try to remove the uploaded image to avoid orphaned files.
      try {
        const uploadRes = uploadResult as {
          public_id?: string;
          secure_url?: string;
          [key: string]: unknown;
        };
        if (uploadRes?.public_id) {
          await cloudinary.uploader.destroy(uploadRes.public_id as string, {
            resource_type: "image",
          });
        }
      } catch (cleanupErr) {
        console.error("Failed to cleanup uploaded image:", cleanupErr);
      }

      // Mongoose validation error: collect all field errors and return them together
      if ((e as any)?.name === "ValidationError") {
        const validationErrors = Object.values((e as any).errors).map(
          (errItem: any) => ({
            field: errItem.path,
            message: errItem.message,
          })
        );

        return NextResponse.json(
          {
            message: "Validation Failed",
            errors: validationErrors,
          },
          { status: 400 }
        );
      }

      // Duplicate key error (e.g., unique index violation)
      if ((e as any)?.code === 11000) {
        const keyValue = (e as any).keyValue || {};
        const duplicates = Object.keys(keyValue).map((field) => ({
          field,
          value: keyValue[field],
          message: `${field} must be unique`,
        }));

        return NextResponse.json(
          {
            message: "Duplicate Key Error",
            duplicates,
          },
          { status: 409 }
        );
      }

      // Fallback for other errors
      return NextResponse.json(
        {
          message: "Event Creation Failed",
          error: e instanceof Error ? e.message : "Unknown",
        },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: e instanceof Error ? e.message : "Unknown",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { message: "Events Retrieved Successfully", events },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        message: "Failed to Retrieve Events",
        error: e instanceof Error ? e.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
