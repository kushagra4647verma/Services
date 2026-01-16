import { Router } from "express";
import {
  getAllExperts,
  getExpertById,
  getExpertRatings,
} from "../controllers/expertController.js";

const router = Router();

router.get("/experts", getAllExperts);
router.get("/experts/:expertId", getExpertById);
router.get("/experts/:expertId/ratings", getExpertRatings);

export default router;
