import * as beverageService from "../services/beverageService.js"
import { success } from "../utils/response.js"

export async function getBeverageById(req, res, next) {
  try {
    const { beverageId } = req.params
    const data = await beverageService.fetchBeverageDetails(beverageId)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}

export async function getBeverageRatings(req, res, next) {
  try {
    const { beverageId } = req.params
    const data = await beverageService.fetchBeverageRatings(beverageId)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}

export async function addUserRating(req, res, next) {
  try {
    const { beverageId } = req.params
    const userId = req.headers["x-user-id"]
    const { rating, comments } = req.body

    const data = await beverageService.createOrUpdateRating(
      userId,
      beverageId,
      rating,
      comments
    )

    res.json(success(data))
  } catch (err) {
    next(err)
  }
}
