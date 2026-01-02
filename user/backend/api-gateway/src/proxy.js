import proxy from "express-http-proxy"

export function createProxy(target) {
  return proxy(target, {
    proxyReqPathResolver: req => req.originalUrl,

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // ✅ Only attach headers if user exists
      if (srcReq.user?.userId) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId
      }

      if (srcReq.user?.role) {
        proxyReqOpts.headers["x-user-role"] = srcReq.user.role
      }

      return proxyReqOpts
    }
  })
}
