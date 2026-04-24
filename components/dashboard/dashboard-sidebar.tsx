"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSidebar } from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  LayoutDashboard,
  Users,
  Scissors,
  Calendar,
  Package,
  ShoppingBag,
  CreditCard,
  Settings,
  Menu,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, setIsOpen } = useSidebar()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  // Determinar el submenú activo basado en la ruta actual
  useEffect(() => {
    if (pathname?.startsWith("/dashboard/empleados")) {
      setActiveSubmenu("empleados")
    } else if (pathname?.startsWith("/dashboard/servicios")) {
      setActiveSubmenu("servicios")
    } else if (pathname?.startsWith("/dashboard/citas")) {
      setActiveSubmenu("citas")
    } else if (pathname?.startsWith("/dashboard/inventario") || pathname?.startsWith("/dashboard/proveedores")) {
      setActiveSubmenu("inventario")
    } else if (pathname?.startsWith("/dashboard/clientes")) {
      setActiveSubmenu("clientes")
    } else if (pathname?.startsWith("/dashboard/pagos")) {
      setActiveSubmenu("pagos")
    } else if (pathname?.startsWith("/dashboard/ventas")) {
      setActiveSubmenu("ventas")
    } else if (pathname?.startsWith("/dashboard/configuracion")) {
      setActiveSubmenu("configuracion")
    } else {
      setActiveSubmenu(null)
    }
  }, [pathname])

  const toggleSubmenu = (submenu: string) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al cerrar sesión")
      }

      router.push("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-4 z-40 h-8 w-8 rounded-full bg-white shadow-md lg:hidden"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <MobileSidebar pathname={pathname} onLogout={() => setShowLogoutDialog(true)} />
        </SheetContent>
      </Sheet>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-white lg:flex">
        <div className="border-b p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold text-lg text-[#1a3b5d] hover:text-[#2a4b6d]"
          >
            <Scissors className="h-5 w-5" />
            <span>Click Barber</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            <Link
              href="/dashboard/home"
              className={cn(
                "group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                pathname === "/dashboard/home" && "bg-[#e8f0f9] text-[#1a3b5d]",
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            {/* Empleados */}
            <div className="grid gap-1">
              <button
                onClick={() => toggleSubmenu("empleados")}
                className={cn(
                  "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                  (activeSubmenu === "empleados" || pathname?.startsWith("/dashboard/empleados")) &&
                    "bg-[#e8f0f9] text-[#1a3b5d]",
                )}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Empleados</span>
                </div>
                {activeSubmenu === "empleados" ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {activeSubmenu === "empleados" && (
                <div className="grid gap-1 pl-6">
                  <Link
                    href="/dashboard/empleados"
                    className={cn(
                      "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                      pathname === "/dashboard/empleados" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                    )}
                  >
                    Lista de Empleados
                  </Link>
                  <Link
                    href="/dashboard/empleados/nuevo"
                    className={cn(
                      "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                      pathname === "/dashboard/empleados/nuevo" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                    )}
                  >
                    Nuevo Empleado
                  </Link>
                </div>
              )}
            </div>

             {/* Clientes */}
            <div className="grid gap-1">
              <button
                onClick={() => toggleSubmenu("clientes")}
                className={cn(
                  "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                  (activeSubmenu === "clientes" || pathname?.startsWith("/dashboard/clientes")) &&
                    "bg-[#e8f0f9] text-[#1a3b5d]",
                )}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Clientes</span>
                </div>
                {activeSubmenu === "clientes" ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {activeSubmenu === "clientes" && (
                <div className="grid gap-1 pl-6">
                  <Link
                    href="/dashboard/clientes"
                    className={cn(
                      "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                      pathname === "/dashboard/clientes" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                    )}
                  >
                    Lista de Clientes
                  </Link>
                  <Link
                    href="/dashboard/clientes/nuevo"
                    className={cn(
                      "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                      pathname === "/dashboard/clientes/nuevo" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                    )}
                  >
                    Nuevo Cliente
                  </Link>
                </div>
              )}
            </div>
             {/* Inventario */}
            <div className="grid gap-1">
              <button
                onClick={() => toggleSubmenu("inventario")}
                className={cn(
                  "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                  (activeSubmenu === "inventario" ||
                    pathname?.startsWith("/dashboard/inventario") ||
                    pathname?.startsWith("/dashboard/proveedores")) &&
                    "bg-[#e8f0f9] text-[#1a3b5d]",
                )}
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Inventario</span>
                </div>
                {activeSubmenu === "inventario" ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {activeSubmenu === "inventario" && (
                <div className="grid gap-1 pl-6">
                  <Link
                    href="/dashboard/inventario"
                    className={cn(
                      "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                      pathname === "/dashboard/inventario" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                    )}
                  >
                    Productos
                  </Link>
                  <Link
                    href="/dashboard/inventario/nuevo"
                    className={cn(
                      "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                      pathname === "/dashboard/inventario/nuevo" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                    )}
                  >
                    Nuevo Producto
                  </Link>
                  <Link
                    href="/dashboard/proveedores"
                    className={cn(
                      "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                      pathname === "/dashboard/proveedores" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                    )}
                  >
                    Proveedores
                  </Link>
                  <Link
                    href="/dashboard/proveedores/nuevo"
                    className={cn(
                      "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                      pathname === "/dashboard/proveedores/nuevo" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                    )}
                  >
                    Nuevo Proveedor
                  </Link>
                </div>
              )}
            </div>

            {/* Servicios */}
            <div className="grid gap-1">
              <button
                onClick={() => toggleSubmenu("servicios")}
                className={cn(
                  "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                  (activeSubmenu === "servicios" || pathname?.startsWith("/dashboard/servicios")) &&
                    "bg-[#e8f0f9] text-[#1a3b5d]",
                )}
              >
                <div className="flex items-center gap-2">
                  <Scissors className="h-4 w-4" />
                  <span>Servicios</span>
                </div>
                {activeSubmenu === "servicios" ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {activeSubmenu === "servicios" && (
                <div className="grid gap-1 pl-6">
                  <Link
                    href="/dashboard/servicios"
                    className={cn(
                      "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                      pathname === "/dashboard/servicios" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                    )}
                  >
                    Lista de Servicios
                  </Link>
                  <Link
                    href="/dashboard/servicios/nuevo"
                    className={cn(
                      "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                      pathname === "/dashboard/servicios/nuevo" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                    )}
                  >
                    Nuevo Servicio
                  </Link>
                </div>
              )}
            </div>

            {/* Citas */}
            <div className="grid gap-1">
              <button
                onClick={() => toggleSubmenu("citas")}
                className={cn(
                  "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                  (activeSubmenu === "citas" || pathname?.startsWith("/dashboard/citas")) &&
                    "bg-[#e8f0f9] text-[#1a3b5d]",
                )}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Citas</span>
                </div>
                {activeSubmenu === "citas" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {activeSubmenu === "citas" && (
                <div className="grid gap-1 pl-6">
                  <Link
                    href="/dashboard/citas"
                    className={cn(
                      "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                      pathname === "/dashboard/citas" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                    )}
                  >
                    Calendario
                  </Link>
                  <Link
                    href="/dashboard/citas/nueva"
                    className={cn(
                      "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                      pathname === "/dashboard/citas/nueva" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                    )}
                  >
                    Nueva Cita
                  </Link>
                </div>
              )}
            </div>

           

            {/* Pagos */}
            <div className="grid gap-1">
              <button
                onClick={() => toggleSubmenu("pagos")}
                className={cn(
                  "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                  (activeSubmenu === "pagos" || pathname?.startsWith("/dashboard/pagos")) &&
                    "bg-[#e8f0f9] text-[#1a3b5d]",
                )}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Pagos</span>
                </div>
                {activeSubmenu === "pagos" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {activeSubmenu === "pagos" && (
                <div className="grid gap-1 pl-6">
                  <Link
                    href="/dashboard/pagos"
                    className={cn(
                      "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                      pathname === "/dashboard/pagos" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                    )}
                  >
                    Historial de Pagos
                  </Link>
                  <Link
                    href="/dashboard/pagos/nuevo"
                    className={cn(
                      "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                      pathname === "/dashboard/pagos/nuevo" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                    )}
                  >
                    Nuevo Pago
                  </Link>
                  <Link
                    href="/dashboard/pagos/informes"
                    className={cn(
                      "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                      pathname === "/dashboard/pagos/informes" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                    )}
                  >
                    Informes Financieros
                  </Link>
                </div>
              )}
            </div>

           

            {/* Configuración */}
            <Link
              href="/dashboard/configuracion"
              className={cn(
                "group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                pathname === "/dashboard/configuracion" && "bg-[#e8f0f9] text-[#1a3b5d]",
              )}
            >
              <Settings className="h-4 w-4" />
              Configuración
            </Link>
          </nav>
        </ScrollArea>
        <div className="mt-auto border-t p-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>Serás redirigido a la página de inicio de sesión.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600">
              Cerrar Sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function MobileSidebar({ pathname, onLogout }) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  const toggleSubmenu = (submenu: string) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-lg text-[#1a3b5d] hover:text-[#2a4b6d]"
        >
          <Scissors className="h-5 w-5" />
          <span>Click Barber</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {/* Mismo contenido que el sidebar desktop */}
          <Link
            href="/dashboard/home"
            className={cn(
              "group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
              pathname === "/dashboard/home" && "bg-[#e8f0f9] text-[#1a3b5d]",
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          {/* Empleados */}
          <div className="grid gap-1">
            <button
              onClick={() => toggleSubmenu("empleados")}
              className={cn(
                "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                (activeSubmenu === "empleados" || pathname?.startsWith("/dashboard/empleados")) &&
                  "bg-[#e8f0f9] text-[#1a3b5d]",
              )}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Empleados</span>
              </div>
              {activeSubmenu === "empleados" ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {activeSubmenu === "empleados" && (
              <div className="grid gap-1 pl-6">
                <Link
                  href="/dashboard/empleados"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/empleados" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Lista de Empleados
                </Link>
                <Link
                  href="/dashboard/empleados/nuevo"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/empleados/nuevo" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Nuevo Empleado
                </Link>
              </div>
            )}
          </div>

          {/* Servicios */}
          <div className="grid gap-1">
            <button
              onClick={() => toggleSubmenu("servicios")}
              className={cn(
                "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                (activeSubmenu === "servicios" || pathname?.startsWith("/dashboard/servicios")) &&
                  "bg-[#e8f0f9] text-[#1a3b5d]",
              )}
            >
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                <span>Servicios</span>
              </div>
              {activeSubmenu === "servicios" ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {activeSubmenu === "servicios" && (
              <div className="grid gap-1 pl-6">
                <Link
                  href="/dashboard/servicios"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/servicios" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Lista de Servicios
                </Link>
                <Link
                  href="/dashboard/servicios/nuevo"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/servicios/nuevo" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Nuevo Servicio
                </Link>
              </div>
            )}
          </div>

          {/* Citas */}
          <div className="grid gap-1">
            <button
              onClick={() => toggleSubmenu("citas")}
              className={cn(
                "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                (activeSubmenu === "citas" || pathname?.startsWith("/dashboard/citas")) &&
                  "bg-[#e8f0f9] text-[#1a3b5d]",
              )}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Citas</span>
              </div>
              {activeSubmenu === "citas" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {activeSubmenu === "citas" && (
              <div className="grid gap-1 pl-6">
                <Link
                  href="/dashboard/citas"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/citas" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Calendario
                </Link>
                <Link
                  href="/dashboard/citas/nueva"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/citas/nueva" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Nueva Cita
                </Link>
              </div>
            )}
          </div>

          {/* Inventario */}
          <div className="grid gap-1">
            <button
              onClick={() => toggleSubmenu("inventario")}
              className={cn(
                "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                (activeSubmenu === "inventario" ||
                  pathname?.startsWith("/dashboard/inventario") ||
                  pathname?.startsWith("/dashboard/proveedores")) &&
                  "bg-[#e8f0f9] text-[#1a3b5d]",
              )}
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Inventario</span>
              </div>
              {activeSubmenu === "inventario" ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {activeSubmenu === "inventario" && (
              <div className="grid gap-1 pl-6">
                <Link
                  href="/dashboard/inventario"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/inventario" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Productos
                </Link>
                <Link
                  href="/dashboard/inventario/nuevo"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/inventario/nuevo" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Nuevo Producto
                </Link>
                <Link
                  href="/dashboard/proveedores"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/proveedores" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Proveedores
                </Link>
                <Link
                  href="/dashboard/proveedores/nuevo"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/proveedores/nuevo" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Nuevo Proveedor
                </Link>
              </div>
            )}
          </div>

          {/* Pagos */}
          <div className="grid gap-1">
            <button
              onClick={() => toggleSubmenu("pagos")}
              className={cn(
                "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                (activeSubmenu === "pagos" || pathname?.startsWith("/dashboard/pagos")) &&
                  "bg-[#e8f0f9] text-[#1a3b5d]",
              )}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Pagos</span>
              </div>
              {activeSubmenu === "pagos" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {activeSubmenu === "pagos" && (
              <div className="grid gap-1 pl-6">
                <Link
                  href="/dashboard/pagos"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/pagos" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Historial de Pagos
                </Link>
                <Link
                  href="/dashboard/pagos/nuevo"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/pagos/nuevo" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Nuevo Pago
                </Link>
                <Link
                  href="/dashboard/pagos/informes"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/pagos/informes" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Informes Financieros
                </Link>
              </div>
            )}
          </div>

          {/* Ventas */}
          <div className="grid gap-1">
            <button
              onClick={() => toggleSubmenu("ventas")}
              className={cn(
                "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                (activeSubmenu === "ventas" || pathname?.startsWith("/dashboard/ventas")) &&
                  "bg-[#e8f0f9] text-[#1a3b5d]",
              )}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span>Ventas</span>
              </div>
              {activeSubmenu === "ventas" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {activeSubmenu === "ventas" && (
              <div className="grid gap-1 pl-6">
                <Link
                  href="/dashboard/ventas"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/ventas" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Historial de Ventas
                </Link>
                <Link
                  href="/dashboard/ventas/nueva"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/ventas/nueva" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Nueva Venta
                </Link>
              </div>
            )}
          </div>

          {/* Clientes */}
          <div className="grid gap-1">
            <button
              onClick={() => toggleSubmenu("clientes")}
              className={cn(
                "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                (activeSubmenu === "clientes" || pathname?.startsWith("/dashboard/clientes")) &&
                  "bg-[#e8f0f9] text-[#1a3b5d]",
              )}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Clientes</span>
              </div>
              {activeSubmenu === "clientes" ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {activeSubmenu === "clientes" && (
              <div className="grid gap-1 pl-6">
                <Link
                  href="/dashboard/clientes"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/clientes" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Lista de Clientes
                </Link>
                <Link
                  href="/dashboard/clientes/nuevo"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
                    pathname === "/dashboard/clientes/nuevo" && "bg-[#e8f0f9] text-[#1a3b5d] font-medium",
                  )}
                >
                  Nuevo Cliente
                </Link>
              </div>
            )}
          </div>

          {/* Configuración */}
          <Link
            href="/dashboard/configuracion"
            className={cn(
              "group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-[#e8f0f9] hover:text-[#1a3b5d]",
              pathname === "/dashboard/configuracion" && "bg-[#e8f0f9] text-[#1a3b5d]",
            )}
          >
            <Settings className="h-4 w-4" />
            Configuración
          </Link>
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
