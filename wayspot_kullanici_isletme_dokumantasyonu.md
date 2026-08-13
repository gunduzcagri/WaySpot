# Wayspot - Kullanıcı & İşletme Yönetimi Dokümantasyonu

## 1. Genel Bakış

Bu doküman, **Wayspot** platformunun kullanıcı yönetimi, işletme yönetimi ve sosyal paylaşım modüllerinin detaylı teknik ve işlevsel spesifikasyonlarını içerir.

**Teknoloji Stack:**
- **Backend:** C# .NET Core Web API
- **Frontend:** React
- **Veritabanı:** (Tercihe göre: PostgreSQL / SQL Server / MongoDB)
- **Kimlik Doğrulama:** JWT + OAuth 2.0 (Google)
- **Harita/Coğrafi:** Google Maps API / OpenStreetMap

---

## 2. Hesap Türleri & Rol Yapısı

### 2.1 Rol Tanımları

| Rol | Açıklama | Yetki Seviyesi |
|-----|----------|----------------|
| **Normal Kullanıcı** | Platformu gezip paylaşımları görüntüleyen, yorum yapan, favorileyen kullanıcı | 1 |
| **İşletme Sahibi** | Kendi işletmesini kaydeden, yöneten, paylaşım yapan kullanıcı | 2 |
| **Admin** | Tüm sistem üzerinde tam yetkili yönetici | 3 |

### 2.2 Rol Tabanlı Yetkilendirme (RBAC)

```
[Authorize(Roles = "Admin")]
[Authorize(Roles = "BusinessOwner")]
[Authorize(Roles = "User")]
```

---

## 3. Kayıt & Giriş Akışı (Registration Flow)

### 3.1 Felsefe

> **"30 Saniye Kuralı"** — Kullanıcı 30 saniye içinde platforma giriş yapabilmeli.

### 3.2 Kayıt Türleri

#### A. Hızlı Kayıt — Google OAuth 2.0 (Önerilen)

```
┌─────────────────────────────────────────────────────────────┐
│  [ Google ile Üye Ol ]                                       │
│  Tek tıkla, 5 saniyede içeride!                              │
└─────────────────────────────────────────────────────────────┘
```

**Akış:**
1. Kullanıcı "Google ile Üye Ol" butonuna tıklar
2. Google OAuth popup açılır
3. Kullanıcı Google hesabını seçer
4. Backend'de:
   - Google `id_token` doğrulanır
   - Email kontrolü yapılır (varsa giriş, yoksa kayıt)
   - JWT token üretilir
   - Kullanıcıya rol seçimi ekranı gösterilir (Normal Kullanıcı / İşletme Sahibi)
5. Kullanıcı anasayfaya yönlendirilir

**Google'dan Alınan Veriler:**
- `email` (zorunlu, unique)
- `name` (tam ad)
- `picture` (profil fotoğrafı URL)
- `sub` (Google unique ID)

#### B. Email & Şifre Kaydı

**Adım 1: Temel Bilgiler (Zorunlu)**

| Alan | Doğrulama | Açıklama |
|------|-----------|----------|
| Ad | 2-50 karakter, sadece harf | Kullanıcının gerçek adı |
| Soyad | 2-50 karakter, sadece harf | Kullanıcının soyadı |
| Email | RFC 5322 standardı, unique | Giriş için kullanılacak |
| Şifre | Min 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam, 1 özel karakter | Güvenlik standardı |
| Şifre Tekrar | Şifre ile eşleşmeli | Doğrulama |
| Kullanım Koşulları | Checkbox (zorunlu) | Yasal zorunluluk |

**Adım 2: Rol Seçimi**

```
┌─────────────────────────────────────────────────────────────┐
│  Siz kimsiniz?                                               │
│                                                              │
│  [👤 Normal Kullanıcı ]     [🏪 İşletme Sahibi ]             │
│  Keşfetmek istiyorum        İşletmemi eklemek istiyorum      │
└─────────────────────────────────────────────────────────────┘
```

- **Normal Kullanıcı seçerse:** Kayıt tamamlanır, anasayfaya yönlendirilir.
- **İşletme Sahibi seçerse:** İşletme bilgileri akışına yönlendirilir (Bkz. Bölüm 4).

