import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../utils/constants';
import FAB from '../../components/FAB';

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 39.9334,
    longitude: 32.8597,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const theme = useTheme();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Konum Izni',
          message: 'Haritada konumunuzu gostermek icin izin gerekli.',
          buttonNeutral: 'Sonra Sor',
          buttonNegative: 'Iptal',
          buttonPositive: 'Tamam',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {location && (
          <Marker coordinate={location} title="Konumunuz" pinColor={theme.primary} />
        )}
      </MapView>

      <TouchableOpacity style={[styles.locateButton, { backgroundColor: theme.primary }]} onPress={getCurrentLocation} activeOpacity={0.7}>
        <Icon name="crosshairs-gps" size={24} color={theme.textInverse} />
      </TouchableOpacity>

      <FAB icon="routes" onPress={() => navigation.navigate('RoutePlanner')} style={{ position: 'absolute', bottom: SPACING.xxxl + 24, right: SPACING.lg, backgroundColor: theme.secondary, shadowColor: theme.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  locateButton: {
    position: 'absolute', bottom: 100, right: SPACING.lg,
    width: 64, height: 64,
    borderRadius: 32, justifyContent: 'center', alignItems: 'center',
    elevation: 8,
  },
});
