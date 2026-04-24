// Tipos de datos
export type Empleado = {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  puesto: string
  fechaContratacion: string
  estado: "activo" | "inactivo"
  especialidades: string[]
  foto?: string
}

export type Servicio = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  duracion: number // en minutos
  categoria: string
  imagen?: string
  destacado: boolean
  estado: "activo" | "inactivo"
}

export type Cliente = {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  fechaRegistro: string
  notas?: string
  foto?: string
}

export type EstadoCita = "programada" | "completada" | "cancelada" | "no-asistio"

export type Cita = {
  id: string
  fecha: string // ISO date string
  horaInicio: string // formato "HH:MM"
  horaFin: string // formato "HH:MM"
  clienteId: string
  empleadoId: string
  servicioIds: string[]
  estado: EstadoCita
  notas?: string
  precioTotal: number
}

export type CategoriaProducto =
  | "Cuidado Capilar"
  | "Cuidado Facial"
  | "Cuidado de Barba"
  | "Afeitado"
  | "Styling"
  | "Accesorios"
  | "Perfumería"

export type GeneroProducto = "Hombre" | "Mujer" | "Unisex"

export type Producto = {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  precio: number
  precioCompra: number
  stock: number
  stockMinimo: number
  categoria: CategoriaProducto
  genero: GeneroProducto
  marca: string
  proveedorId: string
  imagen?: string
  destacado: boolean
  estado: "activo" | "inactivo"
  fechaCreacion: string
}

export type Proveedor = {
  id: string
  nombre: string
  contacto: string
  telefono: string
  email: string
  direccion: string
  notas?: string
  estado: "activo" | "inactivo"
}

export type Venta = {
  id: string
  fecha: string
  clienteId?: string
  empleadoId: string
  productos: {
    productoId: string
    cantidad: number
    precioUnitario: number
  }[]
  total: number
  metodoPago: "efectivo" | "tarjeta" | "transferencia"
  estado: "completada" | "cancelada"
  notas?: string
  descuento?: number
}

// Datos de ejemplo para empleados
export const empleados: Empleado[] = [
  {
    id: "1",
    nombre: "Carlos",
    apellido: "Rodríguez",
    email: "carlos.rodriguez@clickbarber.com",
    telefono: "555-123-4567",
    puesto: "Barbero Senior",
    fechaContratacion: "2022-01-15",
    estado: "activo",
    especialidades: ["Corte clásico", "Barba", "Afeitado tradicional"],
    foto: "/placeholder.svg?key=q2mdf",
  },
  {
    id: "2",
    nombre: "Laura",
    apellido: "Gómez",
    email: "laura.gomez@clickbarber.com",
    telefono: "555-987-6543",
    puesto: "Estilista",
    fechaContratacion: "2022-03-10",
    estado: "activo",
    especialidades: ["Cortes modernos", "Coloración", "Peinados"],
    foto: "/female-hairstylist-portrait.png",
  },
  {
    id: "3",
    nombre: "Miguel",
    apellido: "Sánchez",
    email: "miguel.sanchez@clickbarber.com",
    telefono: "555-456-7890",
    puesto: "Barbero Junior",
    fechaContratacion: "2022-06-22",
    estado: "activo",
    especialidades: ["Cortes urbanos", "Degradados", "Diseños"],
    foto: "/young-barber-portrait.png",
  },
  {
    id: "4",
    nombre: "Ana",
    apellido: "Martínez",
    email: "ana.martinez@clickbarber.com",
    telefono: "555-789-0123",
    puesto: "Recepcionista",
    fechaContratacion: "2022-02-05",
    estado: "activo",
    especialidades: ["Atención al cliente", "Gestión de citas"],
    foto: "/receptionist-woman-portrait.png",
  },
  {
    id: "5",
    nombre: "Javier",
    apellido: "López",
    email: "javier.lopez@clickbarber.com",
    telefono: "555-234-5678",
    puesto: "Barbero Senior",
    fechaContratacion: "2021-11-18",
    estado: "inactivo",
    especialidades: ["Corte clásico", "Barba", "Tratamientos capilares"],
    foto: "/placeholder.svg?key=exq6s",
  },
]

