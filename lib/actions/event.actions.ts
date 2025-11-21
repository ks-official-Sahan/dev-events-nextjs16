"use server";

import Event from "@/database/event.model";
import connectDB from "../mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectDB();

    const event = await Event.findOne({ slug });
    if (!event) {
      throw new Error("Event not found");
    }

    return await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean(); // need to convert to plain JS objects for serialization // without this, Next.js will throw an error about empty strings in the response. // This needs to be done in server actions (required) and in API routes (optional in json response).
  } catch (error) {
    console.error("Error fetching similar events:", error);
    return [];
  }
};
