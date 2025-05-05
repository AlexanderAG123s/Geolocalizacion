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
  Image,
  ActivityIndicator,
  Modal,
  StatusBar,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { BlurView } from "expo-blur"

const FormInput = ({
  label,
  field,
  value,
  onChange,
  error,
  keyboardType = "default",
  theme,
  secureTextEntry = false,
}) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={[styles.label, { color: theme.subtext }]}>{label}</Text>
    <View
      style={[
        styles.inputWrapper,
        {
          backgroundColor: theme.inputBg,
          borderColor: error ? theme.error : theme.inputBorder,
        },
      ]}
    >
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value}
        onChangeText={(text) => onChange(field, text)}
        placeholder={label}
        placeholderTextColor={theme.name === "dark" ? "#6B7280" : "#9EA0A4"}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
)

// Componente para el botón de acción
const ActionButton = ({ onPress, text, isLoading = false, theme, style = {} }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress} disabled={isLoading}>
    <LinearGradient
      colors={[theme.primary, theme.secondary]}
      style={styles.buttonGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>{text}</Text>}
    </LinearGradient>
  </TouchableOpacity>
)

// Temas disponibles
const themes = {
  light: {
    name: "light",
    primary: "#4CAF50",
    secondary: "#3d9140",
    background: ["#f5f7fa", "#e4e8eb"],
    card: "#FFFFFF",
    text: "#333333",
    subtext: "#666666",
    inputBg: "#F5F6F8",
    inputBorder: "#E8E8E8",
    error: "#ff4d4f",
  },
  dark: {
    name: "dark",
    primary: "#2196F3",
    secondary: "#1976D2",
    background: ["#1a1a2e", "#16213e"],
    card: "#0d1117",
    text: "#e6e6e6",
    subtext: "#a0a0a0",
    inputBg: "#1f2937",
    inputBorder: "#374151",
    error: "#ff4d4f",
  },
  darkOrange: {
    name: "darkOrange",
    primary: "#FF5722",
    secondary: "#E64A19",
    background: ["#121212", "#1e1e1e"],
    card: "#1c1c1c",
    text: "#f5f5f5",
    subtext: "#b0b0b0",
    inputBg: "#2c2c2c",
    inputBorder: "#3d3d3d",
    error: "#ff4d4f",
  },
}

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
  })
  const [avatarImage, setAvatarImage] = useState(null)

  const [errors, setErrors] = useState({})
  const [ineImage, setIneImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [theme, setTheme] = useState(themes.light)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const buttonScale = useRef(new Animated.Value(1)).current
  const modalScale = useRef(new Animated.Value(0.8)).current
  const modalOpacity = useRef(new Animated.Value(0)).current

  // Efecto para las animaciones iniciales
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

    // Mostrar notificación al cargar para elegir tema
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
  }, [])

  // Animación para el modal
  useEffect(() => {
    if (showThemeModal) {
      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
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

  const selectTheme = (themeName) => {
    setTheme(themes[themeName])
    setShowThemeModal(false)
  }

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
    const emailRegex = /\S+@\S+\.\S+/
    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/

    // Validaciones básicas
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio"
    if (!formData.birthDate.trim()) newErrors.birthDate = "La fecha de nacimiento es obligatoria"
    else if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(formData.birthDate))
      newErrors.birthDate = "Formato inválido (DD/MM/AAAA)"

    if (!formData.gender.trim()) newErrors.gender = "El sexo es obligatorio"
    if (!formData.street.trim()) newErrors.street = "La calle es obligatoria"
    if (!formData.number.trim()) newErrors.number = "El número es obligatorio"
    if (!formData.suburb.trim()) newErrors.suburb = "La colonia es obligatoria"
    if (!formData.municipality.trim()) newErrors.municipality = "El municipio es obligatorio"
    if (!formData.state.trim()) newErrors.state = "El estado es obligatorio"

    if (!formData.postalCode.trim()) newErrors.postalCode = "El código postal es obligatorio"
    else if (!/^\d{5}$/.test(formData.postalCode)) newErrors.postalCode = "El código postal debe tener 5 dígitos"

    if (!formData.curp.trim()) newErrors.curp = "El CURP es obligatorio"
    else if (!curpRegex.test(formData.curp)) newErrors.curp = "Formato de CURP inválido"

    if (!formData.email.trim()) newErrors.email = "El correo electrónico es obligatorio"
    else if (!emailRegex.test(formData.email)) newErrors.email = "Correo electrónico inválido"

    if (!formData.password) newErrors.password = "La contraseña es obligatoria"
    else if (formData.password.length < 6) newErrors.password = "Mínimo 6 caracteres"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async () => {
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

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Crear FormData object en lugar de JSON
      const formDataObj = new FormData()

      // Agregar todos los campos con los nombres que espera el backend PHP
      formDataObj.append("nombre_completo", formData.name)
      formDataObj.append("fech_nac", formData.birthDate)
      formDataObj.append("sexo", formData.gender)
      formDataObj.append("calle", formData.street)
      formDataObj.append("numero", formData.number)
      formDataObj.append("colonia", formData.suburb)
      formDataObj.append("municipio", formData.municipality)
      formDataObj.append("estado", formData.state) // Aunque el backend no lo use, lo enviamos por si acaso
      formDataObj.append("codigo_postal", formData.postalCode) // Aunque el backend no lo use, lo enviamos por si acaso
      formDataObj.append("curp", formData.curp)
      formDataObj.append("correo", formData.email)
      formDataObj.append("contrasena", formData.password)

      // Si tenemos una imagen de avatar, la agregamos como archivo
      if (avatarImage) {
        // Obtener información del archivo
        const fileNameParts = avatarImage.split("/")
        const fileName = fileNameParts[fileNameParts.length - 1]

        // Crear un Blob a partir de los datos
        formDataObj.append("avatar", {
          uri: avatarImage,
          name: fileName,
          type: "image/jpeg", // Ajustar según el tipo de imagen
        })
      }

      console.log(
        "Enviando solicitud a:",
        "http://192.168.0.14/GEOLOCALIZACION/Geolocalizacion-waos/backend/api/auth/register.php",
      )

      // Imprimir los datos que se están enviando para depuración
      console.log("Enviando datos:", Object.fromEntries(formDataObj._parts))

      const response = await fetch(
        "http://192.168.0.14/GEOLOCALIZACION/Geolocalizacion-waos/backend/api/auth/register.php",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            // Eliminamos el Content-Type para que fetch lo establezca correctamente con boundary para FormData
          },
          body: formDataObj,
        },
      )

      // Verificar el tipo de contenido de la respuesta
      const contentType = response.headers.get("content-type")
      console.log("Tipo de contenido de respuesta:", contentType)

      // Si no es JSON, mostrar el texto de la respuesta para depuración
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("Respuesta no JSON:", textResponse)
        throw new Error("El servidor no devolvió JSON. Respuesta: " + textResponse.substring(0, 150) + "...")
      }

      const data = await response.json()
      console.log("Respuesta del servidor:", data)

      if (data.success) {
        Alert.alert("Registro exitoso", data.message, [
          { text: "Iniciar sesión", onPress: () => navigation.navigate("Login") },
        ])
      } else {
        Alert.alert("Error", data.message || "No se pudo registrar")
      }
    } catch (error) {
      console.error("Error al registrar:", error)
      Alert.alert(
        "Error de conexión",
        "No se pudo conectar con el servidor. Verifica tu conexión a internet y la URL del servidor.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Permiso denegado", "Necesitas permitir acceso a la cámara.")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.5,
      })

      if (!result.canceled) {
        const imageUri = result.assets[0].uri
        setIneImage(imageUri)
        Alert.alert("Imagen capturada", "La imagen ha sido tomada correctamente.")
      }
    } catch (error) {
      console.error("Error al abrir la cámara:", error)
      Alert.alert("Error", "No se pudo abrir la cámara")
    }
  }

  const pickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Permiso denegado", "Necesitas permitir acceso a la galería.")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      })

      if (!result.canceled) {
        const imageUri = result.assets[0].uri
        setAvatarImage(imageUri)
        Alert.alert("Avatar seleccionado", "La imagen ha sido seleccionada correctamente.")
      }
    } catch (error) {
      console.error("Error al seleccionar avatar:", error)
      Alert.alert("Error", "No se pudo seleccionar la imagen")
    }
  }

  const scanIneAndExtractData = async () => {
    if (!ineImage) {
      Alert.alert("Error", "Primero captura una imagen del INE")
      return
    }

    setIsLoading(true)

    try {
      // Crear FormData para la API de OCR
      const formDataOCR = new FormData()
      formDataOCR.append("file", {
        uri: ineImage,
        name: "ine.jpg",
        type: "image/jpeg",
      })
      formDataOCR.append("language", "spa")
      formDataOCR.append("isOverlayRequired", "false")

      // Llamada a la API de OCR
      const res = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: {
          apikey: "K82930276388957", // Considera usar variables de entorno para las claves API
        },
        body: formDataOCR,
      })

      const data = await res.json()

      if (!data || !data.ParsedResults || data.ParsedResults.length === 0) {
        throw new Error("No se pudieron extraer datos de la imagen")
      }

      const text = data.ParsedResults[0].ParsedText || ""
      console.log("Texto OCR completo:", text)

      // Extraer datos del texto OCR usando una función separada
      const extractedData = extractDataFromOCRText(text)
      console.log("Datos extraídos:", extractedData)

      // Actualizar el formulario con los datos extraídos
      setFormData((prevData) => ({
        ...prevData,
        ...extractedData,
      }))

      Alert.alert("Éxito", "Datos extraídos correctamente")
    } catch (error) {
      console.error("OCR Error:", error)
      Alert.alert("Error", "No se pudo procesar la imagen")
    } finally {
      setIsLoading(false)
    }
  }

  // Función separada para extraer datos del texto OCR
  const extractDataFromOCRText = (text) => {
    const extractedData = {
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
    }

    // Extraer nombre
    if (text.includes("NOMBRE")) {
      const nameStartIndex = text.indexOf("NOMBRE") + "NOMBRE".length
      const possibleEnds = ["DOMICILIO", "FECHA", "SEXO", "CLAVE", "CURP"]
      let nameEndIndex = text.length

      for (const endMarker of possibleEnds) {
        const index = text.indexOf(endMarker, nameStartIndex)
        if (index !== -1 && index < nameEndIndex) {
          nameEndIndex = index
        }
      }

      if (nameStartIndex > 0 && nameEndIndex > nameStartIndex) {
        let nameText = text.substring(nameStartIndex, nameEndIndex).trim().replace(/\n/g, " ")
        nameText = nameText
          .replace(/[^\w\s]/gi, " ")
          .replace(/\s+/g, " ")
          .trim()
        extractedData.name = nameText
      }
    }

    // Extraer fecha de nacimiento
    const dobMarkers = ["FECHA DE NACIMIENTO", "NACIMIENTO", "FECHA NAC"]
    for (const marker of dobMarkers) {
      if (text.includes(marker)) {
        const dobStartIndex = text.indexOf(marker) + marker.length
        let dobEndIndex = text.indexOf("\n", dobStartIndex)
        if (dobEndIndex === -1) dobEndIndex = text.length
        extractedData.birthDate = text.substring(dobStartIndex, dobEndIndex).trim()
        break
      }
    }

    if (!extractedData.birthDate) {
      const dobRegex = /(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/
      const dobMatch = text.match(dobRegex)
      if (dobMatch) {
        extractedData.birthDate = dobMatch[0]
      }
    }

    // Extraer género
    if (text.includes("SEXO") || text.includes("GÉNERO")) {
      const genderMarkers = ["SEXO", "GÉNERO"]
      for (const marker of genderMarkers) {
        if (text.includes(marker)) {
          const genderStartIndex = text.indexOf(marker) + marker.length
          let genderEndIndex = text.indexOf("\n", genderStartIndex)
          if (genderEndIndex === -1) genderEndIndex = genderStartIndex + 10
          const genderText = text.substring(genderStartIndex, genderEndIndex).trim()

          if (genderText.includes("M") || genderText.includes("MUJER")) {
            extractedData.gender = "Mujer"
          } else if (genderText.includes("H") || genderText.includes("HOMBRE")) {
            extractedData.gender = "Hombre"
          }
          break
        }
      }
    }

    // Extraer CURP
    const curpRegex = /[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d/
    const curpMatch = text.match(curpRegex)
    if (curpMatch) {
      extractedData.curp = curpMatch[0]
    } else if (text.includes("CURP")) {
      const curpIndex = text.indexOf("CURP")
      const textAfterCurp = text.substring(curpIndex + 4, curpIndex + 54)
      const cleanedText = textAfterCurp.replace(/[\s\n\r\t.,;:]/g, "")
      const potentialCurpMatch = cleanedText.match(/[A-Z]{4}[A-Z0-9]{14}/i)

      if (potentialCurpMatch) {
        extractedData.curp = potentialCurpMatch[0].toUpperCase()
      }
    }

    // Extraer código postal
    const cpRegex = /C\.?P\.?\s*(\d{5})/i
    const cpMatch = text.match(cpRegex)
    if (cpMatch && cpMatch[1]) {
      extractedData.postalCode = cpMatch[1]
    } else {
      const genericCPRegex = /\b(\d{5})\b/
      const genericCPMatch = text.match(genericCPRegex)
      if (genericCPMatch && genericCPMatch[1]) {
        extractedData.postalCode = genericCPMatch[1]
      }
    }

    // Extraer dirección (simplificado para este ejemplo)
    if (text.includes("DOMICILIO")) {
      const addressStartIndex = text.indexOf("DOMICILIO") + "DOMICILIO".length
      const possibleEnds = ["CLAVE", "CURP", "ESTADO", "MUNICIPIO", "LOCALIDAD", "EMISIÓN", "VIGENCIA"]
      let addressEndIndex = text.length

      for (const endMarker of possibleEnds) {
        const index = text.indexOf(endMarker, addressStartIndex)
        if (index !== -1 && index < addressEndIndex) {
          addressEndIndex = index
        }
      }

      if (addressStartIndex > 0 && addressEndIndex > addressStartIndex) {
        const fullAddress = text.substring(addressStartIndex, addressEndIndex).trim().replace(/\n/g, " ")

        // Extraer número
        const numberRegex = /\s(\d+(?:\s?[A-Z])?)\s/
        const numberMatch = fullAddress.match(numberRegex)

        if (numberMatch) {
          extractedData.number = numberMatch[1].trim()

          // Extraer calle
          const streetEndIndex = fullAddress.indexOf(numberMatch[0])
          if (streetEndIndex > 0) {
            extractedData.street = fullAddress.substring(0, streetEndIndex).trim()
          }

          // Extraer colonia
          const suburbStartIndex = streetEndIndex + numberMatch[0].length
          if (suburbStartIndex < fullAddress.length) {
            extractedData.suburb = fullAddress.substring(suburbStartIndex).trim()
          }
        }
      }
    }

    // Extraer municipio
    if (text.includes("MUNICIPIO") || text.includes("ALCALDÍA")) {
      const munMarkers = ["MUNICIPIO", "ALCALDÍA", "DELEGACIÓN"]
      for (const marker of munMarkers) {
        if (text.includes(marker)) {
          const munStartIndex = text.indexOf(marker) + marker.length
          let munEndIndex = text.indexOf("\n", munStartIndex)
          if (munEndIndex === -1) munEndIndex = text.length
          extractedData.municipality = text.substring(munStartIndex, munEndIndex).trim()
          break
        }
      }
    }

    // Extraer estado
    if (text.includes("ESTADO")) {
      const stateStartIndex = text.indexOf("ESTADO") + "ESTADO".length
      let stateEndIndex = text.indexOf("\n", stateStartIndex)
      if (stateEndIndex === -1) stateEndIndex = text.length
      extractedData.state = text.substring(stateStartIndex, stateEndIndex).trim()
    }

    return extractedData
  }

  return (
    <>
      <StatusBar barStyle={theme.name === "light" ? "dark-content" : "light-content"} />
      <LinearGradient colors={theme.background} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
              {/* Sección de escaneo de INE */}
              <View style={{ alignItems: "center", marginBottom: 20 }}>
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
                  onPress={openCamera}
                >
                  <Feather name="camera" size={40} color={theme.primary} />
                </TouchableOpacity>
                <Text style={{ color: theme.subtext, fontSize: 14, marginTop: 8 }}>Escanear INE</Text>

                {ineImage && (
                  <>
                    <Image
                      source={{ uri: ineImage }}
                      style={{ width: 200, height: 120, marginTop: 15, borderRadius: 10 }}
                      resizeMode="cover"
                    />

                    <ActionButton
                      onPress={scanIneAndExtractData}
                      text="Extraer datos INE"
                      isLoading={isLoading}
                      theme={theme}
                      style={{ marginTop: 10 }}
                    />
                  </>
                )}
              </View>

              {/* Sección de avatar */}
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <TouchableOpacity
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: theme.inputBg,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: theme.secondary,
                    shadowColor: theme.secondary,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 5,
                    elevation: 3,
                    overflow: "hidden",
                  }}
                  onPress={pickAvatar}
                >
                  {avatarImage ? (
                    <Image source={{ uri: avatarImage }} style={{ width: 100, height: 100 }} resizeMode="cover" />
                  ) : (
                    <Feather name="user" size={40} color={theme.secondary} />
                  )}
                </TouchableOpacity>
                <Text style={{ color: theme.subtext, fontSize: 14, marginTop: 8 }}>Seleccionar Avatar</Text>
              </View>

              {/* Sección de datos personales */}
              <Text style={[styles.title, { color: theme.text }]}>Datos Personales</Text>

              <FormInput
                label="Nombre completo"
                field="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                theme={theme}
              />

              <FormInput
                label="Fecha de nacimiento (DD/MM/AAAA)"
                field="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                error={errors.birthDate}
                theme={theme}
              />

              <FormInput
                label="Sexo"
                field="gender"
                value={formData.gender}
                onChange={handleInputChange}
                error={errors.gender}
                theme={theme}
              />

              <FormInput
                label="Calle"
                field="street"
                value={formData.street}
                onChange={handleInputChange}
                error={errors.street}
                theme={theme}
              />

              <FormInput
                label="Número"
                field="number"
                value={formData.number}
                onChange={handleInputChange}
                error={errors.number}
                theme={theme}
                keyboardType="numeric"
              />

              <FormInput
                label="Colonia"
                field="suburb"
                value={formData.suburb}
                onChange={handleInputChange}
                error={errors.suburb}
                theme={theme}
              />

              <FormInput
                label="Municipio"
                field="municipality"
                value={formData.municipality}
                onChange={handleInputChange}
                error={errors.municipality}
                theme={theme}
              />

              <FormInput
                label="Estado"
                field="state"
                value={formData.state}
                onChange={handleInputChange}
                error={errors.state}
                theme={theme}
              />

              <FormInput
                label="Código Postal"
                field="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                error={errors.postalCode}
                theme={theme}
                keyboardType="numeric"
              />

              <FormInput
                label="CURP"
                field="curp"
                value={formData.curp}
                onChange={handleInputChange}
                error={errors.curp}
                theme={theme}
              />

              {/* Sección de datos de cuenta */}
              <Text style={[styles.title, { color: theme.text, marginTop: 30 }]}>Datos de Cuenta</Text>

              <FormInput
                label="Correo electrónico"
                field="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                theme={theme}
                keyboardType="email-address"
              />

              <FormInput
                label="Contraseña"
                field="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                theme={theme}
                secureTextEntry={true}
              />

              {/* Botón de registro */}
              <TouchableOpacity
                style={[styles.button, { shadowColor: theme.primary }]}
                onPress={handleRegister}
                activeOpacity={0.8}
              >
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <LinearGradient
                    colors={[theme.primary, theme.secondary]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.buttonText}>{isLoading ? "Procesando..." : "Registrarse"}</Text>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.subtext }]}>¿Ya tienes una cuenta?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={[styles.loginText, { color: theme.primary }]}> Inicia sesión</Text>
                </TouchableOpacity>
              </View>

              {/* Botón de cambio de tema */}
              <TouchableOpacity
                style={[styles.themeToggle, { backgroundColor: theme.primary }]}
                onPress={() => setShowThemeModal(true)}
                accessibilityLabel="Cambiar tema"
              >
                <Text style={styles.themeToggleText}>
                  {theme.name === "dark" ? "🌙" : theme.name === "darkOrange" ? "🔶" : "☀️"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modal de selección de tema */}
        <Modal visible={showThemeModal} transparent animationType="none">
          <BlurView intensity={90} style={styles.modalOverlay} tint={theme.name === "light" ? "light" : "dark"}>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: theme.card,
                  opacity: modalOpacity,
                  transform: [{ scale: modalScale }],
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>Selecciona un tema</Text>

              <View style={styles.themeOptions}>
                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    theme.name === "light" && styles.themeOptionSelected,
                    { borderColor: theme.name === "light" ? "#4CAF50" : "transparent" },
                  ]}
                  onPress={() => selectTheme("light")}
                >
                  <LinearGradient colors={["#f5f7fa", "#e4e8eb"]} style={styles.themePreview}>
                    <View style={[styles.themePreviewButton, { backgroundColor: "#4CAF50" }]} />
                  </LinearGradient>
                  <View>
                    <Text style={[styles.themeOptionText, { color: theme.text }]}>Claro (Verde)</Text>
                    <Text style={[styles.themeOptionSubtext, { color: theme.subtext }]}>Tema brillante y fresco</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    theme.name === "dark" && styles.themeOptionSelected,
                    { borderColor: theme.name === "dark" ? "#2196F3" : "transparent" },
                  ]}
                  onPress={() => selectTheme("dark")}
                >
                  <LinearGradient colors={["#1a1a2e", "#16213e"]} style={styles.themePreview}>
                    <View style={[styles.themePreviewButton, { backgroundColor: "#2196F3" }]} />
                  </LinearGradient>
                  <View>
                    <Text style={[styles.themeOptionText, { color: theme.text }]}>Oscuro (Azul)</Text>
                    <Text style={[styles.themeOptionSubtext, { color: theme.subtext }]}>Ideal para uso nocturno</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    theme.name === "darkOrange" && styles.themeOptionSelected,
                    { borderColor: theme.name === "darkOrange" ? "#FF5722" : "transparent" },
                  ]}
                  onPress={() => selectTheme("darkOrange")}
                >
                  <LinearGradient colors={["#121212", "#1e1e1e"]} style={styles.themePreview}>
                    <View style={[styles.themePreviewButton, { backgroundColor: "#FF5722" }]} />
                  </LinearGradient>
                  <View>
                    <Text style={[styles.themeOptionText, { color: theme.text }]}>Negro (Naranja)</Text>
                    <Text style={[styles.themeOptionSubtext, { color: theme.subtext }]}>Elegante y moderno</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.name === "light" ? "#f1f1f1" : "#333" }]}
                onPress={() => setShowThemeModal(false)}
              >
                <Text style={[styles.closeButtonText, { color: theme.text }]}>Cerrar</Text>
              </TouchableOpacity>
            </Animated.View>
          </BlurView>
        </Modal>
      </LinearGradient>
    </>
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    fontSize: 20,
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
    flexDirection: "row",
  },
  themeOptionSelected: {
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
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  themePreviewButton: {
    width: 30,
    height: 15,
    borderRadius: 5,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  themeOptionSubtext: {
    fontSize: 13,
    fontWeight: "400",
  },
  closeButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
})
