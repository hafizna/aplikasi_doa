import { notFound } from "next/navigation";
import { SeasonalEventClient } from "@/components/seasonal-event-client";
import { getSeasonalEvent, seasonalEvents } from "@/lib/seasonal-events";

export function generateStaticParams() {
  return seasonalEvents.map((event) => ({
    eventId: event.id
  }));
}

export function generateMetadata({ params }: { params: { eventId: string } }) {
  const event = getSeasonalEvent(params.eventId);

  if (!event) {
    return {
      title: "Hari Ini"
    };
  }

  return {
    title: event.title,
    description: event.summary
  };
}

export default function SeasonalEventPage({ params }: { params: { eventId: string } }) {
  const event = getSeasonalEvent(params.eventId);

  if (!event) {
    notFound();
  }

  return <SeasonalEventClient event={event} />;
}
