"use client"

import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, ScrollView, Modal, ActivityIndicator } from "react-native"
import { Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons"
import { useTheme } from "../contexts/theme-context"

interface SidebarProps {
  isVisible: boolean
  onClose: () => void
  onLogout: () => void
  navigation?: any
  userEmail: string | null
  userName: string | null
  apiUrl: string
}

const ElSidebar = ({
  isVisible,
  onClose,
  onLogout,
  navigation,
  userEmail,
  userName,
  apiUrl,
}: SidebarProps) => {
  const { theme, changeTheme } = useTheme()

  // State for user data
  const [userData, setUserData] = useState({
    userPhoto: null,
    userName: userName || "Cargando...",
    userEmail: userEmail || "Cargando..."
  })
  
  // State for loading and error
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Animation for sidebar
  const sidebarWidth = 280
  const [animation] = React.useState(new Animated.Value(isVisible ? 0 : -sidebarWidth))
  const [activeTab, setActiveTab] = React.useState("profile")
  const [showThemeModal, setShowThemeModal] = React.useState(false)

  // Fetch user data from PHP API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        // Using the user's email to fetch data
        const response = await fetch(`${apiUrl}/user/get_user.php?correo=${encodeURIComponent(userEmail)}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.success) {
          setUserData({
            userPhoto: result.data.avatar || result.data.foto_perfil, // Try both field names
            userName: result.data.nombre_completo || userName || "Usuario",
            userEmail: result.data.correo || userEmail
          })
        } else {
          setError(result.message || "Error fetching user data")
          console.error('API Error:', result.message)
        }
      } catch (error) {
        setError("Failed to fetch user data")
        console.error('Fetch Error:', error)
        
        // Use the data we already have from AsyncStorage as fallback
        setUserData({
          userPhoto: null,
          userName: userName || "Usuario",
          userEmail: userEmail || ""
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (userEmail) {
      fetchUserData()
    }
  }, [userEmail, apiUrl, userName])

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: isVisible ? 0 : -sidebarWidth,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [isVisible])

  const handleNavigate = (screen) => {
    onClose()
    navigation.navigate(screen)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ScrollView style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Información Personal</Text>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.subtext }]}>Cargando información...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={24} color="#d9534f" />
                <Text style={styles.errorText}>No se pudo cargar la información</Text>
                <TouchableOpacity 
                  style={[styles.retryButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setIsLoading(true)
                    setError(null)
                    // Trigger re-fetch by changing state
                    setUserData({...userData})
                  }}
                >
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={[styles.infoItem, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.infoLabel, { color: theme.subtext }]}>Nombre</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{userData.userName}</Text>
                </View>

                <View style={[styles.infoItem, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.infoLabel, { color: theme.subtext }]}>Email</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{userData.userEmail}</Text>
                </View>

                <View style={[styles.infoItem, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.infoLabel, { color: theme.subtext }]}>Teléfono</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>+52 55 1234 5678</Text>
                </View>

                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: theme.primary }]}
                  onPress={() => console.log("Edit profile")}
                >
                  <Feather name="edit-2" size={16} color="white" />
                  <Text style={styles.editButtonText}>Editar Perfil</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        )

      case "options":
        return (
          <ScrollView style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Configuración</Text>

            <TouchableOpacity
              style={[styles.optionItem, { backgroundColor: theme.itemBg, borderColor: theme.border }]}
              onPress={() => console.log("Notifications")}
            >
              <Feather name="bell" size={20} color={theme.primary} />
              <Text style={[styles.optionText, { color: theme.text }]}>Notificaciones</Text>
              <Feather name="chevron-right" size={20} color={theme.subtext} style={styles.optionArrow} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, { backgroundColor: theme.itemBg, borderColor: theme.border }]}
              onPress={() => console.log("Privacy")}
            >
              <Feather name="lock" size={20} color={theme.primary} />
              <Text style={[styles.optionText, { color: theme.text }]}>Privacidad</Text>
              <Feather name="chevron-right" size={20} color={theme.subtext} style={styles.optionArrow} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, { backgroundColor: theme.itemBg, borderColor: theme.border }]}
              onPress={() => console.log("Location")}
            >
              <Feather name="map-pin" size={20} color={theme.primary} />
              <Text style={[styles.optionText, { color: theme.text }]}>Ubicación</Text>
              <Feather name="chevron-right" size={20} color={theme.subtext} style={styles.optionArrow} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, { backgroundColor: theme.itemBg, borderColor: theme.border }]}
              onPress={() => setShowThemeModal(true)}
            >
              <Feather
                name={theme.name === "dark" ? "moon" : theme.name === "darkOrange" ? "sun" : "sun"}
                size={20}
                color={theme.primary}
              />
              <Text style={[styles.optionText, { color: theme.text }]}>Tema</Text>
              <Feather name="chevron-right" size={20} color={theme.subtext} style={styles.optionArrow} />
            </TouchableOpacity>

            {/* Nuevas opciones para vehículo y vivienda */}
            <TouchableOpacity
              style={[styles.optionItem, { backgroundColor: theme.itemBg, borderColor: theme.border }]}
              onPress={() => handleNavigate("Vehicle")}
            >
              <FontAwesome name="car" size={20} color={theme.primary} />
              <Text style={[styles.optionText, { color: theme.text }]}>Mi Vehículo</Text>
              <Feather name="chevron-right" size={20} color={theme.subtext} style={styles.optionArrow} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, { backgroundColor: theme.itemBg, borderColor: theme.border }]}
              onPress={() => handleNavigate("Housing")}
            >
              <FontAwesome5 name="home" size={20} color={theme.primary} />
              <Text style={[styles.optionText, { color: theme.text }]}>Mi Vivienda</Text>
              <Feather name="chevron-right" size={20} color={theme.subtext} style={styles.optionArrow} />
            </TouchableOpacity>
          </ScrollView>
        )

      case "logout":
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Cerrar Sesión</Text>
            <Text style={[styles.logoutText, { color: theme.subtext }]}>¿Estás seguro que deseas cerrar sesión?</Text>

            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: "#d9534f" }]} onPress={onLogout}>
              <Feather name="log-out" size={18} color="white" />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={() => setActiveTab("profile")}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.background[0],
          borderRightColor: theme.border,
          transform: [{ translateX: animation }],
          width: sidebarWidth,
        },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Feather name="x" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.userSection}>
        <View style={[styles.photoContainer, { borderColor: theme.primary }]}>
          {isLoading ? (
            <View style={[styles.userPhoto, { backgroundColor: theme.border, justifyContent: 'center', alignItems: 'center' }]}>
              <Feather name="user" size={40} color={theme.subtext} />
            </View>
          ) : (
            <Image
              source={userData.userPhoto ? { uri: `http://192.168.0.14/GEOLOCALIZACION/Geolocalizacion-waos/backend/api/auth/uploads/${userData.userPhoto}` } : require("../assets/geolocalizacion.jpg")}
              style={styles.userPhoto}
              resizeMode="cover"
            />
          )}
        </View>
        <Text style={[styles.userName, { color: theme.text }]}>{userData.userName}</Text>
        <Text style={[styles.userEmail, { color: theme.subtext }]}>{userData.userEmail}</Text>
      </View>

      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "profile" && [styles.activeTab, { borderBottomColor: theme.primary }]]}
          onPress={() => setActiveTab("profile")}
        >
          <Feather name="user" size={20} color={activeTab === "profile" ? theme.primary : theme.subtext} />
          <Text style={[styles.tabText, { color: activeTab === "profile" ? theme.primary : theme.subtext }]}>
            Perfil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "options" && [styles.activeTab, { borderBottomColor: theme.primary }]]}
          onPress={() => setActiveTab("options")}
        >
          <Feather name="settings" size={20} color={activeTab === "options" ? theme.primary : theme.subtext} />
          <Text style={[styles.tabText, { color: activeTab === "options" ? theme.primary : theme.subtext }]}>
            Opciones
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "logout" && [styles.activeTab, { borderBottomColor: theme.primary }]]}
          onPress={() => setActiveTab("logout")}
        >
          <Feather name="log-out" size={20} color={activeTab === "logout" ? theme.primary : theme.subtext} />
          <Text style={[styles.tabText, { color: activeTab === "logout" ? theme.primary : theme.subtext }]}>Salir</Text>
        </TouchableOpacity>
      </View>

      {renderTabContent()}

      {/* Modal de selección de tema */}
      <Modal visible={showThemeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Selecciona un tema</Text>

            <TouchableOpacity
              style={[
                styles.themeOption,
                { borderColor: theme.border },
                theme.name === "light" && { backgroundColor: "rgba(76, 175, 80, 0.1)" },
              ]}
              onPress={() => {
                changeTheme("light")
                setShowThemeModal(false)
              }}
            >
              <View style={[styles.themeColorPreview, { backgroundColor: "#4CAF50" }]} />
              <Text style={[styles.themeOptionText, { color: theme.text }]}>Claro (Verde)</Text>
              {theme.name === "light" && (
                <Feather name="check" size={20} color={theme.primary} style={styles.themeCheckIcon} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                { borderColor: theme.border },
                theme.name === "dark" && { backgroundColor: "rgba(33, 150, 243, 0.1)" },
              ]}
              onPress={() => {
                changeTheme("dark")
                setShowThemeModal(false)
              }}
            >
              <View style={[styles.themeColorPreview, { backgroundColor: "#2196F3" }]} />
              <Text style={[styles.themeOptionText, { color: theme.text }]}>Oscuro (Azul)</Text>
              {theme.name === "dark" && (
                <Feather name="check" size={20} color={theme.primary} style={styles.themeCheckIcon} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                { borderColor: theme.border },
                theme.name === "darkOrange" && { backgroundColor: "rgba(255, 87, 34, 0.1)" },
              ]}
              onPress={() => {
                changeTheme("darkOrange")
                setShowThemeModal(false)
              }}
            >
              <View style={[styles.themeColorPreview, { backgroundColor: "#FF5722" }]} />
              <Text style={[styles.themeOptionText, { color: theme.text }]}>Negro (Naranja)</Text>
              {theme.name === "darkOrange" && (
                <Feather name="check" size={20} color={theme.primary} style={styles.themeCheckIcon} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeModalButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 10,
    borderRightWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
  },
  closeButton: {
    padding: 4,
  },
  userSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  userPhoto: {
    width: "100%",
    height: "100%",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginTop: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  infoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  optionArrow: {
    marginLeft: "auto",
  },
  logoutText: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  cancelButton: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    maxWidth: 300,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  themeColorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  themeOptionText: {
    fontSize: 16,
    flex: 1,
  },
  themeCheckIcon: {
    marginLeft: "auto",
  },
  closeModalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  closeModalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  // New styles for loading and error states
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 10,
    marginBottom: 15,
    fontSize: 14,
    color: "#d9534f",
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "500",
  },
})

export default ElSidebar