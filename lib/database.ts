import mysql from "mysql2/promise"

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "barberia",
  charset: "utf8mb4",
  timezone: "+00:00",
}

// Crear un pool de conexiones
let pool: mysql.Pool

try {
  pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
} catch (error) {
  console.error("Error al crear el pool de conexiones:", error)
  throw error
}

// Función para ejecutar consultas SQL
export async function query(sql: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Error al ejecutar la consulta SQL:", error)
    console.error("SQL:", sql)
    console.error("Params:", params)
    throw error
  }
}

// Función para obtener un solo registro
export async function getOne(sql: string, params: any[] = []) {
  const results: any = await query(sql, params)
  return Array.isArray(results) && results.length > 0 ? results[0] : null
}

// Función para insertar un registro y obtener el ID insertado
export async function insert(sql: string, params: any[] = []) {
  try {
    const [result]: any = await pool.execute(sql, params)
    return result.insertId
  } catch (error) {
    console.error("Error al insertar registro:", error)
    throw error
  }
}

// Función para actualizar registros
export async function update(sql: string, params: any[] = []) {
  try {
    const [result]: any = await pool.execute(sql, params)
    return result.affectedRows
  } catch (error) {
    console.error("Error al actualizar registros:", error)
    throw error
  }
}

// Función para eliminar registros
export async function remove(sql: string, params: any[] = []) {
  try {
    const [result]: any = await pool.execute(sql, params)
    return result.affectedRows
  } catch (error) {
    console.error("Error al eliminar registros:", error)
    throw error
  }
}

// Función para verificar la conexión
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    return true
  } catch (error) {
    console.error("Error de conexión a la base de datos:", error)
    return false
  }
}

export default {
  query,
  getOne,
  insert,
  update,
  remove,
  testConnection,
}
