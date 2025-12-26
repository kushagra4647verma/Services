const express = require("express");
const jwt = require("jsonwebtoken");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const ACCESS_SECRET = "access_secret_key";

/* 🔍 GLOBAL REQUEST LOGGER */
app.use((req, res, next) => {
  console.log("➡️  Gateway received:", req.method, req.originalUrl);
  next();
});

/* ---------- AUTH PROXY (FIRST) ---------- */
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://auth-service:3000",
    changeOrigin: true,

    pathRewrite: {
      "^/auth": ""
    },

    onProxyReq(proxyReq, req) {
      console.log("➡️  Proxying to Auth Service:", req.method, req.originalUrl);

      if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },

    onError(err, req, res) {
      console.error("❌ Proxy error:", err);
      res.status(500).send("Gateway proxy error");
    }
  })
);

/* ---------- JSON + AUTH MIDDLEWARE ---------- */
app.use(express.json());

function authenticate(req, res, next) {
  if (req.path.startsWith("/auth")) return next();

  console.log("🔐 Auth middleware hit for:", req.path);

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];
  jwt.verify(token, ACCESS_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.use(authenticate);

/* ---------- USER SERVICE ---------- */
app.use(
  "/users",
  createProxyMiddleware({
    target: "http://user-service:3001",
    changeOrigin: true
  })
);

/* ---------- ORDER SERVICE ---------- */
app.use(
  "/orders",
  createProxyMiddleware({
    target: "http://order-service:3002",
    changeOrigin: true
  })
);

/* ---------- FALLBACK ---------- */
app.use((req, res) => {
  console.log("❌ Gateway 404 for:", req.method, req.originalUrl);
  res.status(404).send("Gateway route not found");
});

app.listen(8080, () => {
  console.log("✅ API Gateway running on port 8080");
});
