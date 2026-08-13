import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../utils/constants';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(1);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const theme = useTheme();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Hata', 'Tum alanlar zorunlu.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Sifre en az 6 karakter olmali.');
      return;
    }
    setLoading(true);
    try {
      await register(username, email, password, role);
    } catch (error) {
      Alert.alert('Hata', error.response?.data?.message || 'Kayit basarisiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgCard }]}>
      <Text style={[styles.title, { color: theme.primary }]}>WaySpot</Text>
      <Text style={[styles.subtitle, { color: theme.textPrimary }]}>Kayit Ol</Text>

      <TextInput style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]} placeholder="Kullanici Adi" value={username} onChangeText={setUsername} placeholderTextColor={theme.textMuted} accessibilityLabel="Kullanıcı Adı" accessibilityHint="Kullanıcı adınızı girin" />
      <TextInput style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]} placeholder="E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={theme.textMuted} accessibilityLabel="E-posta" accessibilityHint="E-posta adresinizi girin" />
      <TextInput style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]} placeholder="Sifre" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={theme.textMuted} accessibilityLabel="Şifre" accessibilityHint="Şifrenizi girin" />

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === 1 && { backgroundColor: theme.primary, borderColor: theme.primary }]}
          onPress={() => setRole(1)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Yolcu Rolü Seç"
        >
          <Text style={[styles.roleText, role === 1 && { color: theme.textInverse, fontWeight: '600' }, { color: theme.textPrimary }]}>Yolcu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === 2 && { backgroundColor: theme.primary, borderColor: theme.primary }]}
          onPress={() => setRole(2)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="İşletme Rolü Seç"
        >
          <Text style={[styles.roleText, role === 2 && { color: theme.textInverse, fontWeight: '600' }, { color: theme.textPrimary }]}>Isletme</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleRegister} disabled={loading} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Kayıt Ol">
        {loading ? <ActivityIndicator color={theme.textInverse} /> : <Text style={[styles.buttonText, { color: theme.textInverse }]}>Kayit Ol</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Giriş Yap Sayfasına Git">
        <Text style={[styles.link, { color: theme.primary }]}>Zaten hesabiniz var mi? Giris yapin</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: SPACING.lg },
  title: { ...TYPOGRAPHY.display, textAlign: 'center', marginBottom: 8 },
  subtitle: { ...TYPOGRAPHY.bodyLarge, textAlign: 'center', marginBottom: SPACING.xl },
  input: {
    height: 56, paddingHorizontal: SPACING.lg, borderRadius: 16,
    borderWidth: 1, marginBottom: SPACING.md, fontSize: 16,
  },
  roleContainer: { flexDirection: 'row', marginBottom: SPACING.md, gap: SPACING.sm },
  roleButton: {
    flex: 1, height: 56, paddingHorizontal: SPACING.lg, borderRadius: 16, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  roleText: { fontSize: 14, fontWeight: '500' },
  button: {
    height: 56, paddingHorizontal: SPACING.lg, borderRadius: 16,
    alignItems: 'center', marginTop: 8, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', marginTop: SPACING.lg, fontSize: 14 },
});
