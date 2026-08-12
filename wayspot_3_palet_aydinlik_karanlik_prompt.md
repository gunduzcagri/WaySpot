# WaySpot — 3. Palet (Göl ve Gökyüzü) Aydınlık & Karanlık Mod Renk Promptu

**Kural:** WaySpot projesinde TÜM ekranlar hem aydınlık hem karanlık modda çalışacak. Renkler sadece aşağıdaki 3. Palet'e göre kullanılacak. Başka renk kullanılmayacak.

---

## 1. Palet Tanımı (3. Palet — Göl ve Gökyüzü)

### Aydınlık Mod (Light)

| Rol | Hex | Kullanım |
|---|---|---|
| **Primary** | `#2A6B6B` | Ana butonlar, aktif tab, header, harita marker’ları |
| **Primary Hover** | `#236060` | Buton hover/active durumları |
| **Secondary** | `#4A9B9B` | İkincil butonlar, linkler, border’lar, ikonlar |
| **Secondary Hover** | `#3D8585` | Hover durumları |
| **Accent** | `#E07A5F` | Vurgu, kampanya badge’leri, rating yıldızları, bildirimler |
| **Accent Hover** | `#D46A4F` | Hover durumları |
| **Light Teal** | `#87C4C4` | Kart vurguları, divider, hafif arka planlar |
| **Surface** | `#E8F4F4` | Sayfa arka planı, input arka planları |
| **Surface Dark** | `#D4E8E8` | Kart border’ları, ayrıcı çizgiler |
| **Navy** | `#1E3A4C` | Ana metin, başlıklar, ikonlar (koyu) |
| **Navy Light** | `#2A5068` | İkincil başlıklar |
| **White** | `#FFFFFF` | Kart yüzeyleri, buton üstü metin, modal içi |
| **Muted** | `#6B8A8A` | Placeholder, ikincil metin, tarih bilgileri |
| **Muted Light** | `#9BB5B5` | En hafif metin, disabled durumlar |
| **Danger** | `#C44536` | Hata mesajları, silme butonları, reject işlemleri |
| **Danger Light** | `rgba(196,69,54,0.1)` | Hata arka planları |
| **Success** | `#3D8B7A` | Başarı mesajları, onaylı durumlar, approve işlemleri |
| **Success Light** | `rgba(61,139,122,0.1)` | Başarı arka planları |

### Karanlık Mod (Dark) — 3. Palete Uyumlu

| Rol | Hex | Kullanım |
|---|---|---|
| **Background** | `#0B1922` | Sayfa arka planı (en koyu) |
| **Surface** | `#132B3A` | Kart arka planları, input arka planları |
| **Elevated** | `#1E3A4C` | Üst seviye kartlar, modal arka planları, border’lar |
| **Primary** | `#87C4C4` | Ana butonlar (aydınlıktaki Light Teal → karanlıkta primary) |
| **Primary Hover** | `#6BB0B0` | Buton hover/active |
| **Secondary** | `#4A9B9B` | İkincil butonlar, linkler (aynı kalır, metin beyaz) |
| **Secondary Hover** | `#5AADAD` | Hover durumları |
| **Accent** | `#E07A5F` | Vurgu (aydınlıkla aynı, koyu zeminde daha parlak) |
| **Accent Hover** | `#F08A6F` | Hover durumları |
| **Text Primary** | `#E8F4F4` | Ana metin, başlıklar (aydınlıktaki Surface rengi) |
| **Text Secondary** | `#9BC4C4` | İkincil metin, açıklamalar |
| **Text Muted** | `#6B9B9B` | Placeholder, en hafif metin |
| **White** | `#FFFFFF` | Nadiren kullanılır, genellikle Text Primary yeterli |
| **Danger** | `#D65A4A` | Hata (aydınlıktan biraz daha parlak) |
| **Success** | `#4AA88A` | Başarı (aydınlıktan biraz daha parlak) |
| **Shadow** | `rgba(0,0,0,0.4)` | Karanlık mod gölgeleri |

---

