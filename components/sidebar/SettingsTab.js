"use client"
import { StyleSheet, View, Text, TouchableOpacity } from "react-native"
import { useTheme } from "../../context/ThemeContext"

const SettingsTab = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme()

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
}

const styles = StyleSheet.create({
  sidebar_tab_content: {
    padding: 20,
    flex: 1,
  },
  sidebar_section_title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
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
})

export default SettingsTab

