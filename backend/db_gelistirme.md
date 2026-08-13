# WaySpot — Veritabanı Geliştirme Planı

## 1. Genel Bakış

Bu doküman, WaySpot projesinin PostgreSQL veritabanı alanında yapılacak tüm geliştirme, migrasyon, dokümantasyon ve test çalışmalarını kapsar. Hedef, mevcut Entity Framework Core migrasyonlarını doğrulamak, üretim ortamına uygun `dbsetup.sql` kurulum scripti üretmek, örnek verilerle sistemi test edilebilir hale getirmek ve backend tarafında bağlantıyı kesintisiz sağlamaktır.

---

## 2. Mevcut Durum Analizi

### 2.1 Teknoloji Stack
- **ORM:** Entity Framework Core 8
- **Veritabanı:** PostgreSQL + PostGIS (geometry desteği için)
- **Provider:** Npgsql.EntityFrameworkCore.PostgreSQL
- **Konum:** NetTopologySuite (coğrafi koordinat tipleri için)

### 2.2 Mevcut Entity Yapısı
| Entity | Tablo Adı | Açıklama |
|--------|-----------|----------|
| AppUser | Users | Kullanıcılar (User, Business, Admin rolleri) |
| Business | Businesses | İşletmeler (konum Point geometry) |
| Post | Posts | Kampanya/gönderiler |
| Review | Reviews | Yorumlar (IsApproved, IsFlagged desteği) |
| SavedRoute | SavedRoutes | Kayıtlı rotalar (başlangıç/bitiş Point geometry) |

### 2.3 Mevcut Migrasyonlar
- `20260812072233_InitialCreate` — Ana tablolar (Users, Businesses, SavedRoutes, Posts, Reviews)
- `20260812120316_AddReviewModeration` — Reviews tablosuna IsApproved, IsFlagged ekler

**Durum:** Migrasyonlar entity yapısı ile uyumlu. Her iki migrasyon da sırayla uygulanabilir durumda.

### 2.4 Mevcut Bağlantı Ayarları
- **Dosya:** `backend/WaySpot.API/appsettings.json`
- **Mevcut connection string:** `Host=localhost;Port=5432;Database=wayspot_db;Username=wayspot_admin;Password=wayspot_secret_2024`
- **Güncellenecek bağlantı:** `Host=192.168.1.123;Port=5432;Database=wayspot;Username=casaos;Password=casaos`

---

## 3. Geliştirme Adımları

### Adım 1: Veritabanı Bağlantı Ayarlarını Güncelle
- `appsettings.json` dosyasındaki DefaultConnection bağlantı cümlesini hedef PostgreSQL sunucusuna yönlendir.
- Bağlantı testi için `dotnet run` ile backend başlatılacak ve swagger üzerinden sağlık kontrolü yapılacak.

### Adım 2: PostgreSQL Yerel Geliştirme Ortamı
- Geliştirme sırasında PostgreSQL'in yerel makinede çalıştırıldığından emin olun.
- `dotnet ef database update` komutuyla migrasyonlar uygulanacak.
- Alternatif olarak, elle `dbsetup.sql` çalıştırılabilir.

### Adım 3: Migrasyon Doğrulama
- Tüm entity’lerin karşılığı olan tabloların oluşturulduğunu doğrula.
- Review tablosunda `IsApproved` ve `IsFlagged` kolonlarının varlığını kontrol et.
- Foreign key kısıtlamalarını (FK_Reviews_Businesses_BusinessId vb.) doğrula.
- PostGIS uzantısının etkin olduğunu doğrula.

### Adım 4: Seed Data Stratejisi
- **Kullanıcılar:** Password hash’leri BCrypt ile üretilecek.
- **İşletmeler:** En az 3 farklı konumda (Ankara çevresi) test işletmesi.
- **Kampanyalar:** Her işletme için 1-2 adet aktif/geçmiş kampanya.
- **Yorumlar:** Hem onaylı hem bekleyen yorumlar eklenecek.
- **Rotalar:** 2-3 kayıtlı rota örneği.
- **Admin Kullanıcı:** Role=3 olan örnek admin hesabı.

### Adım 5: `dbsetup.sql` Üretimi
- Tamamen PostgreSQL-native bir script olacak.
- `CREATE EXTENSION IF NOT EXISTS postgis;` ile PostGIS aktifleştirilecek.
- Tablo oluşturma, indeksleme, foreign key, unique constraint adımları tek dosyada birleştirilecek.
- BCrypt hash’leri seed data içerisine gömülecek.
- `ON DELETE CASCADE` ve `ON DELETE RESTRICT` kuralları entity yapısı ile uyumlu olacak.

### Adım 6: Test ve Doğrulama
- Backend başlatıldıktan sonra Swagger üzerinden tüm endpoint’ler test edilecek.
- Login → JWT token alınacak.
- Profil, işletme detay, yorum ekleme, rota listeleme endpoint’leri ile veritabanı akışı doğrulanacak.
- Frontend ve mobil uygulamalar API base URL olarak `http://localhost:5075` kullanıyor, bu adres backend çalıştığı sürece değişmeyecektir.

---

## 4. Güvenlik ve Üretim Notları

- **Şifreler:** Üretim ortamında mutlaka BCrypt (veya daha güçlü bir algoritma) ile hash’lenecek. `dbsetup.sql` içindeki hash’ler sadece test amaçlıdır.
- **Connection String:** `appsettings.json` içinde tutulacak. Üretimde environment variable veya user-secrets kullanılması önerilir.
- **JWT Secret:** `Jwt:Key` değeri en az 32 karakter olmalı ve üretimde gizli tutulmalıdır.
- **PostGIS:** Yalnızca coğrafi sorgular için kullanılacaktır; gereksiz yere geniş izinler verilmeyecektir.

---

## 5. Riskler ve Önlemler

| Risk | Önlem |
|------|-------|
| Migration’lar entity ile uyumsuz | Entity ve migration tarafını sıkı kontrol et. |
| BCrypt hash üretimi hatasız olmayabilir | Hash üretimini otomatik script ile yap, elle yazma. |
| PostgreSQL PostGIS kurulu olmayabilir | `dbsetup.sql` başında `CREATE EXTENSION` komutu ekle. |
| Başka bir geliştirici aynı DB'yi kullanıyorsa | Tablo adları ve schema yapısını dokümante et. |

---

## 6. Teslim Edilecek Çıktılar

1. Güncellenmiş `appsettings.json`
2. Yeni `dbsetup.sql` (schema + seed data)
3. Gerekirse migration düzeltmeleri
4. `db_gelistirme.md` plan dosyası

---

*Plan hazırlanma tarihi: 2026-08-13*
