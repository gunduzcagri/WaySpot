import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../utils/constants';

export default function PostCard({ post, onPress }) {
  const theme = useTheme();
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.bgCard, shadowColor: theme.textPrimary }]} onPress={onPress} activeOpacity={0.7}>
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.content}>
        <Text style={[styles.businessName, { color: theme.textPrimary }]}>{post.business.name}</Text>
        <Text style={[styles.text, { color: theme.textPrimary }]} numberOfLines={3}>{post.content}</Text>
        <View style={styles.footer}>
          <View style={[styles.badge, { backgroundColor: theme.lightTealSoft }]}>
            <Icon name="map-marker-radius" size={14} color={theme.primary} />
            <Text style={[styles.badgeText, { color: theme.primary }]}>{post.targetRadiusKm} km</Text>
          </View>
          <Text style={[styles.date, { color: theme.textMuted }]}>
            {new Date(post.createdAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 180 },
  content: { padding: SPACING.md },
  businessName: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  text: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  badgeText: { fontSize: 12, marginLeft: 4, fontWeight: '500' },
  date: { fontSize: 12 },
});
