import pool from "./config/db.js";
(async() => {
  try {
    const { rows } = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'courses';
    `);
    console.log(JSON.stringify(rows, null, 2));
  } catch(e) { console.error(e); } 
  process.exit();
})();
