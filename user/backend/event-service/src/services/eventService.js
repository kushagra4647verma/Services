import * as repo from "../repositories/eventRepository.js"

export async function fetchUpcomingEvents() {
  return repo.getUpcomingEvents()
}

export async function fetchEventDetails(eventId) {
  const event = await repo.getEventById(eventId)

  if (!event) {
    throw new Error("Event not found")
  }

  return event
}
