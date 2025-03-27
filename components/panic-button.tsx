import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native"

export default function PanicButton() {
  const handlePress = () => {
    // Add your panic button logic here
    console.log("Panic button pressed!")
    // You could trigger an alert, make an emergency API call, etc.
  }

  return (
   
      <TouchableOpacity style={styles.panicButton} onPress={handlePress} activeOpacity={0.7}>
        <Text style={styles.buttonText}>PANIC</Text>
      </TouchableOpacity>
  )
}

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   paddingTop: height * 0.1, // This pushes the button slightly below center
  // },
  panicButton: {
    position: "static",
    backgroundColor: "red",
    top: 100,
    width: 100,
    height: 100,
    borderRadius: 50, // Makes it a perfect circle
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})
