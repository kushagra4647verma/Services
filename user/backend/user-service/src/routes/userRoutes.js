import { Router } from "express"
import {
  getMyProfile,
  addBookmark,
  removeBookmark,
  getMyBookmarks,
  createDiaryEntry,
  getDiaryEntries,
  updateDiaryEntry,
  deleteDiaryEntry
} from "../controllers/userController.js"

const router = Router()

router.get("/users/me", getMyProfile)

router.post("/bookmarks/:restaurantId", addBookmark)
router.delete("/bookmarks/:restaurantId", removeBookmark)
router.get("/users/me/bookmarks", getMyBookmarks)

router.post("/diary", createDiaryEntry)
router.get("/diary", getDiaryEntries)
router.patch("/diary/:entryId", updateDiaryEntry)
router.delete("/diary/:entryId", deleteDiaryEntry)

export default router
