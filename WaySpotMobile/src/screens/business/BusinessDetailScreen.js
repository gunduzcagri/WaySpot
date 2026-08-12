import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import client from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import ReviewCard from '../../components/ReviewCard';
import { useTheme } from '../../context/ThemeContext';

export default function BusinessDetailScreen({ route, navigation }) {
  const { businessId } = route.params;
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchBusiness();
    fetchReviews();
  }, [businessId]);

  const fetchBusiness = async () => {
    try {
      const res = await client.get(`/business/${businessId}`);
      setBusiness(res.data);
    } catch (e) {
      Alert.alert('Hata', 'Isletme bilgisi alinamadi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await client.get(`/businesses/${businessId}/reviews`);
      setReviews(res.data);
    } catch (e) {
      console.error('Review error:', e);
    }
  };

  if (loading || !business) return <LoadingSpinner />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: business.latitude,
          longitude: business.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude: business.latitude, longitude: business.longitude }}
          title={business.name}
        />
      </MapView>

      <View style={[styles.infoCard, { backgroundColor: theme.bgCard }]}>
        <Text style={[styles.name, { color: theme.textPrimary }]}>{business.name}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{business.description}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Icon name="star" size={20} color={theme.accent} />
            <Text style={[styles.statText, { color: theme.textPrimary }]}>
              {reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : '-'} / 5
            </Text>
          </View>
          <View style={styles.stat}>
            <Icon name="comment-text" size={20} color={theme.primary} />
            <Text style={[styles.statText, { color: theme.textPrimary }]}>{reviews.length} Yorum</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.reviewButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('AddReview', { businessId, businessName: business.name })}
        >
          <Icon name="pencil" size={18} color={theme.textInverse} />
          <Text style={[styles.reviewButtonText, { color: theme.textInverse }]}>Yorum Yap</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reviewsSection}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Yorumlar</Text>
        {reviews.length === 0 ? (
          <Text style={[styles.noReviews, { color: theme.textMuted }]}>Heniz yorum yapilmamis.</Text>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: 250 },
  infoCard: { margin: 16, padding: 20, borderRadius: 16, elevation: 3 },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  statsRow: { flexDirection: 'row', marginBottom: 16, gap: 20 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 14, fontWeight: '500' },
  reviewButton: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 14, borderRadius: 12, gap: 8,
  },
  reviewButtonText: { fontSize: 16, fontWeight: '600' },
  reviewsSection: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  noReviews: { fontSize: 14, textAlign: 'center', marginTop: 20 },
});
