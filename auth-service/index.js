const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const ACCESS_SECRET = "access_secret_key";
const REFRESH_SECRET = "refresh_secret_key";

let refreshTokens = [];

/* 🔍 GLOBAL LOGGER */
app.use((req, res, next) => {
  console.log("➡️  Auth Service received:", req.method, req.originalUrl);
  next();
});

app.post("/login", (req, res) => {
  console.log("✅ /login handler hit");
  console.log("📦 Body:", req.body);

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId missing" });
  }

  const accessToken = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "5m" });
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" });

  refreshTokens.push(refreshToken);

  res.json({ accessToken, refreshToken });
});

app.post("/refresh", (req, res) => {
  console.log("✅ /refresh handler hit");
  const { refreshToken } = req.body;

  if (!refreshTokens.includes(refreshToken)) {
    return res.sendStatus(403);
  }

  jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = jwt.sign(
      { userId: user.userId },
      ACCESS_SECRET,
      { expiresIn: "5m" }
    );

    res.json({ accessToken: newAccessToken });
  });
});

/* ---------- FALLBACK ---------- */
app.use((req, res) => {
  console.log("❌ Auth Service 404 for:", req.method, req.originalUrl);
  res.status(404).send("Auth route not found");
});

app.listen(3000, () => {
  console.log("✅ Auth Service running on 3000");
});