## 2. Web (React + CSS) — İki Mod Bir Arada

**Dosya:** `frontend/src/styles/theme.css`
```css
:root {
  /* === AYDINLIK MOD (Varsayılan) === */
  --bg-page: #E8F4F4;
  --bg-card: #FFFFFF;
  --bg-input: #E8F4F4;
  --bg-modal: #FFFFFF;
  --bg-overlay: rgba(30, 58, 76, 0.5);

  --primary: #2A6B6B;
  --primary-hover: #236060;
  --primary-light: rgba(42, 107, 107, 0.1);
  --primary-text: #FFFFFF;

  --secondary: #4A9B9B;
  --secondary-hover: #3D8585;
  --secondary-light: rgba(74, 155, 155, 0.1);
  --secondary-text: #FFFFFF;

  --accent: #E07A5F;
  --accent-hover: #D46A4F;
  --accent-light: rgba(224, 122, 95, 0.1);
  --accent-text: #FFFFFF;

  --light-teal: #87C4C4;
  --light-teal-soft: rgba(135, 196, 196, 0.15);

  --surface: #E8F4F4;
  --surface-dark: #D4E8E8;

  --navy: #1E3A4C;
  --navy-light: #2A5068;

  --text-primary: #1E3A4C;
  --text-secondary: #6B8A8A;
  --text-muted: #9BB5B5;
  --text-inverse: #FFFFFF;

  --danger: #C44536;
  --danger-light: rgba(196, 69, 54, 0.1);
  --success: #3D8B7A;
  --success-light: rgba(61, 139, 122, 0.1);

  --border: #D4E8E8;
  --border-focus: #2A6B6B;

  --shadow-soft: 0 4px 20px rgba(30, 58, 76, 0.08);
  --shadow-medium: 0 8px 30px rgba(30, 58, 76, 0.12);
  --shadow-strong: 0 12px 40px rgba(30, 58, 76, 0.16);
}

/* === KARANLIK MOD === */
[data-theme="dark"] {
  --bg-page: #0B1922;
  --bg-card: #132B3A;
  --bg-input: #132B3A;
  --bg-modal: #1E3A4C;
  --bg-overlay: rgba(0, 0, 0, 0.6);

  --primary: #87C4C4;
  --primary-hover: #6BB0B0;
  --primary-light: rgba(135, 196, 196, 0.15);
  --primary-text: #0B1922;

  --secondary: #4A9B9B;
  --secondary-hover: #5AADAD;
  --secondary-light: rgba(74, 155, 155, 0.15);
  --secondary-text: #FFFFFF;

  --accent: #E07A5F;
  --accent-hover: #F08A6F;
  --accent-light: rgba(224, 122, 95, 0.15);
  --accent-text: #0B1922;

  --light-teal: #4A9B9B;
  --light-teal-soft: rgba(74, 155, 155, 0.2);

  --surface: #132B3A;
  --surface-dark: #1E3A4C;

  --navy: #E8F4F4;
  --navy-light: #9BC4C4;

  --text-primary: #E8F4F4;
  --text-secondary: #9BC4C4;
  --text-muted: #6B9B9B;
  --text-inverse: #0B1922;

  --danger: #D65A4A;
  --danger-light: rgba(214, 90, 74, 0.15);
  --success: #4AA88A;
  --success-light: rgba(74, 168, 138, 0.15);

  --border: #1E3A4C;
  --border-focus: #87C4C4;

  --shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.3);
  --shadow-medium: 0 8px 30px rgba(0, 0, 0, 0.4);
  --shadow-strong: 0 12px 40px rgba(0, 0, 0, 0.5);
}
```

**Karanlık Mod Toggle Hook:**
```javascript
// frontend/src/hooks/useTheme.js
import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('wayspot-theme');
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('wayspot-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return { theme, toggleTheme };
}
```

---

## 3. Mobil (React Native) — İki Mod Bir Arada

