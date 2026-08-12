import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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

      <TextInput style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]} placeholder="Kullanici Adi" value={username} onChangeText={setUsername} placeholderTextColor={theme.textMuted} />
      <TextInput style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]} placeholder="E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={theme.textMuted} />
      <TextInput style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]} placeholder="Sifre" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={theme.textMuted} />

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === 1 && { backgroundColor: theme.primary, borderColor: theme.primary }]}
          onPress={() => setRole(1)}
        >
          <Text style={[styles.roleText, role === 1 && { color: theme.textInverse, fontWeight: '600' }, { color: theme.textPrimary }]}>Yolcu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === 2 && { backgroundColor: theme.primary, borderColor: theme.primary }]}
          onPress={() => setRole(2)}
        >
          <Text style={[styles.roleText, role === 2 && { color: theme.textInverse, fontWeight: '600' }, { color: theme.textPrimary }]}>Isletme</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color={theme.textInverse} /> : <Text style={[styles.buttonText, { color: theme.textInverse }]}>Kayit Ol</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.link, { color: theme.primary }]}>Zaten hesabiniz var mi? Giris yapin</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 32 },
  input: {
    borderWidth: 1, borderRadius: 12,
    padding: 14, marginBottom: 16, fontSize: 16,
  },
  roleContainer: { flexDirection: 'row', marginBottom: 16, gap: 12 },
  roleButton: {
    flex: 1, padding: 14, borderRadius: 12, borderWidth: 1,
    alignItems: 'center',
  },
  roleText: { fontSize: 14 },
  button: {
    padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 8,
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', marginTop: 20, fontSize: 14 },
});
