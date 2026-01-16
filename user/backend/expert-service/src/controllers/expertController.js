import * as expertService from "../services/expertService.js";
import { success } from "../utils/response.js";

/**
 * Get all experts
 */
export async function getAllExperts(req, res, next) {
  try {
    const data = await expertService.fetchAllExperts();
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

/**
 * Get expert by ID
 */
export async function getExpertById(req, res, next) {
  try {
    const { expertId } = req.params;
    const data = await expertService.fetchExpertProfile(expertId);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

/**
 * Get expert's ratings
 */
export async function getExpertRatings(req, res, next) {
  try {
    const { expertId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const data = await expertService.fetchExpertRatings(expertId, limit);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}
