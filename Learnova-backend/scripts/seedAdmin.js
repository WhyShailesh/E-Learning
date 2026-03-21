import pool from "../config/db.js";
import bcrypt from "bcrypt";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin";
const ADMIN_NAME = "Admin";

export async function seedAdmin() {
  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [ADMIN_EMAIL]);
    if (existing.rows.length) {
      console.log("[Seed] Admin user already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
      [ADMIN_NAME, ADMIN_EMAIL, hashedPassword, "admin"]
    );
    console.log("[Seed] Default admin created: admin@gmail.com / admin");
  } catch (err) {
    console.error("[Seed] Failed to create admin:", err.message);
  }
}
