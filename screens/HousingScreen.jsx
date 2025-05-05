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
import { Feather, FontAwesome5 } from "@expo/vector-icons"
import { useTheme } from "../contexts/theme-context"

export default function HousingScreen({ navigation, route }) {
  const { theme } = useTheme()
  const [housingData, setHousingData] = useState({
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    reference: "",
  })
  const [isFocused, setIsFocused] = useState({
    street: false,
    number: false,
    neighborhood: false,
    city: false,
    state: false,
    zipCode: false,
    reference: false,
  })

  // Escuchar los resultados del escaneo OCR
  useEffect(() => {
    if (route.params?.scannedText) {
      // Procesar el texto escaneado (comprobante de domicilio)
      try {
        const text = route.params.scannedText;
        const lines = text.split('\n');
        
        // Intentar extraer información de dirección del texto escaneado
        // Este es un ejemplo simple, en una app real se usaría un algoritmo más sofisticado
        if (lines.length >= 3) {
          setHousingData(prev => ({
            ...prev,
            street: lines[0] || prev.street,
            neighborhood: lines[1] || prev.neighborhood,
            city: lines[2].split(',')[0] || prev.city,
            zipCode: lines[2].includes('CP') ? lines[2].split('CP')[1].trim() : prev.zipCode
          }));
        }
      } catch (error) {
        console.error("Error al procesar el texto escaneado:", error);
      }
      
      // Limpiar los parámetros de la ruta para evitar duplicados
      navigation.setParams({ scannedText: null });
    }
  }, [route.params?.scannedText]);

  const handleSave = () => {
    // Validación básica
    if (!housingData.street || !housingData.number || !housingData.city) {
      Alert.alert("Datos incompletos", "Por favor completa los campos obligatorios (calle, número y ciudad).")
      return
    }

    // Aquí iría la lógica para guardar los datos
    Alert.alert("Éxito", "Datos de vivienda guardados correctamente", [
      {
        text: "OK",
        onPress: () => navigation.navigate("Alert"),
      },
    ])
  }

  const handleInputChange = (field, value) => {
    setHousingData({
      ...housingData,
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
      scanType: "address_document",
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
                <FontAwesome5 name="home" size={40} color={theme.primary} />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>Registro de Vivienda</Text>
              <Text style={[styles.subtitle, { color: theme.subtext }]}>Ingresa los datos de tu domicilio</Text>
            </View>

            {/* Botón para escanear comprobante de domicilio */}
            <TouchableOpacity
              style={[styles.scanDocumentButton, { backgroundColor: theme.primary }]}
              onPress={startOcrScan}
            >
              <Feather name="camera" size={20} color="white" style={styles.scanIcon} />
              <Text style={styles.scanButtonText}>Escanear Comprobante de Domicilio</Text>
            </TouchableOpacity>

            <View style={styles.inputsContainer}>
              {/* Calle */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  Calle <Text style={{ color: theme.primary }}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: isFocused.street ? theme.primary : theme.inputBorder,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Ej. Av. Insurgentes"
                    placeholderTextColor={theme.subtext}
                    value={housingData.street}
                    onChangeText={(text) => handleInputChange("street", text)}
                    onFocus={() => handleFocus("street")}
                    onBlur={() => handleBlur("street")}
                  />
                </View>
              </View>

              {/* Número */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  Número <Text style={{ color: theme.primary }}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: isFocused.number ? theme.primary : theme.inputBorder,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Ej. 123"
                    placeholderTextColor={theme.subtext}
                    value={housingData.number}
                    onChangeText={(text) => handleInputChange("number", text)}
                    onFocus={() => handleFocus("number")}
                    onBlur={() => handleBlur("number")}
                  />
                </View>
              </View>

              {/* Colonia */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Colonia</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: isFocused.neighborhood ? theme.primary : theme.inputBorder,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Ej. Del Valle"
                    placeholderTextColor={theme.subtext}
                    value={housingData.neighborhood}
                    onChangeText={(text) => handleInputChange("neighborhood", text)}
                    onFocus={() => handleFocus("neighborhood")}
                    onBlur={() => handleBlur("neighborhood")}
                  />
                </View>
              </View>

              {/* Ciudad */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  Ciudad <Text style={{ color: theme.primary }}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: isFocused.city ? theme.primary : theme.inputBorder,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Ej. Ciudad de México"
                    placeholderTextColor={theme.subtext}
                    value={housingData.city}
                    onChangeText={(text) => handleInputChange("city", text)}
                    onFocus={() => handleFocus("city")}
                    onBlur={() => handleBlur("city")}
                  />
                </View>
              </View>

              {/* Estado */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Estado</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: isFocused.state ? theme.primary : theme.inputBorder,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Ej. CDMX"
                    placeholderTextColor={theme.subtext}
                    value={housingData.state}
                    onChangeText={(text) => handleInputChange("state", text)}
                    onFocus={() => handleFocus("state")}
                    onBlur={() => handleBlur("state")}
                  />
                </View>
              </View>

              {/* Código Postal */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Código Postal</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: isFocused.zipCode ? theme.primary : theme.inputBorder,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Ej. 03100"
                    placeholderTextColor={theme.subtext}
                    value={housingData.zipCode}
                    onChangeText={(text) => handleInputChange("zipCode", text)}
                    onFocus={() => handleFocus("zipCode")}
                    onBlur={() => handleBlur("zipCode")}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              {/* Referencias */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Referencias</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: isFocused.reference ? theme.primary : theme.inputBorder,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.text, height: 100 }]}
                    placeholder="Ej. Casa blanca con portón negro, frente a la farmacia"
                    placeholderTextColor={theme.subtext}
                    value={housingData.reference}
                    onChangeText={(text) => handleInputChange("reference", text)}
                    onFocus={() => handleFocus("reference")}
                    onBlur={() => handleBlur("reference")}
                    multiline={true}
                    textAlignVertical="top"
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
    marginBottom: 20,
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
  scanDocumentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  scanIcon: {
    marginRight: 10,
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
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
  },
  input: {
    width: "100%",
    padding: 15,
    fontSize: 16,
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