**Dosya:** `WaySpotMobile/src/utils/constants.js` (TAMAMEN DEĞİŞTİR)
```javascript
export const COLORS = {
  light: {
    bgPage: '#E8F4F4',
    bgCard: '#FFFFFF',
    bgInput: '#E8F4F4',
    bgModal: '#FFFFFF',
    bgOverlay: 'rgba(30, 58, 76, 0.5)',

    primary: '#2A6B6B',
    primaryHover: '#236060',
    primaryLight: 'rgba(42, 107, 107, 0.1)',
    primaryText: '#FFFFFF',

    secondary: '#4A9B9B',
    secondaryHover: '#3D8585',
    secondaryLight: 'rgba(74, 155, 155, 0.1)',
    secondaryText: '#FFFFFF',

    accent: '#E07A5F',
    accentHover: '#D46A4F',
    accentLight: 'rgba(224, 122, 95, 0.1)',
    accentText: '#FFFFFF',

    lightTeal: '#87C4C4',
    lightTealSoft: 'rgba(135, 196, 196, 0.15)',

    surface: '#E8F4F4',
    surfaceDark: '#D4E8E8',

    navy: '#1E3A4C',
    navyLight: '#2A5068',

    textPrimary: '#1E3A4C',
    textSecondary: '#6B8A8A',
    textMuted: '#9BB5B5',
    textInverse: '#FFFFFF',

    danger: '#C44536',
    dangerLight: 'rgba(196, 69, 54, 0.1)',
    success: '#3D8B7A',
    successLight: 'rgba(61, 139, 122, 0.1)',

    border: '#D4E8E8',
    borderFocus: '#2A6B6B',

    shadowSoft: 'rgba(30, 58, 76, 0.08)',
    shadowMedium: 'rgba(30, 58, 76, 0.12)',
    shadowStrong: 'rgba(30, 58, 76, 0.16)',
  },

  dark: {
    bgPage: '#0B1922',
    bgCard: '#132B3A',
    bgInput: '#132B3A',
    bgModal: '#1E3A4C',
    bgOverlay: 'rgba(0, 0, 0, 0.6)',

    primary: '#87C4C4',
    primaryHover: '#6BB0B0',
    primaryLight: 'rgba(135, 196, 196, 0.15)',
    primaryText: '#0B1922',

    secondary: '#4A9B9B',
    secondaryHover: '#5AADAD',
    secondaryLight: 'rgba(74, 155, 155, 0.15)',
    secondaryText: '#FFFFFF',

    accent: '#E07A5F',
    accentHover: '#F08A6F',
    accentLight: 'rgba(224, 122, 95, 0.15)',
    accentText: '#0B1922',

    lightTeal: '#4A9B9B',
    lightTealSoft: 'rgba(74, 155, 155, 0.2)',

    surface: '#132B3A',
    surfaceDark: '#1E3A4C',

    navy: '#E8F4F4',
    navyLight: '#9BC4C4',

    textPrimary: '#E8F4F4',
    textSecondary: '#9BC4C4',
    textMuted: '#6B9B9B',
    textInverse: '#0B1922',

    danger: '#D65A4A',
    dangerLight: 'rgba(214, 90, 74, 0.15)',
    success: '#4AA88A',
    successLight: 'rgba(74, 168, 138, 0.15)',

    border: '#1E3A4C',
    borderFocus: '#87C4C4',

    shadowSoft: 'rgba(0, 0, 0, 0.3)',
    shadowMedium: 'rgba(0, 0, 0, 0.4)',
    shadowStrong: 'rgba(0, 0, 0, 0.5)',
  },
};
```

