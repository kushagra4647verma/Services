import express from "express";
import dotenv from "dotenv";
import expertRoutes from "./routes/expertRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/", expertRoutes);
app.use(errorHandler);

const PORT = 4006;
app.listen(PORT, () => {
  console.log(`👨‍🔬 Expert service running on port ${PORT}`);
});
