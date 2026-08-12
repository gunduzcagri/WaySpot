import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

export default function ReviewCard({ review }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.bgCard, elevation: 1 }]}>
      <View style={styles.header}>
        <Text style={[styles.username, { color: theme.textPrimary }]}>{review.username}</Text>
        <View style={[styles.ratingBadge, { backgroundColor: theme.accentLight }]}>
          <Icon name="star" size={14} color={theme.accent} />
          <Text style={[styles.ratingText, { color: theme.textPrimary }]}>{review.rating}</Text>
        </View>
      </View>
      <Text style={[styles.comment, { color: theme.textPrimary }]}>{review.comment}</Text>
      <Text style={[styles.date, { color: theme.textMuted }]}>
        {new Date(review.createdAt).toLocaleDateString('tr-TR')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  username: { fontSize: 14, fontWeight: '600' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  ratingText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  comment: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  date: { fontSize: 12 },
});
