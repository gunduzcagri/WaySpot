# WaySpot — Modern UI/UX Tasarım Promptu
## Mobil-First, Erişilebilir ve Premium Kullanıcı Deneyimi

**Kural:** Bu prompt, WaySpot'un TÜM ekranları (Web + Mobil) için geçerlidir. Her bileşen, her ekran ve her etkileşim aşağıdaki prensiplere göre tasarlanacak. Varsayılan UI elemanları kullanılmayacak, her şey özel tasarıma göre şekillendirilecek.

---

## 1. TEMEL TASARIM PRENSİPLERİ

### 1.1 Mobil-First Yaklaşım
- **Tüm tasarımlar önce mobil (375px) için yapılır**, sonra tablet (768px) ve desktop (1440px) için genişletilir.
- Touch hedefleri minimum **48x48dp** olmalı (butonlar, ikonlar, liste öğeleri).
- Parmakla kaydırma için yeterli alan bırakılmalı. Kartlar arası boşluk minimum **16px**.
- **Safe area**'lar dikkate alınmalı (iPhone notch, Android gesture bar).

### 1.2 Modern Görsel Dil
- **Flat Design + Depth:** Tam düz değil, katmanlar arası hafif derinlik (shadow, blur) kullanılacak.
- **Glassmorphism YOK** — yorgun edici, performans düşürücü.
- **Neumorphism YOK** — modası geçmiş, erişilebilirliği zayıf.
- **Yumuşak köşeler:** Tüm kartlar, butonlar, input'lar, modal'lar **border-radius: 16px** (mobil) veya **12px** (küçük öğeler).
- **Keskin köşe YOK.**

### 1.3 Boşluk (Spacing) Sistemi
```
4px  → Mikro (ikon-padding, badge içi)
8px  → XS (elemanlar arası minimum)
12px → S (küçük gruplar)
16px → M (standart kart padding, liste boşlukları)
20px → ML (bölüm başlıkları)
24px → L (sayfa padding, büyük gruplar)
32px → XL (bölüm ayrıcıları)
40px → 2XL (sayfa başlıkları)
48px → 3XL (tam sayfa boşlukları)
```
- **8px grid sistemi** kullanılacak. Tüm padding, margin, gap değerleri 4'ün katı olacak.

### 1.4 Tipografi Sistemi
```
Display    → 32px / 40px line-height / -0.5px letter-spacing / 700 weight
H1         → 28px / 36px / -0.3px / 700
H2         → 22px / 30px / -0.2px / 600
H3         → 18px / 26px / -0.1px / 600
Body Large → 16px / 24px / 0 / 400
Body       → 14px / 22px / 0 / 400
Caption    → 12px / 18px / 0.2px / 500
Overline   → 11px / 16px / 0.5px / 600 / UPPERCASE
```
- **Font ailesi:** Inter (web) / Roboto (Android) / SF Pro (iOS) — sistem fontları tercih edilir.
- **Max line length:** 65 karakter (okunabilirlik için).
- **Line clamp:** Kart başlıkları 2 satır, açıklamalar 3 satır ile sınırlandırılacak.

---

## 2. BİLEŞEN TASARIMLARI

### 2.1 Butonlar (Buttons)

