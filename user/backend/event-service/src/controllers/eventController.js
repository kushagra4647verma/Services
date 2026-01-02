import * as eventService from "../services/eventService.js"
import { success } from "../utils/response.js"

export async function getAllUpcomingEvents(req, res, next) {
  try {
    const data = await eventService.fetchUpcomingEvents()
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}

export async function getEventById(req, res, next) {
  try {
    const { eventId } = req.params
    const data = await eventService.fetchEventDetails(eventId)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}
