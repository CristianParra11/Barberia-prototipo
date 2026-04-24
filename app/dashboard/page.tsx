import { redirect } from "next/navigation"

export default function DashboardPage() {
  // Redirigir a la página principal del dashboard
  redirect("/dashboard/home")
}
