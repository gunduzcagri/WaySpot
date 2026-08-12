## MOBIL ASAMA 4: KESFET EKRANI (DINAMIK YARICAP)

### M.14 - PostCard Bileseni

**Dosya:** `WaySpotMobile/src/components/PostCard.js`
```javascript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../utils/constants';

export default function PostCard({ post, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.content}>
        <Text style={styles.businessName}>{post.business.name}</Text>
        <Text style={styles.text} numberOfLines={3}>{post.content}</Text>
        <View style={styles.footer}>
          <View style={styles.badge}>
            <Icon name="map-marker-radius" size={14} color={COLORS.primary} />
            <Text style={styles.badgeText}>{post.targetRadiusKm} km</Text>
          </View>
          <Text style={styles.date}>
            {new Date(post.createdAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white, borderRadius: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 160 },
  content: { padding: 16 },
  businessName: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 6 },
  text: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, color: COLORS.primary, marginLeft: 4, fontWeight: '500' },
  date: { fontSize: 12, color: '#9CA3AF' },
});
```

---

### M.15 - Discover Screen

**Talimat:** Kullanici konumuna gore /api/discover endpoint'ine istek at. Liste gorunumu. Pull-to-refresh.

**Dosya:** `WaySpotMobile/src/screens/discover/DiscoverScreen.js`
```javascript
import React, { useState, useCallback } from 'react';
import {
  View, FlatList, RefreshControl, StyleSheet, Text, Alert,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import client from '../../api/client';
import PostCard from '../../components/PostCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS } from '../../utils/constants';

export default function DiscoverScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [appliedRadius, setAppliedRadius] = useState(0);
  const [message, setMessage] = useState('');

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

  useState(() => {
    fetchDiscover();
  }, []);

  if (loading && posts.length === 0) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {message ? (
        <View style={styles.header}>
          <Text style={styles.headerText}>{message}</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Yakinlarda kampanya bulunamadi.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  header: { backgroundColor: COLORS.primary, padding: 12, alignItems: 'center' },
  headerText: { color: COLORS.white, fontSize: 13, fontWeight: '500' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#9CA3AF', fontSize: 16 },
});
```

**Kabul Kriteri:** Konum aliniyor. API'den post'lar geliyor. Kartlara tiklaninca BusinessDetail aciliyor.

---

## MOBIL ASAMA 5: ISLETME DETAY & YORUM SISTEMI

### M.16 - Business Detail Screen

**Talimat:** Isletme bilgileri, harita uzerinde konum, yorumlar listesi, "Yorum Yap" butonu.

**Dosya:** `WaySpotMobile/src/screens/business/BusinessDetailScreen.js`
```javascript
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import client from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS } from '../../utils/constants';

export default function BusinessDetailScreen({ route, navigation }) {
  const { businessId } = route.params;
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <ScrollView style={styles.container}>
      {/* Harita */}
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

      {/* Bilgiler */}
      <View style={styles.infoCard}>
        <Text style={styles.name}>{business.name}</Text>
        <Text style={styles.description}>{business.description}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Icon name="star" size={20} color={COLORS.warning} />
            <Text style={styles.statText}>
              {reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : '-'} / 5
            </Text>
          </View>
          <View style={styles.stat}>
            <Icon name="comment-text" size={20} color={COLORS.primary} />
            <Text style={styles.statText}>{reviews.length} Yorum</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => navigation.navigate('AddReview', { businessId, businessName: business.name })}
        >
          <Icon name="pencil" size={18} color={COLORS.white} />
          <Text style={styles.reviewButtonText}>Yorum Yap</Text>
        </TouchableOpacity>
      </View>

      {/* Yorumlar */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Yorumlar</Text>
        {reviews.length === 0 ? (
          <Text style={styles.noReviews}>Heniz yorum yapilmamis.</Text>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>{review.username}</Text>
                <View style={styles.ratingBadge}>
                  <Icon name="star" size={14} color={COLORS.warning} />
                  <Text style={styles.ratingText}>{review.rating}</Text>
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  map: { width: '100%', height: 250 },
  infoCard: { backgroundColor: COLORS.white, margin: 16, padding: 20, borderRadius: 16, elevation: 3 },
  name: { fontSize: 22, fontWeight: 'bold', color: COLORS.dark, marginBottom: 8 },
  description: { fontSize: 15, color: '#4B5563', lineHeight: 22, marginBottom: 16 },
  statsRow: { flexDirection: 'row', marginBottom: 16, gap: 20 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 14, color: COLORS.dark, fontWeight: '500' },
  reviewButton: {
    backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 14, borderRadius: 12, gap: 8,
  },
  reviewButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  reviewsSection: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark, marginBottom: 12 },
  noReviews: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginTop: 20 },
  reviewCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: 12, marginBottom: 10, elevation: 1 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewUser: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#92400E', marginLeft: 4 },
  reviewComment: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 6 },
  reviewDate: { fontSize: 12, color: '#9CA3AF' },
});
```

