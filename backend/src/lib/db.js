import mysql from "mysql2/promise";
import awsCaBundle from "aws-ssl-profiles";

let pool;

// Reused across invocations of the same Lambda container.
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: awsCaBundle,
      connectionLimit: 2,
      connectTimeout: 5000,
    });
  }
  return pool;
}
