import { io, type Socket } from "socket.io-client"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// Tipos para las alertas de emergencia
export interface EmergencyAlert {
  id: string
  type: string
  location: {
    latitude: number
    longitude: number
  }
  timestamp: string
  userId: string
  userName: string
  userEmail?: string
  status: "active" | "resolved" | "pending"
  resolvedAt?: string
}

// Tipo para usuarios activos
export interface ActiveUser {
  id: string
  name: string
  connected: boolean
  lastSeen?: Date
  location?: {
    latitude: number
    longitude: number
  }
  emergencyType?: string
  userEmail?: string
}

// Interfaz para el estado del servicio
interface SocketState {
  socket: Socket | null
  connected: boolean
  alerts: EmergencyAlert[]
  resolvedAlerts: EmergencyAlert[]
  activeUsers: ActiveUser[]
  addAlert: (alert: EmergencyAlert) => void
  updateAlert: (id: string, data: Partial<EmergencyAlert>) => void
  resolveAlert: (id: string) => void
  setActiveUsers: (users: ActiveUser[]) => void
  updateUserLocation: (userId: string, location: { latitude: number; longitude: number }) => void
  addOrUpdateUser: (user: Partial<ActiveUser> & { id: string }) => void
  removeUser: (userId: string) => void
  connect: () => Promise<Socket>
  disconnect: () => void
  syncWithServer: () => void
}

// URL del servidor WebSocket - debe ser la misma que usa la app móvil
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001"

