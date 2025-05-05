"use client"

import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LoginScreen from "./screens/LoginScreen"
import AlertScreen from "./screens/AlertScreen"
import RegisterScreen from "./screens/RegisterScreen"
import VehicleScreen from "./screens/VehicleScreen"
import HousingScreen from "./screens/HousingScreen"
import OcrScanScreen from "./screens/OcrScanScreen"
import RecoverPasswordScreen from './screens/RecoverPasswordScreen'
import { ThemeProvider } from "./contexts/theme-context"


const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Alert" component={AlertScreen} />
          <Stack.Screen name="Vehicle" component={VehicleScreen} />
          <Stack.Screen name="Housing" component={HousingScreen} />
          <Stack.Screen name="OcrScan" component={OcrScanScreen} />
          <Stack.Screen name="RecoverPasswordScreen" component={RecoverPasswordScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  )
}
