import { supabase } from "../db.js";

/**
 * Get all verified experts with their ratings
 */
export async function getAllExperts() {
  const { data: experts, error: expertsError } = await supabase
    .from("experts_duplicate")
    .select("*");

  if (expertsError) throw expertsError;

  // Get ratings for each expert
  const expertsWithRatings = await Promise.all(
    experts.map(async (expert) => {
      const { data: ratings, error: ratingsError } = await supabase
        .from("expertRating_duplicate")
        .select(
          "presentationRating, tasteRating, ingredientsRating, accuracyRating"
        )
        .eq("expertId", expert.userid);

      if (ratingsError) {
        return {
          ...expert,
          avgRating: 0,
          totalRatings: 0,
        };
      }

      // Calculate average rating across all categories
      const totalRatings = ratings.length;
      if (totalRatings === 0) {
        return {
          ...expert,
          avgRating: 0,
          totalRatings: 0,
        };
      }

      const sumRatings = ratings.reduce((sum, rating) => {
        const avgForThisRating =
          (rating.presentationRating +
            rating.tasteRating +
            rating.ingredientsRating +
            rating.accuracyRating) /
          4;
        return sum + avgForThisRating;
      }, 0);

      const avgRating = sumRatings / totalRatings;

      return {
        ...expert,
        avgRating: Math.round(avgRating * 10) / 10,
        totalRatings,
      };
    })
  );

  return expertsWithRatings;
}

/**
 * Get expert by ID with detailed stats
 */
export async function getExpertById(expertId) {
  const { data: expert, error: expertError } = await supabase
    .from("experts_duplicate")
    .select("*")
    .eq("userid", expertId)
    .single();

  if (expertError) return null;

  // Get all ratings by this expert
  const { data: ratings, error: ratingsError } = await supabase
    .from("expertRating_duplicate")
    .select(
      "presentationRating, tasteRating, ingredientsRating, accuracyRating, createdAt"
    )
    .eq("expertId", expertId);

  if (ratingsError) {
    return {
      ...expert,
      avgRating: 0,
      totalRatings: 0,
      yearsExp: 0,
    };
  }

  const totalRatings = ratings.length;
  let avgRating = 0;

  if (totalRatings > 0) {
    const sumRatings = ratings.reduce((sum, rating) => {
      const avgForThisRating =
        (rating.presentationRating +
          rating.tasteRating +
          rating.ingredientsRating +
          rating.accuracyRating) /
        4;
      return sum + avgForThisRating;
    }, 0);

    avgRating = Math.round((sumRatings / totalRatings) * 10) / 10;
  }

  // Calculate years of experience based on account creation
  const yearsExp = expert.createdat
    ? Math.max(
        1,
        new Date().getFullYear() - new Date(expert.createdat).getFullYear()
      )
    : 1;

  return {
    ...expert,
    avgRating,
    totalRatings,
    yearsExp,
  };
}

/**
 * Get expert's recent ratings
 */
export async function getExpertRatings(expertId, limit = 10) {
  const { data, error } = await supabase
    .from("expertRating_duplicate")
    .select(
      `
      expertId,
      beverageId,
      presentationRating,
      tasteRating,
      ingredientsRating,
      accuracyRating,
      createdAt,
      beverages_duplicate!expertRating_duplicate_beverageId_fkey (
        id,
        name,
        category,
        restaurantid
      )
      `
    )
    .eq("expertId", expertId)
    .order("createdAt", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