**Primary Button:**
- Yükseklik: **56px** (mobil) / **48px** (web)
- Padding: **horizontal 24px**
- Border-radius: **16px**
- Font: Body Large, 600 weight
- Arkaplan: `primary` renk (#2A6B6B aydınlık / #87C4C4 karanlık)
- Metin: `primaryText` renk
- Shadow: `shadow-soft`
- **Hover/Active:** Scale 0.98 + opacity 0.9 + shadow-medium
- **Disabled:** Opacity 0.4 + no shadow
- **Loading:** Spinner (primaryText renginde) + metin gizli

**Secondary Button:**
- Aynı boyutlar
- Arkaplan: `transparent`
- Border: **2px solid secondary**
- Metin: `secondary` renk
- **Hover:** Arkaplan `secondary-light` + metin `secondary`

**Floating Action Button (FAB):**
- Boyut: **64x64px**
- Border-radius: **50%** (tam yuvarlak)
- Arkaplan: `primary`
- İkon: `primaryText`, 28px
- Shadow: `shadow-strong`
- **Hover:** Scale 1.05 + shadow-stronger
- Konum: Ekranın sağ altı, bottom tab'dan **24px** yukarıda

**Icon Button:**
- Boyut: **48x48px**
- Border-radius: **12px**
- Arkaplan: `surface` (aydınlık) / `surface-dark` (karanlık)
- İkon: `navy` (aydınlık) / `text-primary` (karanlık), 24px
- **Hover:** Arkaplan `light-teal-soft`

### 2.2 Kartlar (Cards)

**Standard Card:**
- Arkaplan: `bg-card`
- Border-radius: **16px**
- Padding: **16px** (mobil) / **20px** (desktop)
- Shadow: `shadow-soft`
- **Hover (web):** translateY(-2px) + shadow-medium
- **Active (mobil):** Scale 0.98
- Border: **YOK** (gölge yeterli)

**Elevated Card (önemli içerik):**
- Border: **1px solid border** renk
- Shadow: `shadow-medium`

**Image Card (Post/Business):**
- Üst kısım: Görsel (aspect-ratio 16:9, border-radius 16px 16px 0 0)
- Alt kısım: İçerik (padding 16px)
- Görsel üzerinde gradient overlay (alt taraftan): `linear-gradient(transparent, rgba(0,0,0,0.6))`
- Görsel üzerinde badge: konumlandırma absolute, top-right, margin 12px

### 2.3 Input'lar (TextInput)

**Standard Input:**
- Yükseklik: **56px**
- Padding: **horizontal 16px**
- Border-radius: **16px**
- Arkaplan: `bg-input`
- Border: **1.5px solid border**
- Font: Body Large
- Placeholder: `text-muted` rengi
- **Focus:** Border `primary` + shadow-soft + arkaplan `bg-card`
- **Error:** Border `danger` + altına hata metni (Caption, danger rengi)
- **Success:** Border `success` + sağda check ikonu
- İkon (varsa): Sol tarafta, 24px, `muted` rengi, padding-left 16px

**Search Input:**
- Solunda search ikonu (24px, muted)
- Sağında clear ikonu (sadece metin varken görünür)
- Border-radius: **24px** (tam yuvarlak değil, pill shape)
- Arkaplan: `bg-card` (aydınlık) / `surface` (karanlık)

### 2.4 Badge'ler

**Standard Badge:**
- Padding: **vertical 4px, horizontal 10px**
- Border-radius: **20px** (pill)
- Font: Caption, 600 weight
- **Kampanya:** `accent` bg, `accentText` metin
- **Aktif:** `success` bg, `successText` metin
- **Yeni:** `light-teal` bg, `navy` metin
- **Uzaklık:** `surface-dark` bg, `primary` metin

### 2.5 Avatar'lar

**User Avatar:**
- Boyutlar: **32px** (liste), **48px** (yorum), **80px** (profil)
- Border-radius: **50%**
- Border: **2px solid bg-card** (gölge efekti için)
- Fallback: Baş harf + `primary` bg

**Business Avatar:**
- Boyut: **56px**
- Border-radius: **16px** (yuvarlak değil, yumuşak köşe)
- Border: **2px solid surface-dark**

---

## 3. EKRAN TASARIMLARI (Ekran Bazlı UX)

### 3.1 Login / Register Ekranı

**UX Akışı:**
1. **Splash:** Logo animasyonu (fade-in + scale 0.8→1, 600ms, ease-out)
2. **Form:** Tek kolon, ortalanmış, klavye açıldığında scroll edilebilir
3. **Şifre görünürlük:** Sağda göz ikonu (toggle)
4. **Validasyon:** Anlık (onBlur) — hata anında border kırmızı + alt metin
5. **Submit:** Buton yüklenirken disabled + spinner
6. **Başarılı:** Yumuşak geçiş (fade) ana ekrana

**Modern Detaylar:**
- Arka planda hafif desen veya gradient (primary'den surface'a)
- Form kartı: `bg-card`, shadow-strong, padding 32px
- Sosyal login butonları: Outline style, ikon + metin
- "Beni hatırla" checkbox: Custom, yuvarlak, primary renkli

### 3.2 Harita Ekranı (MapScreen)

**UX Akışı:**
1. **Açılış:** Harita merkezlenir, konum izni istenir
2. **Konum alındığında:** Mavi pulse animasyonlu marker (3 saniye)
3. **FAB'lar:** Sağ alt üst üste (Konum + Rota planla)
4. **Alt Sheet:** Business'ları listeleyen bottom sheet (yarım ekran, yukarı çekilebilir)

**Bottom Sheet Davranışı:**
- İlk durum: Ekranın %40'ı kaplar
- Yukarı çekildiğinde: %85'e kadar genişler (snap point)
- Aşağı çekildiğinde: %40'e döner veya kapanır
- İçerik: Yatay scroll post kartları veya dikey liste
- Arkaplan: `bg-card`, border-radius 24px 24px 0 0, shadow-strong

**Marker'lar:**
- Kullanıcı: Pulse animasyonlu (CSS animation: scale 1→1.5, opacity 1→0, 2s infinite)
- Business: Custom marker (48x48px, business fotoğrafı veya ikon)
- Post: Marker üzerinde mini badge (kampanya ikonu)
- Seçili marker: Scale 1.2 + z-index üstte

### 3.3 Discover / Keşfet Ekranı

**UX Akışı:**
1. **Pull-to-refresh:** Aşağı çekince yenilenir (spinner primary renk)
2. **Liste:** Dikey scroll, kartlar arası 16px boşluk
3. **Infinite Scroll:** Son kart göründüğünde yeni veri yüklenir (bottom spinner)
4. **Hızlı filtre:** Yatay scroll chip'ler (kategori, mesafe, puan)

**Filtre Chip'leri:**
- Padding: **vertical 8px, horizontal 16px**
- Border-radius: **20px**
- Aktif: `primary` bg, `primaryText`
- Pasif: `surface` bg, `text-secondary`, border 1px solid `border`
- Seçim: Scale 0.95 animasyonu (100ms)

**Skeleton Loading:**
- Kart yerine: Gri shimmer (gradient animasyonlu)
- Aspect ratio: Kart ile aynı
- 3 skeleton kart gösterilir

**Empty State:**
- İllüstrasyon (SVG, primary renk tonlarında)
- Başlık: "Henüz kampanya yok"
- Açıklama: "Konumunuzu değiştirin veya daha sonra tekrar deneyin"
- Aksiyon butonu: "Konumumu Güncelle"

### 3.4 Business Detay Ekranı

**UX Akışı:**
1. **Hero:** Tam genişlikte harita (250px yükseklik)
2. **Parallax:** Aşağı scroll edince harita küçülür, başlık yapışkan (sticky) olur
3. **Bilgi kartı:** -20px translateY ile haritanın üzerine biner
4. **Tab'lar:** Hakkında | Yorumlar | Menü (varsa)
5. **Yorumlar:** Dikey liste, her yorumda kullanıcı avatarı + rating + fotoğraf

**Sticky Header:**
- Scroll > 200px olduğunda: Header arka plan `bg-card` + shadow-soft + başlık görünür
- Geri butonu: Sol üst, `bg-card` arka planlı, 40x40px
- Paylaş/favori butonları: Sağ üst

**Galeri (varsa):**
- Yatay scroll (Snap to card)
- Kart boyutu: 280x180px
- Border-radius: 12px
- Aralarında 12px boşluk

**Yorum Ekleme FAB:**
- Sağ alt, 64px
- Sadece giriş yapmış kullanıcılar görür
- Tıklayınca yorum modal'ı açılır (slide-up)

### 3.5 AddReview Ekranı (Modal)

**UX Akışı:**
1. **Açılış:** Ekranın altından yukarı kayar (slide-up, 300ms, ease-out)
2. **Rating:** Yıldızlara dokununca anlık dolma (scale bounce 1.2→1)
3. **Fotoğraf:** Kamera veya galeri seçimi (bottom sheet)
4. **Yükleme:** Progress bar (primary renk)
5. **Başarı:** Modal kapanır, toast bildirim

**Bottom Sheet (Fotoğraf Seçimi):**
- Açılış: Ekranın altından yukarı
- İçerik: "Kamera ile Çek" / "Galeriden Seç" / "İptal"
- Her satır: 56px yükseklik, ortalanmış metin + ikon
- İptal: `danger` renk

### 3.6 Rota Planlayıcı Ekranı

**UX Akışı:**
1. **Harita:** Tam ekran, üzerinde input paneli
2. **Input Paneli:** Ekranın altında, yukarı çekilebilir
3. **Başlangıç/Bitiş:** Input'lara dokununca adres arama modal'ı
4. **Rota hesaplandığında:** Polyline çizilir (draw animasyonu, 1s)
5. **Alt bilgi:** Mesafe, süre, yakıt maliyeti (varsa)

**Adres Arama Modal'ı:**
- Search input (focus otomatik)
- Sonuçlar: Liste, her satırda konum ikonu + adres
- Seçim: Modal kapanır, input doldurulur

**Rota Üzerindeki Business'lar:**
- Harita üzerinde mini marker'lar (rota çizgisine paralel)
- Tıklayınca: Bottom sheet'te business bilgisi
- "Burada Dur" butonu: Waypoint ekler

### 3.7 Business Dashboard Ekranı

**UX Akışı:**
1. **Header:** İşletme adı + ayarlar ikonu
2. **İstatistik Kartları:** 2x2 grid, yatay scroll (mobil)
3. **Grafik (varsa):** Basit bar chart (son 7 gün)
4. **Son Yorumlar:** Dikey liste, en fazla 5 adet
5. "Tümünü Gör" linki

**İstatistik Kart Animasyonu:**
- Sayı sayaç animasyonu (0'dan gerçek değere, 800ms)
- Kartlar staggered fade-in (100ms arayla)

**Grafik:**
- Bar chart veya line chart
- Primary renkli bar'lar
- Grid lines: `border` rengi
- Tooltip: `bg-card`, shadow-soft

### 3.8 User Profile Ekranı

**UX Akışı:**
1. **Header:** Gradient arka plan (primary'den primary-hover'a)
2. **Avatar:** Ortada, -40px translateY (header'ın üzerine biner)
3. **İstatistikler:** Yatay 3'lü (Yorum | Rota | Puan)
4. **Menü Listesi:** Dikey, ikon + metin + chevron

**Avatar Animasyonu:**
- Yüklenirken: Skeleton (daire)
- Yüklendikten sonra: Fade-in + scale 0.9→1

**Menü Öğeleri:**
- Her satır: 56px yükseklik
- Sol: İkon (24px, primary)
- Orta: Metin (Body, navy)
- Sağ: Chevron (muted) veya değer metni
- **Hover:** Arkaplan `surface` + sağa 4px translateX

### 3.9 Admin Dashboard Ekranı

**UX Akışı:**
1. **Grid:** 2x2 istatistik kartları
2. **Hızlı Erişim:** Büyük butonlar (icon + metin)
3. **Son Aktiviteler:** Timeline görünümü

**Timeline:**
- Sol: Çizgi (primary renk)
- Noktalar: Primary renkli daireler
- Sağ: Kart (bg-card, shadow-soft)
- İçerik: Kullanıcı adı + aksiyon + zaman

---

## 4. ANİMASYONLAR VE GEÇİŞLER

### 4.1 Temel Animasyon Prensipleri
- **Süre:** 200-300ms (hızlı hissettirmeli)
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- **Performans:** Sadece `transform` ve `opacity` kullanılacak (layout trigger'lanmayacak)

### 4.2 Sayfa Geçişleri (React Navigation)
```javascript
// Stack Navigator config
screenOptions: {
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // Yatay slide
  transitionSpec: {
    open: { animation: 'timing', config: { duration: 300 } },
    close: { animation: 'timing', config: { duration: 250 } },
  },
}
```

### 4.3 Mikro Animasyonlar

**Buton Basma:**
- Scale: 1 → 0.96 (100ms)
- Scale geri: 0.96 → 1 (150ms)

**Kart Tıklama:**
- Scale: 1 → 0.98 (100ms)
- Shadow: soft → medium

**Input Focus:**
- Border: 1.5px → 2px (200ms)
- Shadow: none → soft (200ms)
- Label (floating): translateY 0 → -24px, scale 1 → 0.85 (200ms)

**FAB Açılma (Speed Dial):**
- Ana FAB: rotate 0 → 45deg (300ms)
- Alt FAB'lar: staggered fade-in + translateY 20 → 0 (100ms arayla)

**Pull-to-Refresh:**
- Spinner: primary renk
- Bırakıldığında: bounce animasyonu (overshoot)

**Skeleton Shimmer:**
- Gradient: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`
- Animation: translateX -200% → 200%, 1.5s, infinite

**Toast Bildirim:**
- Giriş: translateY -100% → 0, fade-in (300ms)
- Çıkış: translateY 0 → -100%, fade-out (200ms)
- Konum: Üstte, safe area altında

### 4.4 Harita Animasyonları
- **Marker ekleme:** Scale 0 → 1 + bounce (400ms)
- **Marker seçimi:** Scale 1 → 1.2 + z-index artışı
- **Rota çizimi:** Polyline draw (stroke-dasharray animasyonu, 1s)
- **Bölge değişimi:** Harita smooth pan (500ms)

---

## 5. LOADING VE BOŞ DURUMLAR

### 5.1 Loading State'leri

**Skeleton:**
- Gri arka plan + shimmer animasyonu
- Kart skeleton'ları: Asıl kart ile aynı boyut
- Liste: 3 skeleton öğe
- Detay: Hero skeleton + metin satırları (4-5 satır)

**Spinner:**
- Primary renkli ActivityIndicator (React Native)
- CSS spinner (web): `border: 3px solid surface-dark, border-top: 3px solid primary`
- Ortalanmış, overlay yok (sayfa içinde)

**Progress Bar:**
- Yükseklik: 4px
- Arkaplan: `surface-dark`
- Dolu kısım: `primary`
- Border-radius: 2px
- Animasyon: width geçişi (300ms ease)

### 5.2 Empty State'ler

**İllüstrasyon:**
- SVG formatında
- Renk: `muted` veya `light-teal`
- Boyut: 120x120px (mobil), 160x160px (desktop)

**Metin:**
- Başlık: H3, `text-primary`, ortalanmış
- Açıklama: Body, `text-secondary`, ortalanmış, max-width 280px
- Buton: Primary, ortalanmış, margin-top 24px

**Örnek Empty State'ler:**
- "Henüz kampanya yok" → "Konum Değiştir" butonu
- "Kayıtlı rota yok" → "Rota Oluştur" butonu
- "Yorum yapılmamış" → "İlk Yorumu Sen Yap" butonu
- "Arama sonucu yok" → "Filtreleri Temizle" butonu

### 5.3 Error State'leri

**Network Hatası:**
- İllüstrasyon: Wifi/offline ikonu
- Başlık: "Bağlantı sorunu"
- Açıklama: "İnternet bağlantınızı kontrol edin"
- Buton: "Tekrar Dene"

**404 / Bulunamadı:**
- İllüstrasyon: Harita üzerinde soru işareti
- Başlık: "Sayfa bulunamadı"
- Buton: "Ana Sayfaya Dön"

---

## 6. BİLDİRİMLER (Notifications)

### 6.1 Toast / Snackbar
- Konum: Üst (safe area altında) veya alt (FAB üzerinde)
- Arkaplan: `navy` (başarılı) / `danger` (hata) / `accent` (bilgi)
- Metin: `white`, Body
- İkon: Sol tarafta (24px)
- Kapanma: Otomatik (3 saniye) veya X butonu
- Giriş: Slide-down (üstteyse) veya slide-up (alttaysa)

### 6.2 In-App Bildirimler
- Badge: Sayı gösterimi (accent bg, white text)
- Konum: Tab bar üzerinde (bell ikonu) veya profil avatar'ı üzerinde
- Animasyon: Scale 0 → 1 + bounce

---

## 7. MOBİL SPESİFİK UX

### 7.1 Gesture'lar
- **Swipe left/right:** Kartlar arası geçiş (galeri, post'lar)
- **Swipe down:** Modal/bottom sheet kapatma
- **Swipe up:** Bottom sheet genişletme
- **Long press:** Harita üzerinde konum işaretleme
- **Pinch:** Harita zoom
- **Double tap:** Harita zoom in

### 7.2 Haptic Feedback
- Buton basma: HapticFeedbackType.light
- Başarılı işlem: HapticFeedbackType.success
- Hata: HapticFeedbackType.error
- Scroll snap: HapticFeedbackType.light

### 7.3 Bottom Sheet'ler
- **Snap Points:** %40 (küçük), %85 (büyük)
- **Backdrop:** Siyah overlay (opacity 0.5), tıklayınca kapanır
- **Handle:** Üstte 36px genişliğinde 4px yüksekliğinde çizgi (muted renk)
- **İçerik scroll:** Sheet içindeki liste bağımsız scroll edilebilir

### 7.4 Pull-to-Refresh
- Tüm liste ekranlarında (Discover, Reviews, Routes)
- Spinner: Primary renk
- Threshold: 80px çekme mesafesi
- Release: Bounce animasyonu

### 7.5 Infinite Scroll
- Son öğe göründüğünde trigger
- Bottom spinner: 48px yükseklik, ortalanmış
- Hata durumunda: "Tekrar Dene" butonu (küçük, outline)
- Tüm veri yüklendiğinde: "Sonuna geldiniz" metni (muted, Caption)

---

## 8. ERİŞİLEBİLİLİK (Accessibility)

### 8.1 WCAG 2.1 AA Standartları
- **Renk kontrastı:** Minimum 4.5:1 (normal metin), 3:1 (büyük metin/ikonlar)
- **Renk bağımsızlık:** Bilgi sadece renkle verilmemeli (ikon + metin + şekil)
- **Focus indicator:** Tüm etkileşimli elemanlarda görünür focus halkası (2px offset, primary renk)

### 8.2 Screen Reader Desteği
- Tüm butonlar: `accessibilityLabel` + `accessibilityRole="button"`
- Tüm görseller: `accessibilityLabel` (dekoratif olanlar `accessibilityElementsHidden`)
- Input'lar: `accessibilityLabel` + `accessibilityHint`
- Kartlar: `accessibilityRole="button"`, tüm içerik okunabilir
- Harita marker'ları: `accessibilityLabel` (business adı + mesafe)

### 8.3 Font Scale
- Sistem font boyutu ayarına saygılı (React Native: `allowFontScaling={true}`)
- Max font scale: 1.3 (büyük metinlerin taşmasını önlemek için)
- Layout'lar flexbox ile esnek olmalı

### 8.4 Touch Targets
- Minimum: 48x48dp (Android) / 44x44pt (iOS)
- Birbirine yakın butonlar arası minimum 8px boşluk

---

## 9. RESPONSIVE BREAKPOINT'LER

```
Mobile  : 0 - 767px   (tek kolon, tam ekran kartlar)
Tablet  : 768 - 1023px (2 kolon grid, yan menü)
Desktop : 1024px+      (3 kolon grid, sidebar, hover efektleri)
```

### 9.1 Grid Sistemi
- **Mobil:** 1 kolon, padding 16px
- **Tablet:** 2 kolon, gap 16px, padding 24px
- **Desktop:** 3 kolon (Discover), 2 kolon (Dashboard), gap 24px, padding 32px, max-width 1200px, ortalanmış

### 9.2 Navigation Responsive
- **Mobil:** Bottom Tab Navigator
- **Tablet:** Bottom Tab veya sol sidebar (ikon + metin)
- **Desktop:** Sol sidebar (sabit, 240px genişlik) + üst header

---

## 10. ONBOARDING FLOW'U

### 10.1 İlk Açılış (First Launch)
1. **Splash:** Logo + animasyon (1.5s)
2. **Onboarding Sayfaları:** 3 sayfa (swipe ile geçiş)
   - Sayfa 1: "Keşfet" — Harita illüstrasyonu
   - Sayfa 2: "Rota Planla" — Rota illüstrasyonu
   - Sayfa 3: "Yorum Yap" — Yorum illüstrasyonu
3. **Son Sayfa:** "Başla" butonu (Primary, tam genişlik)
4. **Skip:** Sağ üstte "Atla" linki (her sayfada)

**Onboarding Kartı:**
- Tam ekran, ortalanmış içerik
- İllüstrasyon: 240x240px
- Başlık: H2, ortalanmış
- Açıklama: Body, ortalanmış, max-width 280px
- Pagination: 3 nokta (aktif: primary, pasif: muted)

---

## 11. KESİN KURALLAR (AI İçin)

1. **Köşeli kenar YOK.** Her şey yuvarlak köşeli (minimum 8px, standart 16px).
2. **Shadow her kartta olacak.** Düz kartlar yok (depth hissi için).
3. **Buton yüksekliği 56px (mobil).** Küçük butonlar yok (touch target için).
4. **Input yüksekliği 56px.** Standart HTML input'lar kullanılmayacak, custom tasarım.
5. **Metin ortalanmamalı (sadece başlıklar ve empty state'ler).** Gövde metni sola yaslı.
6. **İkonlar 24px (standart) veya 20px (küçük).** 16px'den küçük ikon yok.
7. **Animasyon süresi 200-300ms.** Yavaş animasyonlar (500ms+) yok.
8. **Loading spinner'lar ortalanmış.** Sol üst köşede spinner yok.
9. **Hata mesajları input'un altında.** Toast yerine anlık validasyon tercih edilir.
10. **Tüm görseller lazy loading.** Performans için placeholder + fade-in.
11. **Bottom sheet'lerde backdrop tıklanabilir.** Kullanıcı kapatma özgürlüğü.
12. **Pull-to-refresh tüm listelerde.** Kullanıcı veri yenilemeyi bekler.
13. **Empty state'lerde aksiyon butonu.** Sadece "boş" demek yeterli değil.
14. **Focus halkası görünür.** Erişilebilirlik için outline:none yapılmayacak.
15. **Font scale'e uyumlu.** Sabit px değerleri yerine relative birimler (rem, dp).

---

**Bu prompt, WaySpot'un TÜM ekranları, bileşenleri, animasyonları, loading state'leri, empty state'leri ve etkileşimleri için geçerlidir. Her UI elemanı bu prensiplere göre tasarlanacak ve kodlanacaktır.**
