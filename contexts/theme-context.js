"use client"

import React, { createContext, useState, useEffect, useContext } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Definimos los temas disponibles
export const themes = {
  light: {
    name: "light",
    primary: "#4CAF50",
    secondary: "#3d9140",
    background: ["#f5f7fa", "#e4e8eb"],
    card: "#FFFFFF",
    text: "#333333",
    subtext: "#666666",
    inputBg: "#F5F6F8",
    inputBorder: "#E8E8E8",
    mapStyle: [], // Estilo por defecto del mapa
  },
  dark: {
    name: "dark",
    primary: "#2196F3",
    secondary: "#1976D2",
    background: ["#1a1a2e", "#16213e"],
    card: "#0d1117",
    text: "#e6e6e6",
    subtext: "#a0a0a0",
    inputBg: "#1f2937",
    inputBorder: "#374151",
    mapStyle: [
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
      },
      {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
      },
      {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
      },
    ],
  },
  darkOrange: {
    name: "darkOrange",
    primary: "#FF5722", // Naranja
    secondary: "#E64A19", // Naranja oscuro
    background: ["#121212", "#1e1e1e"], // Negro
    card: "#212121",
    text: "#ffffff",
    subtext: "#b0b0b0",
    inputBg: "#2c2c2c",
    inputBorder: "#3d3d3d",
    mapStyle: [
      { elementType: "geometry", stylers: [{ color: "#212121" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
      {
        featureType: "administrative",
        elementType: "geometry",
        stylers: [{ color: "#757575" }],
      },
      {
        featureType: "administrative.country",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9e9e9e" }],
      },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#ff5722" }], // Naranja
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#ff5722" }], // Naranja
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#181818" }],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#616161" }],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#1b1b1b" }],
      },
      {
        featureType: "road",
        elementType: "geometry.fill",
        stylers: [{ color: "#2c2c2c" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#8a8a8a" }],
      },
      {
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [{ color: "#373737" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#3c3c3c" }],
      },
      {
        featureType: "road.highway.controlled_access",
        elementType: "geometry",
        stylers: [{ color: "#4e4e4e" }],
      },
      {
        featureType: "road.local",
        elementType: "labels.text.fill",
        stylers: [{ color: "#616161" }],
      },
      {
        featureType: "transit",
        elementType: "labels.text.fill",
        stylers: [{ color: "#ff5722" }], // Naranja
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#000000" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#3d3d3d" }],
      },
    ],
  },
}

// Creamos el contexto
const ThemeContext = createContext()

// Proveedor del contexto
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(themes.light)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar el tema guardado al iniciar la app
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("@theme")
        if (savedTheme) {
          setCurrentTheme(themes[savedTheme])
        }
      } catch (error) {
        console.error("Error loading theme:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [])

  // Función para cambiar el tema
  const changeTheme = async (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themes[themeName])
      try {
        await AsyncStorage.setItem("@theme", themeName)
      } catch (error) {
        console.error("Error saving theme:", error)
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, changeTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook personalizado para usar el tema
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
