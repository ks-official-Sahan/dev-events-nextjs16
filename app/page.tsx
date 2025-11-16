import EventCard from "@/components/custom/EventCard";
import ExploreBtn from "@/components/custom/ExploreBtn";
import { events } from "@/lib/constants";
import { time } from "console";

const Page = () => {
  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can't Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in one place
      </p>
      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h2>Featured Events</h2>

        <ul className="events">
          {events.map((event) => (
            <li key={event.title}>
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
