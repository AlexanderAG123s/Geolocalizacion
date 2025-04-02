import { StyleSheet, View, Text } from "react-native"

const StatusIndicator = ({ emergencyType, emergencyTypes }) => {
  return (
    <View style={styles.status_indicator}>
      <Text style={styles.status_text}>
        {emergencyType
          ? `Emergencia: ${emergencyTypes.find((t) => t.id === emergencyType)?.title || emergencyType}`
          : "Tracking Active"}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  status_indicator: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "rgba(217, 83, 79, 0.8)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 1,
  },
  status_text: {
    color: "white",
    fontWeight: "bold",
  },
})

export default StatusIndicator

