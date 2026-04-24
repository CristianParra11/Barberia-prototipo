import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const result = await query("SELECT * FROM configuracion WHERE id = 1 LIMIT 1")

    if (result.length === 0) {
      // Si no existe configuración, crear una por defecto
      const defaultConfig = {
        nombre_empresa: "Click Barber Shop",
        razon_social: "Click Barber Shop S.L.",
        direccion: "Calle Principal 123",
        ciudad: "Madrid",
        codigo_postal: "28001",
        provincia: "Madrid",
        pais: "España",
        telefono: "910 123 456",
        email: "info@clickbarbershop.com",
        sitio_web: "https://www.clickbarbershop.com",
        cif: "B12345678",
        pie_pagina: "Gracias por confiar en Click Barber Shop",
        logo: "/logo-placeholder.png",
        moneda: "COP",
        zona_horaria: "America/Bogota",
        idioma: "es",
        iva_porcentaje: 19.0,
      }

      await query(
        `INSERT INTO configuracion (
          nombre_empresa, razon_social, direccion, ciudad, codigo_postal, provincia, pais,
          telefono, email, sitio_web, cif, pie_pagina, logo, moneda, zona_horaria, idioma, iva_porcentaje
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          defaultConfig.nombre_empresa,
          defaultConfig.razon_social,
          defaultConfig.direccion,
          defaultConfig.ciudad,
          defaultConfig.codigo_postal,
          defaultConfig.provincia,
          defaultConfig.pais,
          defaultConfig.telefono,
          defaultConfig.email,
          defaultConfig.sitio_web,
          defaultConfig.cif,
          defaultConfig.pie_pagina,
          defaultConfig.logo,
          defaultConfig.moneda,
          defaultConfig.zona_horaria,
          defaultConfig.idioma,
          defaultConfig.iva_porcentaje,
        ],
      )

      return NextResponse.json(defaultConfig)
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error al obtener configuración:", error)
    return NextResponse.json({ error: "Error al obtener la configuración" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    const {
      nombre_empresa,
      razon_social,
      direccion,
      ciudad,
      codigo_postal,
      provincia,
      pais,
      telefono,
      email,
      sitio_web,
      cif,
      pie_pagina,
      logo,
      moneda,
      zona_horaria,
      idioma,
      iva_porcentaje,
    } = data

    // Validaciones básicas
    if (!nombre_empresa || !direccion || !ciudad || !telefono || !email || !cif) {
      return NextResponse.json({ error: "Los campos obligatorios no pueden estar vacíos" }, { status: 400 })
    }

    // Verificar si existe configuración
    const existing = await query("SELECT id FROM configuracion WHERE id = 1")

    if (existing.length === 0) {
      // Crear nueva configuración
      await query(
        `INSERT INTO configuracion (
          id, nombre_empresa, razon_social, direccion, ciudad, codigo_postal, provincia, pais,
          telefono, email, sitio_web, cif, pie_pagina, logo, moneda, zona_horaria, idioma, iva_porcentaje
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre_empresa,
          razon_social,
          direccion,
          ciudad,
          codigo_postal,
          provincia,
          pais,
          telefono,
          email,
          sitio_web,
          cif,
          pie_pagina,
          logo,
          moneda,
          zona_horaria,
          idioma,
          iva_porcentaje,
        ],
      )
    } else {
      // Actualizar configuración existente
      await query(
        `UPDATE configuracion SET 
          nombre_empresa = ?, razon_social = ?, direccion = ?, ciudad = ?, codigo_postal = ?, 
          provincia = ?, pais = ?, telefono = ?, email = ?, sitio_web = ?, cif = ?, 
          pie_pagina = ?, logo = ?, moneda = ?, zona_horaria = ?, idioma = ?, iva_porcentaje = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1`,
        [
          nombre_empresa,
          razon_social,
          direccion,
          ciudad,
          codigo_postal,
          provincia,
          pais,
          telefono,
          email,
          sitio_web,
          cif,
          pie_pagina,
          logo,
          moneda,
          zona_horaria,
          idioma,
          iva_porcentaje,
        ],
      )
    }

    return NextResponse.json({
      message: "Configuración actualizada correctamente",
      data: data,
    })
  } catch (error) {
    console.error("Error al actualizar configuración:", error)
    return NextResponse.json({ error: "Error al actualizar la configuración" }, { status: 500 })
  }
}
