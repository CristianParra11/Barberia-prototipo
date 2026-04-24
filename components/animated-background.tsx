"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // No ejecutar nada si no estamos en el cliente o si el ref no está disponible
    if (!isMounted || !containerRef.current) return

    // Crear elementos de fondo
    const container = containerRef.current
    const numScissors = 12
    const numClocks = 12
    const elements: HTMLDivElement[] = []

    // Crear tijeras
    for (let i = 0; i < numScissors; i++) {
      const element = document.createElement("div")
      element.className = "absolute text-[#4a9bd1] opacity-20"

      // Crear el SVG de tijeras
      const scissorsIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      scissorsIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg")
      scissorsIcon.setAttribute("width", "24")
      scissorsIcon.setAttribute("height", "24")
      scissorsIcon.setAttribute("viewBox", "0 0 24 24")
      scissorsIcon.setAttribute("fill", "none")
      scissorsIcon.setAttribute("stroke", "currentColor")
      scissorsIcon.setAttribute("stroke-width", "2")
      scissorsIcon.setAttribute("stroke-linecap", "round")
      scissorsIcon.setAttribute("stroke-linejoin", "round")

      const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path1.setAttribute("d", "M6 9c0 1.5 1 2 2 2.5S10 13 10 14c0 1-1 2-4 2-2 0-4-1-4-4 0-3.5 4-6 8-6")
      scissorsIcon.appendChild(path1)

      const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path2.setAttribute("d", "M6 15c0-1.5 1-2 2-2.5S10 11 10 10c0-1-1-2-4-2-2 0-4 1-4 4 0 3.5 4 6 8 6")
      scissorsIcon.appendChild(path2)

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
      line.setAttribute("x1", "14")
      line.setAttribute("y1", "4")
      line.setAttribute("x2", "20")
      line.setAttribute("y2", "20")
      scissorsIcon.appendChild(line)

      element.appendChild(scissorsIcon)

      // Tamaño aleatorio entre 24px y 64px
      const size = Math.random() * 40 + 24
      scissorsIcon.setAttribute("width", `${size}px`)
      scissorsIcon.setAttribute("height", `${size}px`)

      // Posición inicial aleatoria
      element.style.left = `${Math.random() * 100}%`
      element.style.top = `${Math.random() * 100}%`

      container.appendChild(element)
      elements.push(element)
    }

    // Crear relojes
    for (let i = 0; i < numClocks; i++) {
      const element = document.createElement("div")
      element.className = "absolute text-[#4a9bd1] opacity-20"

      // Crear el SVG de reloj
      const clockIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      clockIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg")
      clockIcon.setAttribute("width", "24")
      clockIcon.setAttribute("height", "24")
      clockIcon.setAttribute("viewBox", "0 0 24 24")
      clockIcon.setAttribute("fill", "none")
      clockIcon.setAttribute("stroke", "currentColor")
      clockIcon.setAttribute("stroke-width", "2")
      clockIcon.setAttribute("stroke-linecap", "round")
      clockIcon.setAttribute("stroke-linejoin", "round")

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      circle.setAttribute("cx", "12")
      circle.setAttribute("cy", "12")
      circle.setAttribute("r", "10")
      clockIcon.appendChild(circle)

      const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line")
      line1.setAttribute("x1", "12")
      line1.setAttribute("y1", "6")
      line1.setAttribute("x2", "12")
      line1.setAttribute("y2", "12")
      clockIcon.appendChild(line1)

      const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line")
      line2.setAttribute("x1", "12")
      line2.setAttribute("y1", "12")
      line2.setAttribute("x2", "16")
      line2.setAttribute("y2", "14")
      clockIcon.appendChild(line2)

      element.appendChild(clockIcon)

      // Tamaño aleatorio entre 24px y 64px
      const size = Math.random() * 40 + 24
      clockIcon.setAttribute("width", `${size}px`)
      clockIcon.setAttribute("height", `${size}px`)

      // Posición inicial aleatoria
      element.style.left = `${Math.random() * 100}%`
      element.style.top = `${Math.random() * 100}%`

      container.appendChild(element)
      elements.push(element)
    }

    // Añadir partículas flotantes
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div")
      const size = Math.random() * 6 + 2

      particle.style.position = "absolute"
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.borderRadius = "50%"
      particle.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`

      container.appendChild(particle)
      elements.push(particle)
    }

    // Animar elementos
    const animateElement = (element: HTMLDivElement) => {
      // Duración aleatoria entre 15 y 30 segundos
      const duration = Math.random() * 15 + 15

      // Posición final aleatoria
      const xPercent = Math.random() * 100
      const yPercent = Math.random() * 100

      gsap.to(element, {
        xPercent,
        yPercent,
        duration,
        ease: "sine.inOut",
        opacity: Math.random() * 0.3 + 0.1,
        rotation: Math.random() * 360,
        scale: Math.random() * 1.5 + 0.5,
        onComplete: () => animateElement(element), // Repetir animación
      })
    }

    elements.forEach((element) => {
      animateElement(element)
    })

    // Efecto de luz
    const light = document.createElement("div")
    light.style.position = "absolute"
    light.style.width = "300px"
    light.style.height = "300px"
    light.style.borderRadius = "50%"
    light.style.background = "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)"
    light.style.pointerEvents = "none"
    container.appendChild(light)

    // Mover el efecto de luz con el ratón
    const moveLight = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) return

      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      light.style.left = `${x - 150}px`
      light.style.top = `${y - 150}px`
    }

    document.addEventListener("mousemove", moveLight)

    // Limpieza al desmontar
    return () => {
      document.removeEventListener("mousemove", moveLight)
      elements.forEach((element) => {
        gsap.killTweensOf(element)
        if (element.parentNode === container) {
          container.removeChild(element)
        }
      })
      if (light.parentNode === container) {
        container.removeChild(light)
      }
    }
  }, [isMounted]) // Dependencia de isMounted para asegurar que solo se ejecute en el cliente

  // Renderizar un placeholder si no estamos en el cliente
  if (!isMounted) {
    return <div className="absolute inset-0 overflow-hidden bg-[#1a3b5d] opacity-90"></div>
  }

  return <div ref={containerRef} className="absolute inset-0 overflow-hidden" />
}

export default AnimatedBackground
