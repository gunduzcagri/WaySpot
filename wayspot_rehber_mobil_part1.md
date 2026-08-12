## MOBIL ASAMA 1: REACT NATIVE KURULUM & TEMEL YAPI

### M.0 - Kabul Kriteri (On Kosul)
- [ ] Node.js 18+ kurulu.
- [ ] Backend (localhost:5000) calisiyor.
- [ ] Android Studio (Android) veya Xcode (iOS) kurulu.
- [ ] Telefon veya emulatore erisim var.

**Teknoloji Stack (Degistirilemez):**
- React Native (CLI, Expo degil - native modul esnekligi icin)
- react-native-maps (Google Maps / Apple Maps)
- react-navigation (Stack + Tab + Drawer)
- axios (API istekleri - web ile ayni)
- @react-native-async-storage/async-storage (Token saklama)
- react-native-geolocation-service (Konum)
- react-native-image-picker (Kamera + Galeri - Review fotografi)
- react-native-vector-icons (Ikonlar)

---

### M.1 - React Native Projesi Olusturma

**Talimat:** Sadece bu komutlari calistir. Proje adi `WaySpotMobile` olmali.

```bash
npx react-native@latest init WaySpotMobile --version 0.74.0
cd WaySpotMobile
```

**Kabul Kriteri:** `npx react-native run-android` (veya `run-ios`) calisiyor ve default ekran aciliyor.

---

### M.2 - Gerekli Paketlerin Yuklenmesi

**Talimat:** Sadece bu paketleri yukle. Baska paket onerme.

```bash
cd WaySpotMobile

# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @react-navigation/drawer
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# Harita & Konum
npm install react-native-maps
npm install react-native-geolocation-service

# API & Storage
npm install axios
npm install @react-native-async-storage/async-storage

# Kamera & Image Picker
npm install react-native-image-picker

# Ikonlar
npm install react-native-vector-icons

# Yardimci
npm install react-native-permissions
```

**Android Izinleri:** `android/app/src/main/AndroidManifest.xml` icine ekle (mevcut izinlerin altina):
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

**iOS Izinleri:** `ios/WaySpotMobile/Info.plist` icine ekle:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Konumunuzu haritada gostermek ve cevrenizdeki isletmeleri bulmak icin kullanilir.</string>
<key>NSCameraUsageDescription</key>
<string>Yorum fotografi cekmek icin kamera erisimi gerekli.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Yorum fotografi secmek icin galeri erisimi gerekli.</string>
```

**Kabul Kriteri:** `cd android && ./gradlew clean && cd .. && npx react-native run-android` hatasiz calisiyor.

---

### M.3 - Klasor Yapisi

**Talimat:** Asagidaki klasor yapisini olustur. Baska klasor ekleme.

```
WaySpotMobile/
├── src/
│   ├── api/
│   │   └── client.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── MainNavigator.js
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── map/
│   │   │   └── MapScreen.js
│   │   ├── discover/
│   │   │   └── DiscoverScreen.js
│   │   ├── business/
│   │   │   ├── BusinessDetailScreen.js
│   │   │   └── BusinessDashboardScreen.js
│   │   ├── review/
│   │   │   └── AddReviewScreen.js
│   │   ├── route/
│   │   │   └── RoutePlannerScreen.js
│   │   ├── profile/
│   │   │   ├── UserProfileScreen.js
│   │   │   └── SavedRoutesScreen.js
│   │   └── admin/
│   │       └── AdminDashboardScreen.js
│   ├── components/
│   │   ├── MapMarker.js
│   │   ├── PostCard.js
│   │   ├── ReviewCard.js
│   │   └── LoadingSpinner.js
│   └── utils/
│       └── constants.js
├── App.js
└── package.json
```

**Kabul Kriteri:** Klasorler olusmus.

---

### M.4 - API Client & Constants

**Talimat:** Backend adresi ve axios instance'i olustur. Her istekte token otomatik eklensin.

**Dosya:** `WaySpotMobile/src/utils/constants.js`
```javascript
export const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulatore icin localhost
// Gercek cihaz icin: 'http://BILGISAYAR_IP:5000/api'
// iOS simulatore icin: 'http://localhost:5000/api'

