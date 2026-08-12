import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';

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

  const avatarBg = theme.navy === '#1E3A4C' ? 'rgba(255,255,255,0.2)' : 'rgba(135,196,196,0.2)';
  const emailColor = theme.navy === '#1E3A4C' ? 'rgba(255,255,255,0.8)' : 'rgba(232,244,244,0.7)';

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Icon name="account" size={48} color={theme.textInverse} />
        </View>
        <Text style={[styles.username, { color: theme.textInverse }]}>{profile?.username || user?.username}</Text>
        <Text style={[styles.email, { color: emailColor }]}>{profile?.email || user?.email}</Text>
      </View>

      <View style={[styles.statsContainer, { backgroundColor: theme.bgCard }]}>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{profile?.totalReviews || 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Yorum</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{profile?.totalSavedRoutes || 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Kayitli Rota</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.bgCard }]}>
        <Icon name="pencil" size={22} color={theme.primary} />
        <Text style={[styles.menuText, { color: theme.textPrimary }]}>Profili Duzenle</Text>
        <Icon name="chevron-right" size={22} color={theme.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.bgCard }]}>
        <Icon name="comment-text" size={22} color={theme.primary} />
        <Text style={[styles.menuText, { color: theme.textPrimary }]}>Yorumlarim</Text>
        <Icon name="chevron-right" size={22} color={theme.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, styles.logoutItem, { backgroundColor: theme.bgCard }]} onPress={handleLogout}>
        <Icon name="logout" size={22} color={theme.danger} />
        <Text style={[styles.menuText, { color: theme.danger }]}>Cikis Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  username: { fontSize: 22, fontWeight: 'bold' },
  email: { fontSize: 14, marginTop: 4 },
  statsContainer: { flexDirection: 'row', margin: 16, borderRadius: 16, padding: 20, elevation: 3 },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 13, marginTop: 4 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, elevation: 1,
  },
  menuText: { flex: 1, fontSize: 15, marginLeft: 12 },
  logoutItem: { marginTop: 20 },
});
