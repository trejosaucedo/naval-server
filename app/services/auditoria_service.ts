import { MongoClient } from 'mongodb'
import type { AuditoriaLogDto } from '#dtos/auditoria'

const uri = process.env.MONGO_URL || 'mongodb://localhost:27017'
const dbName = process.env.MONGO_DB || 'crud-personas'
const collectionName = 'auditoria_personas'

export async function registrarAuditoria(data: AuditoriaLogDto): Promise<void> {
  // Abre y cierra el cliente en cada llamada
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(collectionName)
    await collection.insertOne(data)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error al registrar auditoría en MongoDB:', error?.message || error)
    }
    // No lances el error, solo lo logueas si quieres
  } finally {
    await client.close().catch(() => {}) // No importa si ya estaba cerrado
  }
}