### 3.3 Giriş (Login)

**Seçenekler:**
1. **Google ile Giriş** — Tek tıkla
2. **Email + Şifre** — Geleneksel

**Güvenlik:**
- Maksimum 5 başarısız deneme sonrası 15 dakika kilit
- JWT Access Token (15 dk) + Refresh Token (7 gün)
- HTTPS zorunlu

---

## 4. İşletme Sahibi Kayıt Detayları

### 4.1 Kayıt Akışı (Step-by-Step Wizard)

> **"Böl ve Yönet" prensibi:** Uzun form yerine 3-4 adımlı wizard.

#### Adım 1: İşletme Kimlik Bilgileri (Zorunlu)

| Alan | Zorunlu | Doğrulama | Açıklama |
|------|---------|-----------|----------|
| İşletme Adı | ✅ | 3-100 karakter | Marka / Ticari unvan |
| İşletme Türü | ✅ | Dropdown | Restoran, Cafe, Mağaza, Otel, vb. |
| Vergi Numarası | ✅ | 10-11 haneli sayı | TC Vergi No / Ticaret Sicil |
| İşletme Açıklaması | ❌ | Max 500 karakter | Kısa tanıtım metni |

#### Adım 2: Konum & Koordinatlar (Zorunlu)

```
┌─────────────────────────────────────────────────────────────┐
│  📍 İşletme Konumu                                           │
│                                                              │
│  [ Haritada Konum Seç ]  veya  [ Koordinat Gir ]            │
│                                                              │
│  Enlem (Latitude):  [ 41.0082        ]                      │
│  Boylam (Longitude): [ 28.9784       ]                      │
│                                                              │
│  Tam Adres:                                                   │
│  [________________________________]                         │
│                                                              │
│  Şehir: [ İstanbul ▼ ]   İlçe: [ Kadıköy ▼ ]               │
│  Posta Kodu: [ 34710 ]                                       │
└─────────────────────────────────────────────────────────────┘
```

| Alan | Zorunlu | Doğrulama |
|------|---------|-----------|
| Enlem (Latitude) | ✅ | -90 ile +90 arası, 6+ ondalık |
| Boylam (Longitude) | ✅ | -180 ile +180 arası, 6+ ondalık |
| Tam Adres | ✅ | 10-200 karakter |
| Şehir | ✅ | Dropdown (Türkiye illeri) |
| İlçe | ✅ | Şehire bağlı dinamik dropdown |
| Posta Kodu | ❌ | 5 haneli sayı |

**Harita Entegrasyonu:**
- Google Maps / Leaflet.js ile harita üzerinden pin bırakma
- Otomatik koordinat doldurma
- Adres autocomplete (Google Places API)

#### Adım 3: İletişim Bilgileri (Zorunlu + Opsiyonel)

| Alan | Zorunlu | Doğrulama | Açıklama |
|------|---------|-----------|----------|
| Telefon | ✅ | Türkiye formatı: +90 5XX XXX XXXX | Müşteri iletişimi |
| Email | ✅ | RFC 5322 | İşletme iletişim emaili |
| Web Sitesi | ❌ | URL formatı | Varsa işletme web sitesi |
| Instagram | ❌ | @kullaniciadi veya URL | Sosyal medya |
| Facebook | ❌ | URL formatı | Sosyal medya |
| WhatsApp | ❌ | Telefon formatı | Doğrudan iletişim |

#### Adım 4: Çalışma Saatleri (Zorunlu)

```
┌─────────────────────────────────────────────────────────────┐
│  🕐 Çalışma Saatleri                                         │
│                                                              │
│  Pazartesi:  [ 09:00 ▼ ] - [ 22:00 ▼ ]  [ Kapalı ☐ ]        │
│  Salı:      [ 09:00 ▼ ] - [ 22:00 ▼ ]  [ Kapalı ☐ ]        │
│  Çarşamba:  [ 09:00 ▼ ] - [ 22:00 ▼ ]  [ Kapalı ☐ ]        │
│  Perşembe:  [ 09:00 ▼ ] - [ 22:00 ▼ ]  [ Kapalı ☐ ]        │
│  Cuma:      [ 09:00 ▼ ] - [ 22:00 ▼ ]  [ Kapalı ☐ ]        │
│  Cumartesi: [ 10:00 ▼ ] - [ 23:00 ▼ ]  [ Kapalı ☐ ]        │
│  Pazar:     [ 10:00 ▼ ] - [ 20:00 ▼ ]  [ Kapalı ☐ ]        │
│                                                              │
│  [ 7/24 Açık ]  [ Hafta İçi Aynı ]                         │
└─────────────────────────────────────────────────────────────┘
```

