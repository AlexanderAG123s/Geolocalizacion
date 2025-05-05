"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSocketStore } from "@/lib/socket-service"
import { AlertTriangle, Users, CheckCircle, Activity } from "lucide-react"

export function StatsCards() {
  const { alerts, resolvedAlerts, activeUsers, connected, socket } = useSocketStore()
  const [stats, setStats] = useState({
    activeAlerts: 0,
    resolvedAlerts: 0,
    totalAlerts: 0,
    connectedUsers: 0,
    latency: 0,
  })

  // Medir latencia periódicamente
  useEffect(() => {
    if (!socket || !connected) return

    let isMounted = true

    const measureLatency = () => {
      const start = Date.now()
      socket.emit("ping", start, (serverTime) => {
        if (isMounted) {
          const latency = Date.now() - start
          setStats((prev) => ({ ...prev, latency }))
        }
      })
    }

    // Medir latencia inmediatamente y luego cada 10 segundos
    measureLatency()
    const interval = setInterval(measureLatency, 10000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [socket, connected])

  // Actualizar estadísticas cuando cambian las alertas o usuarios
  useEffect(() => {
    const activeAlertsCount = alerts.length
    const resolvedAlertsCount = resolvedAlerts.length

    // Contar solo usuarios conectados
    const connectedUsersCount = activeUsers.filter((user) => user.connected).length

    setStats((prev) => ({
      ...prev,
      activeAlerts: activeAlertsCount,
      resolvedAlerts: resolvedAlertsCount,
      totalAlerts: activeAlertsCount + resolvedAlertsCount,
      connectedUsers: connectedUsersCount,
    }))
  }, [alerts, resolvedAlerts, activeUsers])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeAlerts}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeAlerts > 0 ? "Requieren atención inmediata" : "No hay alertas activas"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas Resueltas</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.resolvedAlerts}</div>
          <p className="text-xs text-muted-foreground">
            {stats.resolvedAlerts > 0
              ? `${((stats.resolvedAlerts / (stats.totalAlerts || 1)) * 100).toFixed(0)}% del total`
              : "No hay alertas resueltas"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios Conectados</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.connectedUsers}</div>
          <p className="text-xs text-muted-foreground">
            {stats.connectedUsers > 0 ? "Usuarios activos en el sistema" : "No hay usuarios conectados"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estado del Servidor</CardTitle>
          <Activity className={`h-4 w-4 ${connected ? "text-green-500" : "text-red-500"}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{connected ? "En línea" : "Desconectado"}</div>
          <p className="text-xs text-muted-foreground">
            {connected ? `Latencia: ${stats.latency}ms` : "Intentando reconectar..."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
