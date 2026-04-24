import { type NextRequest, NextResponse } from "next/server"
import { closeSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Cerrar la sesión
    closeSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