**Veritabanı Modeli:**
```json
{
  "businessHours": [
    { "day": "Monday", "open": "09:00", "close": "22:00", "isOpen": true },
    { "day": "Tuesday", "open": "09:00", "close": "22:00", "isOpen": true },
    ...
  ]
}
```

#### Adım 5: Görseller (Opsiyonel ama Önerilen)

| Alan | Zorunlu | Kısıtlamalar |
|------|---------|--------------|
| Kapak Fotoğrafı | ❌ | Max 5MB, JPG/PNG, Min 1200x800px |
| Profil Fotoğrafı (Logo) | ❌ | Max 2MB, JPG/PNG/PNG, 1:1 ratio |
| Galeri Fotoğrafları | ❌ | Max 10 adet, her biri max 5MB |

**Görsel Yükleme Akışı:**
1. Sürükle-bırak veya dosya seçimi
2. Client-side preview
3. Otomatik sıkıştırma (max 1200px genişlik)
4. Cloud storage'a yükleme (AWS S3 / Azure Blob / Local)
5. CDN URL'si veritabanına kaydetme

#### Adım 6: Önizleme & Onay

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ Bilgilerinizi Kontrol Edin                               │
│                                                              │
│  [ Tüm bilgiler özet kart olarak gösterilir ]                │
│                                                              │
│  [ ◀ Geri Dön ]    [ ✔ İşletmemi Oluştur ]                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Zorunlu Alanlar Özeti

**İşletme kaydı için zorunlu alanlar:**
1. İşletme Adı
2. İşletme Türü
3. Vergi Numarası
4. Enlem & Boylam
5. Tam Adres
6. Şehir & İlçe
7. Telefon
8. Email
9. Çalışma Saatleri (en az 1 gün açık olmalı)

---

## 5. Normal Kullanıcı Profili

### 5.1 Temel Profil Bilgileri

| Alan | Zorunlu | Düzenlenebilir |
|------|---------|----------------|
| Ad | ✅ | ✅ |
| Soyad | ✅ | ✅ |
| Kullanıcı Adı | ❌ | ✅ (unique) |
| Email | ✅ | ❌ (değişim için onay) |
| Profil Fotoğrafı | ❌ | ✅ |
| Biyografi | ❌ | ✅ (Max 160 karakter) |
| Doğum Tarihi | ❌ | ✅ |
| Cinsiyet | ❌ | ✅ |
| Telefon | ❌ | ✅ |
| Şehir | ❌ | ✅ |

### 5.2 Kullanıcı Tercihleri

- Bildirim tercihleri (Email, Push)
- Gizlilik ayarları (Profil görünürlüğü)
- Dil tercihi

---

## 6. Sosyal Paylaşım Modülü

### 6.1 Paylaşım Butonları

Her paylaşım (post, işletme, yorum) için aşağıdaki butonlar gösterilir:

```
┌─────────────────────────────────────────────────────────────┐
│  [🔗 Kopyala] [📧 Email] [💼 LinkedIn] [📘 Facebook] [📷 Instagram] │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Platform Bazlı Entegrasyon

#### A. Link Kopyalama

```javascript
// React component
const copyToClipboard = async (url) => {
  await navigator.clipboard.writeText(url);
  toast.success("Link kopyalandı!");
};
```

#### B. Email Paylaşım

```
mailto:?subject=Wayspot'ta bunu keşfettim!&body=Merhaba, bu içeriğe bakmalısın: {URL}
```

#### C. LinkedIn Paylaşım

```
https://www.linkedin.com/sharing/share-offsite/?url={ENCODED_URL}
```

**Özellikler:**
- Open Graph meta tag'leri zorunlu (`og:title`, `og:description`, `og:image`)
- Backend'de dinamik meta tag üretimi (SSR veya prerender)

#### D. Facebook Paylaşım

```
https://www.facebook.com/sharer/sharer.php?u={ENCODED_URL}
```

**Facebook SDK (Opsiyonel — Gelişmiş):**
- Facebook Login ile doğrudan paylaşım
- Paylaşım dialog'u

#### E. Instagram Paylaşım

> **Önemli:** Instagram'ın doğrudan web paylaşım API'si yoktur.

**Çözümler:**
1. **Temel:** "Instagram'da Paylaş" butonu → Link kopyalar + "Instagram'da yapıştır" talimatı gösterir
2. **Gelişmiş:** Instagram Basic Display API + Instagram Graph API (İşletme hesapları için)
   - Önce fotoğrafı indirme seçeneği sunar
   - Kullanıcıyı Instagram'a yönlendirir

```react
// Instagram paylaşım bileşeni
const shareToInstagram = () => {
  // 1. Görseli indir
  downloadImage(shareImageUrl);
  // 2. Kopyala panosuna caption kopyala
  copyToClipboard(shareCaption);
  // 3. Yönlendir
  window.open('https://instagram.com', '_blank');
  // 4. Talimat modalı göster
  showInstructionsModal();
};
```

### 6.3 Paylaşım Veritabanı Modeli

```json
{
  "shareId": "uuid",
  "contentType": "post | business | review",
  "contentId": "uuid",
  "sharedBy": "userId",
  "platform": "linkedin | facebook | email | copy | instagram",
  "sharedAt": "2026-08-13T10:00:00Z",
  "clickCount": 0
}
```

### 6.4 Paylaşım İstatistikleri (Admin Paneli)

- Hangi platform kaç kez kullanıldı
- En çok paylaşılan içerikler
- Paylaşım başarı oranı

---

## 7. API Endpoint Tasarımı

### 7.1 Kimlik Doğrulama

```
POST   /api/auth/register           → Email kayıt
POST   /api/auth/login              → Email giriş
POST   /api/auth/google             → Google OAuth callback
POST   /api/auth/refresh            → Token yenileme
POST   /api/auth/logout             → Çıkış
GET    /api/auth/me                 → Mevcut kullanıcı bilgisi
PUT    /api/auth/profile            → Profil güncelleme
```

### 7.2 İşletme Yönetimi

```
POST   /api/businesses              → İşletme oluştur
GET    /api/businesses              → İşletme listesi (filtreli)
GET    /api/businesses/{id}         → İşletme detayı
PUT    /api/businesses/{id}         → İşletme güncelle
DELETE /api/businesses/{id}         → İşletme sil
POST   /api/businesses/{id}/images  → Görsel yükle
PUT    /api/businesses/{id}/hours   → Çalışma saatleri güncelle
```

### 7.3 Paylaşım

```
POST   /api/shares                  → Paylaşım kaydı (analytics)
GET    /api/shares/stats            → Paylaşım istatistikleri (Admin)
```

---

## 8. Veritabanı Şema Taslağı

### 8.1 Kullanıcılar (Users)

```sql
CREATE TABLE Users (
    Id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Email           VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash    VARCHAR(255),           -- NULL for OAuth users
    FirstName       VARCHAR(50) NOT NULL,
    LastName        VARCHAR(50) NOT NULL,
    UserName        VARCHAR(50) UNIQUE,
    ProfileImage    VARCHAR(500),
    Bio             VARCHAR(160),
    BirthDate       DATE,
    Gender          VARCHAR(10),
    Phone           VARCHAR(20),
    CityId          INT,
    Role            VARCHAR(20) NOT NULL DEFAULT 'User', -- User, BusinessOwner, Admin
    GoogleId        VARCHAR(100),           -- Google sub ID
    EmailConfirmed  BOOLEAN DEFAULT FALSE,
    CreatedAt       TIMESTAMP DEFAULT NOW(),
    UpdatedAt       TIMESTAMP DEFAULT NOW()
);
```

### 8.2 İşletmeler (Businesses)

```sql
CREATE TABLE Businesses (
    Id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    OwnerId         UUID NOT NULL REFERENCES Users(Id),
    Name            VARCHAR(100) NOT NULL,
    Type            VARCHAR(50) NOT NULL,
    TaxNumber       VARCHAR(11) NOT NULL UNIQUE,
    Description     VARCHAR(500),
    Latitude        DECIMAL(10, 8) NOT NULL,
    Longitude       DECIMAL(11, 8) NOT NULL,
    Address         VARCHAR(200) NOT NULL,
    CityId          INT NOT NULL,
    DistrictId      INT NOT NULL,
    PostalCode      VARCHAR(10),
    Phone           VARCHAR(20) NOT NULL,
    Email           VARCHAR(255) NOT NULL,
    Website         VARCHAR(255),
    Instagram       VARCHAR(100),
    Facebook        VARCHAR(255),
    WhatsApp        VARCHAR(20),
    CoverImage      VARCHAR(500),
    LogoImage       VARCHAR(500),
    IsActive        BOOLEAN DEFAULT TRUE,
    IsVerified      BOOLEAN DEFAULT FALSE,
    CreatedAt       TIMESTAMP DEFAULT NOW(),
    UpdatedAt       TIMESTAMP DEFAULT NOW()
);
```

### 8.3 Çalışma Saatleri (BusinessHours)

```sql
CREATE TABLE BusinessHours (
    Id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    BusinessId      UUID NOT NULL REFERENCES Businesses(Id) ON DELETE CASCADE,
    DayOfWeek       INT NOT NULL CHECK (DayOfWeek BETWEEN 0 AND 6), -- 0=Sunday
    OpenTime        TIME NOT NULL,
    CloseTime       TIME NOT NULL,
    IsOpen          BOOLEAN DEFAULT TRUE,
    UNIQUE(BusinessId, DayOfWeek)
);
```

### 8.4 İşletme Görselleri (BusinessImages)

```sql
CREATE TABLE BusinessImages (
    Id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    BusinessId      UUID NOT NULL REFERENCES Businesses(Id) ON DELETE CASCADE,
    ImageUrl        VARCHAR(500) NOT NULL,
    AltText         VARCHAR(200),
    IsPrimary       BOOLEAN DEFAULT FALSE,
    DisplayOrder    INT DEFAULT 0,
    UploadedAt      TIMESTAMP DEFAULT NOW()
);
```

### 8.5 Paylaşımlar (Shares)

```sql
CREATE TABLE Shares (
    Id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId          UUID NOT NULL REFERENCES Users(Id),
    ContentType     VARCHAR(20) NOT NULL, -- post, business, review
    ContentId       UUID NOT NULL,
    Platform        VARCHAR(20) NOT NULL, -- linkedin, facebook, email, copy, instagram
    SharedAt        TIMESTAMP DEFAULT NOW(),
    IpAddress       INET
);
```

---

## 9. Frontend React Bileşen Yapısı

```
src/
├── components/
│   ├── Auth/
│   │   ├── GoogleLoginButton.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── LoginForm.jsx
│   │   └── RoleSelector.jsx
│   ├── Business/
│   │   ├── BusinessWizard/
│   │   │   ├── Step1_Identity.jsx
│   │   │   ├── Step2_Location.jsx
│   │   │   ├── Step3_Contact.jsx
│   │   │   ├── Step4_Hours.jsx
│   │   │   ├── Step5_Images.jsx
│   │   │   └── Step6_Preview.jsx
│   │   ├── BusinessCard.jsx
│   │   ├── BusinessDetail.jsx
│   │   └── BusinessHoursEditor.jsx
│   ├── Profile/
│   │   ├── UserProfile.jsx
│   │   └── BusinessOwnerProfile.jsx
│   └── SocialShare/
│       ├── ShareButtons.jsx
│       ├── ShareModal.jsx
│       └── InstagramShareGuide.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useBusiness.js
│   └── useShare.js
├── context/
│   └── AuthContext.jsx
└── services/
    ├── authService.js
    ├── businessService.js
    └── shareService.js
