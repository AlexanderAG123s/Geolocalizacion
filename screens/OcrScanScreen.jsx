"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native"
import { Camera } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"
import { manipulateAsync, SaveFormat } from "expo-image-manipulator"
import { LinearGradient } from "expo-linear-gradient"
import { Feather, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import { useTheme } from "../contexts/theme-context"

// Constantes para los tipos de escaneo
const SCAN_TYPES = {
  VEHICLE_PLATE: "vehicle_plate",
  ID_DOCUMENT: "id_document",
  ADDRESS_DOCUMENT: "address_document",
}

export default function OcrScanScreen({ navigation, route }) {
  const { theme } = useTheme()
  const { scanType = SCAN_TYPES.VEHICLE_PLATE, onScanComplete } = route.params || {}
  
  const [hasPermission, setHasPermission] = useState(null)
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [recognizedText, setRecognizedText] = useState("")
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off)
  
  const cameraRef = useRef(null)

  // Solicitar permisos de cámara al montar el componente
  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
      
      // También solicitar permisos para la galería
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (galleryStatus.status !== "granted") {
        Alert.alert("Permiso requerido", "Se necesita acceso a la galería para seleccionar imágenes.")
      }
    })()
  }, [])

  // Función para tomar una foto
  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        setIsProcessing(true)
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          skipProcessing: true,
        })
        
        // Procesar la imagen para mejorar el OCR
        const processedImage = await manipulateAsync(
          photo.uri,
          [
            { resize: { width: 1000 } },
            { crop: { originX: 0, originY: 0, width: 1000, height: 800 } },
          ],
          { compress: 0.8, format: SaveFormat.JPEG, base64: true }
        )
        
        setCapturedImage(processedImage)
        await processImageWithOcr(processedImage)
      } catch (error) {
        console.error("Error al tomar la foto:", error)
        Alert.alert("Error", "No se pudo capturar la imagen. Inténtalo de nuevo.")
        setIsProcessing(false)
      }
    }
  }

  // Función para seleccionar una imagen de la galería
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      })
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsProcessing(true)
        setCapturedImage(result.assets[0])
        await processImageWithOcr(result.assets[0])
      }
    } catch (error) {
      console.error("Error al seleccionar la imagen:", error)
      Alert.alert("Error", "No se pudo seleccionar la imagen. Inténtalo de nuevo.")
    }
  }

  // Función para procesar la imagen con OCR
  const processImageWithOcr = async (image) => {
    try {
      // En una aplicación real, aquí enviarías la imagen a un servicio de OCR
      // como Google Cloud Vision, Microsoft Azure OCR, o Tesseract
      
      // Simulamos el procesamiento OCR con un timeout
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulamos el resultado del OCR según el tipo de escaneo
      let simulatedText = ""
      
      switch (scanType) {
        case SCAN_TYPES.VEHICLE_PLATE:
          simulatedText = "ABC-123"
          break
        case SCAN_TYPES.ID_DOCUMENT:
          simulatedText = "NOMBRE: JUAN PEREZ\nDIRECCIÓN: CALLE PRINCIPAL 123\nCIUDAD: MÉXICO"
          break
        case SCAN_TYPES.ADDRESS_DOCUMENT:
          simulatedText = "CALLE INSURGENTES SUR 1602\nCOL. CRÉDITO CONSTRUCTOR\nCIUDAD DE MÉXICO, CP 03940"
          break
        default:
          simulatedText = "TEXTO RECONOCIDO"
      }
      
      setRecognizedText(simulatedText)
      setIsProcessing(false)
    } catch (error) {
      console.error("Error en el procesamiento OCR:", error)
      Alert.alert("Error", "No se pudo procesar la imagen. Inténtalo de nuevo.")
      setIsProcessing(false)
    }
  }

  // Función para usar el texto reconocido
  const useRecognizedText = () => {
    if (route.params?.onScanComplete) {
      route.params.onScanComplete(recognizedText)
    }
    navigation.goBack()
  }

  // Función para reiniciar el escaneo
  const resetScan = () => {
    setCapturedImage(null)
    setRecognizedText("")
  }

  // Función para cambiar el modo del flash
  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.torch
        : Camera.Constants.FlashMode.off
    )
  }

  // Renderizar mensaje si no hay permisos
  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background[0] }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background[0] }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          No se tiene acceso a la cámara. Por favor, otorga los permisos necesarios.
        </Text>
      </View>
    )
  }

  // Obtener el título según el tipo de escaneo
  const getScanTitle = () => {
    switch (scanType) {
      case SCAN_TYPES.VEHICLE_PLATE:
        return "Escanear Placa"
      case SCAN_TYPES.ID_DOCUMENT:
        return "Escanear Identificación"
      case SCAN_TYPES.ADDRESS_DOCUMENT:
        return "Escanear Comprobante"
      default:
        return "Escanear Documento"
    }
  }

  // Obtener instrucciones según el tipo de escaneo
  const getScanInstructions = () => {
    switch (scanType) {
      case SCAN_TYPES.VEHICLE_PLATE:
        return "Coloca la placa del vehículo dentro del recuadro y toma la foto."
      case SCAN_TYPES.ID_DOCUMENT:
        return "Coloca tu identificación dentro del recuadro y toma la foto."
      case SCAN_TYPES.ADDRESS_DOCUMENT:
        return "Coloca tu comprobante de domicilio dentro del recuadro y toma la foto."
      default:
        return "Coloca el documento dentro del recuadro y toma la foto."
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background[0] }]}>
      {/* Botón de regreso */}
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: theme.card }]}
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={24} color={theme.text} />
      </TouchableOpacity>

      {/* Título */}
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{getScanTitle()}</Text>
        <Text style={[styles.headerSubtitle, { color: theme.subtext }]}>{getScanInstructions()}</Text>
      </View>

      {/* Contenido principal */}
      <View style={styles.mainContent}>
        {!capturedImage ? (
          // Cámara
          <View style={styles.cameraContainer}>
            <Camera
              ref={cameraRef}
              style={styles.camera}
              type={cameraType}
              flashMode={flashMode}
              onCameraReady={() => setIsCameraReady(true)}
            >
              <View style={styles.scanOverlay}>
                {/* Marco de escaneo */}
                <View style={styles.scanFrame}>
                  {scanType === SCAN_TYPES.VEHICLE_PLATE && (
                    <Text style={styles.scanFrameText}>PLACA</Text>
                  )}
                </View>
              </View>
            </Camera>

            {/* Controles de cámara */}
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={[styles.cameraButton, { backgroundColor: theme.card }]}
                onPress={toggleFlash}
              >
                <Feather
                  name={flashMode === Camera.Constants.FlashMode.off ? "zap-off" : "zap"}
                  size={24}
                  color={theme.primary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.captureButton, { borderColor: theme.primary }]}
                onPress={takePicture}
                disabled={!isCameraReady || isProcessing}
              >
                <View style={[styles.captureButtonInner, { backgroundColor: theme.primary }]} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cameraButton, { backgroundColor: theme.card }]}
                onPress={pickImage}
              >
                <Feather name="image" size={24} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Resultado del escaneo
          <View style={styles.resultContainer}>
            <Image source={{ uri: capturedImage.uri }} style={styles.capturedImage} />

            <View style={[styles.resultTextContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.resultTitle, { color: theme.text }]}>Texto Reconocido:</Text>
              
              {isProcessing ? (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={[styles.processingText, { color: theme.subtext }]}>
                    Procesando imagen...
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.recognizedTextScroll}>
                  <Text style={[styles.recognizedText, { color: theme.text }]}>
                    {recognizedText || "No se pudo reconocer texto en la imagen."}
                  </Text>
                </ScrollView>
              )}

              <View style={styles.resultButtonsContainer}>
                <TouchableOpacity
                  style={[styles.resultButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={resetScan}
                  disabled={isProcessing}
                >
                  <Feather name="refresh-cw" size={20} color={theme.text} />
                  <Text style={[styles.resultButtonText, { color: theme.text }]}>Reintentar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.resultButton, { backgroundColor: theme.primary }]}
                  onPress={useRecognizedText}
                  disabled={isProcessing || !recognizedText}
                >
                  <Feather name="check" size={20} color="white" />
                  <Text style={[styles.resultButtonText, { color: "white" }]}>Usar Texto</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
  },
  cameraContainer: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
    borderRadius: 20,
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 280,
    height: 120,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrameText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cameraControls: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cameraButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  capturedImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultTextContainer: {
    flex: 1,
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
  },
  recognizedTextScroll: {
    flex: 1,
    marginBottom: 15,
  },
  recognizedText: {
    fontSize: 16,
    lineHeight: 24,
  },
  resultButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resultButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 5,
  },
  resultButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    margin: 20,
  },
})