**Karanlık Mod Context (React Native):**
```javascript
// WaySpotMobile/src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/constants';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('wayspot-theme').then((saved) => {
      if (saved === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem('wayspot-theme', next ? 'dark' : 'light');
  };

  const theme = isDark ? COLORS.dark : COLORS.light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

---

## 4. Bileşen Bazlı Renk Kullanımı (Her İki Mod İçin)

### Butonlar

| Buton Tipi | Aydınlık Arka Plan | Aydınlık Metin | Karanlık Arka Plan | Karanlık Metin |
|---|---|---|---|---|
| **Primary** | `#2A6B6B` | `#FFFFFF` | `#87C4C4` | `#0B1922` |
| **Secondary** | `#4A9B9B` | `#FFFFFF` | `#4A9B9B` | `#FFFFFF` |
| **Outline** | `transparent` | `#2A6B6B` | `transparent` | `#87C4C4` |
| **Ghost** | `transparent` | `#4A9B9B` | `transparent` | `#4A9B9B` |
| **Accent** | `#E07A5F` | `#FFFFFF` | `#E07A5F` | `#0B1922` |
| **Danger** | `#C44536` | `#FFFFFF` | `#D65A4A` | `#FFFFFF` |
| **Success** | `#3D8B7A` | `#FFFFFF` | `#4AA88A` | `#0B1922` |

### Kartlar (Cards)

| Özellik | Aydınlık | Karanlık |
|---|---|---|
| Arka plan | `#FFFFFF` | `#132B3A` |
| Border | `1px solid #D4E8E8` veya `none` | `1px solid #1E3A4C` veya `none` |
| Shadow | `rgba(30,58,76,0.08)` | `rgba(0,0,0,0.3)` |
| Hover shadow | `rgba(30,58,76,0.12)` | `rgba(0,0,0,0.4)` |
| Border-radius | `16px` (mobil), `12px` (web) | Aynı |

### Input’lar (TextInput)

| Özellik | Aydınlık | Karanlık |
|---|---|---|
| Arka plan | `#E8F4F4` | `#132B3A` |
| Border | `1px solid #D4E8E8` | `1px solid #1E3A4C` |
| Focus border | `2px solid #2A6B6B` | `2px solid #87C4C4` |
| Placeholder | `#9BB5B5` | `#6B9B9B` |
| Metin | `#1E3A4C` | `#E8F4F4` |

### Başlıklar (Typography)

| Seviye | Aydınlık | Karanlık |
|---|---|---|
| H1 / Sayfa başlığı | `#1E3A4C`, 700 | `#E8F4F4`, 700 |
| H2 / Bölüm başlığı | `#1E3A4C`, 600 | `#E8F4F4`, 600 |
| H3 / Kart başlığı | `#1E3A4C`, 600 | `#E8F4F4`, 600 |
| Gövde metni | `#1E3A4C`, 400 | `#E8F4F4`, 400 |
| İkincil metin | `#6B8A8A`, 400 | `#9BC4C4`, 400 |
| Placeholder | `#9BB5B5`, 400 | `#6B9B9B`, 400 |

### Badge’ler

| Tip | Aydınlık | Karanlık |
|---|---|---|
| Kampanya / İndirim | `#E07A5F` bg, `#FFFFFF` text | `#E07A5F` bg, `#0B1922` text |
| Aktif / Açık | `#3D8B7A` bg, `#FFFFFF` text | `#4AA88A` bg, `#0B1922` text |
| Pasif / Kapalı | `#6B8A8A` bg, `#FFFFFF` text | `#6B9B9B` bg, `#0B1922` text |
| Beklemede | `#E07A5F` bg, `#FFFFFF` text | `#E07A5F` bg, `#0B1922` text |
| Yeni | `#87C4C4` bg, `#1E3A4C` text | `#87C4C4` bg, `#0B1922` text |

### Harita (Leaflet / react-native-maps)

| Öğe | Aydınlık | Karanlık |
|---|---|---|
| Kullanıcı konum marker’ı | `#2A6B6B` | `#87C4C4` |
| İşletme marker’ı | `#4A9B9B` | `#4A9B9B` |
| Post / Kampanya marker’ı | `#E07A5F` | `#E07A5F` |
| Başlangıç noktası | `#3D8B7A` | `#4AA88A` |
| Bitiş noktası | `#C44536` | `#D65A4A` |
| Rota çizgisi (Polyline) | `#2A6B6B`, 4px | `#87C4C4`, 4px |

### Navigation

