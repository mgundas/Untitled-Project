export { default } from "next-auth/middleware"

// This tells the middleware which routes to protect
export const config = { matcher: ["/settings/path:*", "/settings"] }