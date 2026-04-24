import { cookies } from "next/headers"
import { encrypt, decrypt } from "./crypto"
import { getOne, update } from "./db"

const SESSION_DURATION = 24 * 60 * 60 * 1000
const SESSION_COOKIE_NAME = "click_barber_session"

export interface User {
  id: number
  username: string
  nombre: string
  apellido: string
  email: string
  rol: string
  estado: string
}

// Verificar credenciales
export async function verifyCredentials(username: string, password: string): Promise<User | null> {
  try {
    const user = await getOne(
      "SELECT id, username, nombre, apellido, email, rol, estado FROM usuarios WHERE username = ? AND password = ? AND estado = 'activo'",
      [username, password]
    )

    if (!user) return null

    await update("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?", [user.id])

    return user as User
  } catch (error) {
    console.error("Error al verificar credenciales:", error)
    return null
  }
}

// Crear sesión
export async function createSession(user: User): Promise<void> {
  const sessionData = {
    userId: user.id,
    username: user.username,
    rol: user.rol,
    expires: Date.now() + SESSION_DURATION,
  }

const encryptedSession = await encrypt(JSON.stringify(sessionData))

  const cookieStore = await cookies()
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: encryptedSession,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION / 1000,
  })
}

// Obtener sesión
export async function getSession(): Promise<{ userId: number; username: string; rol: string; expires: number } | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie) return null

  try {
const decryptedSession = await decrypt(sessionCookie.value)
    const sessionData = JSON.parse(decryptedSession)

    if (sessionData.expires < Date.now()) {
      await cookieStore.delete(SESSION_COOKIE_NAME)
      return null
    }

    return sessionData
  } catch (error) {
    console.error("Error al obtener la sesión:", error)
    return null
  }
}

// Cerrar sesión
export async function closeSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Verificar autenticación
export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null
}

// Obtener usuario actual
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) return null

  try {
    const user = await getOne(
      "SELECT id, username, nombre, apellido, email, rol, estado FROM usuarios WHERE id = ? AND estado = 'activo'",
      [session.userId]
    )
    return user as User
  } catch (error) {
    console.error("Error al obtener el usuario actual:", error)
    return null
  }
}
