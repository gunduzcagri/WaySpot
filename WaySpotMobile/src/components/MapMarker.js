import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

export default function MapMarker({ title, coordinate, type = 'default' }) {
  const theme = useTheme();
  const getColor = () => {
    if (type === 'start') return theme.success;
    if (type === 'end') return theme.danger;
    return theme.primary;
  };

  return (
    <View style={styles.markerContainer}>
      <View style={[styles.marker, { backgroundColor: getColor() }]}>
        <Icon name="map-marker" size={24} color={theme.textInverse} />
      </View>
      {title && <Text style={[styles.label, { color: theme.textPrimary }]}>{title}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  markerContainer: { alignItems: 'center' },
  marker: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  label: { marginTop: 4, fontSize: 12, fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
});
