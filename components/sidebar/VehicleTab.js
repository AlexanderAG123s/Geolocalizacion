"use client"
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useTheme } from "../../context/ThemeContext"

const VehicleTab = ({ vehicleInfo, setVehicleInfo }) => {
  const { theme, isDarkMode } = useTheme()

  // Handle vehicle info changes
  const handleVehicleInfoChange = (field, value) => {
    setVehicleInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

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
})

export default VehicleTab