// Datos de ejemplo para servicios
export const servicios: Servicio[] = [
  {
    id: "1",
    nombre: "Corte Clásico",
    descripcion: "Corte tradicional con tijeras y acabado con navaja para un look elegante y atemporal.",
    precio: 25,
    duracion: 30,
    categoria: "Cortes",
    imagen: "/classic-haircut.png",
    destacado: true,
    estado: "activo",
  },
  {
    id: "2",
    nombre: "Degradado (Fade)",
    descripcion: "Corte con degradado perfecto, desde la piel hasta la longitud deseada en la parte superior.",
    precio: 30,
    duracion: 45,
    categoria: "Cortes",
    imagen: "/fade-haircut.png",
    destacado: true,
    estado: "activo",
  },
  {
    id: "3",
    nombre: "Afeitado Tradicional",
    descripcion: "Afeitado con navaja al estilo tradicional, incluye toalla caliente y masaje facial.",
    precio: 35,
    duracion: 40,
    categoria: "Barba",
    imagen: "/traditional-shave.png",
    destacado: true,
    estado: "activo",
  },
  {
    id: "4",
    nombre: "Recorte de Barba",
    descripcion: "Perfilado y recorte de barba para mantener un aspecto cuidado y definido.",
    precio: 20,
    duracion: 25,
    categoria: "Barba",
    imagen: "/beard-trim.png",
    destacado: false,
    estado: "activo",
  },
  {
    id: "5",
    nombre: "Corte y Barba",
    descripcion: "Combinación de corte de pelo y arreglo de barba para un look completo.",
    precio: 45,
    duracion: 60,
    categoria: "Combo",
    imagen: "/haircut-and-beard.png",
    destacado: true,
    estado: "activo",
  },
  {
    id: "6",
    nombre: "Tratamiento Capilar",
    descripcion: "Tratamiento hidratante para el cuero cabelludo y el cabello, ideal para cabellos dañados.",
    precio: 40,
    duracion: 45,
    categoria: "Tratamientos",
    imagen: "/hair-treatment.png",
    destacado: false,
    estado: "activo",
  },
  {
    id: "7",
    nombre: "Coloración",
    descripcion: "Aplicación de color para cubrir canas o cambiar el tono del cabello.",
    precio: 50,
    duracion: 90,
    categoria: "Color",
    imagen: "/hair-coloring.png",
    destacado: false,
    estado: "inactivo",
  },
]

// Datos de ejemplo para clientes
export const clientes: Cliente[] = [
  {
    id: "1",
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan.perez@example.com",
    telefono: "555-111-2233",
    fechaRegistro: "2023-01-10",
    notas: "Cliente habitual, prefiere cortes clásicos",
    foto: "/client-male-1.png",
  },
  {
    id: "2",
    nombre: "María",
    apellido: "González",
    email: "maria.gonzalez@example.com",
    telefono: "555-444-5566",
    fechaRegistro: "2023-02-15",
    foto: "/client-female-1.png",
  },
  {
    id: "3",
    nombre: "Pedro",
    apellido: "Sánchez",
    email: "pedro.sanchez@example.com",
    telefono: "555-777-8899",
    fechaRegistro: "2023-03-20",
    notas: "Alérgico a algunos productos capilares",
    foto: "/client-male-2.png",
  },
  {
    id: "4",
    nombre: "Lucía",
    apellido: "Fernández",
    email: "lucia.fernandez@example.com",
    telefono: "555-222-3344",
    fechaRegistro: "2023-04-05",
    foto: "/client-female-2.png",
  },
  {
    id: "5",
    nombre: "Roberto",
    apellido: "Martínez",
    email: "roberto.martinez@example.com",
    telefono: "555-666-7788",
    fechaRegistro: "2023-05-12",
    notas: "Prefiere ser atendido por Carlos",
    foto: "/client-male-3.png",
  },
  {
    id: "6",
    nombre: "Javier",
    apellido: "Vargas",
    email: "javier.vargas@example.com",
    telefono: "555-888-9999",
    fechaRegistro: "2023-06-01",
    notas: "Cliente VIP",
    foto: "/client-male-4.png",
  },
]

