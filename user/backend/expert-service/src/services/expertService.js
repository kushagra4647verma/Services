import * as repo from "../repositories/expertRepository.js";

/**
 * Fetch all verified experts
 */
export async function fetchAllExperts() {
  return repo.getAllExperts();
}

/**
 * Fetch expert profile with stats
 */
export async function fetchExpertProfile(expertId) {
  const expert = await repo.getExpertById(expertId);

  if (!expert) {
    throw new Error("Expert not found");
  }

  return expert;
}

/**
 * Fetch expert's recent ratings
 */
export async function fetchExpertRatings(expertId, limit) {
  return repo.getExpertRatings(expertId, limit);
}
