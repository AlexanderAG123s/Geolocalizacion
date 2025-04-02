"use client"

import { useState, useRef, useEffect } from "react"
import * as Location from "expo-location"
import { Alert } from "react-native"

export const useLocationTracking = (setOrigin) => {
  const [userLocation, setUserLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const [emergencyType, setEmergencyType] = useState("")

  // Use a ref to store the location subscription
  const locationSubscription = useRef(null)

  // Request location permissions on mount
  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied")
        Alert.alert("Permission Denied", "Location permission is required for this feature.")
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
        Alert.alert("Location Error", "Could not get your current location.")
      }
    })()

    // Clean up any subscription when component unmounts
    return () => {
      stopLocationTracking()
    }
  }, [setOrigin])

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

      // Show alert to confirm tracking started
      Alert.alert(
        "Emergencia Reportada",
        `Se ha reportado: ${type}. Servicios de emergencia serán notificados de su ubicación cada 1 segundo.`,
        [{ text: "OK" }],
      )
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
      Alert.alert("Location Error", "Could not update your current location.")
    }
  }

  return {
    userLocation,
    isTracking,
    emergencyType,
    startLocationTracking,
    stopLocationTracking,
    centerOnUser,
  }
}

