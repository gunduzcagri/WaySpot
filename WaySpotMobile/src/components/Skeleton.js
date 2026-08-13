import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Skeleton({ width, height, style }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width || '100%',
          height: height || 16,
          backgroundColor: theme.surfaceDark,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
});
