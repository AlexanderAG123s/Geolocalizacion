"use client"

import { StatusBar } from "expo-status-bar"
import React, { useEffect, useState, useRef } from "react"
import {
  Pressable,
  StyleSheet,
  View,
  Alert,
  Text,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Animated,
  LogBox,
} from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import * as Location from "expo-location"
import { ThemeProvider, useTheme } from "./context/ThemeContext"

// Ignorar advertencias específicas que no son críticas
LogBox.ignoreLogs(["ViewPropTypes will be removed", "ColorPropType will be removed", "Animated: `useNativeDriver`"])

// Componente para capturar errores
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.log("Error en la aplicación:", error)
    console.log("Información adicional:", errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>¡Ups! Algo salió mal</Text>
          <Text style={styles.errorMessage}>{this.state.error?.toString()}</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => this.setState({ hasError: false })}>
            <Text style={styles.errorButtonText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return this.props.children
  }
}

// Main App wrapped with ThemeProvider and ErrorBoundary
export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  )
}

function App() {
  const { theme, isDarkMode, toggleTheme } = useTheme()

  const [origin, setOrigin] = useState({
    latitude: 19.6845823,
    longitude: -99.1627131,
  })
  const [userLocation, setUserLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [emergencyType, setEmergencyType] = useState("")
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [activeTab, setActiveTab] = useState("settings")

  // Animation value for sidebar
  const sidebarAnimation = useRef(new Animated.Value(0)).current

  // Vehicle card information
  const [vehicleInfo, setVehicleInfo] = useState({
    plate: "",
    make: "",
    model: "",
    year: "",
    color: "",
    vin: "",
    insurance: "",
  })

  // Use a ref to store the location subscription
  const locationSubscription = useRef(null)

  // Emergency types
  const emergencyTypes = [
    { id: "ambulance", title: "Ambulancia", icon: "ambulance" },
    { id: "car-theft", title: "Robo de Coche", icon: "car" },
    { id: "kidnapping", title: "Secuestro", icon: "user-secret" },
    { id: "fire", title: "Incendio", icon: "fire" },
    { id: "police", title: "Policía", icon: "shield" },
  ]

  // Request location permissions on app start
  useEffect(() => {
    const getLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()

        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied")
          console.log("Location permission denied")
          return
        }

        // Get initial location once
        try {
          const initialLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          })

          const userCoords = {
            latitude: initialLocation.coords.latitude,
            longitude: initialLocation.coords.longitude,
          }

          setUserLocation(userCoords)
          setOrigin(userCoords)
        } catch (error) {
          console.error("Error getting initial location:", error)
          setErrorMsg("Error getting location")
        }
      } catch (error) {
        console.error("Error requesting permissions:", error)
      }
    }

    getLocationPermission()

    // Clean up any subscription when component unmounts
    return () => {
      stopLocationTracking()
    }
  }, [])

  // Animate sidebar when visibility changes
  useEffect(() => {
    Animated.timing(sidebarAnimation, {
      toValue: sidebarVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [sidebarVisible, sidebarAnimation])

  // Function to start location tracking
  const startLocationTracking = async (type) => {
    try {
      // First stop any existing subscription
      stopLocationTracking()

      // Set the emergency type
      setEmergencyType(type)

      // Then start a new subscription
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // Update every 1 second
          distanceInterval: 5, // Update if moved by 5 meters
        },
        (location) => {
          const updatedCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }

          setUserLocation(updatedCoords)
          // Also update origin to keep map centered on user
          setOrigin(updatedCoords)

          console.log(`EMERGENCY (${type}): Location updated:`, updatedCoords)
          // Here you would send this location to your emergency service
          // along with the emergency type and vehicle info if available
        },
      )

      setIsTracking(true)
      console.log(`Emergency tracking started for: ${type}`)
    } catch (error) {
      console.error("Error starting location tracking:", error)
      Alert.alert("Tracking Error", "Could not start location tracking.")
      setIsTracking(false)
    }
  }

  // Function to stop location tracking
  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove()
      locationSubscription.current = null
      setIsTracking(false)
      setEmergencyType("")
      console.log("Emergency tracking stopped")
    }
  }

  // Handle panic button press
  const handlePanicButton = () => {
    if (isTracking) {
      // If already tracking, stop tracking
      stopLocationTracking()
    } else {
      // If not tracking, show emergency options
      setModalVisible(true)
    }
  }

  // Handle emergency type selection
  const handleEmergencySelect = (type) => {
    setModalVisible(false)
    startLocationTracking(type.id)
    Alert.alert(
      "Emergencia Reportada",
      `Se ha reportado: ${type.title}. Servicios de emergencia serán notificados de su ubicación cada 1 segundo.`,
      [{ text: "OK" }],
    )
  }

  // Function to manually center map on user's location
  const centerOnUser = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }

      setUserLocation(userCoords)
      setOrigin(userCoords)
    } catch (error) {
      console.error("Error updating location:", error)
    }
  }

  // Handle vehicle info changes
  const handleVehicleInfoChange = (field, value) => {
    setVehicleInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  // Render the sidebar content based on active tab
  const renderSidebarContent = () => {
    switch (activeTab) {
      case "vehicle":
        return (
          <ScrollView style={[styles.sidebar_tab_content, { backgroundColor: theme.background }]}>
            <Text style={[styles.sidebar_section_title, { color: theme.text }]}>Tarjeta Vehicular</Text>
            <View style={styles.form_group}>
              <Text style={[styles.form_label, { color: theme.text }]}>Placa</Text>
              <TextInput
                style={[
                  styles.form_input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                value={vehicleInfo.plate}
                onChangeText={(text) => handleVehicleInfoChange("plate", text)}
                placeholder="Ingrese placa"
                placeholderTextColor={isDarkMode ? "#777" : "#999"}
              />
            </View>
            <View style={styles.form_group}>
              <Text style={[styles.form_label, { color: theme.text }]}>Marca</Text>
              <TextInput
                style={[
                  styles.form_input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                value={vehicleInfo.make}
                onChangeText={(text) => handleVehicleInfoChange("make", text)}
                placeholder="Ingrese marca"
                placeholderTextColor={isDarkMode ? "#777" : "#999"}
              />
            </View>
            <View style={styles.form_group}>
              <Text style={[styles.form_label, { color: theme.text }]}>Modelo</Text>
              <TextInput
                style={[
                  styles.form_input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                value={vehicleInfo.model}
                onChangeText={(text) => handleVehicleInfoChange("model", text)}
                placeholder="Ingrese modelo"
                placeholderTextColor={isDarkMode ? "#777" : "#999"}
              />
            </View>
            <View style={styles.form_group}>
              <Text style={[styles.form_label, { color: theme.text }]}>Año</Text>
              <TextInput
                style={[
                  styles.form_input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                value={vehicleInfo.year}
                onChangeText={(text) => handleVehicleInfoChange("year", text)}
                placeholder="Ingrese año"
                placeholderTextColor={isDarkMode ? "#777" : "#999"}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.form_group}>
              <Text style={[styles.form_label, { color: theme.text }]}>Color</Text>
              <TextInput
                style={[
                  styles.form_input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                value={vehicleInfo.color}
                onChangeText={(text) => handleVehicleInfoChange("color", text)}
                placeholder="Ingrese color"
                placeholderTextColor={isDarkMode ? "#777" : "#999"}
              />
            </View>
            <View style={styles.form_group}>
              <Text style={[styles.form_label, { color: theme.text }]}>Número VIN</Text>
              <TextInput
                style={[
                  styles.form_input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                value={vehicleInfo.vin}
                onChangeText={(text) => handleVehicleInfoChange("vin", text)}
                placeholder="Ingrese VIN"
                placeholderTextColor={isDarkMode ? "#777" : "#999"}
              />
            </View>
            <View style={styles.form_group}>
              <Text style={[styles.form_label, { color: theme.text }]}>Seguro</Text>
              <TextInput
                style={[
                  styles.form_input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                value={vehicleInfo.insurance}
                onChangeText={(text) => handleVehicleInfoChange("insurance", text)}
                placeholder="Ingrese información de seguro"
                placeholderTextColor={isDarkMode ? "#777" : "#999"}
              />
            </View>
            <TouchableOpacity
              style={styles.save_button}
              onPress={() => {
                Alert.alert("Información Guardada", "Los datos del vehículo han sido guardados.")
              }}
            >
              <Text style={styles.save_button_text}>Guardar</Text>
            </TouchableOpacity>
          </ScrollView>
        )
      case "settings":
        return (
          <View style={[styles.sidebar_tab_content, { backgroundColor: theme.background }]}>
            <Text style={[styles.sidebar_section_title, { color: theme.text }]}>Configuración</Text>

            {/* Theme toggle option */}
            <View style={[styles.settings_option, { borderBottomColor: theme.border }]}>
              <Text style={[styles.settings_label, { color: theme.text }]}>Tema</Text>
              <TouchableOpacity onPress={toggleTheme}>
                <Text style={[styles.settings_value, { color: theme.primary }]}>{isDarkMode ? "Oscuro" : "Claro"}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.settings_option, { borderBottomColor: theme.border }]}>
              <Text style={[styles.settings_label, { color: theme.text }]}>Intervalo de actualización</Text>
              <Text style={[styles.settings_value, { color: theme.primary }]}>1 segundo</Text>
            </View>
            <View style={[styles.settings_option, { borderBottomColor: theme.border }]}>
              <Text style={[styles.settings_label, { color: theme.text }]}>Precisión de ubicación</Text>
              <Text style={[styles.settings_value, { color: theme.primary }]}>Alta</Text>
            </View>
            <View style={[styles.settings_option, { borderBottomColor: theme.border }]}>
              <Text style={[styles.settings_label, { color: theme.text }]}>Notificaciones</Text>
              <Text style={[styles.settings_value, { color: theme.primary }]}>Activadas</Text>
            </View>
          </View>
        )
      case "contacts":
        return (
          <View style={[styles.sidebar_tab_content, { backgroundColor: theme.background }]}>
            <Text style={[styles.sidebar_section_title, { color: theme.text }]}>Contactos de Emergencia</Text>
            <Text style={[styles.sidebar_text, { color: isDarkMode ? "#aaa" : "#666" }]}>
              Agregue contactos que serán notificados en caso de emergencia.
            </Text>
            <TouchableOpacity style={styles.add_contact_button}>
              <FontAwesome name="plus" size={16} color="white" />
              <Text style={styles.add_contact_text}>Agregar Contacto</Text>
            </TouchableOpacity>
          </View>
        )
      default:
        return null
    }
  }

  // Calculate sidebar position based on animation value
  const sidebarLeft = sidebarAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-250, 0],
  })

  // Render Map Fallback
  const renderMapFallback = () => (
    <View style={[styles.mapFallback, { backgroundColor: isDarkMode ? "#1a1a1a" : "#f0f0f0" }]}>
      <Text style={[styles.mapFallbackText, { color: theme.text }]}>Ubicación actual:</Text>
      {userLocation ? (
        <View style={styles.locationInfo}>
          <Text style={[styles.locationText, { color: theme.text }]}>Latitud: {userLocation.latitude.toFixed(6)}</Text>
          <Text style={[styles.locationText, { color: theme.text }]}>
            Longitud: {userLocation.longitude.toFixed(6)}
          </Text>
          {isTracking && (
            <Text style={[styles.trackingText, { color: "#ff6b6b" }]}>
              Enviando ubicación (Emergencia:{" "}
              {emergencyTypes.find((t) => t.id === emergencyType)?.title || emergencyType})
            </Text>
          )}
        </View>
      ) : (
        <Text style={[styles.locationText, { color: theme.text }]}>Obteniendo ubicación...</Text>
      )}
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.statusBar} />

      {/* Left Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            left: sidebarLeft,
            backgroundColor: theme.background,
            borderRightColor: theme.border,
            borderRightWidth: 1,
          },
        ]}
      >
        <View style={[styles.sidebar_header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sidebar_title, { color: theme.text }]}>Opciones</Text>
          <TouchableOpacity style={styles.sidebar_close} onPress={toggleSidebar}>
            <FontAwesome name="times" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.sidebar_tabs, { borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={[
              styles.sidebar_tab,
              { backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5" },
              activeTab === "vehicle" && styles.sidebar_tab_active,
            ]}
            onPress={() => setActiveTab("vehicle")}
          >
            <FontAwesome name="car" size={20} color={activeTab === "vehicle" ? "#fff" : theme.text} />
            <Text
              style={[
                styles.sidebar_tab_text,
                { color: theme.text },
                activeTab === "vehicle" && styles.sidebar_tab_text_active,
              ]}
            >
              Vehículo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sidebar_tab,
              { backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5" },
              activeTab === "settings" && styles.sidebar_tab_active,
            ]}
            onPress={() => setActiveTab("settings")}
          >
            <FontAwesome name="cog" size={20} color={activeTab === "settings" ? "#fff" : theme.text} />
            <Text
              style={[
                styles.sidebar_tab_text,
                { color: theme.text },
                activeTab === "settings" && styles.sidebar_tab_text_active,
              ]}
            >
              Ajustes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sidebar_tab,
              { backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5" },
              activeTab === "contacts" && styles.sidebar_tab_active,
            ]}
            onPress={() => setActiveTab("contacts")}
          >
            <FontAwesome name="users" size={20} color={activeTab === "contacts" ? "#fff" : theme.text} />
            <Text
              style={[
                styles.sidebar_tab_text,
                { color: theme.text },
                activeTab === "contacts" && styles.sidebar_tab_text_active,
              ]}
            >
              Contactos
            </Text>
          </TouchableOpacity>
        </View>

        {renderSidebarContent()}
      </Animated.View>

      {/* Semi-transparent overlay when sidebar is open */}
      {sidebarVisible && <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={toggleSidebar} />}

      {/* Main Content - No longer using Animated.View with marginLeft */}
      <View style={styles.main_content}>
        {/* Fallback UI instead of MapView */}
        {renderMapFallback()}

        {/* Location button to recenter on user */}
        <Pressable
          style={[
            styles.location_button,
            {
              backgroundColor: isDarkMode ? theme.dark : "white",
              borderColor: isDarkMode ? theme.border : "transparent",
              borderWidth: isDarkMode ? 1 : 0,
            },
          ]}
          onPress={centerOnUser}
        >
          <FontAwesome name="location-arrow" size={24} color={isDarkMode ? theme.light : "black"} />
        </Pressable>

        {/* Sidebar toggle button */}
        <Pressable
          style={[
            styles.sidebar_button,
            {
              backgroundColor: isDarkMode ? theme.dark : "white",
              borderColor: isDarkMode ? theme.border : "transparent",
              borderWidth: isDarkMode ? 1 : 0,
            },
          ]}
          onPress={toggleSidebar}
        >
          <FontAwesome name="bars" size={24} color={isDarkMode ? theme.light : "black"} />
        </Pressable>

        {/* Theme toggle button */}
        <Pressable
          style={[
            styles.theme_button,
            {
              backgroundColor: isDarkMode ? theme.dark : "white",
              borderColor: isDarkMode ? theme.border : "transparent",
              borderWidth: isDarkMode ? 1 : 0,
            },
          ]}
          onPress={toggleTheme}
        >
          <FontAwesome name={isDarkMode ? "sun-o" : "moon-o"} size={24} color={isDarkMode ? theme.light : "black"} />
        </Pressable>

        {/* Panic button - changes color when tracking is active */}
        <Pressable
          style={[styles.warning_button, isTracking ? styles.tracking_active : {}]}
          onPress={handlePanicButton}
        >
          <FontAwesome name={isTracking ? "stop-circle" : "exclamation-triangle"} size={40} color="white" />
          <Text style={styles.button_text}>{isTracking ? "STOP" : "SOS"}</Text>
        </Pressable>

        {/* Status indicator */}
        {isTracking && (
          <View style={styles.status_indicator}>
            <Text style={styles.status_text}>
              {emergencyType
                ? `Emergencia: ${emergencyTypes.find((t) => t.id === emergencyType)?.title || emergencyType}`
                : "Tracking Active"}
            </Text>
          </View>
        )}
      </View>

      {/* Emergency Type Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false)
        }}
      >
        <SafeAreaView style={styles.modal_container}>
          <View style={[styles.modal_content, { backgroundColor: isDarkMode ? "#222" : "#333" }]}>
            <Text style={styles.modal_title}>Seleccione Tipo de Emergencia</Text>

            {emergencyTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={styles.emergency_option}
                onPress={() => handleEmergencySelect(type)}
              >
                <FontAwesome name={type.icon} size={24} color="white" style={styles.option_icon} />
                <Text style={styles.option_text}>{type.title}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.cancel_button, { backgroundColor: isDarkMode ? "#444" : "#555" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancel_text}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main_content: {
    flex: 1,
    position: "relative",
  },
  mapFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mapFallbackText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  locationInfo: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%",
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    marginBottom: 10,
  },
  trackingText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 5,
  },
  warning_button: {
    position: "absolute",
    width: 100,
    height: 100,
    backgroundColor: "red",
    borderRadius: 50,
    bottom: 40,
    alignSelf: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Ensure button stays above map
  },
  tracking_active: {
    backgroundColor: "#d9534f",
    borderWidth: 3,
    borderColor: "white",
  },
  button_text: {
    color: "white",
    fontWeight: "bold",
    marginTop: 5,
  },
  location_button: {
    position: "absolute",
    width: 50,
    height: 50,
    backgroundColor: "white",
    borderRadius: 25,
    top: 60,
    right: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Ensure button stays above map
  },
  sidebar_button: {
    position: "absolute",
    width: 50,
    height: 50,
    backgroundColor: "white",
    borderRadius: 25,
    top: 60,
    left: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Ensure button stays above map
  },
  theme_button: {
    position: "absolute",
    width: 50,
    height: 50,
    backgroundColor: "white",
    borderRadius: 25,
    top: 120,
    right: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Ensure button stays above map
  },
  status_indicator: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "rgba(217, 83, 79, 0.8)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 1, // Ensure indicator stays above map
  },
  status_text: {
    color: "white",
    fontWeight: "bold",
  },
  // Modal styles
  modal_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal_content: {
    width: "80%",
    backgroundColor: "#333",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modal_title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
    textAlign: "center",
  },
  emergency_option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "red",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  option_icon: {
    marginRight: 15,
  },
  option_text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancel_button: {
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#555",
    width: "100%",
    alignItems: "center",
  },
  cancel_text: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Sidebar styles
  sidebar: {
    position: "absolute",
    width: 250,
    height: "100%",
    backgroundColor: "white",
    zIndex: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  sidebar_header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sidebar_title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sidebar_close: {
    padding: 5,
  },
  sidebar_tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sidebar_tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#f5f5f5",
  },
  sidebar_tab_active: {
    backgroundColor: "#007bff",
  },
  sidebar_tab_text: {
    marginLeft: 8,
    fontWeight: "bold",
    color: "#333",
  },
  sidebar_tab_text_active: {
    color: "white",
  },
  sidebar_tab_content: {
    padding: 20,
    flex: 1,
  },
  sidebar_section_title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  sidebar_text: {
    marginBottom: 15,
    color: "#666",
  },
  // Form styles
  form_group: {
    marginBottom: 15,
  },
  form_label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "500",
  },
  form_input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  save_button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  save_button_text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Settings styles
  settings_option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settings_label: {
    fontSize: 16,
  },
  settings_value: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "500",
  },
  // Contact styles
  add_contact_button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    justifyContent: "center",
    marginTop: 15,
  },
  add_contact_text: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  // Error boundary styles
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#dc3545",
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#343a40",
  },
  errorButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})

