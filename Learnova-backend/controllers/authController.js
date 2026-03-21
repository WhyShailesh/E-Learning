import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email.toLowerCase(), hashedPassword, role || "learner"]
    );

    const user = result.rows[0];
    const token = signToken(user);
    const { password: _pw, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN — checks both `users` table and `instructors` table
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check regular users table first
    let userRow = null;
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [normalizedEmail]
    );
    if (userResult.rows.length > 0) {
      userRow = userResult.rows[0];
    }

    // 2. If not found in users, check instructors table
    if (!userRow) {
      const instructorResult = await pool.query(
        "SELECT * FROM instructors WHERE email = $1",
        [normalizedEmail]
      );
      if (instructorResult.rows.length > 0) {
        userRow = instructorResult.rows[0];
      }
    }

    // 3. No match in either table
    if (!userRow) {
      return res.status(400).json({ message: "Wrong username or password" });
    }

    // 4. Compare password
    const valid = await bcrypt.compare(password, userRow.password);
    if (!valid) {
      return res.status(400).json({ message: "Wrong username or password" });
    }

    // 5. Sign token and return safe user object
    const token = signToken(userRow);
    const { password: _pw, ...safeUser } = userRow;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("[auth] login error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    // First check users table (admin, learner)
    const userResult = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.user.id]
    );
    if (userResult.rows.length) {
      return res.json(userResult.rows[0]);
    }

    // Then check instructors table (instructor accounts)
    const instructorResult = await pool.query(
      "SELECT id, name, email, role FROM instructors WHERE id = $1",
      [req.user.id]
    );
    if (instructorResult.rows.length) {
      return res.json(instructorResult.rows[0]);
    }

    return res.status(404).json({ message: "User not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};