"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import gsap from "gsap"
import { Scissors, Calendar, Users, Bookmark } from "lucide-react"

export default function DashboardClient() {
  const headerRef = useRef(null)
  const titleRef = useRef(null)
  const cardsRef = useRef([])

  useEffect(() => {
    // Animación de entrada
    const tl = gsap.timeline()

    tl.from(headerRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    })

    tl.from(
      titleRef.current,
      {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      },
      "-=0.4",
    )

    tl.from(
      cardsRef.current,
      {
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 0.6,
        ease: "back.out(1.7)",
      },
      "-=0.2",
    )
  }, [])

  return (
    <>
      <header ref={headerRef} className="border-b border-gray-200 bg-white p-6 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image src="/logo-click-barber.png" alt="Click Barber" width={120} height={60} priority />
            <h1 className="text-2xl font-bold text-[#1a3b5d]">Click Barber</h1>
          </div>
          <Button
            variant="outline"
            asChild
            className="border-[#1a3b5d] text-[#1a3b5d] hover:bg-[#1a3b5d] hover:text-white"
          >
            <Link href="/">Cerrar Sesión</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-8">
        <div ref={titleRef} className="mb-8">
          <h2 className="text-2xl font-semibold text-[#1a3b5d]">Panel de Administración</h2>
          <p className="text-gray-600">Bienvenido al sistema de gestión de Click Barber</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div
            ref={(el) => (cardsRef.current[0] = el)}
            className="flex items-center rounded-lg border border-gray-200 bg-white p-6 shadow-md"
          >
            <div className="mr-4 rounded-full bg-[#e6f0f9] p-3">
              <Calendar className="h-6 w-6 text-[#1a3b5d]" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Citas Hoy</h3>
              <p className="text-2xl font-bold text-[#1a3b5d]">0</p>
            </div>
          </div>

          <div
            ref={(el) => (cardsRef.current[1] = el)}
            className="flex items-center rounded-lg border border-gray-200 bg-white p-6 shadow-md"
          >
            <div className="mr-4 rounded-full bg-[#e6f0f9] p-3">
              <Users className="h-6 w-6 text-[#1a3b5d]" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Clientes</h3>
              <p className="text-2xl font-bold text-[#1a3b5d]">0</p>
            </div>
          </div>

          <div
            ref={(el) => (cardsRef.current[2] = el)}
            className="flex items-center rounded-lg border border-gray-200 bg-white p-6 shadow-md"
          >
            <div className="mr-4 rounded-full bg-[#e6f0f9] p-3">
              <Scissors className="h-6 w-6 text-[#1a3b5d]" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Servicios</h3>
              <p className="text-2xl font-bold text-[#1a3b5d]">0</p>
            </div>
          </div>

          <div
            ref={(el) => (cardsRef.current[3] = el)}
            className="flex items-center rounded-lg border border-gray-200 bg-white p-6 shadow-md"
          >
            <div className="mr-4 rounded-full bg-[#e6f0f9] p-3">
              <Bookmark className="h-6 w-6 text-[#1a3b5d]" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Reservas</h3>
              <p className="text-2xl font-bold text-[#1a3b5d]">0</p>
            </div>
          </div>
        </div>

        <div
          ref={(el) => (cardsRef.current[4] = el)}
          className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-md"
        >
          <h3 className="mb-4 text-xl font-semibold text-[#1a3b5d]">Próximas Citas</h3>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">No hay citas programadas</p>
          </div>
        </div>
      </main>
    </>
  )
}
