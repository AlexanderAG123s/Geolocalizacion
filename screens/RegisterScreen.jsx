"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  Alert,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    gender: "",
    street: "",
    number: "",
    suburb: "",
    municipality: "",
    state: "",
    postalCode: "",
    curp: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({})
  const [isDarkTheme, setIsDarkTheme] = useState(false)

  // Refs para inputs
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const confirmPasswordRef = useRef(null)

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const buttonScale = useRef(new Animated.Value(1)).current

  const theme = {
    primary: isDarkTheme ? "#2196F3" : "#4CAF50",
    secondary: isDarkTheme ? "#1976D2" : "#3d9140",
    background: isDarkTheme ? ["#1a1a2e", "#16213e"] : ["#f5f7fa", "#e4e8eb"],
    card: isDarkTheme ? "#0d1117" : "#FFFFFF",
    text: isDarkTheme ? "#e6e6e6" : "#333333",
    subtext: isDarkTheme ? "#a0a0a0" : "#666666",
    inputBg: isDarkTheme ? "#1f2937" : "#F5F6F8",
    inputBorder: isDarkTheme ? "#374151" : "#E8E8E8",
    error: "#ff4d4f",
  }

  useEffect(() => {
    Animated.parallel([ 
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    })

    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio"
    if (!formData.birthDate.trim()) newErrors.birthDate = "La fecha de nacimiento es obligatoria"
    if (!formData.gender.trim()) newErrors.gender = "El sexo es obligatorio"
    if (!formData.street.trim()) newErrors.street = "La calle es obligatoria"
    if (!formData.number.trim()) newErrors.number = "El número es obligatorio"
    if (!formData.suburb.trim()) newErrors.suburb = "La colonia es obligatoria"
    if (!formData.municipality.trim()) newErrors.municipality = "El municipio es obligatorio"
    if (!formData.state.trim()) newErrors.state = "El estado es obligatorio"
    if (!formData.postalCode.trim()) newErrors.postalCode = "El código postal es obligatorio"
    if (!formData.curp.trim()) newErrors.curp = "El CURP es obligatorio"
    if (!formData.email.trim()) newErrors.email = "El correo electrónico es obligatorio"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Correo electrónico inválido"
    if (!formData.password) newErrors.password = "La contraseña es obligatoria"
    else if (formData.password.length < 6) newErrors.password = "Mínimo 6 caracteres"
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = () => {
    Animated.sequence([ 
      Animated.spring(buttonScale, {
        toValue: 0.95,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start()

    if (validateForm()) {
      Alert.alert("Registro exitoso", "Tu cuenta ha sido creada correctamente", [
        {
          text: "Iniciar sesión",
          onPress: () => navigation.navigate("Login"),
        },
      ])
    }
  }

  const renderInput = (label, field, keyboardType = "default") => (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.label, { color: theme.subtext }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: theme.inputBg, borderColor: errors[field] ? theme.error : theme.inputBorder },
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={formData[field]}
          onChangeText={(text) => handleInputChange(field, text)}
          placeholder={label}
          placeholderTextColor={isDarkTheme ? "#6B7280" : "#9EA0A4"}
          keyboardType={keyboardType}
        />
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  )

  return (
    <LinearGradient colors={theme.background} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.formContainer,
              { backgroundColor: theme.card, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={{ alignItems: "center", marginBottom: 30 }}>
              <TouchableOpacity
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: theme.inputBg,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: theme.primary,
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 5,
                }}
                onPress={() => Alert.alert("Escanear INE", "Aquí irá la funcionalidad OCR")}
              >
                <Feather name="camera" size={40} color={theme.primary} />
              </TouchableOpacity>
              <Text style={{ color: theme.subtext, fontSize: 14, marginTop: 8 }}>Escanear INE</Text>
            </View>

            <Text style={[styles.title, { color: theme.text }]}>Datos Personales</Text>

            {renderInput("Nombre completo", "name")}
            {renderInput("Fecha de nacimiento (DD/MM/AAAA)", "birthDate")}
            {renderInput("Sexo", "gender")}
            {renderInput("Calle", "street")}
            {renderInput("Número", "number", "numeric")}
            {renderInput("Colonia", "suburb")}
            {renderInput("Municipio", "municipality")}
            {renderInput("Estado", "state")}
            {renderInput("Código Postal", "postalCode", "numeric")}
            {renderInput("CURP", "curp")}

            <Text style={[styles.title, { color: theme.text, marginTop: 30 }]}>Datos de Cuenta</Text>

            {renderInput("Correo electrónico", "email", "email-address")}
            {renderInput("Contraseña", "password")}
            {renderInput("Confirmar contraseña", "confirmPassword")}

            <TouchableOpacity style={[styles.button, { shadowColor: theme.primary }]} onPress={handleRegister} activeOpacity={0.8}>
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <LinearGradient
                  colors={[theme.primary, theme.secondary]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>Registrarse</Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.subtext }]}>¿Ya tienes una cuenta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.loginText, { color: theme.primary }]}> Inicia sesión</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.themeToggle, { backgroundColor: theme.primary }]}
              onPress={() => setIsDarkTheme(!isDarkTheme)}
            >
              <Text style={styles.themeToggleText}>{isDarkTheme ? "🌙" : "☀️"}</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoid: {
    flex: 1,
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  formContainer: {
    width: width > 500 ? 450 : width * 0.9,
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    position: "relative",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  inputWrapper: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  input: {
    fontSize: 16,
    padding: 8,
    borderRadius: 5,
  },
  errorText: {
    fontSize: 12,
    color: "#ff4d4f",
    marginTop: 5,
  },
  button: {
    marginTop: 30,
    borderRadius: 10,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 14,
  },
  loginText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  themeToggle: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  themeToggleText: {
    fontSize: 20,
  },
})