**Kabul Kriteri:** Isletme detayi aciliyor. Harita uzerinde konum gosteriliyor. Yorumlar listeleniyor.

---

### M.17 - AddReview Screen (Kamera ile Foto Cekme)

**Talimat:** react-native-image-picker kullan. Foto cekme veya galeriden secme. PhotoUrl zorunlu - backend'e gondermeden once fotografi upload et (simdilik base64 veya placeholder URL). Gercek upload icin backend'e image upload endpoint'i gerekebilir.

**Dosya:** `WaySpotMobile/src/screens/review/AddReviewScreen.js`
```javascript
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import client from '../../api/client';
import { COLORS } from '../../utils/constants';

export default function AddReviewScreen({ route, navigation }) {
  const { businessId, businessName } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const takePhoto = () => {
    launchCamera({ mediaType: 'photo', quality: 0.8, includeBase64: false }, (response) => {
      if (response.assets && response.assets[0]) {
        setPhotoUri(response.assets[0].uri);
      }
    });
  };

  const pickPhoto = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.assets && response.assets[0]) {
        setPhotoUri(response.assets[0].uri);
      }
    });
  };

  const submitReview = async () => {
    if (!comment || comment.length < 10) {
      Alert.alert('Hata', 'Yorum en az 10 karakter olmali.');
      return;
    }
    if (!photoUri) {
      Alert.alert('Hata', 'Fotograf cekmek veya secmek zorunlu.');
      return;
    }

    setLoading(true);
    try {
      // NOT: Gercek uygulamada fotografi once sunucuya yukleyip URL almaniz gerekir.
      // Simdilik placeholder URL kullaniyoruz. Backend'e image upload endpoint'i eklenmeli.
      const photoUrl = photoUri; // Gecici: gercekte upload sonrasi URL olmali

      await client.post(`/businesses/${businessId}/reviews`, {
        businessId,
        rating,
        comment,
        photoUrl,
      });

      Alert.alert('Basarili', 'Yorumunuz gonderildi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Hata', error.response?.data?.message || 'Yorum gonderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{businessName}</Text>
      <Text style={styles.subtitle}>Yorumunuzu paylasin</Text>

      {/* Rating */}
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Icon
              name={star <= rating ? 'star' : 'star-outline'}
              size={36}
              color={COLORS.warning}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Comment */}
      <TextInput
        style={styles.commentInput}
        placeholder="Deneyiminizi paylasin..."
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {/* Photo */}
      <View style={styles.photoSection}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Icon name="camera" size={40} color="#9CA3AF" />
            <Text style={styles.photoPlaceholderText}>Fotograf ekleyin</Text>
          </View>
        )}

        <View style={styles.photoButtons}>
          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Icon name="camera" size={20} color={COLORS.white} />
            <Text style={styles.photoButtonText}>Kamera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.photoButton, { backgroundColor: COLORS.secondary }]} onPress={pickPhoto}>
            <Icon name="image" size={20} color={COLORS.white} />
            <Text style={styles.photoButtonText}>Galeri</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={submitReview} disabled={loading}>
        {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitText}>Gonder</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.white },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.dark },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  ratingContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  commentInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 14, fontSize: 15, minHeight: 100, backgroundColor: COLORS.light, marginBottom: 20,
  },
  photoSection: { marginBottom: 24 },
  photoPreview: { width: '100%', height: 200, borderRadius: 12, marginBottom: 12 },
  photoPlaceholder: {
    width: '100%', height: 150, borderRadius: 12, borderWidth: 2,
    borderColor: '#E5E7EB', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  photoPlaceholderText: { color: '#9CA3AF', marginTop: 8 },
  photoButtons: { flexDirection: 'row', gap: 12 },
  photoButton: {
    flex: 1, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 12, borderRadius: 12, gap: 8,
  },
  photoButtonText: { color: COLORS.white, fontWeight: '600' },
  submitButton: {
    backgroundColor: COLORS.success, padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 'auto',
  },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
```

**Kabul Kriteri:** Kamera aciliyor. Foto cekiliyor. Rating secilebiliyor. Yorum gonderiliyor (backend calisiyorsa).

