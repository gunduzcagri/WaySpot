import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

export default function IconButton({ name, size = 24, onPress, color, style }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.surface }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon name={name} size={size} color={color || theme.navy} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
