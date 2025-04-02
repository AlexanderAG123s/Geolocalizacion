"use client"
import { StyleSheet, View, Text, TouchableOpacity } from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"

const ContactsTab = () => {
  const { theme, isDarkMode } = useTheme()

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
  sidebar_text: {
    marginBottom: 15,
    color: "#666",
  },
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
})

export default ContactsTab