| Öğe | Aydınlık | Karanlık |
|---|---|---|
| Aktif tab / icon | `#2A6B6B` | `#87C4C4` |
| Pasif tab / icon | `#9BB5B5` | `#6B9B9B` |
| Header arka plan | `#FFFFFF` veya `#2A6B6B` | `#132B3A` veya `#1E3A4C` |
| Header metin (koyu bg) | `#FFFFFF` | `#E8F4F4` |
| Bottom tab arka plan | `#FFFFFF` | `#0B1922` |
| Drawer menu arka plan | `#E8F4F4` | `#132B3A` |

### Yıldız Rating

| Durum | Aydınlık | Karanlık |
|---|---|---|
| Dolu yıldız | `#E07A5F` | `#E07A5F` |
| Boş yıldız | `#D4E8E8` | `#1E3A4C` |

### Divider / Ayrac

| Tip | Aydınlık | Karanlık |
|---|---|---|
| İnce çizgi | `1px solid #D4E8E8` | `1px solid #1E3A4C` |
| Kalın çizgi | `2px solid #87C4C4` | `2px solid #4A9B9B` |

### Loading / Spinner

| Öğe | Aydınlık | Karanlık |
|---|---|---|
| Renk | `#2A6B6B` | `#87C4C4` |
| Arka plan overlay | `rgba(30,58,76,0.3)` | `rgba(0,0,0,0.5)` |

### Modal / Dialog

| Öğe | Aydınlık | Karanlık |
|---|---|---|
| Overlay | `rgba(30,58,76,0.5)` | `rgba(0,0,0,0.6)` |
| İçerik arka plan | `#FFFFFF` | `#1E3A4C` |
| Border-radius | `20px` | Aynı |

---

## 5. Sayfa Bazlı Renk Uygulamaları

### Login / Register Ekranı

| Öğe | Aydınlık | Karanlık |
|---|---|---|
| Sayfa arka plan | `#E8F4F4` | `#0B1922` |
| Kart arka plan | `#FFFFFF` | `#132B3A` |
| Başlık | `#1E3A4C` | `#E8F4F4` |
| Primary buton | `#2A6B6B` bg, `#FFFFFF` text | `#87C4C4` bg, `#0B1922` text |
| Link metni | `#4A9B9B` | `#87C4C4` |
| Rol seçim aktif | `#2A6B6B` bg, `#FFFFFF` text | `#87C4C4` bg, `#0B1922` text |
| Rol seçim pasif | `#E8F4F4` bg, `#6B8A8A` text | `#1E3A4C` bg, `#6B9B9B` text |

### Harita Ekranı (MapScreen)

| Öğe | Aydınlık | Karanlık |
|---|---|---|
| Floating buton (Konum) | `#2A6B6B` | `#87C4C4` |
| Floating buton (Rota) | `#4A9B9B` | `#4A9B9B` |
| Bottom sheet arka plan | `#FFFFFF` | `#132B3A` |
| Bottom sheet üst çizgi | `#87C4C4`, 3px | `#4A9B9B`, 3px |

### Discover / Keşfet Ekranı

| Öğe | Aydınlık | Karanlık |
|---|---|---|
| Sayfa arka plan | `#E8F4F4` | `#0B1922` |
| Post kart arka plan | `#FFFFFF` | `#132B3A` |
| Post kart badge (km) | `#E8F4F4` bg, `#2A6B6B` text | `#1E3A4C` bg, `#87C4C4` text |
| Üst header (yarıçap bilgisi) | `#2A6B6B` bg, `#FFFFFF` text | `#1E3A4C` bg, `#87C4C4` text |

### Business Detay Ekranı

| Öğe | Aydınlık | Karanlık |
|---|---|---|
| Bilgi kartı | `#FFFFFF` | `#132B3A` |
| İşletme adı | `#1E3A4C`, 22px, bold | `#E8F4F4`, 22px, bold |
| Açıklama | `#1E3A4C`, 15px | `#9BC4C4`, 15px |
| İstatistik badge’leri | `#E8F4F4` arka plan | `#1E3A4C` arka plan |
| Yorum Yap butonu | `#2A6B6B` | `#87C4C4` |
| Yorum kartı | `#FFFFFF`, border `#E8F4F4` | `#132B3A`, border `#1E3A4C` |

