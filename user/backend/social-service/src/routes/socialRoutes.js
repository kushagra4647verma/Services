import { Router } from "express"
import {
  addFriend,
  removeFriend,
  getMyFriends
} from "../controllers/socialController.js"

const router = Router()

router.post("/friends/:friendId", addFriend)
router.delete("/friends/:friendId", removeFriend)
router.get("/friends", getMyFriends)

export default router
