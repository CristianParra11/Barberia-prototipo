import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "./lib/auth"

// Rutas que no requieren autenticación
const publicRoutes = ["/login", "/api/auth/login"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar si la ruta es pública
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificar si el usuario está autenticado
  const session = getSession()

  if (!session) {
    // Redirigir al login si no está autenticado
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.search = `?redirect=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url)
  }

  // Continuar con la solicitud si está autenticado
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Excluir archivos estáticos y API routes que no requieren autenticación
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
}