### AddReview Ekranı

| Öğe | Aydınlık | Karanlık |
|---|---|---|
| Sayfa arka plan | `#FFFFFF` | `#0B1922` |
| Rating yıldız dolu | `#E07A5F` | `#E07A5F` |
| Rating yıldız boş | `#D4E8E8` | `#1E3A4C` |
| Comment input arka plan | `#E8F4F4` | `#132B3A` |
| Kamera butonu | `#2A6B6B` | `#87C4C4` |
| Galeri butonu | `#4A9B9B` | `#4A9B9B` |
| Gönder butonu | `#3D8B7A` | `#4AA88A` |

### Business Dashboard Ekranı

| Öğe | Aydınlık | Karanlık |
|---|---|---|
| Sayfa arka plan | `#E8F4F4` | `#0B1922` |
| İstatistik kartları | `#FFFFFF` | `#132B3A` |
| Kart icon renkleri | `#2A6B6B`, `#3D8B7A`, `#E07A5F`, `#4A9B9B` | Aynı (icon renkleri değişmez) |
| Section başlıkları | `#1E3A4C` | `#E8F4F4` |

### Admin Dashboard Ekranı

| Öğe | Aydınlık | Karanlık |
|---|---|---|
| Sayfa arka plan | `#E8F4F4` | `#0B1922` |
| Grid kartları | `#FFFFFF` | `#132B3A` |
| Grid değerleri | `#1E3A4C`, 24px, bold | `#E8F4F4`, 24px, bold |
| Grid label’ları | `#6B8A8A` | `#6B9B9B` |
| Menü item’ları | `#FFFFFF`, icon `#2A6B6B` | `#132B3A`, icon `#87C4C4` |

### User Profile Ekranı

| Öğe | Aydınlık | Karanlık |
|---|---|---|
| Header arka plan | `#2A6B6B` | `#1E3A4C` |
| Avatar arka plan | `rgba(255,255,255,0.2)` | `rgba(135,196,196,0.2)` |
| Kullanıcı adı | `#FFFFFF` | `#E8F4F4` |
| Email | `rgba(255,255,255,0.8)` | `rgba(232,244,244,0.7)` |
| İstatistik kutuları | `#FFFFFF` | `#132B3A` |
| Menü item’ları | `#FFFFFF`, icon `#2A6B6B` | `#132B3A`, icon `#87C4C4` |
| Çıkış butonu | `#C44536` metin + icon | `#D65A4A` metin + icon |

---

## 6. Tailwind Config (Web — İki Mod)

**Dosya:** `frontend/tailwind.config.js` (eğer Tailwind kullanılıyorsa)
```javascript
module.exports = {
  darkMode: 'class', // veya 'media' için 'data-theme' attribute'u kullan
  theme: {
    extend: {
      colors: {
        // Aydınlık mod (varsayılan)
        primary: '#2A6B6B',
        'primary-hover': '#236060',
        secondary: '#4A9B9B',
        'secondary-hover': '#3D8585',
        accent: '#E07A5F',
        'accent-hover': '#D46A4F',
        surface: '#E8F4F4',
        'surface-dark': '#D4E8E8',
        'light-teal': '#87C4C4',
        navy: '#1E3A4C',
        'navy-light': '#2A5068',
        muted: '#6B8A8A',
        'muted-light': '#9BB5B5',
        danger: '#C44536',
        success: '#3D8B7A',
        // Karanlık mod için ayrı tanımlar (class bazlı kullanımda)
        'dark-bg': '#0B1922',
        'dark-surface': '#132B3A',
        'dark-elevated': '#1E3A4C',
        'dark-primary': '#87C4C4',
        'dark-text': '#E8F4F4',
        'dark-text-secondary': '#9BC4C4',
        'dark-text-muted': '#6B9B9B',
        'dark-danger': '#D65A4A',
        'dark-success': '#4AA88A',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(30, 58, 76, 0.08)',
        medium: '0 8px 30px rgba(30, 58, 76, 0.12)',
        strong: '0 12px 40px rgba(30, 58, 76, 0.16)',
        'dark-soft': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'dark-medium': '0 8px 30px rgba(0, 0, 0, 0.4)',
        'dark-strong': '0 12px 40px rgba(0, 0, 0, 0.5)',
      },
    },
  },
};
```

