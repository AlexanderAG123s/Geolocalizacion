"use client"

import { useState, useEffect } from "react"
import { useSocketStore, type EmergencyAlert } from "@/lib/socket-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Clock, MapPin, User, Mail, RefreshCw } from "lucide-react"

export function EmergencyList({ showAll = false }: { showAll?: boolean }) {
  const { alerts, resolvedAlerts, connected, resolveAlert, syncWithServer } = useSocketStore()
  const [filter, setFilter] = useState<"active" | "resolved" | "all">("active")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Sincronizar con el servidor cuando se monta el componente
  useEffect(() => {
    syncWithServer()
  }, [syncWithServer])

  // Función para refrescar manualmente
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await syncWithServer()
    setTimeout(() => setIsRefreshing(false), 1000) // Mostrar animación por al menos 1 segundo
  }

  // Obtener las alertas según el filtro seleccionado
  const getFilteredAlerts = () => {
    switch (filter) {
      case "active":
        return alerts
      case "resolved":
        return resolvedAlerts
      case "all":
        return [...alerts, ...resolvedAlerts].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
      default:
        return alerts
    }
  }

  const filteredAlerts = getFilteredAlerts()

  // Mostrar solo las alertas según el filtro si no se especifica showAll
  const displayAlerts = showAll ? filteredAlerts : filteredAlerts.slice(0, 5)

  // Función para resolver una alerta
  const handleResolveAlert = (id: string) => {
    resolveAlert(id)
  }

  // Función para obtener el nombre del tipo de emergencia
  function getEmergencyTypeName(type: string): string {
    const types: Record<string, string> = {
      ambulance: "Ambulancia",
      "car-theft": "Robo de Coche",
      kidnapping: "Secuestro",
      fire: "Incendio",
      police: "Policía",
    }

    return types[type] || type
  }

  // Función para obtener el color del badge según el tipo de emergencia
  function getEmergencyColor(type: string): string {
    const colors: Record<string, string> = {
      ambulance: "bg-red-100 text-red-800 hover:bg-red-200",
      "car-theft": "bg-blue-100 text-blue-800 hover:bg-blue-200",
      kidnapping: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      fire: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      police: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    }

    return colors[type] || "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }

  return (
    <div className="space-y-4">
      {!connected && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 text-sm">Desconectado del servidor. Intentando reconectar...</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <Tabs defaultValue="active" onValueChange={(value) => setFilter(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Activas</TabsTrigger>
            <TabsTrigger value="resolved">Resueltas</TabsTrigger>
            <TabsTrigger value="all">Todas</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="ml-2">
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {displayAlerts.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">
            No hay alertas {filter !== "all" ? (filter === "active" ? "activas" : "resueltas") : ""}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Las alertas aparecerán aquí cuando se generen desde la aplicación móvil.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayAlerts.map((alert) => (
            <EmergencyCard
              key={alert.id}
              alert={alert}
              onResolve={handleResolveAlert}
              getEmergencyTypeName={getEmergencyTypeName}
              getEmergencyColor={getEmergencyColor}
            />
          ))}
        </div>
      )}

      {!showAll && filteredAlerts.length > 5 && (
        <div className="text-center pt-2">
          <Button variant="ghost" size="sm">
            Ver todas las alertas
          </Button>
        </div>
      )}
    </div>
  )
}

interface EmergencyCardProps {
  alert: EmergencyAlert
  onResolve: (id: string) => void
  getEmergencyTypeName: (type: string) => string
  getEmergencyColor: (type: string) => string
}

function EmergencyCard({ alert, onResolve, getEmergencyTypeName, getEmergencyColor }: EmergencyCardProps) {
  const isActive = alert.status === "active"
  const date = new Date(alert.timestamp)
  const resolvedDate = alert.resolvedAt ? new Date(alert.resolvedAt) : null

  return (
    <Card className={`overflow-hidden ${isActive ? "border-red-300" : ""}`}>
      <CardContent className="p-0">
        <div className="flex items-stretch">
          <div className={`w-2 ${isActive ? "bg-red-500" : "bg-green-500"}`}></div>
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className={getEmergencyColor(alert.type)}>{getEmergencyTypeName(alert.type)}</Badge>
                  {isActive ? (
                    <span className="flex items-center text-xs text-red-500">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Activa
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" /> Resuelta
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5 mr-1" />
                  <span>{alert.userName}</span>
                </div>
                {alert.userEmail && (
                  <div className="mt-1 flex items-center text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 mr-1" />
                    <span>{alert.userEmail}</span>
                  </div>
                )}
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {date.toLocaleTimeString()} - {date.toLocaleDateString()}
                  </span>
                </div>
                {resolvedDate && (
                  <div className="mt-1 flex items-center text-sm text-green-600">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    <span>
                      Resuelta: {resolvedDate.toLocaleTimeString()} - {resolvedDate.toLocaleDateString()}
                    </span>
                  </div>
                )}
                {alert.location && (
                  <div className="mt-1 flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {alert.location.latitude.toFixed(6)}, {alert.location.longitude.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>

              {isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                  onClick={() => onResolve(alert.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Resolver
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
