import EventCard from "@/components/custom/EventCard";
import ExploreBtn from "@/components/custom/ExploreBtn";
import { IEvent } from "@/database/event.model";
import { cacheLife } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const Page = async () => {
  'use cache'
  cacheLife('hours')

  const res = await fetch(`${BASE_URL}/api/events`, {
    // next: { revalidate: 60 }, // This becomes in effective with cacheLife.
    // cache: "no-store", // not good with revalidations. // this stops caching entirely.
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status}`);
  }

  const { events } = await res.json();

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in one place
      </p>
      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h2>Featured Events</h2>

        <ul className="events">
          {events &&
            events.map((event: IEvent) => (
              <li key={event.title} className="list-none">
                <EventCard {...event} />
                {/* <EventCard title={event.title} image={event.image} /> */}
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
};

export default Page;
