
import "dotenv/config";
import { pool } from "../src/lib/mysql";

async function main() {
  try {
    const [rows] = await pool.execute(
      `SELECT
        j.id,
        j.title,
        j.effort,
        u.name,
        u.email
      FROM Journal AS j
      INNER JOIN User AS u ON j.userId = u.id
      WHERE u.email = ?`,
      ["demo@example.com"]
    );

    console.log("JOIN sorgusu başarılı!");
    console.log(rows);
  } catch (error) {
    console.error("Sorgu hatası:", error);
  } finally {
    await pool.end();
  }
}

main();
