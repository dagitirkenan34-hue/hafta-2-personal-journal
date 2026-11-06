import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "localhost",
  port: 3307,
  user: "journal_user",
  password: process.env.MYSQL_PASSWORD,
  database: "personal_journal",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});