export const COLORS = {
  primary: '#2563EB',
  secondary: '#1E40AF',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  dark: '#1F2937',
  light: '#F3F4F6',
  white: '#FFFFFF',
};
```

**Dosya:** `WaySpotMobile/src/api/client.js`
```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token ekleme
client.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - 401 handling
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

export default client;
```

**Kabul Kriteri:** Hatasiz. `client.get('/discover?latitude=...')` calisabilmeli.

---

## MOBIL ASAMA 2: KIMLIK DOGRULAMA (AUTH CONTEXT + EKRANLAR)

### M.5 - Auth Context (Global State)

**Talimat:** Context API kullan. Sadece login/register/logout/token yonetimi.

**Dosya:** `WaySpotMobile/src/context/AuthContext.js`
```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.error('Auth check error:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await client.post('/auth/login', { email, password });
    const { token, ...userData } = response.data;
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (username, email, password, role) => {
    const response = await client.post('/auth/register', {
      username,
      email,
      password,
      role,
    });
    const { token, ...userData } = response.data;
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

**Kabul Kriteri:** Hatasiz. Context dogru sekilde export ediliyor.

---

### M.6 - Auth Navigator

**Dosya:** `WaySpotMobile/src/navigation/AuthNavigator.js`
```javascript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
```

---

### M.7 - Login Screen

**Dosya:** `WaySpotMobile/src/screens/auth/LoginScreen.js`
```javascript
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
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/constants';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

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
    <View style={styles.container}>
      <Text style={styles.title}>WaySpot</Text>
      <Text style={styles.subtitle}>Giris Yap</Text>

      <TextInput
        style={styles.input}
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Sifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Giris Yap</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Hesabiniz yok mu? Kayit olun</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: COLORS.white },
  title: { fontSize: 36, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 18, color: COLORS.dark, textAlign: 'center', marginBottom: 32 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 14, marginBottom: 16, fontSize: 16, backgroundColor: COLORS.light,
  },
  button: {
    backgroundColor: COLORS.primary, padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  link: { color: COLORS.primary, textAlign: 'center', marginTop: 20, fontSize: 14 },
});
```

---

### M.8 - Register Screen

**Dosya:** `WaySpotMobile/src/screens/auth/RegisterScreen.js`
```javascript
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/constants';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(1); // 1=User, 2=Business
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

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
    <View style={styles.container}>
      <Text style={styles.title}>WaySpot</Text>
      <Text style={styles.subtitle}>Kayit Ol</Text>

      <TextInput style={styles.input} placeholder="Kullanici Adi" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Sifre" value={password} onChangeText={setPassword} secureTextEntry />

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === 1 && styles.roleButtonActive]}
          onPress={() => setRole(1)}
        >
          <Text style={[styles.roleText, role === 1 && styles.roleTextActive]}>Yolcu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === 2 && styles.roleButtonActive]}
          onPress={() => setRole(2)}
        >
          <Text style={[styles.roleText, role === 2 && styles.roleTextActive]}>Isletme</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Kayit Ol</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Zaten hesabiniz var mi? Giris yapin</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: COLORS.white },
  title: { fontSize: 36, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 18, color: COLORS.dark, textAlign: 'center', marginBottom: 32 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 14, marginBottom: 16, fontSize: 16, backgroundColor: COLORS.light,
  },
  roleContainer: { flexDirection: 'row', marginBottom: 16, gap: 12 },
  roleButton: {
    flex: 1, padding: 14, borderRadius: 12, borderWidth: 1,
    borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: COLORS.light,
  },
  roleButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleText: { fontSize: 14, color: COLORS.dark },
  roleTextActive: { color: COLORS.white, fontWeight: '600' },
  button: {
    backgroundColor: COLORS.primary, padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  link: { color: COLORS.primary, textAlign: 'center', marginTop: 20, fontSize: 14 },
});
```

**Kabul Kriteri:** Login ve Register ekranlari calisiyor. Token AsyncStorage'e kaydediliyor.

---

## MOBIL ASAMA 3: ANA NAVIGASYON & HARITA EKRANI

### M.9 - Bottom Tab Navigator

**Talimat:** 4 ana tab: Harita, Kesfet, Rotalar, Profil. Rol'e gore Business Dashboard tab'i da eklenebilir.

**Dosya:** `WaySpotMobile/src/navigation/MainNavigator.js`
```javascript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapScreen from '../screens/map/MapScreen';
import DiscoverScreen from '../screens/discover/DiscoverScreen';
import SavedRoutesScreen from '../screens/profile/SavedRoutesScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';
import BusinessDashboardScreen from '../screens/business/BusinessDashboardScreen';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { user } = useAuth();
  const isBusiness = user?.role === 2;
  const isAdmin = user?.role === 3;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Harita') iconName = 'map';
          else if (route.name === 'Kesfet') iconName = 'compass';
          else if (route.name === 'Rotalar') iconName = 'routes';
          else if (route.name === 'Panel') iconName = 'store';
          else if (route.name === 'Profil') iconName = 'account';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Harita" component={MapScreen} />
      <Tab.Screen name="Kesfet" component={DiscoverScreen} />
      <Tab.Screen name="Rotalar" component={SavedRoutesScreen} />
      {isBusiness && <Tab.Screen name="Panel" component={BusinessDashboardScreen} />}
      <Tab.Screen name="Profil" component={UserProfileScreen} />
    </Tab.Navigator>
  );
}
```

---

### M.10 - App Navigator (Root)

**Dosya:** `WaySpotMobile/src/navigation/AppNavigator.js`
```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import BusinessDetailScreen from '../screens/business/BusinessDetailScreen';
import AddReviewScreen from '../screens/review/AddReviewScreen';
import RoutePlannerScreen from '../screens/route/RoutePlannerScreen';
import LoadingSpinner from '../components/LoadingSpinner';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen name="BusinessDetail" component={BusinessDetailScreen} options={{ headerShown: true, title: 'Isletme Detayi' }} />
            <Stack.Screen name="AddReview" component={AddReviewScreen} options={{ headerShown: true, title: 'Yorum Yap' }} />
            <Stack.Screen name="RoutePlanner" component={RoutePlannerScreen} options={{ headerShown: true, title: 'Rota Planla' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

### M.11 - App.js (Giris Noktasi)

**Dosya:** `WaySpotMobile/App.js` (TAMAMEN DEGISTIR)
```javascript
import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/utils/constants';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <AppNavigator />
    </AuthProvider>
  );
}
```

**Kabul Kriteri:** Uygulama aciliyor. Login ekrani gorunuyor. Basarili giris sonrasi Tab Navigator aciliyor.

---

### M.12 - Loading Spinner Bileseni

**Dosya:** `WaySpotMobile/src/components/LoadingSpinner.js`
```javascript
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
});
```

---

### M.13 - Map Screen (Tam Sayfa Harita + Konum)

**Talimat:** react-native-maps kullan. Kullanici konumunu al ve marker ile goster. Izin iste.

**Dosya:** `WaySpotMobile/src/screens/map/MapScreen.js`
```javascript
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../utils/constants';

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 39.9334,
    longitude: 32.8597,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Konum Izni',
          message: 'Haritada konumunuzu gostermek icin izin gerekli.',
          buttonNeutral: 'Sonra Sor',
          buttonNegative: 'Iptal',
          buttonPositive: 'Tamam',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {location && (
          <Marker coordinate={location} title="Konumunuz" pinColor={COLORS.primary} />
        )}
      </MapView>

      <TouchableOpacity style={styles.locateButton} onPress={getCurrentLocation}>
        <Icon name="crosshairs-gps" size={24} color={COLORS.white} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.routeButton} onPress={() => navigation.navigate('RoutePlanner')}>
        <Icon name="routes" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  locateButton: {
    position: 'absolute', bottom: 100, right: 16,
    backgroundColor: COLORS.primary, width: 50, height: 50,
    borderRadius: 25, justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3.84,
  },
  routeButton: {
    position: 'absolute', bottom: 32, right: 16,
    backgroundColor: COLORS.secondary, width: 50, height: 50,
    borderRadius: 25, justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3.84,
  },
});
```

**Kabul Kriteri:** Harita aciliyor. Konum izni isteniyor. Mevcut konumda marker beliriyor. Konum dugmesi calisiyor.
