"use client"

import { useEffect, useRef, useState } from "react"
import { useSocketStore } from "@/lib/socket-service"

declare global {
  interface Window {
    google?: any
  }
}

export function EmergencyMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<{ [key: string]: google.maps.Marker }>({})

  const { alerts, activeUsers, connected } = useSocketStore()

  // Cargar Google Maps
  useEffect(() => {
    // Verificar si el script de Google Maps ya está cargado
    if (!document.getElementById("google-maps-script") && !window.google?.maps) {
      const script = document.createElement("script")
      script.id = "google-maps-script"
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)
    } else {
      setMapLoaded(true)
    }

    return () => {
      // Limpiar marcadores al desmontar
      Object.values(markers).forEach((marker) => marker.setMap(null))
    }
  }, [])

  // Inicializar mapa
  useEffect(() => {
    if (mapLoaded && mapRef.current && !map) {
      const defaultCenter = { lat: 19.6845823, lng: -99.1627131 } // Coordenadas por defecto (México)

      const newMap = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
        styles: [
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#7c93a3" }, { lightness: "-10" }],
          },
          {
            featureType: "administrative.country",
            elementType: "geometry",
            stylers: [{ visibility: "on" }],
          },
          {
            featureType: "administrative.province",
            elementType: "geometry.stroke",
            stylers: [{ color: "#a5c2cc" }],
          },
          {
            featureType: "landscape",
            elementType: "geometry.fill",
            stylers: [{ color: "#f7f7f7" }],
          },
          {
            featureType: "road",
            elementType: "geometry.fill",
            stylers: [{ color: "#ffffff" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#d6d6d6" }],
          },
          {
            featureType: "water",
            elementType: "geometry.fill",
            stylers: [{ color: "#e0f3f8" }],
          },
        ],
      })

      setMap(newMap)
    }
  }, [mapLoaded, mapRef, map])

  // Actualizar marcadores de alertas
  useEffect(() => {
    if (!map) return

    // Crear o actualizar marcadores para alertas
    const newMarkers = { ...markers }

    alerts.forEach((alert) => {
      if (alert.location && alert.status === "active") {
        const position = {
          lat: alert.location.latitude,
          lng: alert.location.longitude,
        }

        // Crear marcador si no existe
        if (!newMarkers[alert.id]) {
          const marker = new window.google.maps.Marker({
            position,
            map,
            title: `${alert.userName}: ${alert.type}`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#FF0000",
              fillOpacity: 0.8,
              strokeWeight: 2,
              strokeColor: "#FFFFFF",
              scale: 10,
            },
            animation: window.google.maps.Animation.DROP,
          })

          // Agregar ventana de información
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 5px 0; color: #d9534f;">${getEmergencyTypeName(alert.type)}</h3>
                <p style="margin: 0 0 5px 0;"><strong>Usuario:</strong> ${alert.userName}</p>
                <p style="margin: 0 0 5px 0;"><strong>Hora:</strong> ${new Date(alert.timestamp).toLocaleTimeString()}</p>
              </div>
            `,
          })

          marker.addListener("click", () => {
            infoWindow.open(map, marker)
          })

          newMarkers[alert.id] = marker
        } else {
          // Actualizar posición si el marcador ya existe
          newMarkers[alert.id].setPosition(position)
        }
      } else if (alert.status !== "active" && newMarkers[alert.id]) {
        // Eliminar marcador si la alerta ya no está activa
        newMarkers[alert.id].setMap(null)
        delete newMarkers[alert.id]
      }
    })

    // Actualizar marcadores de usuarios activos
    activeUsers.forEach((user) => {
      if (user.location) {
        const userId = `user-${user.id}`
        const position = {
          lat: user.location.latitude,
          lng: user.location.longitude,
        }

        if (!newMarkers[userId]) {
          const marker = new window.google.maps.Marker({
            position,
            map,
            title: user.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#4285F4",
              fillOpacity: 0.7,
              strokeWeight: 1,
              strokeColor: "#FFFFFF",
              scale: 7,
            },
          })

          newMarkers[userId] = marker
        } else {
          newMarkers[userId].setPosition(position)
        }
      }
    })

    setMarkers(newMarkers)

    // Centrar mapa en la alerta más reciente
    if (alerts.length > 0 && alerts[0].location) {
      const recentAlert = alerts[0]
      map.panTo({
        lat: recentAlert.location.latitude,
        lng: recentAlert.location.longitude,
      })
    }
  }, [map, alerts, activeUsers])

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

  return (
    <div className="relative h-full w-full rounded-md overflow-hidden">
      {!connected && (
        <div className="absolute top-2 right-2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          Desconectado
        </div>
      )}

      {connected && (
        <div className="absolute top-2 right-2 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          Conectado
        </div>
      )}

      <div ref={mapRef} className="h-full w-full" />

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  )
}
