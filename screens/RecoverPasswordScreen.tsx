import { useState, useRef, useEffect } from "react"
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
  Alert,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "../contexts/theme-context"

export default function RecoverPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("")
  // Cambiamos isFocused a un objeto para manejar múltiples campos
  const [isFocused, setIsFocused] = useState({
    email: false,
    newPassword: false,
    confirmPassword: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const { theme } = useTheme()

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

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

  const handleRecoverPassword = async () => {
    if (!email) {
      Alert.alert("Campo vacío", "Por favor ingresa tu correo electrónico.")
      return
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert("Email inválido", "Por favor ingresa un correo electrónico válido.")
      return
    }

    setIsLoading(true)

    try {
      // Aquí iría tu lógica para recuperar la contraseña
      // Por ahora, simulamos un proceso de recuperación
      setTimeout(() => {
        Alert.alert(
          "Correo enviado",
          "Se ha enviado un enlace de recuperación a tu correo electrónico.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        )
        setIsLoading(false)
      }, 2000)
    } catch (error) {
      console.error("Error:", error)
      Alert.alert("Error", "No se pudo procesar tu solicitud. Inténtalo de nuevo más tarde.")
      setIsLoading(false)
    }
  }

  // Función para manejar el focus de los inputs
  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }))
  }

  // Función para manejar el blur de los inputs
  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }))
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={[styles.backButtonText, { color: theme.primary }]}>← Volver</Text>
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.text }]}>Recuperar contraseña</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
          </Text>

          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                },
                isFocused.email && { borderColor: theme.primary, shadowColor: theme.primary },
              ]}
            >
              <TextInput
                placeholder="Email"
                style={[styles.input, { color: theme.text }]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => handleFocus('email')}
                onBlur={() => handleBlur('email')}
                placeholderTextColor={theme.name === "dark" ? "#6B7280" : "#9EA0A4"}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="send"
                enablesReturnKeyAutomatically
                onSubmitEditing={handleRecoverPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, { shadowColor: theme.primary }]}
            onPress={handleRecoverPassword}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[theme.primary, theme.secondary]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Enviar enlace</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 25,
  },
  inputWrapper: {
    borderRadius: 12,
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
  button: {
    width: "100%",
    height: 55,
    borderRadius: 12,
    overflow: "hidden",
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
})