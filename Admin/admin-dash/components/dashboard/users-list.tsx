"use client"

import { useSocketStore, type ActiveUser } from "@/lib/socket-service"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, AlertTriangle } from "lucide-react"

export function UsersList() {
  const { activeUsers } = useSocketStore()

  // Ordenar usuarios: primero los conectados, luego por última vez vistos
  const sortedUsers = [...activeUsers].sort((a, b) => {
    // Primero por estado de conexión
    if (a.connected && !b.connected) return -1
    if (!a.connected && b.connected) return 1

    // Luego por emergencia activa
    if (a.emergencyType && !b.emergencyType) return -1
    if (!a.emergencyType && b.emergencyType) return 1

    // Finalmente por última vez visto
    const aTime = a.lastSeen ? new Date(a.lastSeen).getTime() : 0
    const bTime = b.lastSeen ? new Date(b.lastSeen).getTime() : 0
    return bTime - aTime
  })

  return (
    <div className="space-y-4">
      {sortedUsers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay usuarios conectados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  )
}

function UserCard({ user }: { user: ActiveUser }) {
  // Función para obtener el nombre del tipo de emergencia
  function getEmergencyTypeName(type: string | undefined): string {
    if (!type) return ""

    const types: Record<string, string> = {
      ambulance: "Ambulancia",
      "car-theft": "Robo de Coche",
      kidnapping: "Secuestro",
      fire: "Incendio",
      police: "Policía",
    }

    return types[type] || type
  }

  // Calcular tiempo desde la última vez visto
  const getTimeAgo = (date: Date | undefined) => {
    if (!date) return "Desconocido"

    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `hace ${seconds} segundos`
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`
    return `hace ${Math.floor(seconds / 86400)} días`
  }

  return (
    <Card className={`overflow-hidden ${!user.connected ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{user.name}</h3>
              <Badge variant={user.connected ? "default" : "outline"}>
                {user.connected ? "Conectado" : "Desconectado"}
              </Badge>
              {user.emergencyType && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {getEmergencyTypeName(user.emergencyType)}
                </Badge>
              )}
            </div>

            <div className="mt-2 text-sm text-muted-foreground">
              <p className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" />
                Última actividad: {getTimeAgo(user.lastSeen)}
              </p>

              {user.location && (
                <p className="flex items-center mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {user.location.latitude.toFixed(6)}, {user.location.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          <div className={`h-3 w-3 rounded-full ${user.connected ? "bg-green-500" : "bg-gray-300"}`}></div>
        </div>
      </CardContent>
    </Card>
  )
}
