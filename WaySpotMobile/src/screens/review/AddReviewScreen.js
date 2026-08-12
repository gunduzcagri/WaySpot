import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import client from '../../api/client';
import { useTheme } from '../../context/ThemeContext';

export default function AddReviewScreen({ route, navigation }) {
  const { businessId, businessName } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

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
      const photoUrl = photoUri;

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
    <View style={[styles.container, { backgroundColor: theme.bgCard }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{businessName}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Yorumunuzu paylasin</Text>

      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Icon
              name={star <= rating ? 'star' : 'star-outline'}
              size={36}
              color={theme.accent}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.commentInput, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
        placeholder="Deneyiminizi paylasin..."
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        placeholderTextColor={theme.textMuted}
      />

      <View style={styles.photoSection}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          <View style={[styles.photoPlaceholder, { borderColor: theme.border }]}>
            <Icon name="camera" size={40} color={theme.textMuted} />
            <Text style={[styles.photoPlaceholderText, { color: theme.textMuted }]}>Fotograf ekleyin</Text>
          </View>
        )}

        <View style={styles.photoButtons}>
          <TouchableOpacity style={[styles.photoButton, { backgroundColor: theme.primary }]} onPress={takePhoto}>
            <Icon name="camera" size={20} color={theme.textInverse} />
            <Text style={[styles.photoButtonText, { color: theme.textInverse }]}>Kamera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.photoButton, { backgroundColor: theme.secondary }]} onPress={pickPhoto}>
            <Icon name="image" size={20} color={theme.textInverse} />
            <Text style={[styles.photoButtonText, { color: theme.textInverse }]}>Galeri</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.success }]} onPress={submitReview} disabled={loading}>
        {loading ? <ActivityIndicator color={theme.textInverse} /> : <Text style={[styles.submitText, { color: theme.textInverse }]}>Gonder</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  ratingContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  commentInput: {
    borderWidth: 1, borderRadius: 12,
    padding: 14, fontSize: 15, minHeight: 100, marginBottom: 20,
  },
  photoSection: { marginBottom: 24 },
  photoPreview: { width: '100%', height: 200, borderRadius: 12, marginBottom: 12 },
  photoPlaceholder: {
    width: '100%', height: 150, borderRadius: 12, borderWidth: 2,
    borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  photoPlaceholderText: { marginTop: 8 },
  photoButtons: { flexDirection: 'row', gap: 12 },
  photoButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 12, borderRadius: 12, gap: 8,
  },
  photoButtonText: { fontWeight: '600' },
  submitButton: {
    padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 'auto',
  },
  submitText: { fontSize: 16, fontWeight: '700' },
});
