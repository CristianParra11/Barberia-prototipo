"use client"

import { use } from "react"
import FacturaPreview from "@/components/dashboard/pagos/factura-preview"

interface FacturaPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ print?: string }>
}

export default function FacturaPage({ params, searchParams }: FacturaPageProps) {
  const resolvedParams = use(params)
  const resolvedSearchParams = use(searchParams)

  const print = resolvedSearchParams.print === "true"

  return <FacturaPreview id={resolvedParams.id} print={print} />
}
