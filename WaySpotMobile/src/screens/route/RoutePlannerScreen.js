import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet, Text, Alert, ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

export default function RoutePlannerScreen() {
  const [start, setStart] = useState('Ankara');
  const [end, setEnd] = useState('Antalya');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const geocode = async (city) => {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
    );
    if (res.data.length === 0) throw new Error(`${city} bulunamadi`);
    return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
  };

  const calculateRoute = async () => {
    setLoading(true);
    try {
      const startCoords = await geocode(start);
      const endCoords = await geocode(end);

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`;
      const res = await axios.get(osrmUrl);

      if (res.data.routes && res.data.routes.length > 0) {
        const coords = res.data.routes[0].geometry.coordinates.map((c) => ({
          latitude: c[1],
          longitude: c[0],
        }));
        setRoute({
          coords,
          start: startCoords,
          end: endCoords,
          distance: (res.data.routes[0].distance / 1000).toFixed(1),
        });
      }
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={route ? {
          latitude: (route.start.lat + route.end.lat) / 2,
          longitude: (route.start.lng + route.end.lng) / 2,
          latitudeDelta: Math.abs(route.start.lat - route.end.lat) * 1.5,
          longitudeDelta: Math.abs(route.start.lng - route.end.lng) * 1.5,
        } : { latitude: 39.9334, longitude: 32.8597, latitudeDelta: 10, longitudeDelta: 10 }}
      >
        {route && (
          <>
            <Marker coordinate={{ latitude: route.start.lat, longitude: route.start.lng }} title="Baslangic" pinColor="green" />
            <Marker coordinate={{ latitude: route.end.lat, longitude: route.end.lng }} title="Bitis" pinColor="red" />
            <Polyline coordinates={route.coords} strokeColor={theme.primary} strokeWidth={4} />
          </>
        )}
      </MapView>

      <View style={[styles.panel, { backgroundColor: theme.bgCard, shadowColor: theme.textPrimary }]}>
        <TextInput style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]} placeholder="Baslangic (sehir)" value={start} onChangeText={setStart} placeholderTextColor={theme.textMuted} />
        <TextInput style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]} placeholder="Bitis (sehir)" value={end} onChangeText={setEnd} placeholderTextColor={theme.textMuted} />

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={calculateRoute} disabled={loading}>
          {loading ? <ActivityIndicator color={theme.textInverse} /> : <Text style={[styles.buttonText, { color: theme.textInverse }]}>Rotayi Hesapla</Text>}
        </TouchableOpacity>

        {route && <Text style={[styles.distance, { color: theme.textPrimary }]}>Mesafe: {route.distance} km</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10,
  },
  input: {
    borderWidth: 1, borderRadius: 12,
    padding: 12, marginBottom: 10, fontSize: 15,
  },
  button: {
    padding: 14, borderRadius: 12,
    alignItems: 'center', marginTop: 4,
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  distance: { textAlign: 'center', marginTop: 12, fontSize: 16, fontWeight: '700' },
});
