"use server";

import Booking from "@/database/booking.model";
import connectDB from "../mongodb";

export const createBooking = async ({
  eventId,
  slug,
  email,
}: {
  eventId: string;
  slug: string;
  email: string;
}) => {
  try {
    await connectDB();

    const booking = (
      await Booking.create({
        eventId,
        slug,
        email,
      })
    ).lean(); // By using lean() we can return a plain JavaScript object instead of a Mongoose document, and avoid JSON.stringify on returning the result.

    return {
      success: true,
    };
  } catch (e) {
    console.error("create booking failed", e);
    return {
      success: false,
    };
  }
};
