import { redirect } from "next/navigation";

export default async function TripLandingPage({ params }) {
  const { id } = await params;
  redirect(`/trips/${id}/itinerary`);
}