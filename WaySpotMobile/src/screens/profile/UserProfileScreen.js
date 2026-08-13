import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import Avatar from '../../components/Avatar';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../utils/constants';

export default function UserProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await client.get('/profile');
      setProfile(res.data);
    } catch (e) {
      Alert.alert('Hata', 'Profil bilgisi alinamadi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Cikis', 'Hesabinizdan cikmak istiyor musunuz?', [
      { text: 'Iptal', style: 'cancel' },
      { text: 'Cikis Yap', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Avatar size={80} name={profile?.username || user?.username} />
        <Text style={[styles.username, { color: theme.textInverse }]}>{profile?.username || user?.username}</Text>
        <Text style={[styles.email, { color: theme.textInverse }]}>{profile?.email || user?.email}</Text>
      </View>

      <View style={[styles.statsContainer, { backgroundColor: theme.bgCard, shadowColor: theme.textPrimary }]}>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{profile?.totalReviews || 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Yorum</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{profile?.totalSavedRoutes || 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Kayitli Rota</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.bgCard, shadowColor: theme.textPrimary }]} activeOpacity={0.7}>
        <Icon name="pencil" size={22} color={theme.primary} />
        <Text style={[styles.menuText, { color: theme.textPrimary }]}>Profili Duzenle</Text>
        <Icon name="chevron-right" size={22} color={theme.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.bgCard, shadowColor: theme.textPrimary }]} activeOpacity={0.7}>
        <Icon name="comment-text" size={22} color={theme.primary} />
        <Text style={[styles.menuText, { color: theme.textPrimary }]}>Yorumlarim</Text>
        <Icon name="chevron-right" size={22} color={theme.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, styles.logoutItem, { backgroundColor: theme.bgCard, shadowColor: theme.textPrimary }]} onPress={handleLogout} activeOpacity={0.7}>
        <Icon name="logout" size={22} color={theme.danger} />
        <Text style={[styles.menuText, { color: theme.danger }]}>Cikis Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: SPACING.xxl },
  username: { fontSize: 22, fontWeight: 'bold', marginTop: 12 },
  email: { fontSize: 14, marginTop: 4 },
  statsContainer: { flexDirection: 'row', margin: SPACING.lg, borderRadius: 16, padding: SPACING.lg, elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 13, marginTop: 4 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.lg, marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, borderRadius: 16, elevation: 1, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  menuText: { flex: 1, fontSize: 15, marginLeft: 12 },
  logoutItem: { marginTop: 20 },
});
