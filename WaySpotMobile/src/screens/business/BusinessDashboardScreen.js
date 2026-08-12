import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import client from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';

export default function BusinessDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await client.get('/business-dashboard/stats');
      setStats(res.data);
    } catch (e) {
      Alert.alert('Hata', 'Istatistikler alinamadi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!stats) return <Text style={[styles.error, { color: theme.textMuted }]}>Veri yok</Text>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <Text style={[styles.header, { color: theme.textPrimary }]}>Isletme Paneli</Text>

      <View style={styles.cardsRow}>
        <View style={[styles.card, { backgroundColor: theme.lightTealSoft }]}>
          <Icon name="post" size={28} color={theme.primary} />
          <Text style={[styles.cardValue, { color: theme.textPrimary }]}>{stats.totalPosts}</Text>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Toplam Post</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.successLight }]}>
          <Icon name="comment-text" size={28} color={theme.success} />
          <Text style={[styles.cardValue, { color: theme.textPrimary }]}>{stats.totalReviews}</Text>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Yorum</Text>
        </View>
      </View>

      <View style={styles.cardsRow}>
        <View style={[styles.card, { backgroundColor: theme.accentLight }]}>
          <Icon name="star" size={28} color={theme.accent} />
          <Text style={[styles.cardValue, { color: theme.textPrimary }]}>{stats.averageRating}</Text>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Ort. Puan</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.surfaceDark }]}>
          <Icon name="eye" size={28} color={theme.navy} />
          <Text style={[styles.cardValue, { color: theme.textPrimary }]}>{stats.activePosts}</Text>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Aktif Post</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Son Yorumlar</Text>
      {stats.recentReviews.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textMuted }]}>Heniz yorum yok.</Text>
      ) : (
        stats.recentReviews.map((r) => (
          <View key={r.id} style={[styles.reviewItem, { backgroundColor: theme.bgCard }]}>
            <View style={styles.reviewHeader}>
              <Text style={[styles.reviewUser, { color: theme.textPrimary }]}>{r.username}</Text>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={12} color={theme.accent} />
                <Text style={[styles.ratingText, { color: theme.textPrimary }]}>{r.rating}</Text>
              </View>
            </View>
            <Text style={[styles.reviewComment, { color: theme.textPrimary }]} numberOfLines={2}>{r.comment}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', elevation: 2 },
  cardValue: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  cardLabel: { fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 20 },
  reviewItem: { padding: 14, borderRadius: 12, marginBottom: 8, elevation: 1 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewUser: { fontWeight: '600' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  ratingText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  reviewComment: { fontSize: 14 },
  error: { textAlign: 'center', marginTop: 100 },
});
