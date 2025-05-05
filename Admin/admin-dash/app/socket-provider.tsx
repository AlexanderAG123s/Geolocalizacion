"use client"

import { type ReactNode, useEffect, useRef } from "react"
import { initializeSocket, useSocketStore } from "@/lib/socket-service"

export function SocketProvider({ children }: { children: ReactNode }) {
  // Usar una referencia para rastrear si ya se inicializó
  const initialized = useRef(false)
  const { syncWithServer } = useSocketStore()

  // Inicializar la conexión WebSocket cuando se carga la aplicación
  useEffect(() => {
    // Solo inicializar una vez
    if (!initialized.current) {
      initialized.current = true

      initializeSocket().then((success) => {
        if (success) {
          console.log("Socket.io inicializado correctamente")

          // Sincronizar con el servidor para obtener el estado actual
          syncWithServer()

          // Configurar sincronización periódica
          const syncInterval = setInterval(() => {
            syncWithServer()
          }, 30000) // Sincronizar cada 30 segundos

          return () => {
            clearInterval(syncInterval)
          }
        } else {
          console.error("Error al inicializar Socket.io")
        }
      })
    }

    // Limpiar al desmontar
    return () => {
      // No desconectar aquí, ya que queremos mantener la conexión
      // mientras la aplicación esté abierta
    }
  }, [syncWithServer])

  return <>{children}</>
}
