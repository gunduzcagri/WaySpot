import React, { useState, useCallback, useEffect } from 'react';
import {
  View, FlatList, RefreshControl, StyleSheet, Text, Alert,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import client from '../../api/client';
import PostCard from '../../components/PostCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';

export default function DiscoverScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [appliedRadius, setAppliedRadius] = useState(0);
  const [message, setMessage] = useState('');
  const theme = useTheme();

  const fetchDiscover = async () => {
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, timeout: 15000, maximumAge: 10000,
        });
      });

      const { latitude, longitude } = position.coords;
      const response = await client.get(`/discover?latitude=${latitude}&longitude=${longitude}`);

      setPosts(response.data.posts);
      setAppliedRadius(response.data.appliedRadiusKm);
      setMessage(response.data.message);
    } catch (error) {
      Alert.alert('Hata', 'Kesif verileri alinamadi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDiscover();
  }, []);

  useEffect(() => {
    fetchDiscover();
  }, []);

  if (loading && posts.length === 0) return <LoadingSpinner />;

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPage }]}>
      {message ? (
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={[styles.headerText, { color: theme.textInverse }]}>{message}</Text>
        </View>
      ) : null}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => navigation.navigate('BusinessDetail', { businessId: item.business.id })}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>Yakinlarda kampanya bulunamadi.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 12, alignItems: 'center' },
  headerText: { fontSize: 13, fontWeight: '500' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16 },
});
