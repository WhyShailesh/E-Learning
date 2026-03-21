import jwt from "jsonwebtoken";


export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user?.role) {
    return res.status(403).json({ message: "Role missing" });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};