// Datos de ejemplo para citas
export const citas: Cita[] = [
  {
    id: "1",
    fecha: "2025-05-15",
    horaInicio: "10:00",
    horaFin: "10:30",
    clienteId: "1",
    empleadoId: "1",
    servicioIds: ["1"],
    estado: "programada",
    precioTotal: 25,
  },
  {
    id: "2",
    fecha: "2025-05-15",
    horaInicio: "11:00",
    horaFin: "11:45",
    clienteId: "2",
    empleadoId: "2",
    servicioIds: ["2"],
    estado: "programada",
    precioTotal: 30,
  },
  {
    id: "3",
    fecha: "2025-05-15",
    horaInicio: "12:00",
    horaFin: "13:00",
    clienteId: "3",
    empleadoId: "3",
    servicioIds: ["5"],
    estado: "programada",
    precioTotal: 45,
  },
  {
    id: "4",
    fecha: "2025-05-16",
    horaInicio: "09:30",
    horaFin: "10:10",
    clienteId: "4",
    empleadoId: "1",
    servicioIds: ["3"],
    estado: "programada",
    precioTotal: 35,
  },
  {
    id: "5",
    fecha: "2025-05-16",
    horaInicio: "14:00",
    horaFin: "15:00",
    clienteId: "5",
    empleadoId: "2",
    servicioIds: ["5"],
    estado: "programada",
    precioTotal: 45,
  },
  {
    id: "6",
    fecha: "2025-05-14",
    horaInicio: "16:00",
    horaFin: "16:30",
    clienteId: "1",
    empleadoId: "3",
    servicioIds: ["1"],
    estado: "completada",
    precioTotal: 25,
  },
  {
    id: "7",
    fecha: "2025-05-14",
    horaInicio: "17:00",
    horaFin: "17:25",
    clienteId: "3",
    empleadoId: "1",
    servicioIds: ["4"],
    estado: "cancelada",
    notas: "Cliente canceló por motivos personales",
    precioTotal: 20,
  },
  // Agregar la cita que aparece en la interfaz
  {
    id: "38c89021-ec95-4b1e-a498-7730fca23dc7",
    fecha: "2025-05-26",
    horaInicio: "07:00",
    horaFin: "08:00",
    clienteId: "6", // Javier Vargas
    empleadoId: "1",
    servicioIds: ["5"], // Corte y Barba
    estado: "completada",
    precioTotal: 15000,
    notas: "Servicio premium completado",
  },
]

// Datos de ejemplo para proveedores
export const proveedores: Proveedor[] = [
  {
    id: "1",
    nombre: "Distribuciones BarberPro",
    contacto: "Antonio Ramírez",
    telefono: "555-111-0001",
    email: "info@barberpro.com",
    direccion: "Calle Comercio 123, Madrid",
    estado: "activo",
  },
  {
    id: "2",
    nombre: "Productos de Belleza Elegance",
    contacto: "Sofía Martín",
    telefono: "555-222-0002",
    email: "pedidos@elegance.com",
    direccion: "Avenida de la Belleza 45, Barcelona",
    estado: "activo",
  },
  {
    id: "3",
    nombre: "Suministros Profesionales HairStyle",
    contacto: "Manuel López",
    telefono: "555-333-0003",
    email: "ventas@hairstyle.com",
    direccion: "Calle Estilistas 67, Valencia",
    notas: "Especialistas en productos premium",
    estado: "activo",
  },
  {
    id: "4",
    nombre: "Importaciones BeautyWorld",
    contacto: "Carmen Sánchez",
    telefono: "555-444-0004",
    email: "info@beautyworld.com",
    direccion: "Polígono Industrial Norte, Nave 12, Sevilla",
    estado: "activo",
  },
  {
    id: "5",
    nombre: "Mayorista BarberShop",
    contacto: "Javier Fernández",
    telefono: "555-555-0005",
    email: "contacto@barbershop-mayorista.com",
    direccion: "Calle Distribución 89, Bilbao",
    estado: "inactivo",
    notas: "Suspendido temporalmente por problemas de calidad",
  },
]

