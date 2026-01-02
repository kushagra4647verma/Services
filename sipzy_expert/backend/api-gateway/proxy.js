import proxy from "express-http-proxy"

export function createProxy(target) {
  return proxy(target, {
    proxyReqPathResolver: req => req.originalUrl,
    proxyReqOptDecorator: (opts, req) => {
      if (req.user) {
        opts.headers["x-user-id"] = req.user.userId
        opts.headers["x-user-role"] = req.user.user_role
      }
      return opts
    }
  })
}
