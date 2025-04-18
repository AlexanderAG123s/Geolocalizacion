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
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isFocused, setIsFocused] = useState({ username: false, password: false })
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [showThemeModal, setShowThemeModal] = useState(false)

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const buttonScale = useRef(new Animated.Value(1)).current
  const modalScale = useRef(new Animated.Value(0.8)).current
  const modalOpacity = useRef(new Animated.Value(0)).current

  // Colores según el tema
  const theme = {
    primary: isDarkTheme ? "#2196F3" : "#4CAF50",
    secondary: isDarkTheme ? "#1976D2" : "#3d9140",
    background: isDarkTheme ? ["#1a1a2e", "#16213e"] : ["#f5f7fa", "#e4e8eb"],
    card: isDarkTheme ? "#0d1117" : "#FFFFFF",
    text: isDarkTheme ? "#e6e6e6" : "#333333",
    subtext: isDarkTheme ? "#a0a0a0" : "#666666",
    inputBg: isDarkTheme ? "#1f2937" : "#F5F6F8",
    inputBorder: isDarkTheme ? "#374151" : "#E8E8E8",
  }

  useEffect(() => {
    // Mostrar notificación al cargar
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

    // Animación inicial
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

  // Animación para el modal
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

  const handleLogin = () => {
    // Animación cuando se presiona el botón
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

    // Mantener la misma lógica - navega a la pantalla "Alert"
    navigation.navigate("Alert")
  }

  const selectTheme = (isDark) => {
    setIsDarkTheme(isDark)
    setShowThemeModal(false)
  }

  return (
    <LinearGradient colors={theme.background} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
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
                isFocused.username && { borderColor: theme.primary, shadowColor: theme.primary },
              ]}
            >
              <TextInput
                placeholder="Usuario"
                style={[styles.input, { color: theme.text }]}
                value={username}
                onChangeText={setUsername}
                onFocus={() => setIsFocused({ ...isFocused, username: true })}
                onBlur={() => setIsFocused({ ...isFocused, username: false })}
                placeholderTextColor={isDarkTheme ? "#6B7280" : "#9EA0A4"}
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
                placeholderTextColor={isDarkTheme ? "#6B7280" : "#9EA0A4"}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword} onPress={() => alert("Recuperar contraseña")}>
            <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { shadowColor: theme.primary }]}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <LinearGradient
                colors={[theme.primary, theme.secondary]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Entrar</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

        <View style={styles.footer}>
  <Text style={[styles.footerText, { color: theme.subtext }]}>¿No tienes cuenta?</Text>
  <TouchableOpacity onPress={() => navigation.navigate("Register")}>
    <Text style={[styles.registerText, { color: theme.primary }]}>Regístrate</Text>
  </TouchableOpacity>
</View>


          <TouchableOpacity
            style={[styles.themeToggle, { backgroundColor: theme.primary }]}
            onPress={() => setShowThemeModal(true)}
          >
            <Text style={styles.themeToggleText}>{isDarkTheme ? "🌙" : "☀️"}</Text>
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
                style={[styles.themeOption, !isDarkTheme && styles.themeOptionSelected]}
                onPress={() => selectTheme(false)}
              >
                <LinearGradient colors={["#f5f7fa", "#e4e8eb"]} style={styles.themePreview}>
                  <View style={[styles.themePreviewButton, { backgroundColor: "#4CAF50" }]} />
                </LinearGradient>
                <Text style={styles.themeOptionText}>Claro (Verde)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.themeOption, isDarkTheme && styles.themeOptionSelected]}
                onPress={() => selectTheme(true)}
              >
                <LinearGradient colors={["#1a1a2e", "#16213e"]} style={styles.themePreview}>
                  <View style={[styles.themePreviewButton, { backgroundColor: "#2196F3" }]} />
                </LinearGradient>
                <Text style={styles.themeOptionText}>Oscuro (Azul)</Text>
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
    marginBottom: 25,
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
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 25,
  },
  themeOption: {
    alignItems: "center",
    width: "45%",
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  themeOptionSelected: {
    borderColor: "#666",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  themePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  themePreviewButton: {
    width: 50,
    height: 20,
    borderRadius: 5,
  },
  themeOptionText: {
    fontSize: 14,
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