// Datos de ejemplo para productos
export const productos: Producto[] = [
  {
    id: "1",
    codigo: "SH001",
    nombre: "Champú Hidratante Profesional",
    descripcion: "Champú hidratante para todo tipo de cabello. Fórmula profesional con aceites naturales.",
    precio: 18.5,
    precioCompra: 9.25,
    stock: 45,
    stockMinimo: 10,
    categoria: "Cuidado Capilar",
    genero: "Unisex",
    marca: "HairPro",
    proveedorId: "1",
    imagen: "/product-shampoo.png",
    destacado: true,
    estado: "activo",
    fechaCreacion: "2023-01-15",
  },
  {
    id: "2",
    codigo: "PB002",
    nombre: "Pomada para Barba",
    descripcion: "Pomada fijadora para barba con aceite de argán. Proporciona hidratación y fijación media.",
    precio: 15.95,
    precioCompra: 7.5,
    stock: 30,
    stockMinimo: 8,
    categoria: "Cuidado de Barba",
    genero: "Hombre",
    marca: "BeardMaster",
    proveedorId: "1",
    imagen: "/product-beard-pomade.png",
    destacado: true,
    estado: "activo",
    fechaCreacion: "2023-01-20",
  },
  {
    id: "3",
    codigo: "AF003",
    nombre: "Crema de Afeitar Premium",
    descripcion: "Crema de afeitar con aloe vera y vitamina E. Proporciona un afeitado suave y sin irritaciones.",
    precio: 22.0,
    precioCompra: 11.0,
    stock: 25,
    stockMinimo: 5,
    categoria: "Afeitado",
    genero: "Hombre",
    marca: "ShavePro",
    proveedorId: "3",
    imagen: "/product-shaving-cream.png",
    destacado: false,
    estado: "activo",
    fechaCreacion: "2023-02-05",
  },
  {
    id: "4",
    codigo: "ST004",
    nombre: "Cera Texturizadora",
    descripcion: "Cera para dar textura y definición al cabello. Fijación fuerte y acabado mate.",
    precio: 16.75,
    precioCompra: 8.25,
    stock: 40,
    stockMinimo: 10,
    categoria: "Styling",
    genero: "Unisex",
    marca: "StyleMaster",
    proveedorId: "2",
    imagen: "/product-hair-wax.png",
    destacado: true,
    estado: "activo",
    fechaCreacion: "2023-02-10",
  },
  {
    id: "5",
    codigo: "CF005",
    nombre: "Sérum Facial Hidratante",
    descripcion: "Sérum facial con ácido hialurónico. Hidrata en profundidad y reduce líneas de expresión.",
    precio: 28.5,
    precioCompra: 14.25,
    stock: 20,
    stockMinimo: 5,
    categoria: "Cuidado Facial",
    genero: "Unisex",
    marca: "FaceCare",
    proveedorId: "2",
    imagen: "/product-face-serum.png",
    destacado: false,
    estado: "activo",
    fechaCreacion: "2023-02-15",
  },
  {
    id: "6",
    codigo: "AC006",
    nombre: "Cepillo para Barba",
    descripcion: "Cepillo de cerdas naturales para barba. Ideal para distribuir productos y dar forma.",
    precio: 12.95,
    precioCompra: 5.5,
    stock: 35,
    stockMinimo: 8,
    categoria: "Accesorios",
    genero: "Hombre",
    marca: "BeardMaster",
    proveedorId: "1",
    imagen: "/product-beard-brush.png",
    destacado: false,
    estado: "activo",
    fechaCreacion: "2023-03-01",
  },
  {
    id: "7",
    codigo: "COL007",
    nombre: "Colonia Gentleman",
    descripcion: "Fragancia masculina con notas amaderadas y cítricas. Larga duración.",
    precio: 45.0,
    precioCompra: 22.5,
    stock: 15,
    stockMinimo: 3,
    categoria: "Perfumería",
    genero: "Hombre",
    marca: "LuxScent",
    proveedorId: "4",
    imagen: "/product-cologne.png",
    destacado: true,
    estado: "activo",
    fechaCreacion: "2023-03-10",
  },
  {
    id: "8",
    codigo: "SH008",
    nombre: "Champú Anticaída",
    descripcion: "Champú fortificante que previene la caída del cabello. Con cafeína y biotina.",
    precio: 24.95,
    precioCompra: 12.5,
    stock: 18,
    stockMinimo: 5,
    categoria: "Cuidado Capilar",
    genero: "Unisex",
    marca: "HairPro",
    proveedorId: "1",
    imagen: "/product-anti-hair-loss.png",
    destacado: false,
    estado: "activo",
    fechaCreacion: "2023-03-15",
  },
  {
    id: "9",
    codigo: "SPR009",
    nombre: "Spray Fijador Profesional",
    descripcion: "Spray fijador de cabello de fijación extra fuerte. Ideal para peinados elaborados.",
    precio: 19.5,
    precioCompra: 9.75,
    stock: 22,
    stockMinimo: 6,
    categoria: "Styling",
    genero: "Unisex",
    marca: "StyleMaster",
    proveedorId: "2",
    imagen: "/product-hair-spray.png",
    destacado: false,
    estado: "activo",
    fechaCreacion: "2023-03-20",
  },
  {
    id: "10",
    codigo: "PF010",
    nombre: "Perfume Floral Elegance",
    descripcion: "Fragancia femenina con notas florales y frutales. Ideal para uso diario.",
    precio: 42.0,
    precioCompra: 21.0,
    stock: 12,
    stockMinimo: 3,
    categoria: "Perfumería",
    genero: "Mujer",
    marca: "LuxScent",
    proveedorId: "4",
    imagen: "/product-perfume.png",
    destacado: true,
    estado: "activo",
    fechaCreacion: "2023-04-01",
  },
  {
    id: "11",
    codigo: "AC011",
    nombre: "Tijeras Profesionales",
    descripcion: "Tijeras de acero inoxidable para corte profesional. Incluye estuche.",
    precio: 85.0,
    precioCompra: 42.5,
    stock: 8,
    stockMinimo: 2,
    categoria: "Accesorios",
    genero: "Unisex",
    marca: "ProTools",
    proveedorId: "3",
    imagen: "/product-scissors.png",
    destacado: false,
    estado: "activo",
    fechaCreacion: "2023-04-05",
  },
  {
    id: "12",
    codigo: "CF012",
    nombre: "Crema Hidratante After Shave",
    descripcion: "Crema hidratante para después del afeitado. Calma y regenera la piel.",
    precio: 17.95,
    precioCompra: 8.95,
    stock: 28,
    stockMinimo: 7,
    categoria: "Cuidado Facial",
    genero: "Hombre",
    marca: "ShavePro",
    proveedorId: "3",
    imagen: "/product-after-shave.png",
    destacado: false,
    estado: "activo",
    fechaCreacion: "2023-04-10",
  },
  {
    id: "13",
    codigo: "BO013",
    nombre: "Aceite para Barba",
    descripcion: "Aceite nutritivo para barba con aceites esenciales. Suaviza y da brillo.",
    precio: 21.5,
    precioCompra: 10.75,
    stock: 32,
    stockMinimo: 8,
    categoria: "Cuidado de Barba",
    genero: "Hombre",
    marca: "BeardMaster",
    proveedorId: "1",
    imagen: "/product-beard-oil.png",
    destacado: true,
    estado: "activo",
    fechaCreacion: "2023-04-15",
  },
  {
    id: "14",
    codigo: "SH014",
    nombre: "Acondicionador Reparador",
    descripcion: "Acondicionador intensivo para cabellos dañados. Con queratina y aceite de argán.",
    precio: 20.95,
    precioCompra: 10.5,
    stock: 25,
    stockMinimo: 6,
    categoria: "Cuidado Capilar",
    genero: "Unisex",
    marca: "HairPro",
    proveedorId: "1",
    imagen: "/product-conditioner.png",
    destacado: false,
    estado: "activo",
    fechaCreacion: "2023-04-20",
  },
  {
    id: "15",
    codigo: "HD015",
    nombre: "Secador Profesional",
    descripcion: "Secador de pelo profesional de 2200W con tecnología iónica.",
    precio: 120.0,
    precioCompra: 60.0,
    stock: 5,
    stockMinimo: 2,
    categoria: "Accesorios",
    genero: "Unisex",
    marca: "ProTools",
    proveedorId: "3",
    imagen: "/product-hair-dryer.png",
    destacado: true,
    estado: "activo",
    fechaCreacion: "2023-05-01",
  },
]

