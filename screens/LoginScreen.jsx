"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "../contexts/theme-context"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isFocused, setIsFocused] = useState({ email: false, password: false })
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { theme, changeTheme } = useTheme()

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const buttonScale = useRef(new Animated.Value(1)).current
  const modalScale = useRef(new Animated.Value(0.8)).current
  const modalOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    setTimeout(() => {
      Alert.alert(
        "Bienvenido",
        "Selecciona tu tema preferido para continuar",
        [
          {
            text: "Elegir tema",
            onPress: () => setShowThemeModal(true),
          },
        ],
        { cancelable: false },
      )
    }, 500)

    setTimeout(() => {
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
    }, 300)
  }, [])

  useEffect(() => {
    if (showThemeModal) {
      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 0.8,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [showThemeModal])

  // Función para manejar el login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos vacíos", "Por favor completa todos los campos.")
      return
    }

    setIsLoading(true)

    try {
      console.log(
        "Intentando conectar a:",
        "http://192.168.0.14/GEOLOCALIZACION/Geolocalizacion-waos/backend/api/auth/login.php",
      )

      const response = await fetch(
        "http://192.168.0.14/GEOLOCALIZACION/Geolocalizacion-waos/backend/api/auth/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json", // Solicitar explícitamente JSON
          },
          body: JSON.stringify({
            correo: email,
            contrasena: password,
          }),
        },
      )

      // Obtener la respuesta como texto primero
      const responseText = await response.text()

      // Log the first part of the response to see what's coming back
      console.log("Respuesta del servidor (primeros 150 caracteres):", responseText.substring(0, 150))

      // Verificar si la respuesta es HTML (contiene etiquetas HTML)
      if (responseText.includes("<html") || responseText.includes("<!DOCTYPE") || responseText.trim().startsWith("<")) {
        console.error("ERROR: El servidor devolvió HTML en lugar de JSON")
        Alert.alert("Error de servidor", "El servidor no está configurado correctamente. Contacte al administrador.")
        return
      }

      // Intentar parsear el JSON
      let data
      try {
        data = JSON.parse(responseText)
        console.log("Datos JSON parseados:", data)
      } catch (parseError) {
        console.error("Error al parsear JSON:", parseError)
        console.error("Contenido recibido:", responseText)
        Alert.alert("Error de formato", "La respuesta del servidor no tiene el formato JSON esperado.")
        return
      }

      // Ahora manejar la respuesta parseada correctamente
      if (response.ok && data.success) {
        console.log("Conexión exitosa con la base de datos")
        
        // IMPORTANTE: Guardar el correo y nombre del usuario en AsyncStorage
        await AsyncStorage.setItem('userEmail', data.user.correo)
        await AsyncStorage.setItem('userName', data.user.nombre_completo)
        
        console.log("Datos guardados en AsyncStorage:", {
          email: data.user.correo,
          name: data.user.nombre_completo
        })
        
        navigation.navigate("Alert")
      } else {
        Alert.alert("Error", data.message || "Credenciales incorrectas")
      }
    } catch (error) {
      console.error("Login error:", error)
      Alert.alert(
        "Error de conexión",
        "No se pudo conectar al servidor. Verifique su conexión a internet y que el servidor esté en línea.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Referencia para los inputs
  const passwordInputRef = useRef(null)

  // Función para manejar el envío desde el teclado
  const handleSubmitEditing = (inputName) => {
    if (inputName === "email" && passwordInputRef.current) {
      passwordInputRef.current.focus()
    }
    if (inputName === "password") {
      handleLogin()
    }
  }

  const selectTheme = (themeName) => {
    changeTheme(themeName)
    setShowThemeModal(false)
  }

  return (
    <LinearGradient colors={theme.background} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        enabled
      >
        <Animated.View
          style={[
            styles.formContainer,
            {
              backgroundColor: theme.card,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/geolocalizacion.jpg")} // Ruta de la imagen
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>Bienvenido</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>Inicia sesión para continuar</Text>

          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                },
                isFocused.email && { borderColor: theme.primary, shadowColor: theme.primary }, // Actualizado aquí
              ]}
            >
              <TextInput
                placeholder="Email"
                style={[styles.input, { color: theme.text }]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setIsFocused({ ...isFocused, email: true })}
                onBlur={() => setIsFocused({ ...isFocused, email: false })}
                placeholderTextColor={theme.name === "dark" ? "#6B7280" : "#9EA0A4"}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
                blurOnSubmit={false}
                returnKeyType="next"
                enablesReturnKeyAutomatically
                onSubmitEditing={() => handleSubmitEditing("email")}
              />
            </View>

            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                },
                isFocused.password && { borderColor: theme.primary, shadowColor: theme.primary },
              ]}
            >
              <TextInput
                placeholder="Contraseña"
                style={[styles.input, { color: theme.text }]}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => setIsFocused({ ...isFocused, password: true })}
                onBlur={() => setIsFocused({ ...isFocused, password: false })}
                placeholderTextColor={theme.name === "dark" ? "#6B7280" : "#9EA0A4"}
                editable={!isLoading}
                blurOnSubmit={true}
                returnKeyType="done"
                enablesReturnKeyAutomatically
                ref={passwordInputRef}
                onSubmitEditing={() => handleSubmitEditing("password")}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate("RecoverPasswordScreen")}
            disabled={isLoading}
          >
            <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { shadowColor: theme.primary }]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <LinearGradient
                colors={[theme.primary, theme.secondary]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.subtext }]}>¿No tienes cuenta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")} disabled={isLoading}>
              <Text style={[styles.registerText, { color: theme.primary }]}>Regístrate</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.themeToggle, { backgroundColor: theme.primary }]}
            onPress={() => setShowThemeModal(true)}
            disabled={isLoading}
          >
            <Text style={styles.themeToggleText}>
              {theme.name === "dark" ? "🌙" : theme.name === "darkOrange" ? "🔶" : "☀️"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Modal de selección de tema */}
      <Modal visible={showThemeModal} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: modalOpacity,
                transform: [{ scale: modalScale }],
              },
            ]}
          >
            <Text style={styles.modalTitle}>Selecciona un tema</Text>

            <View style={styles.themeOptions}>
              <TouchableOpacity
                style={[styles.themeOption, theme.name === "light" && styles.themeOptionSelected]}
                onPress={() => selectTheme("light")}
              >
                <LinearGradient colors={["#f5f7fa", "#e4e8eb"]} style={styles.themePreview}>
                  <View style={[styles.themePreviewButton, { backgroundColor: "#4CAF50" }]} />
                </LinearGradient>
                <Text style={styles.themeOptionText}>Claro (Verde)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.themeOption, theme.name === "dark" && styles.themeOptionSelected]}
                onPress={() => selectTheme("dark")}
              >
                <LinearGradient colors={["#1a1a2e", "#16213e"]} style={styles.themePreview}>
                  <View style={[styles.themePreviewButton, { backgroundColor: "#2196F3" }]} />
                </LinearGradient>
                <Text style={styles.themeOptionText}>Oscuro (Azul)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.themeOption, theme.name === "darkOrange" && styles.themeOptionSelected]}
                onPress={() => selectTheme("darkOrange")}
              >
                <LinearGradient colors={["#121212", "#1e1e1e"]} style={styles.themePreview}>
                  <View style={[styles.themePreviewButton, { backgroundColor: "#FF5722" }]} />
                </LinearGradient>
                <Text style={styles.themeOptionText}>Negro (Naranja)</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => setShowThemeModal(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: width > 500 ? 450 : width * 0.9,
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    position: "relative",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  inputWrapper: {
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    width: "100%",
    padding: 16,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  button: {
    width: "100%",
    height: 55,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 15,
  },
  registerText: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 5,
  },
  themeToggle: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  themeToggleText: {
    fontSize: 18,
    color: "#FFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  themeOptions: {
    flexDirection: "column",
    justifyContent: "space-around",
    marginBottom: 25,
    gap: 15,
  },
  themeOption: {
    alignItems: "center",
    width: "100%",
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
    flexDirection: "row",
  },
  themeOptionSelected: {
    borderColor: "#666",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  themePreview: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  themePreviewButton: {
    width: 30,
    height: 15,
    borderRadius: 5,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  closeButton: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
})