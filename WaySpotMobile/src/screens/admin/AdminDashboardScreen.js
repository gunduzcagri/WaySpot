import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import client from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../utils/constants';

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await client.get('/admin/dashboard');
      setStats(res.data);
    } catch (e) {
      Alert.alert('Hata', 'Admin verileri alinamadi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!stats) return <EmptyState icon="shield-account" title="Henuz veri yok" description="Admin panel verileri yukleniyor." />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <Text style={[styles.header, { color: theme.textPrimary }]}>Admin Paneli</Text>

      <View style={styles.grid}>
        <View style={[styles.gridItem, { backgroundColor: theme.lightTealSoft }]}>
          <Icon name="account-group" size={28} color={theme.primary} />
          <Text style={[styles.gridValue, { color: theme.textPrimary }]}>{stats?.totalUsers}</Text>
          <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Kullanici</Text>
        </View>
        <View style={[styles.gridItem, { backgroundColor: theme.successLight }]}>
          <Icon name="store" size={28} color={theme.success} />
          <Text style={[styles.gridValue, { color: theme.textPrimary }]}>{stats?.totalBusinesses}</Text>
          <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Isletme</Text>
        </View>
        <View style={[styles.gridItem, { backgroundColor: theme.accentLight }]}>
          <Icon name="post" size={28} color={theme.accent} />
          <Text style={[styles.gridValue, { color: theme.textPrimary }]}>{stats?.totalPosts}</Text>
          <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Post</Text>
        </View>
        <View style={[styles.gridItem, { backgroundColor: theme.dangerLight }]}>
          <Icon name="comment-alert" size={28} color={theme.danger} />
          <Text style={[styles.gridValue, { color: theme.textPrimary }]}>{stats?.pendingReviews}</Text>
          <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Bekleyen</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Hizli Erisim</Text>
      <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.bgCard, shadowColor: theme.textPrimary }]} activeOpacity={0.7}>
        <Icon name="account-group" size={22} color={theme.primary} />
        <Text style={[styles.menuText, { color: theme.textPrimary }]}>Kullanicilari Yonet</Text>
        <Icon name="chevron-right" size={22} color={theme.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.bgCard, shadowColor: theme.textPrimary }]} activeOpacity={0.7}>
        <Icon name="store" size={22} color={theme.primary} />
        <Text style={[styles.menuText, { color: theme.textPrimary }]}>Isletmeleri Yonet</Text>
        <Icon name="chevron-right" size={22} color={theme.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.bgCard, shadowColor: theme.textPrimary }]} activeOpacity={0.7}>
        <Icon name="comment-check" size={22} color={theme.primary} />
        <Text style={[styles.menuText, { color: theme.textPrimary }]}>Yorum Moderasyonu</Text>
        <Icon name="chevron-right" size={22} color={theme.textMuted} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg },
  header: { ...TYPOGRAPHY.h2, marginBottom: SPACING.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: 24 },
  gridItem: { width: '47%', padding: SPACING.lg, borderRadius: 16, alignItems: 'center', elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  gridValue: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  gridLabel: { fontSize: 12, marginTop: 4 },
  sectionTitle: { ...TYPOGRAPHY.h3, marginBottom: SPACING.md },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, marginBottom: SPACING.sm, borderRadius: 16, elevation: 1, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  menuText: { flex: 1, fontSize: 15, marginLeft: 12 },
});
