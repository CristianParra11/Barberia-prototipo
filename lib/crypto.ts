const encoder = new TextEncoder()
const decoder = new TextDecoder()

const IV_LENGTH = 12 // AES-GCM requiere 12 bytes de IV

function getSecretKey(): Uint8Array {
  const secret = process.env.SECRET_KEY || "default_secret_key"
  return encoder.encode(secret.padEnd(32, "0").slice(0, 32)) // fuerza a 32 bytes
}

async function importKey(): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    getSecretKey(),
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  )
}

export async function encrypt(text: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await importKey()
  const encodedText = encoder.encode(text)

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedText
  )

  // Concatenar IV + cifrado, codificar como base64
  const encryptedBytes = new Uint8Array(encryptedBuffer)
  const result = new Uint8Array(iv.length + encryptedBytes.length)
  result.set(iv)
  result.set(encryptedBytes, iv.length)

  return Buffer.from(result).toString("base64")
}

export async function decrypt(base64: string): Promise<string> {
  const encryptedData = Buffer.from(base64, "base64")
  const iv = encryptedData.slice(0, IV_LENGTH)
  const data = encryptedData.slice(IV_LENGTH)
  const key = await importKey()

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  )

  return decoder.decode(decryptedBuffer)
}