```

---

## 10. Güvenlik & Validasyon

### 10.1 Backend Validasyonları (.NET Core FluentValidation)

```csharp
public class BusinessCreateValidator : AbstractValidator<BusinessCreateDto>
{
    public BusinessCreateValidator()
    {
        RuleFor(x => x.Name).NotEmpty().Length(3, 100);
        RuleFor(x => x.TaxNumber).NotEmpty().Matches(@"^\d{10,11}$");
        RuleFor(x => x.Latitude).InclusiveRange(-90, 90);
        RuleFor(x => x.Longitude).InclusiveRange(-180, 180);
        RuleFor(x => x.Email).EmailAddress();
        RuleFor(x => x.Phone).Matches(@"^\+90\s?5\d{2}\s?\d{3}\s?\d{4}$");
    }
}
```

### 10.2 Rate Limiting

```csharp
// Program.cs
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("register", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(15);
    });
});
```

### 10.3 Dosya Yükleme Güvenliği

- Sadece JPG, PNG, WEBP
- Max 5MB
- Magic number kontrolü (file signature)
- Antivirus taraması (ClamAV vb.)
- Rastgele dosya adı (UUID)

---

## 11. Kullanıcı Deneyimi (UX) İlkeleri

### 11.1 Kayıt Süreci UX

| Prensip | Uygulama |
|---------|----------|
| **Azalt** | Her adımda max 5 alan |
| **Akıllı Varsayılanlar** | Şehir: IP'den tahmin, Saatler: 09:00-22:00 |
| **Anlık Doğrulama** | Blur olayında hata gösterimi |
| **İlerleme Çubuğu** | "Adım 2/4" gösterimi |
| **Geri Dönüş** | Tüm adımlarda geri butonu |
| **Kaydet & Devam Et** | Form verisi localStorage'da saklanır |
| **Mobil Öncelikli** | Tüm formlar mobil uyumlu |

### 11.2 Boğmayan Tasarım

- Zorunlu olmayan alanlar "Opsiyonel" etiketiyle belirtilir
- Araç ipuçları (tooltip) ile yardım metni
- Otomatik tamamlama (autocomplete) kullanımı
- Adres seçimi: Harita > Metin girişi

---

## 12. Geliştirme Aşamaları (Roadmap)

### Faz 1: MVP (Minimum Viable Product)
- [ ] Google OAuth kayıt/giriş
- [ ] Normal kullanıcı kaydı
- [ ] Temel profil yönetimi
- [ ] İşletme kaydı (zorunlu alanlar)
- [ ] Link kopyalama + Email paylaşım

### Faz 2: Gelişmiş Özellikler
- [ ] İşletme görselleri
- [ ] Çalışma saatleri editörü
- [ ] LinkedIn & Facebook paylaşım
- [ ] Instagram paylaşım kılavuzu
- [ ] Paylaşım istatistikleri

### Faz 3: Optimizasyon
- [ ] Performans iyileştirmeleri
- [ ] SEO & meta tag optimizasyonu
- [ ] Bildirim sistemi
- [ ] Admin paneli tamamlama

---

## 13. Ekler

### 13.1 HTTP Durum Kodları

| Kod | Durum | Senaryo |
|-----|-------|---------|
| 200 | OK | Başarılı GET/PUT/DELETE |
| 201 | Created | Başarılı POST |
| 400 | Bad Request | Validasyon hatası |
| 401 | Unauthorized | Token geçersiz/yok |
| 403 | Forbidden | Yetkisiz erişim |
| 404 | Not Found | Kaynak bulunamadı |
| 409 | Conflict | Email zaten kayıtlı |
| 429 | Too Many Requests | Rate limit aşıldı |
| 500 | Internal Error | Sunucu hatası |

### 13.2 Hata Mesajları (Türkçe)

```json
{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "Bu email adresi zaten kayıtlı. Giriş yapmayı deneyin.",
    "suggestion": "Google ile giriş yapabilir veya şifrenizi sıfırlayabilirsiniz."
  }
}
```

---

> **Not:** Bu doküman canlı bir belgedir. Proje ilerledikçe güncellenmeli ve ekip tarafından sürekli referans alınmalıdır.

**Son Güncelleme:** 2026-08-13
**Versiyon:** 1.0
**Yazar:** Wayspot Dev Team
