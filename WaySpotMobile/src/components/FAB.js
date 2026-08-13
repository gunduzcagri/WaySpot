import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

export default function FAB({ icon, onPress, label, style }) {
  const theme = useTheme();
  return (
    <TouchableOpacity style={[styles.fab, style]} onPress={onPress} activeOpacity={0.85}>
      {icon ? (
        <Icon name={icon} size={28} color={theme.textInverse} />
      ) : (
        <Text style={[styles.label, { color: theme.textInverse }]}>{label || '+'}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  label: { fontSize: 28, fontWeight: '600' },
});
