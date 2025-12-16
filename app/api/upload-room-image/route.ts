import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] Starting file upload")

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      console.log("[v0] No file provided")
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    console.log("[v0] File received:", file.name, file.type, file.size)

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Type de fichier non valide" }, { status: 400 })
    }

    // Validate file size (8MB max)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (8MB max)" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log("[v0] File converted to base64 successfully")

    return NextResponse.json({ url: dataUrl })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      { error: `Erreur lors du téléchargement: ${error instanceof Error ? error.message : "Erreur inconnue"}` },
      { status: 500 },
    )
  }
}