// Datos de ejemplo para ventas
export const ventas: Venta[] = [
  {
    id: "1",
    fecha: "2023-05-10T14:30:00",
    clienteId: "1",
    empleadoId: "4",
    productos: [
      {
        productoId: "2",
        cantidad: 1,
        precioUnitario: 15.95,
      },
      {
        productoId: "6",
        cantidad: 1,
        precioUnitario: 12.95,
      },
    ],
    total: 28.9,
    metodoPago: "tarjeta",
    estado: "completada",
  },
  {
    id: "2",
    fecha: "2023-05-10T16:45:00",
    clienteId: "3",
    empleadoId: "4",
    productos: [
      {
        productoId: "1",
        cantidad: 1,
        precioUnitario: 18.5,
      },
      {
        productoId: "4",
        cantidad: 1,
        precioUnitario: 16.75,
      },
    ],
    total: 35.25,
    metodoPago: "efectivo",
    estado: "completada",
  },
  {
    id: "3",
    fecha: "2023-05-11T10:15:00",
    clienteId: "2",
    empleadoId: "4",
    productos: [
      {
        productoId: "10",
        cantidad: 1,
        precioUnitario: 42.0,
      },
    ],
    total: 42.0,
    metodoPago: "tarjeta",
    estado: "completada",
  },
  {
    id: "4",
    fecha: "2023-05-11T12:30:00",
    empleadoId: "4",
    productos: [
      {
        productoId: "7",
        cantidad: 1,
        precioUnitario: 45.0,
      },
    ],
    total: 45.0,
    metodoPago: "efectivo",
    estado: "completada",
  },
  {
    id: "5",
    fecha: "2023-05-12T15:00:00",
    clienteId: "5",
    empleadoId: "4",
    productos: [
      {
        productoId: "13",
        cantidad: 1,
        precioUnitario: 21.5,
      },
      {
        productoId: "3",
        cantidad: 1,
        precioUnitario: 22.0,
      },
    ],
    total: 43.5,
    metodoPago: "tarjeta",
    estado: "completada",
  },
  {
    id: "6",
    fecha: "2023-05-12T17:30:00",
    clienteId: "4",
    empleadoId: "4",
    productos: [
      {
        productoId: "5",
        cantidad: 1,
        precioUnitario: 28.5,
      },
    ],
    total: 28.5,
    metodoPago: "tarjeta",
    estado: "completada",
  },
  {
    id: "7",
    fecha: "2023-05-13T11:45:00",
    empleadoId: "4",
    productos: [
      {
        productoId: "8",
        cantidad: 1,
        precioUnitario: 24.95,
      },
    ],
    total: 24.95,
    metodoPago: "efectivo",
    estado: "cancelada",
    notas: "Cliente devolvió el producto por alergia",
  },
  // Agregar la venta que aparece en la interfaz
  {
    id: "venta-1748315554786-xzclvos0j",
    fecha: "2025-05-26T17:12:00",
    empleadoId: "4",
    productos: [
      {
        productoId: "7",
        cantidad: 2,
        precioUnitario: 15000,
      },
    ],
    total: 30000,
    metodoPago: "tarjeta",
    estado: "completada",
    notas: "Venta de productos premium",
  },
]

