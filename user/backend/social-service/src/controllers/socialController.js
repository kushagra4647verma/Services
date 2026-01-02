import * as socialService from "../services/socialService.js"
import { success } from "../utils/response.js"

export async function addFriend(req, res, next) {
  try {
    const userId = req.headers["x-user-id"]
    const { friendId } = req.params

    const data = await socialService.addFriend(userId, friendId)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}

export async function removeFriend(req, res, next) {
  try {
    const userId = req.headers["x-user-id"]
    const { friendId } = req.params

    const data = await socialService.removeFriend(userId, friendId)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}

export async function getMyFriends(req, res, next) {
  try {
    const userId = req.headers["x-user-id"]
    const data = await socialService.fetchMyFriends(userId)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}
