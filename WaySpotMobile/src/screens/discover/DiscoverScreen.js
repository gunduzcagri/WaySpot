import React, { useState, useCallback, useEffect } from 'react';
import {
  View, FlatList, RefreshControl, StyleSheet, Text, Alert,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import client from '../../api/client';
import PostCard from '../../components/PostCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../utils/constants';

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

  if (loading && posts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bgPage }]}>
        {message ? (
          <View style={[styles.header, { backgroundColor: theme.primary }]}>
            <Text style={[styles.headerText, { color: theme.textInverse }]}>{message}</Text>
          </View>
        ) : null}
        <View style={{ padding: SPACING.lg }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ marginBottom: SPACING.md }}>
              <Skeleton width="100%" height={180} />
              <View style={{ padding: SPACING.md }}>
                <Skeleton width="60%" height={20} />
                <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
                <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

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
        contentContainerStyle={{ padding: SPACING.lg }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="compass-off"
            title="Yakinlarda kampanya bulunamadi"
            description="Yeni isletmeler eklenince burada gorunecektir."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: SPACING.md, alignItems: 'center' },
  headerText: { ...TYPOGRAPHY.caption },
});