// Funciones para gestionar empleados
export function getEmpleados() {
  return empleados
}

export function getEmpleadoById(id: string) {
  return empleados.find((emp) => emp.id === id)
}

export function getEmpleadosActivos() {
  return empleados.filter((emp) => emp.estado === "activo")
}

// Funciones para gestionar servicios
export function getServicios() {
  return servicios
}

export function getServicioById(id: string) {
  return servicios.find((serv) => serv.id === id)
}

export function getServiciosActivos() {
  return servicios.filter((serv) => serv.estado === "activo")
}

export function getServiciosDestacados() {
  return servicios.filter((serv) => serv.destacado && serv.estado === "activo")
}

// Funciones para gestionar clientes
export function getClientes() {
  return clientes
}

export function getClienteById(id: string) {
  return clientes.find((client) => client.id === id)
}

// Funciones para gestionar citas
export function getCitas() {
  return citas
}

export function getCitaById(id: string) {
  return citas.find((cita) => cita.id === id)
}

export function getCitasByFecha(fecha: string) {
  return citas.filter((cita) => cita.fecha === fecha)
}

export function getCitasByEmpleado(empleadoId: string) {
  return citas.filter((cita) => cita.empleadoId === empleadoId)
}

export function getCitasByCliente(clienteId: string) {
  return citas.filter((cita) => cita.clienteId === clienteId)
}

