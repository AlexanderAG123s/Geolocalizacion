"use client"

import { StatusBar } from "expo-status-bar"
import React, { useEffect, useState, useRef } from "react"
import { Pressable, StyleSheet, View, Alert, Text, Modal, TouchableOpacity, SafeAreaView, Linking } from "react-native"
import MapView, { Marker } from "react-native-maps"
import { FontAwesome } from "@expo/vector-icons"
import * as Location from "expo-location"
import { useTheme } from "../contexts/theme-context"
import ElSidebar from "../components/elegant-sidebar"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function AlertScreen({ navigation, route }) {
  const { theme } = useTheme()
  const [origin, setOrigin] = useState({ latitude: 19.6845823, longitude: -99.1627131 })
  const [userLocation, setUserLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [emergencyType, setEmergencyType] = useState("")
  const [currentAlertId, setCurrentAlertId] = useState(null)
  
  // User data state
  const [userEmail, setUserEmail] = useState(null)
  const [userName, setUserName] = useState(null)
  
  // API base URL - usando tu dominio
  const apiBaseUrl = "http://192.168.1.68/GEOLOCALIZACION/backend/api"

  const locationSubscription = useRef(null)

  const emergencyTypes = [
    { id: "police", title: "Policía", icon: "shield" },
    { id: "ambulance", title: "Ambulancia", icon: "ambulance" },
    { id: "fire", title: "Incendio", icon: "fire" },
    { id: "car-theft", title: "Robo de Coche", icon: "car" },
  ]
  
  // Obtener datos del usuario desde AsyncStorage al montar el componente
  useEffect(() => {
    const getUserData = async () => {
      try {
        // Obtener email del usuario desde AsyncStorage
        const storedEmail = await AsyncStorage.getItem('userEmail')
        const storedName = await AsyncStorage.getItem('userName')
        
        if (storedEmail) {
          setUserEmail(storedEmail)
          setUserName(storedName || "Usuario")
          
          // Verificar si hay una alerta activa para este usuario
          checkActiveAlert(storedEmail)
        } else {
          // Si no hay email de usuario en storage, verificar si se pasó en los parámetros de ruta
          const routeEmail = route.params?.userEmail
          const routeName = route.params?.userName
          
          if (routeEmail) {
            setUserEmail(routeEmail)
            setUserName(routeName || "Usuario")
            // Guardar en AsyncStorage para uso futuro
            await AsyncStorage.setItem('userEmail', routeEmail)
            if (routeName) {
              await AsyncStorage.setItem('userName', routeName)
            }
            
            // Verificar si hay una alerta activa para este usuario
            checkActiveAlert(routeEmail)
          } else {
            // No hay email de usuario disponible, redirigir a login
            Alert.alert(
              "Sesión no encontrada", 
              "Por favor inicie sesión nuevamente",
              [{ text: "OK", onPress: () => navigation.navigate("Login") }]
            )
          }
        }
      } catch (error) {
        console.error("Error retrieving user data:", error)
      }
    }
    
    getUserData()
  }, [])

  // Verificar si el usuario tiene una alerta activa
  const checkActiveAlert = async (email) => {
    try {
      // Intentar hacer la solicitud
      const response = await fetch(`${apiBaseUrl}/emergency/check_active_alert.php?correo=${encodeURIComponent(email)}`)
      
      // Si la respuesta no es exitosa (por ejemplo, 404), simplemente continuamos sin alerta activa
      if (!response.ok) {
        console.log("No se pudo verificar alertas activas, continuando sin alerta")
        return
      }
      
      // Intentar parsear la respuesta como JSON
      let data
      try {
        data = await response.json()
      } catch (error) {
        console.error("Error parsing response:", error)
        return
      }
      
      if (data.success && data.has_active_alert) {
        // El usuario tiene una alerta activa
        setIsTracking(true)
        setCurrentAlertId(data.alerta_id)
        setEmergencyType(data.tipo_emergencia)
        
        // Iniciar seguimiento de ubicación
        startLocationTracking(data.tipo_emergencia, data.alerta_id)
        
        Alert.alert(
          "Alerta Activa", 
          `Tienes una alerta de ${data.tipo_emergencia} activa. El seguimiento continuará.`,
          [{ text: "OK" }]
        )
      }
    } catch (error) {
      // Capturar el error pero no hacer nada, simplemente continuamos sin alerta activa
      console.error("Error checking active alert:", error)
    }
  }

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        if (isMounted) {
          setErrorMsg("Permission denied")
          Alert.alert("Permiso denegado", "La ubicación es necesaria.")
        }
        return
      }

      try {
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

        const userCoords = {
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
        }

        if (isMounted) {
          setUserLocation(userCoords)
          setOrigin(userCoords)
        }
      } catch (error) {
        console.error("Error getting initial location:", error)
        if (isMounted) {
          setErrorMsg("Error getting location")
          Alert.alert("Error", "No se pudo obtener la ubicación.")
        }
      }
    })()

    return () => {
      isMounted = false
      stopLocationTracking()
    }
  }, [])

  const startLocationTracking = async (type, existingAlertId = null) => {
    try {
      // Si ya hay un seguimiento activo, detenerlo primero
      if (locationSubscription.current) {
        locationSubscription.current.remove()
      }
      
      setEmergencyType(type)

      // Iniciar nuevo seguimiento de ubicación
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 5,
        },
        (location) => {
          const updatedCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }

          setUserLocation(updatedCoords)
          setOrigin(updatedCoords)

          // Enviar la ubicación de emergencia al backend
          sendEmergencyLocation(type, updatedCoords, existingAlertId)

          console.log(`EMERGENCY (${type}): Location updated:`, updatedCoords)
        },
      )

      setIsTracking(true)
      console.log(`Emergency tracking started for: ${type}`)
    } catch (error) {
      console.error("Error starting location tracking:", error)
      Alert.alert("Tracking Error", "No se pudo iniciar el rastreo.")
      setIsTracking(false)
    }
  }

  // Función para enviar la ubicación de emergencia al backend
  const sendEmergencyLocation = async (type, coordinates, existingAlertId = null) => {
    if (!userEmail) return
    
    try {
      const response = await fetch(`${apiBaseUrl}/emergency/report.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: userEmail,
          tipo_emergencia: type,
          latitud: coordinates.latitude,
          longitud: coordinates.longitude,
          alerta_id: existingAlertId // Esto es opcional, el backend lo manejará
        })
      })
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        console.error("Error response from server:", await response.text())
        return
      }
      
      // Intentar parsear la respuesta como JSON
      let result
      try {
        result = await response.json()
      } catch (error) {
        console.error("Error parsing response:", error)
        return
      }
      
      console.log("Emergency location sent:", result)
      
      // Si es una nueva alerta, guardar el ID
      if (result.success && result.data && result.data.es_nueva_alerta && result.data.alerta_id) {
        setCurrentAlertId(result.data.alerta_id)
      }
    } catch (error) {
      console.error("Error sending emergency location:", error)
    }
  }

  const stopLocationTracking = async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove()
      locationSubscription.current = null
      
      // Finalizar la alerta en el servidor si tenemos un email de usuario
      if (userEmail) {
        try {
          const response = await fetch(`${apiBaseUrl}/emergency/end_alert.php`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              correo: userEmail,
              alerta_id: currentAlertId // Opcional, se puede finalizar por correo o por ID
            })
          })
          
          // Si el endpoint no existe o hay un error, simplemente lo registramos pero continuamos
          if (!response.ok) {
            console.log("No se pudo finalizar la alerta en el servidor, continuando...")
          } else {
            // Intentar parsear la respuesta como JSON
            try {
              const result = await response.json()
              console.log("Alerta finalizada:", result)
              
              // Mostrar mensaje al usuario
              if (result.success) {
                Alert.alert("Alerta finalizada", "La alerta de emergencia ha sido finalizada.")
              }
            } catch (error) {
              console.error("Error parsing response:", error)
            }
          }
        } catch (error) {
          console.error("Error al finalizar la alerta:", error)
        }
      }
      
      setIsTracking(false)
      setEmergencyType("")
      setCurrentAlertId(null)
      console.log("Tracking stopped")
    }
  }

  const handlePanicButton = () => {
    if (isTracking) {
      stopLocationTracking()
    } else {
      setModalVisible(true)
    }
  }

  const handleEmergencySelect = (type) => {
    setModalVisible(false)
    startLocationTracking(type.id)

    // Número de prueba
    const phoneNumber = "tel:5518394345"

    // Intentar iniciar la llamada
    Linking.openURL(phoneNumber).catch((err) => {
      console.error("Error making phone call:", err)
      Alert.alert("Error", "No se pudo iniciar la llamada.")
    })

    Alert.alert(
      "Emergencia Reportada",
      `Se ha reportado: ${type.title}. Se está llamando al número de prueba.`,
      [{ text: "OK" }]
    )
  }

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
      Alert.alert("Error", "No se pudo actualizar la ubicación.")
    }
  }

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  const handleLogout = async () => {
    setSidebarVisible(false)
    
    // Si hay una alerta activa, preguntar al usuario si desea finalizarla
    if (isTracking) {
      Alert.alert(
        "Alerta Activa",
        "Tienes una alerta de emergencia activa. ¿Deseas finalizarla antes de cerrar sesión?",
        [
          {
            text: "Finalizar y Salir",
            onPress: async () => {
              await stopLocationTracking()
              performLogout()
            }
          },
          {
            text: "Mantener Activa",
            onPress: () => performLogout(),
            style: "cancel"
          }
        ]
      )
    } else {
      performLogout()
    }
  }
  
  const performLogout = async () => {
    try {
      // Limpiar datos de usuario de AsyncStorage
      await AsyncStorage.removeItem('userEmail')
      await AsyncStorage.removeItem('userName')
      // Podrías querer limpiar otros datos relacionados con el usuario también
      
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente")
      navigation.navigate("Login")
    } catch (error) {
      console.error("Error during logout:", error)
      Alert.alert("Error", "No se pudo cerrar la sesión correctamente")
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.main_content}>
        <MapView
          style={styles.map}
          region={{
            latitude: origin.latitude,
            longitude: origin.longitude,
            latitudeDelta: 0.09,
            longitudeDelta: 0.04,
          }}
          customMapStyle={theme.mapStyle}
        >
          {userLocation && <Marker coordinate={userLocation} title="Tú estás aquí" pinColor="blue" />}
          <Marker
            pinColor="Blue"
            draggable
            coordinate={origin}
            onDragEnd={(e) => setOrigin(e.nativeEvent.coordinate)}
          />
        </MapView>

        <Pressable style={styles.location_button} onPress={centerOnUser}>
          <FontAwesome name="location-arrow" size={24} color="black" />
        </Pressable>

        <Pressable style={styles.sidebar_button} onPress={toggleSidebar}>
          <FontAwesome name="bars" size={24} color="black" />
        </Pressable>

        <Pressable
          style={[styles.warning_button, isTracking ? styles.tracking_active : {}]}
          onPress={handlePanicButton}
        >
          <FontAwesome name={isTracking ? "stop-circle" : "exclamation-triangle"} size={40} color="white" />
          <Text style={styles.button_text}>{isTracking ? "STOP" : "SOS"}</Text>
        </Pressable>

        {isTracking && (
          <View style={styles.status_indicator}>
            <Text style={styles.status_text}>
              {emergencyType
                ? `Emergencia: ${emergencyTypes.find((t) => t.id === emergencyType)?.title || emergencyType}`
                : "Tracking activo"}
            </Text>
          </View>
        )}
      </View>

      {/* Pasar userEmail y API URL a ElSidebar */}
      <ElSidebar
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onLogout={handleLogout}
        userEmail={userEmail}
        userName={userName}
        navigation={navigation}
        apiUrl={apiBaseUrl}
      />

      {sidebarVisible && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSidebarVisible(false)} />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modal_container}>
          <View style={styles.modal_content}>
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

            <TouchableOpacity style={styles.cancel_button} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancel_text}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  main_content: { flex: 1, position: "relative" },
  map: { width: "100%", height: "100%" },
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)", zIndex: 5,
  },
  warning_button: {
    position: "absolute", width: 100, height: 100, backgroundColor: "red",
    borderRadius: 50, bottom: 40, alignSelf: "center",
    elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 3, justifyContent: "center", alignItems: "center", zIndex: 1,
  },
  tracking_active: {
    backgroundColor: "#d9534f",
    borderWidth: 3,
    borderColor: "white",
  },
  button_text: { color: "white", fontWeight: "bold", marginTop: 5 },
  location_button: {
    position: "absolute", width: 50, height: 50, backgroundColor: "white",
    borderRadius: 25, top: 60, right: 20, elevation: 5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 3, justifyContent: "center", alignItems: "center", zIndex: 1,
  },
  sidebar_button: {
    position: "absolute", width: 50, height: 50, backgroundColor: "white",
    borderRadius: 25, top: 60, left: 20, elevation: 5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 3, justifyContent: "center", alignItems: "center", zIndex: 1,
  },
  status_indicator: {
    position: "absolute", top: 40, alignSelf: "center",
    backgroundColor: "rgba(217, 83, 79, 0.8)", paddingVertical: 8,
    paddingHorizontal: 16, borderRadius: 20, zIndex: 1,
  },
  status_text: { color: "white", fontWeight: "bold" },
  modal_container: {
    flex: 1, justifyContent: "center", alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal_content: {
    width: "80%", backgroundColor: "#333", borderRadius: 20,
    padding: 20, alignItems: "center", shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25,
    shadowRadius: 4, elevation: 5,
  },
  modal_title: {
    fontSize: 20, fontWeight: "bold", marginBottom: 20,
    color: "white", textAlign: "center",
  },
  emergency_option: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "red", width: "100%", padding: 15,
    borderRadius: 10, marginBottom: 10,
  },
  option_icon: { marginRight: 15 },
  option_text: { color: "white", fontSize: 18, fontWeight: "bold" },
  cancel_button: {
    marginTop: 10, padding: 15, borderRadius: 10,
    backgroundColor: "#555", width: "100%", alignItems: "center",
  },
  cancel_text: { color: "white", fontSize: 16, fontWeight: "bold" },
})