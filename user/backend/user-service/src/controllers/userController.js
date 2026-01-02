import * as userService from "../services/userService.js"
import { success } from "../utils/response.js"

export async function getMyProfile(req, res, next) {
  try {
    const userId = req.headers["x-user-id"]
    const data = await userService.fetchMyProfile(userId)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}

export async function addBookmark(req, res, next) {
  try {
    const userId = req.headers["x-user-id"]
    const { restaurantId } = req.params
    const data = await userService.addBookmark(userId, restaurantId)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}

export async function removeBookmark(req, res, next) {
  try {
    const userId = req.headers["x-user-id"]
    const { restaurantId } = req.params
    const data = await userService.removeBookmark(userId, restaurantId)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}

export async function getMyBookmarks(req, res, next) {
  try {
    const userId = req.headers["x-user-id"]
    const data = await userService.fetchMyBookmarks(userId)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}

export async function createDiaryEntry(req, res, next) {
  try {
    const userId = req.headers["x-user-id"]
    const data = await userService.createDiary(userId, req.body)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}

export async function getDiaryEntries(req, res, next) {
  try {
    const userId = req.headers["x-user-id"]
    const data = await userService.fetchDiary(userId)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}

export async function updateDiaryEntry(req, res, next) {
  try {
    const userId = req.headers["x-user-id"]
    const { entryId } = req.params
    const data = await userService.updateDiary(userId, entryId, req.body)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}

export async function deleteDiaryEntry(req, res, next) {
  try {
    const userId = req.headers["x-user-id"]
    const { entryId } = req.params
    const data = await userService.deleteDiary(userId, entryId)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}
