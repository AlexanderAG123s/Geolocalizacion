"use client"
import { StyleSheet, View, Pressable } from "react-native"
import MapView, { Marker, Polyline } from "react-native-maps"
import { FontAwesome } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

const MapComponent = ({
  origin,
  setOrigin,
  destination,
  setDestination,
  userLocation,
  centerOnUser,
  toggleSidebar,
}) => {
  const { theme, isDarkMode, toggleTheme } = useTheme()

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        customMapStyle={isDarkMode ? theme.mapStyle : []}
        region={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 0.09,
          longitudeDelta: 0.04,
        }}
      >
        {/* User's current location marker */}
        {userLocation && <Marker coordinate={userLocation} title="You are here" pinColor="blue" />}

        <Marker draggable coordinate={origin} onDragEnd={(direction) => setOrigin(direction.nativeEvent.coordinate)} />
        <Marker
          draggable
          coordinate={destination}
          onDragEnd={(direction) => setDestination(direction.nativeEvent.coordinate)}
        />

        <Polyline coordinates={[origin, destination]} strokeColor={isDarkMode ? "#4a90e2" : "black"} strokeWidth={8} />
      </MapView>

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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
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
    zIndex: 1,
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
    zIndex: 1,
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
    zIndex: 1,
  },
})

export default MapComponent