---

## MOBIL ASAMA 6: ROTA PLANLAYICI

### M.18 - Route Planner Screen

**Talimat:** OSRM public API ile rota hesapla. react-native-maps Polyline ile ciz.

**Dosya:** `WaySpotMobile/src/screens/route/RoutePlannerScreen.js`
```javascript
import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet, Text, Alert, ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { COLORS } from '../../utils/constants';

export default function RoutePlannerScreen() {
  const [start, setStart] = useState('Ankara');
  const [end, setEnd] = useState('Antalya');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  const geocode = async (city) => {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
    );
    if (res.data.length === 0) throw new Error(`${city} bulunamadi`);
    return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
  };

  const calculateRoute = async () => {
    setLoading(true);
    try {
      const startCoords = await geocode(start);
      const endCoords = await geocode(end);

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`;
      const res = await axios.get(osrmUrl);

      if (res.data.routes && res.data.routes.length > 0) {
        const coords = res.data.routes[0].geometry.coordinates.map((c) => ({
          latitude: c[1],
          longitude: c[0],
        }));
        setRoute({
          coords,
          start: startCoords,
          end: endCoords,
          distance: (res.data.routes[0].distance / 1000).toFixed(1),
        });
      }
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={route ? {
          latitude: (route.start.lat + route.end.lat) / 2,
          longitude: (route.start.lng + route.end.lng) / 2,
          latitudeDelta: Math.abs(route.start.lat - route.end.lat) * 1.5,
          longitudeDelta: Math.abs(route.start.lng - route.end.lng) * 1.5,
        } : { latitude: 39.9334, longitude: 32.8597, latitudeDelta: 10, longitudeDelta: 10 }}
      >
        {route && (
          <>
            <Marker coordinate={{ latitude: route.start.lat, longitude: route.start.lng }} title="Baslangic" pinColor="green" />
            <Marker coordinate={{ latitude: route.end.lat, longitude: route.end.lng }} title="Bitis" pinColor="red" />
            <Polyline coordinates={route.coords} strokeColor={COLORS.primary} strokeWidth={4} />
          </>
        )}
      </MapView>

      <View style={styles.panel}>
        <TextInput style={styles.input} placeholder="Baslangic (sehir)" value={start} onChangeText={setStart} />
        <TextInput style={styles.input} placeholder="Bitis (sehir)" value={end} onChangeText={setEnd} />

        <TouchableOpacity style={styles.button} onPress={calculateRoute} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Rotayi Hesapla</Text>}
        </TouchableOpacity>

        {route && <Text style={styles.distance}>Mesafe: {route.distance} km</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white, padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10,
  },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, marginBottom: 10, fontSize: 15, backgroundColor: COLORS.light,
  },
  button: {
    backgroundColor: COLORS.primary, padding: 14, borderRadius: 12,
    alignItems: 'center', marginTop: 4,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  distance: { textAlign: 'center', marginTop: 12, fontSize: 16, fontWeight: '700', color: COLORS.dark },
});
```

**Kabul Kriteri:** Ankara-Antalya rotasi hesaplaniyor. Polyline harita uzerinde ciziliyor. Mesafe gosteriliyor.

---

## MOBIL ASAMA 7: BUSINESS DASHBOARD (MOBIL)

### M.19 - Business Dashboard Screen

**Dosya:** `WaySpotMobile/src/screens/business/BusinessDashboardScreen.js`
```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import client from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS } from '../../utils/constants';

