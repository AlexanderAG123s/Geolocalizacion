"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather, FontAwesome } from "@expo/vector-icons"
import { useTheme } from "../contexts/theme-context"

export default function VehicleScreen({ navigation, route }) {
  const { theme } = useTheme()
  const [vehicleData, setVehicleData] = useState({
    plate: "",
    model: "",
    year: "",
    color: "",
    brand: "",
  })
  const [isFocused, setIsFocused] = useState({
    plate: false,
    model: false,
    year: false,
    color: false,
    brand: false,
  })

  // Escuchar los resultados del escaneo OCR
  useEffect(() => {
    if (route.params?.scannedText) {
      // Procesar el texto escaneado (en este caso, asumimos que es una placa)
      setVehicleData(prev => ({
        ...prev,
        plate: route.params.scannedText.trim()
      }))
      
      // Limpiar los parámetros de la ruta para evitar duplicados
      navigation.setParams({ scannedText: null })
    }
  }, [route.params?.scannedText])

  const handleSave = () => {
    // Validación básica
    if (!vehicleData.plate || !vehicleData.model || !vehicleData.year) {
      Alert.alert("Datos incompletos", "Por favor completa los campos obligatorios (placa, modelo y año).")
      return
    }

    // Aquí iría la lógica para guardar los datos
    Alert.alert("Éxito", "Datos del vehículo guardados correctamente", [
      {
        text: "OK",
        onPress: () => navigation.navigate("Alert"),
      },
    ])
  }

  const handleInputChange = (field, value) => {
    setVehicleData({
      ...vehicleData,
      [field]: value,
    })
  }

  const handleFocus = (field) => {
    setIsFocused({
      ...isFocused,
      [field]: true,
    })
  }

  const handleBlur = (field) => {
    setIsFocused({
      ...isFocused,
      [field]: false,
    })
  }

  // Función para iniciar el escaneo OCR
  const startOcrScan = () => {
    navigation.navigate("OcrScan", {
      scanType: "vehicle_plate",
      onScanComplete: (text) => {
        navigation.setParams({ scannedText: text })
      }
    })
  }

  return (
    <LinearGradient colors={theme.background} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.card }]}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>

          <View style={[styles.formContainer, { backgroundColor: theme.card }]}>
            <View style={styles.headerContainer}>
              <View style={styles.iconContainer}>
                <FontAwesome name="car" size={40} color={theme.primary} />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>Registro de Vehículo</Text>
              <Text style={[styles.subtitle, { color: theme.subtext }]}>Ingresa los datos de tu vehículo</Text>
            </View>

            <View style={styles.inputsContainer}>
              {/* Placa del vehículo con botón de escaneo */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  Placa del vehículo <Text style={{ color: theme.primary }}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: isFocused.plate ? theme.primary : theme.inputBorder,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Ej. ABC-123"
                    placeholderTextColor={theme.subtext}
                    value={vehicleData.plate}
                    onChangeText={(text) => handleInputChange("plate", text)}
                    onFocus={() => handleFocus("plate")}
                    onBlur={() => handleBlur("plate")}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity 
                    style={[styles.scanButton, { backgroundColor: theme.primary }]}
                    onPress={startOcrScan}
                  >
                    <Feather name="camera" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Modelo */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  Modelo <Text style={{ color: theme.primary }}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: isFocused.model ? theme.primary : theme.inputBorder,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Ej. Civic"
                    placeholderTextColor={theme.subtext}
                    value={vehicleData.model}
                    onChangeText={(text) => handleInputChange("model", text)}
                    onFocus={() => handleFocus("model")}
                    onBlur={() => handleBlur("model")}
                  />
                </View>
              </View>

              {/* Año */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  Año <Text style={{ color: theme.primary }}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: isFocused.year ? theme.primary : theme.inputBorder,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Ej. 2023"
                    placeholderTextColor={theme.subtext}
                    value={vehicleData.year}
                    onChangeText={(text) => handleInputChange("year", text)}
                    onFocus={() => handleFocus("year")}
                    onBlur={() => handleBlur("year")}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>

              {/* Marca */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Marca</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: isFocused.brand ? theme.primary : theme.inputBorder,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Ej. Honda"
                    placeholderTextColor={theme.subtext}
                    value={vehicleData.brand}
                    onChangeText={(text) => handleInputChange("brand", text)}
                    onFocus={() => handleFocus("brand")}
                    onBlur={() => handleBlur("brand")}
                  />
                </View>
              </View>

              {/* Color */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Color</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: isFocused.color ? theme.primary : theme.inputBorder,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Ej. Rojo"
                    placeholderTextColor={theme.subtext}
                    value={vehicleData.color}
                    onChangeText={(text) => handleInputChange("color", text)}
                    onFocus={() => handleFocus("color")}
                    onBlur={() => handleBlur("color")}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity style={[styles.saveButton, { shadowColor: theme.primary }]} onPress={handleSave}>
              <LinearGradient
                colors={[theme.primary, theme.secondary]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={[styles.requiredText, { color: theme.subtext }]}>
              <Text style={{ color: theme.primary }}>*</Text> Campos obligatorios
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  formContainer: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  inputsContainer: {
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  scanButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    height: 55,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
  },
  requiredText: {
    fontSize: 14,
    textAlign: "center",
  },
})
