import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <h1 className="mb-2 text-6xl font-bold text-[#1a3b5d]">404</h1>
      <h2 className="mb-4 text-2xl font-semibold">Página no encontrada</h2>
      <p className="mb-8 max-w-md text-gray-600">
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </p>
      <Button asChild className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
        <Link href="/dashboard/home">Volver al inicio</Link>
      </Button>
    </div>
  )
}
