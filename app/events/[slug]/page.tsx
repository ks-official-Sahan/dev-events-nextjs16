import BookEvent from "@/components/custom/BookEvent";
import EventCard from "@/components/custom/EventCard";
import { IEvent } from "@/database/event.model";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import { cacheLife } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const EventDetailsItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div key={tag} className="pill">
        {tag}
      </div>
    ))}
  </div>
);

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  "use cache";
  cacheLife("minutes");

  const { slug } = await params;

  const res = await fetch(`${BASE_URL}/api/events/${slug}`, {
    // next: { revalidate: 10*60 }, // No need for revalidation with cacheLife
    // cache: "no-store", // not good with revalidations. // this stops caching entirely.
  });

  if (!res.ok) {
    return notFound();
  }

  // const { event: { title, description, overview, image, venue, location, date, time, mode, audience, agenda, organizer,  tags, createdAt, updatedAt } } = await res.json();
  // if (!title) return notFound();

  const { event } = await res.json();
  if (!event) return notFound();

  const {
    title,
    description,
    overview,
    image,
    venue,
    location,
    date,
    time,
    mode,
    audience,
    agenda,
    organizer,
    tags,
    createdAt,
    updatedAt,
  }: IEvent = event;

  const bookings = 15;

  // const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);
  const similarEvents = await getSimilarEventsBySlug(slug);
  console.log(similarEvents);

  return (
    <section id="event">
      {/* <pre className="sr-only">{JSON.stringify(event, null, 2)}</pre> */}
      <pre className="sr-only">{slug}</pre>

      <div className="header">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        {/* Left Side - Event Content */}
        <div className="content">
          <Image
            src={image}
            alt={"banner"}
            width={800}
            height={800}
            className="banner"
          />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>
            <EventDetailsItem
              icon="/icons/calendar.svg"
              alt="date"
              label={date}
            />
            <EventDetailsItem
              icon="/icons/pin.svg"
              alt="location"
              label={location}
            />
            <EventDetailsItem icon="/icons/clock.svg" alt="time" label={time} />
            <EventDetailsItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailsItem
              icon="/icons/audience.svg"
              alt="audience"
              label={audience}
            />
          </section>

          <EventAgenda agendaItems={agenda} />

          <section className="flex-col-gap-2">
            <h2>Venue</h2>
            <p>{venue}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags} />
        </div>

        {/* Right Side - Booking Form */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have already booked their spot!
              </p>
            ) : (
              <p className="text-sm">Be the first to book your spot!</p>
            )}

            <BookEvent />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {similarEvents.length > 0 &&
            similarEvents.map((event) => (
              <EventCard {...event} key={event.id} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default EventDetailsPage;
