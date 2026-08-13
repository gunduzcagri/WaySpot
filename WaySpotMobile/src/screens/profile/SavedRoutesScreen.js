import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import client from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../utils/constants';

export default function SavedRoutesScreen() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const fetchRoutes = async () => {
    try {
      const res = await client.get('/saved-routes');
      setRoutes(res.data);
    } catch (e) {
      Alert.alert('Hata', 'Rotalar alinamadi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const deleteRoute = async (id) => {
    Alert.alert('Sil', 'Bu rotayi silmek istiyor musunuz?', [
      { text: 'Iptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          try {
            await client.delete(`/saved-routes/${id}`);
            setRoutes(routes.filter((r) => r.id !== id));
          } catch (e) {
            Alert.alert('Hata', 'Silme basarisiz.');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.routeCard, { backgroundColor: theme.bgCard, shadowColor: theme.textPrimary }]}>
            <View style={styles.routeInfo}>
              <Text style={[styles.routeName, { color: theme.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.routeDetail, { color: theme.textSecondary }]}>
                {item.totalDistanceKm} km | {new Date(item.createdAt).toLocaleDateString('tr-TR')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => deleteRoute(item.id)} activeOpacity={0.7}>
              <Icon name="delete" size={22} color={theme.danger} />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ padding: SPACING.lg }}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); fetchRoutes(); }}
        ListEmptyComponent={<EmptyState icon="map-marker-off" title="Kayitli rota yok." description="Planladiginiz rotalar burada gorunecektir." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  routeCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.md, borderRadius: 16, marginBottom: SPACING.sm, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  routeInfo: { flex: 1 },
  routeName: { ...TYPOGRAPHY.body, fontWeight: '600' },
  routeDetail: { ...TYPOGRAPHY.caption, marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 16 },
});
