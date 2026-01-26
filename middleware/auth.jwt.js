import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const override = globalThis.__TEST_MIDDLEWARE__?.requireAuth;
  if (override) {
    return override(req, res, next);
  }
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}
export function requireRole(role) {
  const overrideFactory = globalThis.__TEST_MIDDLEWARE__?.requireRole;
  if (overrideFactory) {
    return overrideFactory(role);
  }
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    if (!roles.includes(role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}
