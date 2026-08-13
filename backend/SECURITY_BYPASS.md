# WaySpot — Local Development Security Bypass Guide

## Tek Seferde Tüm Güvenlikleri Kapatma

Geliştirme sırasında güvenlik önlemlerini tek bir değişiklikle devre dışı bırakmak için aşağıdaki adımları izleyin:

### Backend (.NET API)

**Yöntem 1: appsettings.Development.json Kullan (Önerilen)**

`backend/WaySpot.API/appsettings.Development.json` dosyası zaten tüm güvenlik önlemlerini kapalı olarak yapılandırılmıştır:

```json
{
  "Security": {
    "EnableSecurityHeaders": false,
    "EnableRateLimiting": false,
    "EnableBruteForceProtection": false,
    "EnableCors": true,
    "RequireHttps": false,
    "EnableSwagger": true,
    "EnableDatabaseSecurity": false,
    "EnableAuditLogging": false,
    "EnableIpBlocking": false,
    "EnableJwtBlacklist": false
  }
}
```

.NET otomatik olarak `ASPNETCORE_ENVIRONMENT=Development` olduğunda bu dosyayı kullanır.

**Yöntem 2: Environment Variables ile**

Terminal'de şu komutu çalıştırın:

```bash
export ASPNETCORE_ENVIRONMENT=Development
cd backend/WaySpot.API
dotnet run
```

**Yöntem 3: appsettings.json ile Tek Hamle**

Eğer development dosyası kullanmak istemiyorsanız, `appsettings.json` içindeki tüm `Enable*` değerlerini `false` yapın:

```json
"Security": {
  "EnableSecurityHeaders": false,
  "EnableRateLimiting": false,
  "EnableBruteForceProtection": false,
  "EnableCors": false,
  "RequireHttps": false,
  "EnableSwagger": true,
  "EnableDatabaseSecurity": false,
  "EnableAuditLogging": false,
  "EnableIpBlocking": false,
  "EnableJwtBlacklist": false
}
```

### Frontend (React)

**Yöntem 1: .env Dosyası**

`frontend/.env` dosyasını düzenleyin:

```env
VITE_ENABLE_SECURITY_HEADERS=false
VITE_ENABLE_CSP=false
VITE_ENABLE_XSS_PROTECTION=false
VITE_API_URL=http://localhost:5075/api
VITE_APP_ENV=development
```

**Yöntem 2: .env.example'dan Kopyala**

```bash
cp frontend/.env.example frontend/.env
# Gerekli değerleri düzenleyin
```

### Mobil (React Native)

Mobil uygulama için güvenlik ayarları `WaySpotMobile/src/utils/constants.js` içindeki `API_BASE_URL` ile kontrol edilir. Local development için:

```javascript
export const API_BASE_URL = 'http://10.0.2.2:5075/api'; // Android emulator
// veya
export const API_BASE_URL = 'http://localhost:5075/api'; // iOS simulator
```

### Database

Veritabanı güvenlik özellikleri (RLS, Audit triggers) `dbsetup.sql` içinde tanımlıdır. Local development için bu özellikleri kapatmak için:

```sql
-- RLS'yi kapatmak için:
ALTER TABLE "Users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Businesses" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "SavedRoutes" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Posts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Reviews" DISABLE ROW LEVEL SECURITY;

-- Audit trigger'ları kaldırmak için:
DROP TRIGGER IF EXISTS users_audit_trigger ON "Users";
DROP TRIGGER IF EXISTS businesses_audit_trigger ON "Businesses";
DROP TRIGGER IF EXISTS reviews_audit_trigger ON "Reviews";
DROP TRIGGER IF EXISTS posts_audit_trigger ON "Posts";
```

### Tek Seferde Tümünu Kapatma (Cheat Sheet)

```bash
# Backend
cd backend/WaySpot.API
export ASPNETCORE_ENVIRONMENT=Development
dotnet run

# Frontend
cd frontend
cp .env.example .env
npm run dev

# Database
psql -h 192.168.1.123 -U casaos -d wayspot -c "
  ALTER TABLE \"Users\" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE \"Businesses\" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE \"SavedRoutes\" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE \"Posts\" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE \"Reviews\" DISABLE ROW LEVEL SECURITY;
"
```

## Production'da Güvenliği Aktif Etme

Production ortamında güvenliği aktif etmek için:

1. `appsettings.Production.json` oluşturun ve tüm `Enable*` değerlerini `true` yapın
2. `ASPNETCORE_ENVIRONMENT=Production` olarak ayarlayın
3. HTTPS zorunlu hale getirin (`RequireHttps: true`)
4. CORS'u sadece production domain'lere kısıtlayın
5. Database RLS ve Audit trigger'ları aktif edin

## Not

- `appsettings.Development.json` Git'e eklenmelidir (local geliştirme için ortam ayarlarını içerir)
- `appsettings.json` production bağlantı bilgilerini içerir
- `.env` dosyası `.gitignore`'da olmalıdır (frontend için)
