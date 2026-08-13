import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.lightTealSoft }]}>
        <Icon name={icon || 'package-variant-closed'} size={48} color={theme.primary} />
      </View>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title || 'Henuz veri yok'}</Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        {description || 'Burada gorunecek bir sey yok.'}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary }]} onPress={onAction}>
          <Text style={[styles.actionText, { color: theme.textInverse }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconContainer: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  description: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  actionButton: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16, alignItems: 'center' },
  actionText: { fontSize: 15, fontWeight: '600' },
});
