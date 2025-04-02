"use client"
import { StyleSheet, Modal, View, Text, TouchableOpacity, SafeAreaView } from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

const EmergencyModal = ({ visible, setVisible, emergencyTypes, onSelectEmergency }) => {
  const { isDarkMode } = useTheme()

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={() => setVisible(false)}>
      <SafeAreaView style={styles.modal_container}>
        <View style={[styles.modal_content, { backgroundColor: isDarkMode ? "#222" : "#333" }]}>
          <Text style={styles.modal_title}>Seleccione Tipo de Emergencia</Text>

          {emergencyTypes.map((type) => (
            <TouchableOpacity key={type.id} style={styles.emergency_option} onPress={() => onSelectEmergency(type)}>
              <FontAwesome name={type.icon} size={24} color="white" style={styles.option_icon} />
              <Text style={styles.option_text}>{type.title}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.cancel_button, { backgroundColor: isDarkMode ? "#444" : "#555" }]}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.cancel_text}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
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
})

export default EmergencyModal

