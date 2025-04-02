"use client"

import { useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Animated } from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import VehicleTab from "./sidebar/VehicleTab"
import SettingsTab from "./sidebar/SettingsTab"
import ContactsTab from "./sidebar/ContactsTab"

const SidebarComponent = ({ sidebarLeft, toggleSidebar, vehicleInfo, setVehicleInfo }) => {
  const [activeTab, setActiveTab] = useState("settings")
  const { theme, isDarkMode } = useTheme()

  // Render the sidebar content based on active tab
  const renderSidebarContent = () => {
    switch (activeTab) {
      case "vehicle":
        return <VehicleTab vehicleInfo={vehicleInfo} setVehicleInfo={setVehicleInfo} />
      case "settings":
        return <SettingsTab />
      case "contacts":
        return <ContactsTab />
      default:
        return null
    }
  }

  return (
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
  )
}

const styles = StyleSheet.create({
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
})

export default SidebarComponent

