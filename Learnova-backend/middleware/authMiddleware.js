import jwt from "jsonwebtoken";

// Maps legacy DB role names to canonical roles
const ROLE_ALIASES = { course_manager: "instructor" };

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Normalize legacy role names so all downstream checks use canonical roles
    decoded.role = ROLE_ALIASES[decoded.role] ?? decoded.role;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * requireRole(...roles) — checks req.user.role is in the allowed list
 * Usage: requireRole("admin", "instructor")
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user?.role) {
    return res.status(403).json({ success: false, message: "Role missing" });
  }

  const allowed = roles.flat(); // support both requireRole("a","b") and requireRole(["a","b"])
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Access denied: insufficient permissions" });
  }

  next();
};

/**
 * authorizeRole — spec-compliant alias for requireRole
 * Usage: authorizeRole(['admin', 'instructor'])
 */
export const authorizeRole = (...roles) => requireRole(...roles);

/**
 * optionalAuth — decode JWT if present, but never block.
 * Sets req.user if token is valid; otherwise req.user = null.
 * Used on public routes that return different data based on role.
 */
export const optionalAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    decoded.role = ROLE_ALIASES[decoded.role] ?? decoded.role;
    req.user = decoded;
  } catch {
    req.user = null;
  }
  next();
};