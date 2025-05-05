const express = require("express")
const app = express()
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const compression = require("compression")
const axios = require("axios")

app.use(cors())
app.use(compression())
app.use(express.json())

const server = http.createServer(app)

// Configuración de la API REST
const API_BASE_URL = "http://192.168.1.68/Geo/Geolocalizacion/backend/api"

// Configurar el servidor para escuchar en todas las interfaces de red
const io = new Server(server, {
  cors: {
    origin: "*", // Permitir cualquier origen
    methods: ["GET", "POST"],
  },
  transports: ["websocket"], // Priorizar websocket
  allowUpgrades: false, // Evitar upgrades de transporte
  pingTimeout: 10000, // Reducir el timeout del ping
  pingInterval: 5000, // Reducir el intervalo de ping
  connectTimeout: 5000, // Timeout de conexión más corto
  maxHttpBufferSize: 1e6, // 1MB - Reducir tamaño de buffer para mensajes más pequeños
  perMessageDeflate: {
    threshold: 1024, // Comprimir mensajes mayores a 1KB
  },
})

// Almacenar usuarios activos y sus ubicaciones
const activeUsers = new Map()
const activeAlerts = new Map()

// Función para sincronizar con la API REST
async function syncWithRestApi(alertData) {
  try {
    if (!alertData.userEmail) return

    // Enviar la alerta a la API REST
    const response = await axios.post(`${API_BASE_URL}/emergency/report.php`, {
      correo: alertData.userEmail,
      tipo_emergencia: alertData.type,
      latitud: alertData.location.latitude,
      longitud: alertData.location.longitude,
    })

    console.log("Alerta sincronizada con API REST:", response.data)

    // Si es una nueva alerta, guardar el ID
    if (response.data.success && response.data.data && response.data.data.alerta_id) {
      // Guardar el ID de alerta para este usuario
      activeAlerts.set(alertData.userEmail, {
        alertId: response.data.data.alerta_id,
        type: alertData.type,
        timestamp: new Date().toISOString(),
      })
    }

    return response.data
  } catch (error) {
    console.error("Error al sincronizar con API REST:", error.message)
    return null
  }
}

// Función para finalizar alerta en la API REST
async function endAlertInRestApi(userEmail, alertId) {
  try {
    if (!userEmail) return

    // Enviar solicitud para finalizar la alerta
    const response = await axios.post(`${API_BASE_URL}/emergency/end_alert.php`, {
      correo: userEmail,
      alerta_id: alertId,
    })

    console.log("Alerta finalizada en API REST:", response.data)

    // Eliminar la alerta de nuestro registro
    if (activeAlerts.has(userEmail)) {
      activeAlerts.delete(userEmail)
    }

    return response.data
  } catch (error) {
    console.error("Error al finalizar alerta en API REST:", error.message)
    return null
  }
}

