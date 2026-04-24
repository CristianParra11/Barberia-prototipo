"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard/home"

  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsMounted(true)

    // Recuperar nombre de usuario si está guardado
    const savedUsername = localStorage.getItem("rememberedUsername")
    if (savedUsername) {
      setUsername(savedUsername)
      setRemember(true)
    }
  }, [])

 //este es el codigo original con BD. 
/*
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setError("Por favor ingrese su nombre de usuario y contraseña")
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 600) // Duración de la animación
      return
    }

    try {
      setIsLoading(true)
      setError("")

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, remember }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión")
      }

      // Guardar nombre de usuario si "recordarme" está activado
      if (remember) {
        localStorage.setItem("rememberedUsername", username)
      } else {
        localStorage.removeItem("rememberedUsername")
      }

      // Redirigir al usuario
      router.push(redirect)
    } catch (error: any) {
      console.error("Error de inicio de sesión:", error)
      setError(error.message || "Error al iniciar sesión")
      setIsLoading(false)
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 600) // Duración de la animación
    }
  }
*/

// modo prototipo
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!username || !password) {
    setError("Por favor ingrese su nombre de usuario y contraseña")
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 600)
    return
  }

  setIsLoading(true)
  setError("")

  // Simulación de login
  setTimeout(() => {
    if (remember) {
      localStorage.setItem("rememberedUsername", username)
    } else {
      localStorage.removeItem("rememberedUsername")
    }

    alert("Inicio de sesión exitoso (modo prototipo)")

    router.push(redirect)
  }, 1000)
}
   //hasta aqui es el modo prototipo.


  // Si no estamos en el cliente, mostrar un placeholder
  if (!isMounted) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader className="pb-4">
          <div className="h-7 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className={`transition-all duration-300 ease-in-out ${isShaking ? "animate-shake" : ""}`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#1a3b5d]">Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input
              id="username"
              type="text"
              placeholder="Ingresa tu nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="border-gray-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="border-gray-300"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(checked) => setRemember(checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="remember" className="text-sm text-gray-600">
              Recordar mi usuario
            </Label>
          </div>
          <Button type="submit" className="w-full bg-[#1a3b5d] hover:bg-[#2a4b6d]" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