// Store de Zustand para manejar el estado del socket y las alertas
// Usamos persist para guardar las alertas en localStorage
export const useSocketStore = create<SocketState>()(
  persist(
    (set, get) => ({
      socket: null,
      connected: false,
      alerts: [],
      resolvedAlerts: [],
      activeUsers: [],

      addAlert: (alert) => {
        set((state) => {
          // Verificar si la alerta ya existe
          const exists = state.alerts.some((a) => a.id === alert.id)
          if (exists) {
            console.log("Alerta duplicada ignorada en addAlert:", alert)
            return { alerts: state.alerts } // No modificar el estado
          }

          return {
            alerts: [alert, ...state.alerts],
          }
        })
      },

      updateAlert: (id, data) => {
        set((state) => ({
          alerts: state.alerts.map((alert) => (alert.id === id ? { ...alert, ...data } : alert)),
        }))
      },

      resolveAlert: (id) => {
        set((state) => {
          // Buscar la alerta a resolver
          const alertToResolve = state.alerts.find((alert) => alert.id === id)

          if (!alertToResolve) {
            return state // No se encontró la alerta
          }

          // Actualizar la alerta con estado resuelto y timestamp
          const resolvedAlert = {
            ...alertToResolve,
            status: "resolved" as const,
            resolvedAt: new Date().toISOString(),
          }

          // Emitir evento al servidor para resolver la alerta
          if (get().socket && get().connected) {
            get().socket.emit("detenerSeguimiento", {
              userId: resolvedAlert.userId,
              timestamp: new Date().toISOString(),
              userEmail: resolvedAlert.userEmail,
            })
          }

          // Mover la alerta de la lista activa a la lista de resueltas
          return {
            alerts: state.alerts.filter((alert) => alert.id !== id),
            resolvedAlerts: [resolvedAlert, ...state.resolvedAlerts],
          }
        })
      },

      setActiveUsers: (users) => {
        set({ activeUsers: users })
      },

      updateUserLocation: (userId, location) => {
        set((state) => {
          // Actualizar la ubicación del usuario
          return {
            activeUsers: state.activeUsers.map((user) =>
              user.id === userId ? { ...user, location, lastSeen: new Date() } : user,
            ),
          }
        })
      },

      addOrUpdateUser: (userData) => {
        set((state) => {
          const existingUserIndex = state.activeUsers.findIndex((user) => user.id === userData.id)

          if (existingUserIndex >= 0) {
            // Actualizar usuario existente
            const updatedUsers = [...state.activeUsers]
            updatedUsers[existingUserIndex] = {
              ...updatedUsers[existingUserIndex],
              ...userData,
              lastSeen: new Date(),
            }
            return { activeUsers: updatedUsers }
          } else {
            // Añadir nuevo usuario
            return {
              activeUsers: [
                ...state.activeUsers,
                {
                  id: userData.id,
                  name: userData.name || `Usuario ${userData.id.substring(0, 5)}`,
                  connected: userData.connected !== undefined ? userData.connected : true,
                  lastSeen: new Date(),
                  location: userData.location,
                  emergencyType: userData.emergencyType,
                  userEmail: userData.userEmail,
                },
              ],
            }
          }
        })
      },

      removeUser: (userId) => {
        set((state) => ({
          activeUsers: state.activeUsers.filter((user) => user.id !== userId),
        }))
      },

      // Sincronizar con el servidor para obtener el estado actual
      syncWithServer: async () => {
        try {
          // Obtener alertas activas del servidor
          const response = await fetch(`${SOCKET_SERVER_URL}/api/alerts`)
          const data = await response.json()

          if (data.activeAlerts && Array.isArray(data.activeAlerts)) {
            // Procesar las alertas activas del servidor
            data.activeAlerts.forEach((serverAlert: any) => {
              // Verificar si la alerta ya existe en nuestro estado
              const exists = get().alerts.some(
                (a) => a.userEmail === serverAlert.userEmail || (serverAlert.alertId && a.id === serverAlert.alertId),
              )

              if (!exists) {
                // Crear una alerta con el formato correcto
                const alert: EmergencyAlert = {
                  id: serverAlert.alertId || `server-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                  type: serverAlert.type || "unknown",
                  location: {
                    latitude: 0,
                    longitude: 0,
                  },
                  timestamp: serverAlert.timestamp || new Date().toISOString(),
                  userId: "server-user",
                  userName: serverAlert.userEmail || "Usuario",
                  userEmail: serverAlert.userEmail,
                  status: "active",
                }

                get().addAlert(alert)
              }
            })
          }
        } catch (error) {
          console.error("Error al sincronizar con el servidor:", error)
        }
      },

      connect: async () => {
        // Si ya hay una conexión, devolverla
        if (get().socket && get().connected) {
          return get().socket
        }

        // Si hay un socket pero no está conectado, intentar reconectar
        if (get().socket && !get().connected) {
          get().socket.connect()
          return get().socket
        }

        // Crear nueva conexión
        return new Promise(async (resolve, reject) => {
          // Crear un ID único para esta conexión para evitar duplicados
          const connectionId = Date.now().toString()

          const socket = io(SOCKET_SERVER_URL, {
            transports: ["websocket"],
            upgrade: false,
            reconnectionAttempts: 3,
            reconnectionDelay: 500,
            timeout: 5000,
            autoConnect: true,
          })

          // Configurar eventos
          socket.on("connect", () => {
            console.log("Socket.io conectado:", socket.id)
            set({ socket, connected: true })

            // Sincronizar con el servidor al conectar
            get().syncWithServer()

            resolve(socket)
          })

          socket.on("connect_error", (error) => {
            console.error("Error de conexión Socket.io:", error)
            reject(error)
          })

          socket.on("disconnect", (reason) => {
            console.log("Socket.io desconectado:", reason)
            set({ connected: false })
          })

          // Manejar confirmación de conexión
          socket.on("connectionEstablished", (data) => {
            console.log("Conexión establecida:", data)
            // Podemos usar esto para sincronizar el tiempo con el servidor
          })

          // Manejar lista de usuarios activos
          socket.on("usuariosActivos", (users) => {
            console.log("Usuarios activos recibidos:", users)

            // Convertir los datos recibidos al formato de ActiveUser
            const formattedUsers = users.map((user: any) => ({
              id: user.id,
              name: user.name || `Usuario ${user.id.substring(0, 5)}`,
              connected: user.connected !== undefined ? user.connected : true,
              lastSeen: user.lastSeen ? new Date(user.lastSeen) : new Date(),
              location: user.location,
              emergencyType: user.emergencyType,
              userEmail: user.userEmail,
            }))

            set({ activeUsers: formattedUsers })
          })

          // Escuchar alertas de emergencia - Añadir verificación de duplicados
          socket.on("alertaRecibida", (data) => {
            console.log("Alerta recibida:", data)

            // Generar un ID consistente para la alerta
            const alertId = data.id || `${data.userId || data.fromUser}-${new Date(data.timestamp).getTime()}`

            // Verificar si la alerta ya existe en el estado
            const alertExists = get().alerts.some(
              (alert) =>
                alert.id === alertId ||
                (alert.userId === (data.userId || data.fromUser) &&
                  Math.abs(new Date(alert.timestamp).getTime() - new Date(data.timestamp).getTime()) < 5000),
            )

            if (!alertExists) {
              const alertWithId = {
                ...data,
                id: alertId,
                userId: data.userId || data.fromUser,
                status: "active",
                userEmail: data.userEmail,
              }
              get().addAlert(alertWithId)

              // Actualizar información del usuario que emitió la alerta
              get().addOrUpdateUser({
                id: data.userId || data.fromUser,
                name: data.userName,
                location: data.location,
                emergencyType: data.type,
                connected: true,
                userEmail: data.userEmail,
              })
            } else {
              console.log("Alerta duplicada ignorada:", data)
            }
          })

          // Escuchar actualizaciones de ubicación
          socket.on("ubicacionActualizada", (data) => {
            console.log("Ubicación actualizada recibida:", data)
            const userId = data.userId || data.fromUser || socket.id

            get().updateUserLocation(userId, data.location)

            // También actualizar el usuario
            get().addOrUpdateUser({
              id: userId,
              location: data.location,
              connected: true,
              userEmail: data.userEmail,
            })
          })

          // Escuchar detención de seguimiento
          socket.on("seguimientoDetenido", (data) => {
            console.log("Seguimiento detenido:", data)

            // Buscar todas las alertas activas de este usuario
            const alerts = get().alerts
            const userAlerts = alerts.filter((a) => a.userId === data.userId || a.userEmail === data.userEmail)

            // Resolver todas las alertas de este usuario
            userAlerts.forEach((alert) => {
              get().resolveAlert(alert.id)
            })

            // Actualizar el usuario
            get().addOrUpdateUser({
              id: data.userId,
              emergencyType: null,
              connected: true,
            })
          })

          // Escuchar desconexiones de usuarios
          socket.on("usuarioDesconectado", (data) => {
            console.log("Usuario desconectado:", data)

            // Marcar al usuario como desconectado en lugar de eliminarlo
            get().addOrUpdateUser({
              id: data.userId,
              connected: false,
              lastSeen: new Date(),
            })
          })

          // Implementar ping para medir latencia
          const pingInterval = setInterval(() => {
            if (socket.connected) {
              const start = Date.now()
              socket.emit("ping", start, (serverTime) => {
                const latency = Date.now() - start
                console.log(`Latencia del servidor: ${latency}ms`)
              })
            }
          }, 30000) // Cada 30 segundos

          // Limpiar intervalo cuando se desconecte
          socket.on("disconnect", () => {
            clearInterval(pingInterval)
          })

          set({ socket })
        })
      },

      disconnect: () => {
        const { socket } = get()
        if (socket) {
          socket.disconnect()
          set({ socket: null, connected: false })
        }
      },
    }),
    {
      name: "emergency-alerts-storage", // Nombre para localStorage
      partialize: (state) => ({
        // Solo persistir las alertas y no el socket u otros estados volátiles
        alerts: state.alerts,
        resolvedAlerts: state.resolvedAlerts,
      }),
    },
  ),
)

// Función para inicializar la conexión
export const initializeSocket = async () => {
  try {
    await useSocketStore.getState().connect()
    return true
  } catch (error) {
    console.error("Error al inicializar Socket.io:", error)
    return false
  }
}