---

## 7. Kesin Kurallar (AI İçin — İki Mod İçin)

1. **Kırmızı (#FF0000, #EF4444, vb.) KULLANMA.** Danger için sadece `#C44536` (aydınlık) / `#D65A4A` (karanlık).
2. **Yeşil (#10B981, #22C55E, vb.) KULLANMA.** Success için sadece `#3D8B7A` (aydınlık) / `#4AA88A` (karanlık).
3. **Mavi (#2563EB, #3B82F6, vb.) KULLANMA.** Primary için sadece `#2A6B6B` (aydınlık) / `#87C4C4` (karanlık).
4. **Turuncu (#F97316, vb.) KULLANMA.** Accent için sadece `#E07A5F` (her iki modda aynı).
5. **Siyah (#000000) KULLANMA.** Metin için sadece `#1E3A4C` (aydınlık) / `#E8F4F4` (karanlık).
6. **Gri (#9CA3AF, #6B7280, vb.) KULLANMA.** İkincil metin için sadece `#6B8A8A` (aydınlık) / `#6B9B9B` (karanlık).
7. **Beyaz (#FFFFFF) KULLAN.** Kartlar ve buton metinleri için — ama karanlık modda buton metinleri `#0B1922` olabilir.
8. **Bütün geçişler (hover, active, focus)** yukarıdaki hover renklerini kullanmalı.
9. **Shadow’lar** aydınlık modda `rgba(30, 58, 76, X)`, karanlık modda `rgba(0, 0, 0, X)` olmalı.
10. **Border-radius’lar** 12px, 16px, 20px, 24px olmalı (köşeli kenar yok).
11. **Karanlık modda primary buton metni KOYU (`#0B1922`) olmalı** — çünkü arka plan açık teal (`#87C4C4`).
12. **Karanlık modda kart border’ları `#1E3A4C` olmalı** — aydınlık moddaki `#D4E8E8` yerine.
13. **Accent (`#E07A5F`) her iki modda da AYNI kalmalı** — koyu zeminde daha parlak ve dikkat çekici görünür.
14. **Karanlık modda input arka planı `#132B3A` olmalı** — aydınlık moddaki `#E8F4F4` yerine.
15. **Karanlık modda placeholder metin `#6B9B9B` olmalı** — aydınlık moddaki `#9BB5B5` yerine daha koyu.

---

## 8. Tema Değiştirme UI Örneği (Web)

```jsx
// Toggle butonu
import { useTheme } from '../hooks/useTheme';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{
        background: theme === 'light' ? '#2A6B6B' : '#87C4C4',
        color: theme === 'light' ? '#FFFFFF' : '#0B1922',
        padding: '10px 16px',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
      }}
    >
      {theme === 'light' ? '🌙 Karanlık Mod' : '☀️ Aydınlık Mod'}
    </button>
  );
}
```

## 9. Tema Değiştirme UI Örneği (React Native)

```jsx
import { useTheme } from '../context/ThemeContext';
import { TouchableOpacity, Text } from 'react-native';

function ThemeToggle() {
  const { theme, isDark, toggleTheme } = useTheme();
  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={{
        backgroundColor: theme.primary,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: theme.primaryText, fontWeight: '600' }}>
        {isDark ? '☀️ Aydınlık Mod' : '🌙 Karanlık Mod'}
      </Text>
    </TouchableOpacity>
  );
}
```

---

**Bu prompt, WaySpot projesindeki TÜM ekranlar, bileşenler, butonlar, kartlar, input'lar, harita elemanları ve navigation öğeleri için HEM aydınlık HEM karanlık modda geçerlidir. Başka hiçbir renk kullanılmayacaktır.**
