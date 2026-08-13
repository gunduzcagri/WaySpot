import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Avatar({ size = 48, source, name, style }) {
  const theme = useTheme();
  const fontSize = size * 0.4;
  const borderRadius = size === 80 ? 40 : size === 56 ? 16 : size / 2;

  if (source) {
    return <Image source={{ uri: source }} style={[styles.image, { width: size, height: size, borderRadius }, style]} />;
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius, backgroundColor: theme.primary }, style]}>
      <Text style={[styles.initial, { color: theme.textInverse, fontSize }]}>
        {name ? name.charAt(0).toUpperCase() : '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initial: { fontWeight: '700' },
});
