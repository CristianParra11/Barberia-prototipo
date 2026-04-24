import { type NextRequest, NextResponse } from "next/server"
import { verifyCredentials, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password, remember } = await request.json()

    // Validar que se proporcionaron username y password
    if (!username || !password) {
      return NextResponse.json({ error: "El nombre de usuario y la contraseña son obligatorios" }, { status: 400 })
    }

    // Verificar credenciales
    const user = await verifyCredentials(username, password)

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Crear sesión
    createSession(user)

    // Devolver información del usuario (sin datos sensibles)
    return NextResponse.json({
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
    })
  } catch (error) {
    console.error("Error en el inicio de sesión:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
