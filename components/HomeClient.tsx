'use client'

import Image from 'next/image'
import LoginForm from '@/components/login-form'
import dynamic from 'next/dynamic'

const AnimatedBackground = dynamic(() => import('@/components/animated-background'), { ssr: false })

export default function HomeClient() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="hidden w-1/2 bg-[#1a3b5d] lg:block">
        <div className="relative h-full w-full overflow-hidden">
          <div className="absolute inset-0 bg-[#1a3b5d] opacity-90"></div>
          <AnimatedBackground />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
            <Image src="/logo-click-barber.png" alt="Click Barber" width={300} height={150} className="mb-8" priority />
            <h1 className="mb-6 text-5xl font-bold">Click Barber</h1>
            <p className="mb-8 text-xl">Optimizing Your Cut</p>
            <div className="w-24 border-b-2 border-[#4a9bd1]"></div>
            <div className="mt-12 max-w-md">
              <h2 className="mb-4 text-2xl font-semibold">Sistema de gestión para barberías</h2>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="mr-2 h-1.5 w-1.5 rounded-full bg-[#4a9bd1]"></div>
                  <span>Gestión de citas y clientes</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-2 h-1.5 w-1.5 rounded-full bg-[#4a9bd1]"></div>
                  <span>Control de inventario y ventas</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-2 h-1.5 w-1.5 rounded-full bg-[#4a9bd1]"></div>
                  <span>Facturación y pagos</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-2 h-1.5 w-1.5 rounded-full bg-[#4a9bd1]"></div>
                  <span>Estadísticas y reportes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Image
              src="/logo-click-barber.png"
              alt="Click Barber"
              width={200}
              height={100}
              className="mx-auto mb-4"
              priority
            />
            <h1 className="text-3xl font-bold text-[#1a3b5d]">Click Barber</h1>
            <p className="text-gray-600">Optimizing Your Cut</p>
          </div>
          <LoginForm />
          <p className="mt-8 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Click Barber. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
