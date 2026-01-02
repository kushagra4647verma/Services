import * as repo from "../repositories/userRepository.js"

export async function fetchMyProfile(userId) {
  const [profile, badges] = await Promise.all([
    repo.getUserProfile(userId),
    repo.getUserBadges(userId)
  ])

  return {
    ...profile,
    badges
  }
}

export async function addBookmark(userId, restaurantId) {
  await repo.insertBookmark(userId, restaurantId)
  await repo.recalculateBookmarkCount(userId)
  return { message: "Bookmarked" }
}

export async function removeBookmark(userId, restaurantId) {
  await repo.deleteBookmark(userId, restaurantId)
  await repo.recalculateBookmarkCount(userId)
  return { message: "Bookmark removed" }
}

export async function fetchMyBookmarks(userId) {
  return repo.getBookmarks(userId)
}

export async function createDiary(userId, payload) {
  return repo.insertDiary(userId, payload)
}

export async function fetchDiary(userId) {
  return repo.getDiary(userId)
}

export async function updateDiary(userId, entryId, payload) {
  return repo.updateDiary(userId, entryId, payload)
}

export async function deleteDiary(userId, entryId) {
  return repo.deleteDiary(userId, entryId)
}
