import "dotenv/config";
import { pool } from "../src/lib/mysql";

async function main() {
  try {
    const [rows] = await pool.query("SELECT VERSION() AS version");

    console.log("MySQL bağlantısı başarılı!");
    console.log(rows);
  } catch (error) {
    console.error("Veritabanı bağlantı hatası:", error);
  } finally {
    await pool.end();
  }
}

main();