export function getCitasByEstado(estado: EstadoCita) {
  return citas.filter((cita) => cita.estado === estado)
}

// Funciones para gestionar productos
export function getProductos() {
  return productos
}

export function getProductoById(id: string) {
  return productos.find((producto) => producto.id === id)
}

export function getProductosByCodigo(codigo: string) {
  return productos.find((producto) => producto.codigo === codigo)
}

export function getProductosActivos() {
  return productos.filter((producto) => producto.estado === "activo")
}

export function getProductosDestacados() {
  return productos.filter((producto) => producto.destacado && producto.estado === "activo")
}

export function getProductosByCategoria(categoria: CategoriaProducto) {
  return productos.filter((producto) => producto.categoria === categoria && producto.estado === "activo")
}

export function getProductosByGenero(genero: GeneroProducto) {
  return productos.filter((producto) => producto.genero === genero && producto.estado === "activo")
}

export function getProductosByProveedor(proveedorId: string) {
  return productos.filter((producto) => producto.proveedorId === proveedorId)
}

export function getProductosBajoStock() {
  return productos.filter((producto) => producto.stock <= producto.stockMinimo && producto.estado === "activo")
}

// Funciones para gestionar proveedores
export function getProveedores() {
  return proveedores
}

export function getProveedorById(id: string) {
  return proveedores.find((proveedor) => proveedor.id === id)
}

export function getProveedoresActivos() {
  return proveedores.filter((proveedor) => proveedor.estado === "activo")
}

// Funciones para gestionar ventas
export function getVentas() {
  return ventas
}

export function getVentaById(id: string) {
  return ventas.find((venta) => venta.id === id)
}

export function getVentasByFecha(fecha: string) {
  // Comparar solo la parte de la fecha (YYYY-MM-DD)
  return ventas.filter((venta) => venta.fecha.split("T")[0] === fecha)
}

export function getVentasByCliente(clienteId: string) {
  return ventas.filter((venta) => venta.clienteId === clienteId)
}

export function getVentasByEmpleado(empleadoId: string) {
  return ventas.filter((venta) => venta.empleadoId === empleadoId)
}

export function getVentasByProducto(productoId: string) {
  return ventas.filter((venta) => venta.productos.some((producto) => producto.productoId === productoId))
}

export function getVentasByEstado(estado: "completada" | "cancelada") {
  return ventas.filter((venta) => venta.estado === estado)
}

// Puestos disponibles
export const puestos = ["Barbero Senior", "Barbero Junior", "Estilista", "Recepcionista", "Gerente", "Asistente"]

// Especialidades disponibles
export const especialidades = [
  "Corte clásico",
  "Cortes modernos",
  "Cortes urbanos",
  "Degradados",
  "Barba",
  "Afeitado tradicional",
  "Diseños",
  "Coloración",
  "Peinados",
  "Tratamientos capilares",
  "Atención al cliente",
  "Gestión de citas",
]

// Categorías de servicios
export const categorias = ["Cortes", "Barba", "Combo", "Tratamientos", "Color"]

// Categorías de productos
export const categoriasProducto: CategoriaProducto[] = [
  "Cuidado Capilar",
  "Cuidado Facial",
  "Cuidado de Barba",
  "Afeitado",
  "Styling",
  "Accesorios",
  "Perfumería",
]

// Géneros de productos
export const generosProducto: GeneroProducto[] = ["Hombre", "Mujer", "Unisex"]

// Horarios de trabajo
export const horariosDisponibles = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
]

// Estados de citas
export const estadosCita: EstadoCita[] = ["programada", "completada", "cancelada", "no-asistio"]

// Métodos de pago
export const metodosPago = ["efectivo", "tarjeta", "transferencia"]

