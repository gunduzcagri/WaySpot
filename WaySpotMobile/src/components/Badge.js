import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Badge({ label, type = 'default' }) {
  const theme = useTheme();
  const colors = {
    campaign: { bg: theme.accentLight, text: theme.accent },
    active: { bg: theme.successLight, text: theme.success },
    new: { bg: theme.lightTealSoft, text: theme.navy },
    distance: { bg: theme.surfaceDark, text: theme.primary },
    default: { bg: theme.surfaceDark, text: theme.textSecondary },
  };
  const c = colors[type] || colors.default;

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '600' },
});
