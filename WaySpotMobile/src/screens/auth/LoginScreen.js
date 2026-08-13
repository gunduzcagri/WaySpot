import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../utils/constants';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const theme = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve sifre zorunlu.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Hata', error.response?.data?.message || 'Giris basarisiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgCard }]}>
      <Text style={[styles.title, { color: theme.primary }]}>WaySpot</Text>
      <Text style={[styles.subtitle, { color: theme.textPrimary }]}>Giris Yap</Text>

      <TextInput
        style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={theme.textMuted}
        accessibilityLabel="E-posta"
        accessibilityHint="E-posta adresinizi girin"
      />
      <View style={styles.passwordWrapper}>
        <TextInput
          style={[styles.input, styles.passwordInput, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Sifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor={theme.textMuted}
          accessibilityLabel="Şifre"
          accessibilityHint="Şifrenizi girin"
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)} accessibilityRole="button" accessibilityLabel="Şifreyi Göster">
          <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleLogin} disabled={loading} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Giriş Yap">
        {loading ? (
          <ActivityIndicator color={theme.textInverse} />
        ) : (
          <Text style={[styles.buttonText, { color: theme.textInverse }]}>Giris Yap</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Kayıt Ol Sayfasına Git">
        <Text style={[styles.link, { color: theme.primary }]}>Hesabiniz yok mu? Kayit olun</Text>
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
  passwordWrapper: { position: 'relative' },
  passwordInput: { paddingRight: 56 },
  eyeIcon: { position: 'absolute', right: SPACING.lg, top: 0, bottom: 0, justifyContent: 'center', width: 56, alignItems: 'center' },
  button: {
    height: 56, paddingHorizontal: SPACING.lg, borderRadius: 16,
    alignItems: 'center', marginTop: 8, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', marginTop: SPACING.lg, fontSize: 14 },
});
