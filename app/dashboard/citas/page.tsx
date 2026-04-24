import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CitasCalendario from "@/components/dashboard/citas/citas-calendario"
import CitasLista from "@/components/dashboard/citas/citas-lista"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function CitasPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3b5d]">Gestión de Citas</h1>
          <p className="text-gray-600">Administra las citas y reservas de la barbería</p>
        </div>
        <Button asChild className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
          <Link href="/dashboard/citas/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cita
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList className="mb-4 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
        </TabsList>
        <TabsContent value="lista">
          <CitasLista />
        </TabsContent>
        <TabsContent value="calendario">
          <CitasCalendario />
        </TabsContent>
      </Tabs>
    </div>
  )
}