export default function BusinessDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
  if (!stats) return <Text style={styles.error}>Veri yok</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Isletme Paneli</Text>

      {/* Kartlar */}
      <View style={styles.cardsRow}>
        <View style={[styles.card, { backgroundColor: '#EFF6FF' }]}>
          <Icon name="post" size={28} color={COLORS.primary} />
          <Text style={styles.cardValue}>{stats.totalPosts}</Text>
          <Text style={styles.cardLabel}>Toplam Post</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#ECFDF5' }]}>
          <Icon name="comment-text" size={28} color={COLORS.success} />
          <Text style={styles.cardValue}>{stats.totalReviews}</Text>
          <Text style={styles.cardLabel}>Yorum</Text>
        </View>
      </View>

      <View style={styles.cardsRow}>
        <View style={[styles.card, { backgroundColor: '#FEF3C7' }]}>
          <Icon name="star" size={28} color={COLORS.warning} />
          <Text style={styles.cardValue}>{stats.averageRating}</Text>
          <Text style={styles.cardLabel}>Ort. Puan</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#F3E8FF' }]}>
          <Icon name="eye" size={28} color="#7C3AED" />
          <Text style={styles.cardValue}>{stats.activePosts}</Text>
          <Text style={styles.cardLabel}>Aktif Post</Text>
        </View>
      </View>

      {/* Son Yorumlar */}
      <Text style={styles.sectionTitle}>Son Yorumlar</Text>
      {stats.recentReviews.length === 0 ? (
        <Text style={styles.empty}>Heniz yorum yok.</Text>
      ) : (
        stats.recentReviews.map((r) => (
          <View key={r.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewUser}>{r.username}</Text>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={12} color={COLORS.warning} />
                <Text style={styles.ratingText}>{r.rating}</Text>
              </View>
            </View>
            <Text style={styles.reviewComment} numberOfLines={2}>{r.comment}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light, padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark, marginBottom: 20 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', elevation: 2 },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark, marginTop: 8 },
  cardLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark, marginTop: 20, marginBottom: 12 },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 20 },
  reviewItem: { backgroundColor: COLORS.white, padding: 14, borderRadius: 12, marginBottom: 8, elevation: 1 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewUser: { fontWeight: '600', color: COLORS.dark },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#92400E', marginLeft: 4 },
  reviewComment: { fontSize: 14, color: '#4B5563' },
  error: { textAlign: 'center', marginTop: 100, color: '#9CA3AF' },
});
```

**Kabul Kriteri:** Istatistikler geliyor. Kartlar gorunuyor. Son yorumlar listeleniyor.

---

## MOBIL ASAMA 8: KULLANICI PROFILI & KAYITLI ROTALAR

### M.20 - User Profile Screen

**Dosya:** `WaySpotMobile/src/screens/profile/UserProfileScreen.js`
```javascript
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS } from '../../utils/constants';

export default function UserProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Icon name="account" size={48} color={COLORS.white} />
        </View>
        <Text style={styles.username}>{profile?.username || user?.username}</Text>
        <Text style={styles.email}>{profile?.email || user?.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{profile?.totalReviews || 0}</Text>
          <Text style={styles.statLabel}>Yorum</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{profile?.totalSavedRoutes || 0}</Text>
          <Text style={styles.statLabel}>Kayitli Rota</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
        <Icon name="pencil" size={22} color={COLORS.primary} />
        <Text style={styles.menuText}>Profili Duzenle</Text>
        <Icon name="chevron-right" size={22} color="#9CA3AF" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
        <Icon name="comment-text" size={22} color={COLORS.primary} />
        <Text style={styles.menuText}>Yorumlarim</Text>
        <Icon name="chevron-right" size={22} color="#9CA3AF" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
        <Icon name="logout" size={22} color={COLORS.danger} />
        <Text style={[styles.menuText, { color: COLORS.danger }]}>Cikis Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  header: { backgroundColor: COLORS.primary, alignItems: 'center', paddingVertical: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  username: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  statsContainer: { flexDirection: 'row', backgroundColor: COLORS.white, margin: 16, borderRadius: 16, padding: 20, elevation: 3 },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark },
  statLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    padding: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, elevation: 1,
  },
  menuText: { flex: 1, fontSize: 15, color: COLORS.dark, marginLeft: 12 },
  logoutItem: { marginTop: 20 },
});
```

---

### M.21 - Saved Routes Screen

**Dosya:** `WaySpotMobile/src/screens/profile/SavedRoutesScreen.js`
```javascript
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import client from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS } from '../../utils/constants';

