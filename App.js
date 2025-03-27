import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, {Marker, Polyline } from 'react-native-maps';
import MapviewDirections from 'react-native-maps-directions';
import PanicButton from './components/panic-button';
import * as Location from "expo-location"


export default function App() {
  


  const [origin, setOrigin] = React.useState({
    latitude: 19.6845823,
    longitude: -99.1627131,
  });
  const [destination, setDestination] = React.useState({
    latitude: 19.679444556072685, 
    longitude: -99.14825848149951,
  });

  return (
    <View style={styles.container}>
      
      <MapView style={styles.map}
      initialRegion={{
        latitude: origin.latitude,
        longitude: origin.longitude,
        latitudeDelta: 0.09,
        longitudeDelta: 0.04
      }}
>
      <Marker
        draggable
        coordinate={origin}
        onDragEnd={(direction) => setOrigin(direction.nativeEvent.coordinate)}
      />
      <Marker
        draggable
        coordinate={destination}
        onDragEnd={(direction) => setDestination(direction.nativeEvent.coordinate)}
      />

      {/* <MapviewDirections 
        origin={origin}
        destination={destination}
        apikey=''
      /> */}
      <Polyline 
        coordinates={[origin, destination]}
        strokeColor='black'
        strokeWidth={8}
      /> 
      </MapView>

     

      <PanicButton/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  map: {
    width: '100%',
    height: '100%',
    
  },
  warning_button: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: 700,
    right: 170,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 10,
  }
});