// Función para verificar disponibilidad
export function verificarDisponibilidad(
  fecha: string,
  horaInicio: string,
  horaFin: string,
  empleadoId: string,
  citaIdExcluir?: string,
) {
  const citasDelDia = getCitasByFecha(fecha).filter(
    (cita) =>
      cita.empleadoId === empleadoId &&
      cita.estado !== "cancelada" &&
      (citaIdExcluir ? cita.id !== citaIdExcluir : true),
  )

  // Verificar si hay solapamiento con alguna cita existente
  return !citasDelDia.some((cita) => {
    // Convertir horas a minutos para facilitar la comparación
    const inicioNuevaCita = convertirHoraAMinutos(horaInicio)
    const finNuevaCita = convertirHoraAMinutos(horaFin)
    const inicioCitaExistente = convertirHoraAMinutos(cita.horaInicio)
    const finCitaExistente = convertirHoraAMinutos(cita.horaFin)

    // Verificar solapamiento
    return (
      (inicioNuevaCita >= inicioCitaExistente && inicioNuevaCita < finCitaExistente) ||
      (finNuevaCita > inicioCitaExistente && finNuevaCita <= finCitaExistente) ||
      (inicioNuevaCita <= inicioCitaExistente && finNuevaCita >= finCitaExistente)
    )
  })
}

// Función auxiliar para convertir hora (HH:MM) a minutos
function convertirHoraAMinutos(hora: string): number {
  const [horas, minutos] = hora.split(":").map(Number)
  return horas * 60 + minutos
}

// Función para calcular hora de fin basada en servicios seleccionados
export function calcularHoraFin(horaInicio: string, servicioIds: string[]): string {
  // Calcular duración total en minutos
  let duracionTotal = 0
  servicioIds.forEach((id) => {
    const servicio = getServicioById(id)
    if (servicio) {
      duracionTotal += servicio.duracion
    }
  })

  // Convertir hora de inicio a minutos
  const [horas, minutos] = horaInicio.split(":").map(Number)
  const inicioEnMinutos = horas * 60 + minutos

  // Calcular hora de fin en minutos
  const finEnMinutos = inicioEnMinutos + duracionTotal

  // Convertir de vuelta a formato HH:MM
  const horasFin = Math.floor(finEnMinutos / 60)
  const minutosFin = finEnMinutos % 60

  return `${horasFin.toString().padStart(2, "0")}:${minutosFin.toString().padStart(2, "0")}`
}

// Función para calcular precio total basado en servicios seleccionados
export function calcularPrecioTotal(servicioIds: string[]): number {
  let precioTotal = 0
  servicioIds.forEach((id) => {
    const servicio = getServicioById(id)
    if (servicio) {
      precioTotal += servicio.precio
    }
  })
  return precioTotal
}

// Función para calcular el valor total del inventario
export function calcularValorInventario(): number {
  return productos.reduce((total, producto) => {
    return total + producto.precioCompra * producto.stock
  }, 0)
}

// Función para calcular el margen de beneficio potencial del inventario
export function calcularMargenBeneficioPotencial(): number {
  return productos.reduce((total, producto) => {
    return total + (producto.precio - producto.precioCompra) * producto.stock
  }, 0)
}

// Función para calcular las ventas totales en un período
export function calcularVentasTotales(fechaInicio: string, fechaFin: string): number {
  return ventas
    .filter((venta) => {
      const fechaVenta = new Date(venta.fecha)
      return fechaVenta >= new Date(fechaInicio) && fechaVenta <= new Date(fechaFin) && venta.estado === "completada"
    })
    .reduce((total, venta) => total + venta.total, 0)
}

// Función para calcular los productos más vendidos
export function calcularProductosMasVendidos(limite = 5): { productoId: string; cantidad: number }[] {
  const ventasCompletadas = ventas.filter((venta) => venta.estado === "completada")

  // Crear un mapa para contar las ventas de cada producto
  const contadorProductos: Record<string, number> = {}

  ventasCompletadas.forEach((venta) => {
    venta.productos.forEach((item) => {
      if (!contadorProductos[item.productoId]) {
        contadorProductos[item.productoId] = 0
      }
      contadorProductos[item.productoId] += item.cantidad
    })
  })

  // Convertir el mapa a un array y ordenarlo
  return Object.entries(contadorProductos)
    .map(([productoId, cantidad]) => ({ productoId, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, limite)
}

export function getPagoById(id: string) {
  const venta = ventas.find((v) => v.id === id)
  if (venta) return venta

  const cita = citas.find((c) => c.id === id)
  if (cita) return cita

  return undefined
}

// Añadir la función formatPrecio como una exportación
export function formatPrecio(precio: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(precio)
}
