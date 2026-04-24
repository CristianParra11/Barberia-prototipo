// Tipos basados en tu esquema de base de datos real
export interface Cliente {
  id: string
  nombre: string
  apellido: string
  email?: string
  telefono: string
  fecha_registro: string
  notas?: string
  foto?: string
  created_at?: string
  updated_at?: string
  // Para estadísticas
  estadisticas?: {
    totalCitas: number
    totalCompras: number
    citasCompletadas: number
    citasPendientes: number
    totalGastado: number
  }
}

export interface Empleado {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  puesto: string
  fecha_contratacion: string
  estado: "activo" | "inactivo"
  especialidades: string[]
  foto?: string
  usuario_id?: number
  created_at?: string
  updated_at?: string
  estadisticas?: {
    totalCitas: number
    citasCompletadas: number
    citasPendientes: number
    totalVentas: number
  }
}

export interface Servicio {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  duracion: number
  categoria: string
  imagen?: string
  destacado: boolean
  estado: "activo" | "inactivo"
  created_at?: string
  updated_at?: string
}

export interface Producto {
  id: string
  codigo?: string
  nombre: string
  descripcion?: string
  precio: number
  precio_compra: number
  stock: number
  stock_minimo: number
  categoria:
    | "Cuidado Capilar"
    | "Cuidado Facial"
    | "Cuidado de Barba"
    | "Afeitado"
    | "Styling"
    | "Accesorios"
    | "Perfumería"
  genero: "Hombre" | "Mujer" | "Unisex"
  marca: string
  proveedor_id: string
  imagen?: string
  destacado: boolean
  estado: "activo" | "inactivo"
  fecha_creacion: string
  created_at?: string
  updated_at?: string
}

export interface Proveedor {
  id: string
  nombre: string
  contacto: string
  telefono: string
  email?: string
  direccion?: string
  notas?: string
  estado: "activo" | "inactivo"
  created_at?: string
  updated_at?: string
}

export interface Cita {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  cliente_id: string
  empleado_id: string
  estado: "programada" | "completada" | "cancelada" | "no-asistio"
  notas?: string
  precio_total: number
  created_at?: string
  updated_at?: string
  // Datos relacionados de la base de datos (campos planos de las consultas JOIN)
  cliente_nombre?: string
  cliente_apellido?: string
  cliente_email?: string
  cliente_telefono?: string
  cliente_foto?: string
  empleado_nombre?: string
  empleado_apellido?: string
  empleado_email?: string
  empleado_telefono?: string
  empleado_puesto?: string
  empleado_foto?: string
  // Relaciones (objetos completos)
  cliente?: Cliente
  empleado?: Empleado
  servicios?: CitaServicio[]
}

export interface CitaServicio {
  id: number
  cita_id: string
  servicio_id: string
  precio: number
  created_at?: string
  // Datos del servicio incluidos en la consulta JOIN
  nombre?: string
  descripcion?: string
  duracion?: number
  categoria?: string
  imagen?: string
  precio_actual?: number
  // Relaciones
  servicio?: Servicio
}

export interface Venta {
  id: string
  fecha: string
  cliente_id?: string
  empleado_id: string
  total: number
  metodo_pago: "efectivo" | "tarjeta" | "transferencia"
  estado: "completada" | "cancelada"
  notas?: string
  descuento: number
  created_at?: string
  updated_at?: string
  // Relaciones
  cliente?: Cliente
  empleado?: Empleado
  productos?: VentaProducto[]
}

export interface VentaProducto {
  id: number
  venta_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  created_at?: string
  // Relaciones
  producto?: Producto
}

export interface Usuario {
  id: number
  username: string
  nombre: string
  apellido: string
  email: string
  rol: "admin" | "empleado" | "recepcionista"
  estado: "activo" | "inactivo"
  fecha_creacion: string
  ultimo_acceso?: string
  created_at?: string
  updated_at?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  total?: number
  details?: string
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      console.log(`API Request: ${options.method || "GET"} ${url}`)