// Optimizar el manejo de conexiones
io.on("connection", (socket) => {
  console.log(`Usuario Conectado: ${socket.id}`)

  // Enviar confirmación inmediata de conexión
  socket.emit("connectionEstablished", {
    id: socket.id,
    timestamp: Date.now(),
    serverTime: new Date().toISOString(),
  })

  // Agregar usuario a la lista de activos
  activeUsers.set(socket.id, {
    id: socket.id,
    connected: true,
    lastSeen: new Date(),
  })

  // Informar al nuevo usuario sobre los usuarios activos
  socket.emit("usuariosActivos", Array.from(activeUsers.values()))

  // Manejar ping para medir latencia
  socket.on("ping", (clientTime, callback) => {
    if (typeof callback === "function") {
      callback(Date.now())
    } else {
      socket.emit("pong", {
        clientTime,
        serverTime: Date.now(),
      })
    }
  })

  // Manejar alertas de emergencia
  socket.on("emitirAlerta", async (data) => {
    console.log(`Alerta recibida de ${socket.id}:`, data)

    // Actualizar información del usuario
    if (activeUsers.has(socket.id)) {
      const userData = activeUsers.get(socket.id)
      activeUsers.set(socket.id, {
        ...userData,
        location: data.location,
        emergencyType: data.type,
        lastSeen: new Date(),
        userEmail: data.userEmail,
      })
    }

    // Sincronizar con la API REST
    if (data.userEmail) {
      await syncWithRestApi(data)
    }

    // Emitir la alerta a todos los demás clientes
    socket.broadcast.emit("alertaRecibida", {
      ...data,
      fromUser: socket.id,
    })
  })

  // Manejar actualizaciones de ubicación
  socket.on("actualizarUbicacion", async (data) => {
    console.log(`Actualización de ubicación de ${socket.id}:`, data)

    // Actualizar información del usuario
    if (activeUsers.has(socket.id)) {
      const userData = activeUsers.get(socket.id)
      activeUsers.set(socket.id, {
        ...userData,
        location: data.location,
        lastSeen: new Date(),
        userEmail: data.userEmail,
      })
    }

    // Sincronizar con la API REST si hay una alerta activa
    if (data.userEmail && activeAlerts.has(data.userEmail)) {
      await syncWithRestApi({
        ...data,
        type: activeAlerts.get(data.userEmail).type,
      })
    }

    // Emitir la ubicación a todos los demás clientes
    socket.broadcast.emit("ubicacionActualizada", {
      ...data,
      fromUser: socket.id,
    })
  })

  // Manejar detención de seguimiento
  socket.on("detenerSeguimiento", async (data) => {
    console.log(`Usuario ${socket.id} detuvo el seguimiento:`, data)

    // Actualizar información del usuario
    if (activeUsers.has(socket.id)) {
      const userData = activeUsers.get(socket.id)
      activeUsers.set(socket.id, {
        ...userData,
        emergencyType: null,
        lastSeen: new Date(),
      })
    }

    // Finalizar alerta en la API REST
    if (data.userEmail) {
      const alertInfo = activeAlerts.get(data.userEmail)
      if (alertInfo) {
        await endAlertInRestApi(data.userEmail, alertInfo.alertId)
      }
    }

    // Notificar a otros usuarios
    socket.broadcast.emit("seguimientoDetenido", {
      userId: socket.id,
      timestamp: data.timestamp,
      userEmail: data.userEmail,
    })
  })

  // Manejar desconexión
  socket.on("disconnect", () => {
    console.log(`Usuario Desconectado: ${socket.id}`)

    // Actualizar estado del usuario
    if (activeUsers.has(socket.id)) {
      const userData = activeUsers.get(socket.id)

      // Si el usuario tenía una emergencia activa, mantener el registro
      if (userData.emergencyType && userData.userEmail) {
        activeUsers.set(socket.id, {
          ...userData,
          connected: false,
          lastSeen: new Date(),
        })
      } else {
        // Si no tenía emergencia, eliminar después de un tiempo
        setTimeout(() => {
          if (activeUsers.has(socket.id) && !activeUsers.get(socket.id).connected) {
            activeUsers.delete(socket.id)
          }
        }, 3600000) // 1 hora
      }
    }

    // Informar a otros clientes que este usuario se desconectó
    socket.broadcast.emit("usuarioDesconectado", {
      userId: socket.id,
      timestamp: new Date().toISOString(),
    })
  })
})

// Ruta simple para verificar que el servidor está funcionando
app.get("/", (req, res) => {
  res.send("Servidor de Socket.io funcionando correctamente")
})

// Agregar esta ruta para verificar la salud del servidor
app.get("/health", (req, res) => {
  res.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    activeUsers: activeUsers.size,
    activeAlerts: activeAlerts.size,
  })
})

// Ruta para obtener alertas activas
app.get("/api/alerts", (req, res) => {
  res.status(200).send({
    activeAlerts: Array.from(activeAlerts.entries()).map(([email, data]) => ({
      userEmail: email,
      ...data,
    })),
  })
})

// Cambiar esto para escuchar en todas las interfaces de red
server.listen(3001, "0.0.0.0", () => {
  console.log("Server is ON.... en puerto 3001, escuchando en todas las interfaces")
})
