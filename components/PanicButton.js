import { StyleSheet, Pressable, Text } from "react-native"
import { FontAwesome } from "@expo/vector-icons"

const PanicButton = ({ isTracking, onPress }) => {
  return (
    <Pressable style={[styles.warning_button, isTracking ? styles.tracking_active : {}]} onPress={onPress}>
      <FontAwesome name={isTracking ? "stop-circle" : "exclamation-triangle"} size={40} color="white" />
      <Text style={styles.button_text}>{isTracking ? "STOP" : "SOS"}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  warning_button: {
    position: "absolute",
    width: 100,
    height: 100,
    backgroundColor: "red",
    borderRadius: 50,
    bottom: 40,
    alignSelf: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  tracking_active: {
    backgroundColor: "#d9534f",
    borderWidth: 3,
    borderColor: "white",
  },
  button_text: {
    color: "white",
    fontWeight: "bold",
    marginTop: 5,
  },
})

export default PanicButton