      if (options.body) {
        console.log(`Request Body:`, JSON.parse(options.body as string))
      }

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()
      console.log(`API Response:`, data)

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`,
          details: data.details,
        }
      }

      return data
    } catch (error) {
      console.error("API request error:", error)
      return {
        success: false,
        error: "Error de conexión. Verifica tu conexión a internet.",
        details: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Métodos para clientes
  async getClientes(search?: string): Promise<ApiResponse<Cliente[]>> {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<Cliente[]>(`/api/clientes${query}`)
  }

  async getCliente(id: string): Promise<ApiResponse<Cliente>> {
    return this.request<Cliente>(`/api/clientes/${id}`)
  }

  async createCliente(cliente: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
    console.log("Creating cliente:", cliente)
    return this.request<Cliente>("/api/clientes", {
      method: "POST",
      body: JSON.stringify(cliente),
    })
  }

  async updateCliente(id: string, cliente: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
    console.log("Updating cliente:", id, cliente)
    return this.request<Cliente>(`/api/clientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(cliente),
    })
  }

  async deleteCliente(id: string): Promise<ApiResponse> {
    console.log("Deleting cliente:", id)
    return this.request(`/api/clientes/${id}`, {
      method: "DELETE",
    })
  }

  // Métodos para empleados
  async getEmpleados(search?: string): Promise<ApiResponse<Empleado[]>> {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<Empleado[]>(`/api/empleados${query}`)
  }

  async getEmpleado(id: string): Promise<ApiResponse<Empleado>> {
    return this.request<Empleado>(`/api/empleados/${id}`)
  }

  async createEmpleado(empleado: Partial<Empleado>): Promise<ApiResponse<Empleado>> {
    console.log("Creating empleado:", empleado)
    return this.request<Empleado>("/api/empleados", {
      method: "POST",
      body: JSON.stringify(empleado),
    })
  }

  async updateEmpleado(id: string, empleado: Partial<Empleado>): Promise<ApiResponse<Empleado>> {
    console.log("Updating empleado:", id, empleado)
    return this.request<Empleado>(`/api/empleados/${id}`, {
      method: "PUT",
      body: JSON.stringify(empleado),
    })
  }

  async deleteEmpleado(id: string): Promise<ApiResponse> {
    console.log("Deleting empleado:", id)
    return this.request(`/api/empleados/${id}`, {
      method: "DELETE",
    })
  }

  // Métodos para servicios
  async getServicios(search?: string): Promise<ApiResponse<Servicio[]>> {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<Servicio[]>(`/api/servicios${query}`)
  }

  async getServicio(id: string): Promise<ApiResponse<Servicio>> {
    return this.request<Servicio>(`/api/servicios/${id}`)
  }

  async createServicio(servicio: Partial<Servicio>): Promise<ApiResponse<Servicio>> {
    console.log("Creating servicio:", servicio)
    return this.request<Servicio>("/api/servicios", {
      method: "POST",
      body: JSON.stringify(servicio),
    })
  }

  async updateServicio(id: string, servicio: Partial<Servicio>): Promise<ApiResponse<Servicio>> {
    console.log("Updating servicio:", id, servicio)
    return this.request<Servicio>(`/api/servicios/${id}`, {
      method: "PUT",
      body: JSON.stringify(servicio),
    })
  }

  async deleteServicio(id: string): Promise<ApiResponse> {
    console.log("Deleting servicio:", id)
    return this.request(`/api/servicios/${id}`, {
      method: "DELETE",
    })
  }

  // Métodos para productos
  async getProductos(search?: string): Promise<ApiResponse<Producto[]>> {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<Producto[]>(`/api/productos${query}`)
  }

  async getProducto(id: string): Promise<ApiResponse<Producto>> {
    return this.request<Producto>(`/api/productos/${id}`)
  }

  async createProducto(producto: Partial<Producto>): Promise<ApiResponse<Producto>> {
    console.log("Creating producto:", producto)
    return this.request<Producto>("/api/productos", {
      method: "POST",
      body: JSON.stringify(producto),
    })
  }

  async updateProducto(id: string, producto: Partial<Producto>): Promise<ApiResponse<Producto>> {
    console.log("Updating producto:", id, producto)
    return this.request<Producto>(`/api/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify(producto),
    })
  }

  async deleteProducto(id: string): Promise<ApiResponse> {
    console.log("Deleting producto:", id)
    return this.request(`/api/productos/${id}`, {
      method: "DELETE",
    })
  }

  // Métodos para proveedores
  async getProveedores(search?: string): Promise<ApiResponse<Proveedor[]>> {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<Proveedor[]>(`/api/proveedores${query}`)
  }

  async getProveedor(id: string): Promise<ApiResponse<Proveedor>> {
    return this.request<Proveedor>(`/api/proveedores/${id}`)
  }

  async createProveedor(proveedor: Partial<Proveedor>): Promise<ApiResponse<Proveedor>> {
    console.log("Creating proveedor:", proveedor)
    return this.request<Proveedor>("/api/proveedores", {
      method: "POST",
      body: JSON.stringify(proveedor),
    })
  }

  async updateProveedor(id: string, proveedor: Partial<Proveedor>): Promise<ApiResponse<Proveedor>> {
    console.log("Updating proveedor:", id, proveedor)
    return this.request<Proveedor>(`/api/proveedores/${id}`, {
      method: "PUT",
      body: JSON.stringify(proveedor),
    })
  }

  async deleteProveedor(id: string): Promise<ApiResponse> {
    console.log("Deleting proveedor:", id)
    return this.request(`/api/proveedores/${id}`, {
      method: "DELETE",
    })
  }

  // ========================================
  // MÉTODOS PARA CITAS - COMPLETAMENTE ACTUALIZADOS
  // ========================================

  async getCitas(search?: string): Promise<ApiResponse<Cita[]>> {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<Cita[]>(`/api/citas${query}`)
  }

  async getCita(id: string): Promise<ApiResponse<Cita>> {
    return this.request<Cita>(`/api/citas/${id}`)
  }

  async createCita(citaData: {
    fecha: string
    hora_inicio: string
    hora_fin: string
    cliente_id: string
    empleado_id: string
    servicio_ids: string[]
    notas?: string
    estado?: string
    precio_total: number
  }): Promise<ApiResponse<Cita>> {
    console.log("API Client - Creando cita:", citaData)

    // Validaciones antes de enviar
    if (!citaData.cliente_id || citaData.cliente_id === "0") {
      return {
        success: false,
        error: "Debe seleccionar un cliente",
      }
    }

    if (!citaData.empleado_id || citaData.empleado_id === "0") {
      return {
        success: false,
        error: "Debe seleccionar un empleado",
      }
    }

    if (!citaData.servicio_ids || citaData.servicio_ids.length === 0) {
      return {
        success: false,
        error: "Debe seleccionar al menos un servicio",
      }
    }

    return this.request<Cita>("/api/citas", {
      method: "POST",
      body: JSON.stringify(citaData),
    })
  }

  async updateCita(id: string, citaData: Partial<Cita> & { servicio_ids?: string[] }): Promise<ApiResponse<Cita>> {
    console.log("API Client - Actualizando cita:", id, citaData)
    return this.request<Cita>(`/api/citas/${id}`, {
      method: "PUT",
      body: JSON.stringify(citaData),
    })
  }

  async deleteCita(id: string): Promise<ApiResponse> {
    console.log("API Client - Eliminando cita:", id)
    return this.request(`/api/citas/${id}`, {
      method: "DELETE",
    })
  }

  // Método específico para actualizar estado de cita
  async updateCitaEstado(id: string, estado: string): Promise<ApiResponse<Cita>> {
    console.log("API Client - Actualizando estado de cita:", id, estado)
    return this.request<Cita>(`/api/citas/${id}`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    })
  }

  // Métodos para ventas
  async getVentas(search?: string): Promise<ApiResponse<Venta[]>> {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<Venta[]>(`/api/ventas${query}`)
  }

  async getVenta(id: string): Promise<ApiResponse<Venta>> {
    return this.request<Venta>(`/api/ventas/${id}`)
  }

  async createVenta(venta: Partial<Venta>): Promise<ApiResponse<Venta>> {
    console.log("Creating venta:", venta)
    return this.request<Venta>("/api/ventas", {
      method: "POST",
      body: JSON.stringify(venta),
    })
  }

  async updateVenta(id: string, venta: Partial<Venta>): Promise<ApiResponse<Venta>> {
    console.log("Updating venta:", id, venta)
    return this.request<Venta>(`/api/ventas/${id}`, {
      method: "PUT",
      body: JSON.stringify(venta),
    })
  }

  async deleteVenta(id: string): Promise<ApiResponse> {
    console.log("Deleting venta:", id)
    return this.request(`/api/ventas/${id}`, {
      method: "DELETE",
    })
  }

  // Métodos para usuarios
  async getUsuarios(search?: string): Promise<ApiResponse<Usuario[]>> {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<Usuario[]>(`/api/usuarios${query}`)
  }

  async getUsuario(id: number): Promise<ApiResponse<Usuario>> {
    return this.request<Usuario>(`/api/usuarios/${id}`)
  }

  async createUsuario(usuario: Partial<Usuario>): Promise<ApiResponse<Usuario>> {
    console.log("Creating usuario:", usuario)
    return this.request<Usuario>("/api/usuarios", {
      method: "POST",
      body: JSON.stringify(usuario),
    })
  }

  async updateUsuario(id: number, usuario: Partial<Usuario>): Promise<ApiResponse<Usuario>> {
    console.log("Updating usuario:", id, usuario)
    return this.request<Usuario>(`/api/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(usuario),
    })
  }

  async deleteUsuario(id: number): Promise<ApiResponse> {
    console.log("Deleting usuario:", id)
    return this.request(`/api/usuarios/${id}`, {
      method: "DELETE",
    })
  }

  // Métodos para autenticación
  async login(username: string, password: string): Promise<ApiResponse<{ user: Usuario; token?: string }>> {
    console.log("Login attempt for:", username)
    return this.request<{ user: Usuario; token?: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
  }

  async logout(): Promise<ApiResponse> {
    console.log("Logging out")
    return this.request("/api/auth/logout", {
      method: "POST",
    })
  }

  // Métodos para estadísticas y reportes
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request("/api/dashboard/stats")
  }

  async getReporteVentas(fechaInicio: string, fechaFin: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams()
    params.append("fechaInicio", fechaInicio)
    params.append("fechaFin", fechaFin)
    return this.request(`/api/reportes/ventas?${params.toString()}`)
  }

  async getReporteCitas(fechaInicio: string, fechaFin: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams()
    params.append("fechaInicio", fechaInicio)
    params.append("fechaFin", fechaFin)
    return this.request(`/api/reportes/citas?${params.toString()}`)
  }

  // Métodos de utilidad para formularios
  async getClientesActivos(): Promise<Cliente[]> {
    try {
      const response = await this.getClientes()
      if (response.success && response.data) {
        return response.data.filter((cliente) => cliente.estado !== "inactivo")
      }
      return []
    } catch (error) {
      console.error("Error getting clientes activos:", error)
      return []
    }
  }

  async getEmpleadosActivos(): Promise<Empleado[]> {
    try {
      const response = await this.getEmpleados()
      if (response.success && response.data) {
        return response.data.filter((empleado) => empleado.estado === "activo")
      }
      return []
    } catch (error) {
      console.error("Error getting empleados activos:", error)
      return []
    }
  }

  async getServiciosActivos(): Promise<Servicio[]> {
    try {
      const response = await this.getServicios()
      if (response.success && response.data) {
        return response.data.filter((servicio) => servicio.estado === "activo")
      }
      return []
    } catch (error) {
      console.error("Error getting servicios activos:", error)
      return []
    }
  }

  async getProductosActivos(): Promise<Producto[]> {
    try {
      const response = await this.getProductos()
      if (response.success && response.data) {
        return response.data.filter((producto) => producto.estado === "activo")
      }
      return []
    } catch (error) {
      console.error("Error getting productos activos:", error)
      return []
    }
  }

  async getProveedoresActivos(): Promise<Proveedor[]> {
    try {
      const response = await this.getProveedores()
      if (response.success && response.data) {
        return response.data.filter((proveedor) => proveedor.estado === "activo")
      }
      return []
    } catch (error) {
      console.error("Error getting proveedores activos:", error)
      return []
    }
  }

  // Método para búsqueda global
  async buscarGlobal(query: string, tipo?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams()
    params.append("q", query)
    if (tipo) params.append("tipo", tipo)

    return this.request(`/api/buscar?${params.toString()}`)
  }

  // ========================================
  // MÉTODOS ESPECÍFICOS PARA CITAS - MEJORADOS
  // ========================================

  async getCitasByFecha(fecha: string): Promise<ApiResponse<Cita[]>> {
    return this.request<Cita[]>(`/api/citas?fecha=${fecha}`)
  }

  async verificarDisponibilidad(
    empleadoId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string,
    citaId?: string,
  ): Promise<ApiResponse<{ disponible: boolean; mensaje?: string }>> {
    const params = new URLSearchParams()
    params.append("empleadoId", empleadoId)
    params.append("fecha", fecha)
    params.append("horaInicio", horaInicio)
    params.append("horaFin", horaFin)
    if (citaId) params.append("citaId", citaId)

    return this.request<{ disponible: boolean; mensaje?: string }>(`/api/citas/disponibilidad?${params.toString()}`)
  }

  // Método para obtener horarios disponibles
  async getHorariosDisponibles(empleadoId: string, fecha: string): Promise<ApiResponse<string[]>> {
    const params = new URLSearchParams()
    params.append("empleadoId", empleadoId)
    params.append("fecha", fecha)

    return this.request<string[]>(`/api/citas/horarios-disponibles?${params.toString()}`)
  }

  // Método para calcular duración total de servicios
  calcularDuracionTotal(servicios: Servicio[]): number {
    return servicios.reduce((total, servicio) => total + servicio.duracion, 0)
  }

  // Método para calcular precio total de servicios
  calcularPrecioTotal(servicios: Servicio[]): number {
    return servicios.reduce((total, servicio) => total + servicio.precio, 0)
  }

  // Método para formatear hora
  formatearHora(hora: string): string {
    const [hours, minutes] = hora.split(":")
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`
  }

  // Método para calcular hora fin basada en duración
  calcularHoraFin(horaInicio: string, duracionMinutos: number): string {
    const [hours, minutes] = horaInicio.split(":").map(Number)
    const totalMinutos = hours * 60 + minutes + duracionMinutos
    const horasFin = Math.floor(totalMinutos / 60)
    const minutosFin = totalMinutos % 60

    return `${horasFin.toString().padStart(2, "0")}:${minutosFin.toString().padStart(2, "0")}`
  }

  // Método para validar horario de trabajo
  validarHorarioTrabajo(hora: string): boolean {
    const [hours] = hora.split(":").map(Number)
    return hours >= 8 && hours <= 20 // Horario de 8 AM a 8 PM
  }

  // Método para obtener próximas citas
  async getProximasCitas(limite = 5): Promise<ApiResponse<Cita[]>> {
    return this.request<Cita[]>(`/api/citas/proximas?limite=${limite}`)
  }

  // Método para obtener citas del día
  async getCitasHoy(): Promise<ApiResponse<Cita[]>> {
    const hoy = new Date().toISOString().split("T")[0]
    return this.getCitasByFecha(hoy)
  }

  // Método para obtener estadísticas de citas
  async getEstadisticasCitas(fechaInicio?: string, fechaFin?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams()
    if (fechaInicio) params.append("fechaInicio", fechaInicio)
    if (fechaFin) params.append("fechaFin", fechaFin)
    const query = params.toString() ? `?${params.toString()}` : ""

    return this.request(`/api/citas/estadisticas${query}`)
  }

  // Método para validar datos de cita antes de enviar
  validarDatosCita(citaData: any): { valido: boolean; errores: string[] } {
    const errores: string[] = []

    if (!citaData.fecha) {
      errores.push("La fecha es obligatoria")
    }

    if (!citaData.hora_inicio) {
      errores.push("La hora de inicio es obligatoria")
    }

    if (!citaData.hora_fin) {
      errores.push("La hora de fin es obligatoria")
    }

    if (!citaData.cliente_id || citaData.cliente_id === "0") {
      errores.push("Debe seleccionar un cliente")
    }

    if (!citaData.empleado_id || citaData.empleado_id === "0") {
      errores.push("Debe seleccionar un empleado")
    }

    if (!citaData.servicio_ids || citaData.servicio_ids.length === 0) {
      errores.push("Debe seleccionar al menos un servicio")
    }

    if (citaData.hora_inicio && citaData.hora_fin) {
      const inicio = new Date(`2000-01-01T${citaData.hora_inicio}`)
      const fin = new Date(`2000-01-01T${citaData.hora_fin}`)

      if (fin <= inicio) {
        errores.push("La hora de fin debe ser posterior a la hora de inicio")
      }
    }

    return {
      valido: errores.length === 0,
      errores,
    }
  }

  // Método para generar horarios disponibles
  generarHorariosDisponibles(horaInicio = "08:00", horaFin = "20:00", intervalo = 30): string[] {
    const horarios: string[] = []
    const inicio = new Date(`2000-01-01T${horaInicio}`)
    const fin = new Date(`2000-01-01T${horaFin}`)

    const actual = new Date(inicio)
    while (actual < fin) {
      const hora = actual.toTimeString().slice(0, 5)
      horarios.push(hora)
      actual.setMinutes(actual.getMinutes() + intervalo)
    }

    return horarios
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient()

// Export default para compatibilidad
export default apiClient