export default function SavedRoutesScreen() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    <View style={styles.container}>
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.routeCard}>
            <View style={styles.routeInfo}>
              <Text style={styles.routeName}>{item.name}</Text>
              <Text style={styles.routeDetail}>
                {item.totalDistanceKm} km | {new Date(item.createdAt).toLocaleDateString('tr-TR')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => deleteRoute(item.id)}>
              <Icon name="delete" size={22} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); fetchRoutes(); }}
        ListEmptyComponent={<Text style={styles.empty}>Kayitli rota yok.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  routeCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, padding: 16, borderRadius: 12, marginBottom: 10, elevation: 2,
  },
  routeInfo: { flex: 1 },
  routeName: { fontSize: 16, fontWeight: '600', color: COLORS.dark },
  routeDetail: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 60, fontSize: 16 },
});
```

**Kabul Kriteri:** Profil bilgileri geliyor. Rotalar listeleniyor. Silme calisiyor. Cikis yapiliyor.

---

## MOBIL ASAMA 9: ADMIN PANELI (MOBIL)

### M.22 - Admin Dashboard Screen

**Talimat:** Sadece Admin rolu gorebilir. Istatistik kartlari + hizli erisim menu.

**Dosya:** `WaySpotMobile/src/screens/admin/AdminDashboardScreen.js`
```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import client from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS } from '../../utils/constants';

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Admin Paneli</Text>

      <View style={styles.grid}>
        <View style={[styles.gridItem, { backgroundColor: '#EFF6FF' }]}>
          <Icon name="account-group" size={28} color={COLORS.primary} />
          <Text style={styles.gridValue}>{stats?.totalUsers}</Text>
          <Text style={styles.gridLabel}>Kullanici</Text>
        </View>
        <View style={[styles.gridItem, { backgroundColor: '#ECFDF5' }]}>
          <Icon name="store" size={28} color={COLORS.success} />
          <Text style={styles.gridValue}>{stats?.totalBusinesses}</Text>
          <Text style={styles.gridLabel}>Isletme</Text>
        </View>
        <View style={[styles.gridItem, { backgroundColor: '#FEF3C7' }]}>
          <Icon name="post" size={28} color={COLORS.warning} />
          <Text style={styles.gridValue}>{stats?.totalPosts}</Text>
          <Text style={styles.gridLabel}>Post</Text>
        </View>
        <View style={[styles.gridItem, { backgroundColor: '#FEE2E2' }]}>
          <Icon name="comment-alert" size={28} color={COLORS.danger} />
          <Text style={styles.gridValue}>{stats?.pendingReviews}</Text>
          <Text style={styles.gridLabel}>Bekleyen</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Hizli Erisim</Text>
      <TouchableOpacity style={styles.menuItem}>
        <Icon name="account-group" size={22} color={COLORS.primary} />
        <Text style={styles.menuText}>Kullanicilari Yonet</Text>
        <Icon name="chevron-right" size={22} color="#9CA3AF" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem}>
        <Icon name="store" size={22} color={COLORS.primary} />
        <Text style={styles.menuText}>Isletmeleri Yonet</Text>
        <Icon name="chevron-right" size={22} color="#9CA3AF" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem}>
        <Icon name="comment-check" size={22} color={COLORS.primary} />
        <Text style={styles.menuText}>Yorum Moderasyonu</Text>
        <Icon name="chevron-right" size={22} color="#9CA3AF" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light, padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  gridItem: { width: '47%', padding: 16, borderRadius: 16, alignItems: 'center', elevation: 2 },
  gridValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark, marginTop: 8 },
  gridLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark, marginBottom: 12 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    padding: 16, marginBottom: 8, borderRadius: 12, elevation: 1,
  },
  menuText: { flex: 1, fontSize: 15, color: COLORS.dark, marginLeft: 12 },
});
```

**Kabul Kriteri:** Admin token ile istatistikler geliyor. User/Business token ile 403 donuyor.

---

## MOBIL ASAMA 10: BUILD & DEPLOY

### M.23 - Android Build

**Talimat:** Release APK olustur.

```bash
cd WaySpotMobile/android
./gradlew assembleRelease
```

**Cikti:** `android/app/build/outputs/apk/release/app-release.apk`

**Test:** Telefona yukle ve test et.
```bash
adb install app/build/outputs/apk/release/app-release.apk
```

---

### M.24 - iOS Build (Mac Gerekli)

```bash
cd WaySpotMobile/ios
pod install
cd ..
npx react-native run-ios --configuration Release
```

---

### M.25 - Mobil Test Kontrol Listesi

- [ ] Uygulama aciliyor
- [ ] Login ekrani calisiyor
- [ ] Register (User ve Business) calisiyor
- [ ] Tab navigator dogru rol'e gore gosteriliyor
- [ ] Harita aciliyor ve konum aliniyor
- [ ] Kesfet ekrani post'lari listeliyor
- [ ] Business detay aciliyor, harita ve yorumlar gorunuyor
- [ ] Yorum yapma: Kamera aciliyor, foto cekiliyor, gonderiliyor
- [ ] Rota planlayici calisiyor, polyline ciziliyor
- [ ] Business Dashboard istatistikleri geliyor
- [ ] Profil ekrani bilgileri gosteriyor
- [ ] Kayitli rotalar listeleniyor ve silinebiliyor
- [ ] Admin paneli sadece Admin rolu ile aciliyor
- [ ] Cikis yapiliyor ve login ekranina donuluyor

**Kabul Kriteri:** Tum maddeler test edildi ve calisiyor.
