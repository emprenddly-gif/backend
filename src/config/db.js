import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// ✅ Variables de entorno con valores por defecto
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";      // por defecto "root"
const DB_PASS = process.env.DB_PASS || "";          // sin contraseña
const DB_NAME = process.env.DB_NAME || "emprenddly_2"; // cambia si tu BD tiene otro nombre
const DB_PORT = process.env.DB_PORT || 3306;

console.log("🟢 Intentando conexión con la base de datos:");
console.log({
  host: DB_HOST,
  user: DB_USER || "(vacío)",
  pass: DB_PASS ? "****" : "(vacío)",
  db: DB_NAME,
  port: DB_PORT,
});

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS || undefined, // si está vacío, no se envía
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conexión a la base de datos exitosa.");
    connection.release();
  } catch (error) {
    console.error("❌ ERROR DE CONEXIÓN A LA BASE DE DATOS:");
    console.error(error.message);
  }
}

testDbConnection();

export default pool;
