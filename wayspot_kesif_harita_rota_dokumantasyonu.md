# Wayspot - Keşif Akışı, Harita & Rota Planlama Dokümantasyonu

## 1. Genel Bakış

Bu doküman, **Wayspot** platformunun keşif akışı, harita tabanlı işletme keşfi ve akıllı rota planlama modüllerinin detaylı spesifikasyonlarını içerir.

**Mevcut Durum:** Basit harita + liste görünümü  
**Hedef:** Instagram/Facebook benzeri zengin, resimli, canlı bir keşif akışı + haritada yakındaki işletmeler + rota üzeri akıllı öneriler

---

## 2. Keşif Akışı (Discovery Feed)

### 2.1 Felsefe

> **"Her kaydırma bir keşif olsun."**

Facebook/Instagram benzeri, görsel ağırlıklı, sınırsız kaydırılabilir (infinite scroll) bir akış. Kullanıcılar sadece kaydırarak yeni işletmeler, mekanlar ve deneyimler keşfeder.

### 2.2 Akış Kartı Tasarımı

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │              [ KAPAK FOTOĞRAFI / GALERİ ]           │   │
│  │              (Swipable carousel, 16:9)              │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  🏪 Konyaaltı Balıkçısı                          ⭐ 4.8    │
│  📍 Konyaaltı, Antalya • 🚶 1.2 km uzaklıkta               │
│  🕐 Açık • 09:00 - 23:00                                   │
│  🏷️ Restoran • Deniz Ürünleri • Aile Dostu                │
│                                                              │
│  "Günlük taze deniz ürünleri ile akşam yemeğine           │
│   bekliyoruz! Özel menümüzü kaçırmayın..."                 │
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │  ❤️ 234    │ │  💬 45     │ │  🔖 Kaydet │             │
│  └────────────┘ └────────────┘ └────────────┘             │
│                                                              │
│  [📤 Paylaş] [🗺️ Yol Tarifi] [📞 Ara] [🌐 Web Sitesi]    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👤 @ahmet_y: "Harika bir mekan, balıkları muhteşem!"│   │
│  │ 👤 @zeynep_k: "Manzara eşsiz, mutlaka gidin."       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Akış Kartı Bileşenleri

| Bileşen | Tip | Açıklama |
|---------|-----|----------|
| **Görsel Galerisi** | Carousel | 3-10 fotoğraf, swipe edilebilir, dot indicator |
| **İşletme Adı** | Metin | Tıklanabilir, detay sayfasına yönlendirir |
| **Puan** | ⭐ 0-5 | Kullanıcı yorumları ortalaması |
| **Konum** | Metin | İlçe, Şehir formatında |
| **Uzaklık** | Metin | Kullanıcının anlık konumuna göre hesaplanır |
| **Durum** | Badge | "Açık" (yeşil) / "Kapalı" (kırmızı) / "Kapanmak Üzere" (sarı) |
| **Çalışma Saatleri** | Metin | Bugünün saatleri |
| **Etiketler** | Chip | İşletme türü + özellikler |
| **Açıklama** | Metin | Max 150 karakter, "devamı..." ile uzatılabilir |
| **Etkileşim Butonları** | Action | Beğen, Yorum, Kaydet |
| **Hızlı İşlemler** | Action | Paylaş, Yol Tarifi, Ara, Web Sitesi |
| **Son Yorumlar** | Preview | En fazla 2 yorum önizlemesi |

### 2.4 Akış Tipleri

```
┌─────────────────────────────────────────────────────────────┐
│  [ 🔥 Popüler ] [ 📍 Yakınımda ] [ 🍽️ Yemek ] [ ☕ Kafe ]   │
│  [ 🏨 Otel ] [ 🛍️ Alışveriş ] [ 🎭 Eğlence ] [ ➕ Filtre ] │
└─────────────────────────────────────────────────────────────┘
```

| Akış Tipi | Algoritma | Açıklama |
|-----------|-----------|----------|
| **Popüler** | Beğeni + ziyaret + yorum ağırlıklı | En çok etkileşim alan işletmeler |
| **Yakınımda** | Mesafe (km) + açık/kapalı durumu | Kullanıcının konumuna göre sıralı |
| **Kategoriler** | Kategori filtresi + popülerlik | Yemek, Kafe, Otel, Alışveriş, Eğlence |
| **Filtrele** | Çoklu filtre | Mesafe (1-5-10-20 km), açık/kapalı, puan (4+), etiket |

### 2.5 Infinite Scroll & Pagination

```csharp
// API: GET /api/feed?page=1&pageSize=10&filter=nearby&lat=36.8&lng=30.7
public class FeedRequestDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public FeedFilter Filter { get; set; } = FeedFilter.Popular;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public double? MaxDistanceKm { get; set; } = 10;
    public string? Category { get; set; }
    public bool? IsOpenNow { get; set; }
    public double? MinRating { get; set; }
}
```

**Frontend (React):**
```jsx
// useFeed hook
const useFeed = (filter) => {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['feed', filter],
    queryFn: ({ pageParam = 1 }) => fetchFeed({ ...filter, page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
  });

  // Intersection Observer ile otomatik yükleme
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && hasNextPage && fetchNextPage(),
      { rootMargin: '200px' }
    );
    // ...
  }, []);

  return { data, fetchNextPage, hasNextPage };
};
```

---

## 3. Harita Tabanlı Keşif (Map Discovery)

### 3.1 Harita Görünümü

```
┌─────────────────────────────────────────────────────────────┐
│  [🔍 Ara...] [📍 Konumum] [⚙️ Filtre]                      │
│                                                              │
│     ┌──────────────────────────────────────────┐             │
│     │                                          │             │
│     │        🗺️ HARİTA (Leaflet / Google)      │             │
│     │                                          │             │
│     │     📍        📍                           │             │
│     │          📍        📍                    │             │
│     │               👤 (ben)                   │             │
│     │     📍              📍                   │             │
│     │                                          │             │
│     └──────────────────────────────────────────┘             │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [📍 Konyaaltı Balıkçısı]  [📍 Kaleiçi Kahve]       │    │
│  │  [📍 Düden Şelalesi]       [📍 +12 daha fazla]      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  [📋 Liste Görünümü]  [🗺️ Harita Görünümü]                 │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Harita Marker'ları

| Marker Tipi | Görünüm | Anlamı |
|-------------|---------|--------|
| **Açık İşletme** | Yeşil pin | Şu an açık |
| **Kapalı İşletme** | Kırmızı pin | Şu an kapalı |
| **Kapanmak Üzere** | Sarı pin | 30 dk içinde kapanacak |
| **Kullanıcı Konumu** | Mavi nokta + halka | GPS konumu |
| **Seçili İşletme** | Büyük pin + popup | Tıklanan işletme |

### 3.3 Clustering (Kümeleme)

Çok sayıda marker olduğunda:
- Zoom out → Marker'lar sayısal cluster halinde birleşir
- Zoom in → Cluster ayrılır, bireysel marker'lar görünür

```javascript
// Leaflet.markercluster
const markers = L.markerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  maxClusterRadius: 80,
  iconCreateFunction: (cluster) => {
    return L.divIcon({
      html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
      className: 'marker-cluster',
      iconSize: L.point(40, 40)
    });
  }
});
```

### 3.4 Harita Popup (Tıklanan İşletme)

```
┌─────────────────────────────┐
│  ┌─────────────────────┐    │
│  │   [Kapak Fotoğrafı] │    │
│  └─────────────────────┘    │
│  Konyaaltı Balıkçısı   ⭐4.8│
│  🚶 1.2 km  •  🕐 Açık      │
│                             │
│  [Detaylar] [Yol Tarifi]    │
└─────────────────────────────┘
```

### 3.5 Yakınımdaki İşletmeler API

```csharp
// GET /api/businesses/nearby?lat=36.8854&lng=30.7033&radiusKm=5&limit=50
[HttpGet("nearby")]
public async Task<ActionResult<List<BusinessNearbyDto>>> GetNearbyBusinesses(
    [FromQuery] double lat,
    [FromQuery] double lng,
    [FromQuery] double radiusKm = 5,
    [FromQuery] string? category = null,
    [FromQuery] bool? isOpen = null)
{
    // PostGIS / SQL Spatial Query
    var businesses = await _context.Businesses
        .Where(b => EF.Functions.Distance(
            b.Location, 
            new Point(lng, lat) { SRID = 4326 }
        ) <= radiusKm * 1000)
        .WhereIf(category != null, b => b.Type == category)
        .Select(b => new BusinessNearbyDto
        {
            Id = b.Id,
            Name = b.Name,
            Latitude = b.Latitude,
            Longitude = b.Longitude,
            DistanceKm = EF.Functions.Distance(b.Location, new Point(lng, lat) { SRID = 4326 }) / 1000,
            IsOpenNow = IsOpenNow(b.BusinessHours),
            Rating = b.AverageRating,
            CoverImage = b.CoverImage,
            Type = b.Type
        })
        .OrderBy(b => b.DistanceKm)
        .Take(50)
        .ToListAsync();

    return Ok(businesses);
}
```

### 3.6 Konum İzni Akışı

```
┌─────────────────────────────────────────────────────────────┐
│  📍 Konumunuza Erişim                                       │
│                                                              │
│  Size yakındaki işletmeleri gösterebilmemiz için            │
│  konum izni vermeniz gerekiyor.                             │
│                                                              │
│  [ ✔ Konumumu Kullan ]    [ ❌ Sonra ]                     │
│                                                              │
│  Konumunuz sadece size yakın mekanları bulmak için          │
│  kullanılır, kaydedilmez.                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Akıllı Rota Planlama (Smart Route Planner)

### 4.1 Felsefe

> **"Sadece A noktasından B noktasına gitmek değil, yolun tadını çıkarmak."**

Kullanıcı rota oluşturduğunda, sistem sadece en kısa yolu değil; yol üzerindeki ilginç işletmeleri, manzaraları ve durakları da önerir.

### 4.2 Rota Planlama Arayüzü

```
┌─────────────────────────────────────────────────────────────┐
│  🧭 Rota Planlayıcı                                          │
│                                                              │
│  Başlangıç Noktası:                                         │
│  [📍 Mevcut Konumum ]  veya  [________________]             │
│                                                              │
│  Varış Noktası:                                             │
│  [________________]  [🔍 Ara]                                │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Yol Üzerinde Görmek İstediğim:                      │   │
│  │                                                      │   │
│  │  ☑️ Restoranlar    ☑️ Kafeler    ☑️ Tarihi Yerler   │   │
│  │  ☑️ Manzaralar     ☑️ Alışveriş  ☐ Eğlence          │   │
│  │                                                      │   │
│  │  Max Sapma Mesafesi: [ 2 km ▼ ]                     │   │
│  │  (Ana yoldan en fazla 2 km uzaklıktaki yerler)       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [ 🗺️ Rotayı Oluştur ]                                      │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Rota Sonuç Ekranı

```
┌─────────────────────────────────────────────────────────────┐
│  🗺️ Harita (Rota çizgisi + öneri marker'ları)               │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📊 Rota Özeti                                       │   │
│  │  Toplam: 537 km • Tahmini Süre: 6s 15dk             │   │
│  │  🏪 Yol üzerinde 12 öneri bulundu                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📍 Yol Üzeri Öneriler                               │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │ 📍 Km 45 - Mevlana Müzesi                     │  │   │
│  │  │    Konya • ⭐ 4.9 • Tarihi Yer               │  │   │
│  │  │    "Yoldan 1.2 km sapma"                      │  │   │
│  │  │    [🛑 Durak Ekle] [Detaylar]                │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │ 📍 Km 128 - Etli Ekmekçi Ahmet Usta           │  │   │
│  │  │    Konya • ⭐ 4.7 • Restoran                  │  │   │
│  │  │    "Yoldan 800m sapma, öğle yemeği için ideal"│  │   │
│  │  │    [🛑 Durak Ekle] [Detaylar]                │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │ 📍 Km 245 - Tuz Gölü Manzarası               │  │   │
│  │  │    Aksaray • ⭐ 4.5 • Manzara                │  │   │
│  │  │    "Ana yol üzerinde, 10 dk fotoğraf molası" │  │   │
│  │  │    [🛑 Durak Ekle] [Detaylar]                │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │  [ + 9 öneri daha... ]                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [ 📋 Rota Planımı Gör ]  [ 🚀 Rotayı Başlat ]              │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Rota Üzeri İşletme Öneri Algoritması

```csharp
public class RouteRecommendationService
{
    /// <summary>
    /// Rota üzerindeki işletmeleri bulur ve önerir
    /// </summary>
    public async Task<List<RouteStopRecommendation>> GetRecommendationsAlongRoute(
        List<Coordinate> routePoints,  // Rota noktaları (Google Directions API'den)
        double maxDeviationKm,         // Ana yoldan max sapma (default: 2km)
        List<string> preferredCategories,
        int maxResults = 20)
    {
        var recommendations = new List<RouteStopRecommendation>();

        // 1. Rota noktalarını 5 km aralıklarla örnekleyelim
        var sampledPoints = SampleRoutePoints(routePoints, intervalKm: 5);

        foreach (var point in sampledPoints)
        {
            // 2. Her nokta etrafında yarıçap içindeki işletmeleri bul
            var nearbyBusinesses = await _businessRepository
                .GetNearbyAsync(point.Lat, point.Lng, radiusKm: maxDeviationKm);

            // 3. Kategori filtresi uygula
            if (preferredCategories?.Any() == true)
            {
                nearbyBusinesses = nearbyBusinesses
                    .Where(b => preferredCategories.Contains(b.Type))
                    .ToList();
            }

            // 4. Her işletme için rota üzerine olan dik uzaklığı hesapla
            foreach (var business in nearbyBusinesses)
            {
                var deviation = CalculatePerpendicularDistance(
                    routePoints, 
                    new Coordinate(business.Latitude, business.Longitude)
                );

                // 5. Sadece max sapma içindekileri al
                if (deviation <= maxDeviationKm)
                {
                    // 6. Rota üzerindeki kilometre pozisyonunu bul
                    var routeKm = CalculateRouteDistance(routePoints, point);

                    recommendations.Add(new RouteStopRecommendation
                    {
                        BusinessId = business.Id,
                        BusinessName = business.Name,
                        Category = business.Type,
                        Rating = business.AverageRating,
                        RouteKm = routeKm,
                        DeviationKm = deviation,
                        CoverImage = business.CoverImage,
                        IsOnMainRoute = deviation < 0.5, // Ana yol üzerinde mi?
                        EstimatedStopMinutes = EstimateStopTime(business.Type),
                        Reason = GenerateReason(business, deviation)
                    });
                }
            }
        }

        // 7. Tekrarlayanları kaldır, en iyi puanlıları seç
        return recommendations
            .GroupBy(r => r.BusinessId)
            .Select(g => g.OrderBy(r => r.DeviationKm).First())
            .OrderBy(r => r.RouteKm)
            .Take(maxResults)
            .ToList();
    }

    private string GenerateReason(Business business, double deviation)
    {
        if (deviation < 0.3)
            return "Ana yol üzerinde, durmadan geçmeyin!";
        else if (deviation < 1.0)
            return $"Yoldan sadece {deviation:F1} km sapma";
        else
            return $"Yoldan {deviation:F1} km sapma, değer bir durak";
    }

    private int EstimateStopTime(string category)
    {
        return category switch
        {
            "Restoran" => 60,
            "Kafe" => 30,
            "Tarihi Yer" => 45,
            "Manzara" => 15,
            "Alışveriş" => 40,
            _ => 20
        };
    }
}
```

### 4.5 Rota Üzeri Öneri DTO

```csharp
public class RouteStopRecommendation
{
    public Guid BusinessId { get; set; }
    public string BusinessName { get; set; }
    public string Category { get; set; }
    public double Rating { get; set; }
    public double RouteKm { get; set; }           // Rota başlangıcından kaçıncı km
    public double DeviationKm { get; set; }       // Ana yoldan sapma mesafesi
    public string CoverImage { get; set; }
    public bool IsOnMainRoute { get; set; }
    public int EstimatedStopMinutes { get; set; }
    public string Reason { get; set; }            // Neden önerildiği açıklaması
    public bool IsAddedToRoute { get; set; }      // Kullanıcı durak ekledi mi?
}
```

### 4.6 Rota Oluşturma Akışı

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Kullanıcı │───▶│ Başlangıç/   │───▶│ Google Maps  │───▶│ Rota Noktaları│
│  Girişi   │    │ Varış Girişi │    │ Directions   │    │ (Polyline)   │
└──────────┘    └──────────────┘    │ API          │    └──────┬───────┘
                                    └──────────────┘           │
                                                                 ▼
                                    ┌──────────────┐    ┌──────────────┐
                                    │ Öneriler     │◀───│ Buffer Zone  │
                                    │ Listesi      │    │ Hesaplama    │
                                    │ (Sıralı)     │    │ (±2km)       │
                                    └──────┬───────┘    └──────────────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ Kullanıcı    │
                                    │ Durak Seçimi │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ Final Rota   │
                                    │ (Ana rota +  │
                                    │  duraklar)   │
                                    └──────────────┘
```

### 4.7 Rota Detay / Planım Ekranı

```
┌─────────────────────────────────────────────────────────────┐
│  📋 Rota Planım: Ankara → Antalya                           │
│  Toplam: 537 km • 6s 15dk • 3 Durak                          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  🚗 Ankara (Başlangıç)                              │     │
│  │     08:00                                           │     │
│  │     │                                               │     │
│  │     │ 120 km • 1s 30dk                              │     │
│  │     ▼                                               │     │
│  │  🛑 Durak 1: Tuz Gölü Manzarası                     │     │
│  │     ⏱️ 15 dk mola                                   │     │
│  │     │                                               │     │
│  │     │ 200 km • 2s 30dk                              │     │
│  │     ▼                                               │     │
│  │  🛑 Durak 2: Mevlana Müzesi                         │     │
│  │     ⏱️ 45 dk mola                                   │     │
│  │     │                                               │     │
│  │     │ 150 km • 1s 45dk                              │     │
│  │     ▼                                               │     │
│  │  🛑 Durak 3: Etli Ekmekçi Ahmet Usta                │     │
│  │     ⏱️ 60 dk öğle yemeği                            │     │
│  │     │                                               │     │
│  │     │ 67 km • 45dk                                  │     │
│  │     ▼                                               │     │
│  │  🏁 Antalya (Varış)                                 │     │
│  │     14:30                                           │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  [ 🗺️ Haritada Gör ]  [ 📤 Paylaş ]  [ 💾 Kaydet ]         │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Konum Bazlı Öneriler (Location-Based Recommendations)

### 5.1 "Şurada Şu Var" Özelliği

Kullanıcı belirli bir şehir veya bölge seçtiğinde:

```
┌─────────────────────────────────────────────────────────────┐
│  📍 Konya'da Ne Var?                                         │
│                                                              │
│  🏆 Popüler İşletmeler:                                      │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  1. Mevlana Müzesi              ⭐ 4.9  📍 Merkez  │     │
│  │  2. Etli Ekmekçi Ahmet Usta     ⭐ 4.8  📍 Merkez  │     │
│  │  3. Alaeddin Tepesi             ⭐ 4.7  📍 Merkez  │     │
│  │  4. Konya Bilim Merkezi         ⭐ 4.6  📍 Selçuklu│     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  🍽️ Konya'da Yemek:                                          │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  • Fırın Kebabı - Kebapçı Mahmut    ⭐ 4.8          │     │
│  │  • Etli Ekmek - Hacı Şükrü          ⭐ 4.7          │     │
│  │  • Mevlana Böreği - Börekçi Ali     ⭐ 4.5          │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  🎯 Konya'da Yapılacaklar:                                   │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  • Mevlana Müzesi'ni ziyaret et                     │     │
│  │  • Alaeddin Tepesi'nde gün batımı izle              │     │
│  │  • Konya Lezzet Rotası'nda 5 duraklı tur yap        │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  [ 🗺️ Konya Haritasını Gör ]  [ 🧭 Konya Rotası Oluştur ]  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Şehir Bazlı API

```csharp
// GET /api/cities/{cityId}/discover
[HttpGet("{cityId}/discover")]
public async Task<ActionResult<CityDiscoveryDto>> GetCityDiscovery(Guid cityId)
{
    var city = await _cityService.GetByIdAsync(cityId);

    var popularBusinesses = await _businessRepository
        .GetTopRatedByCityAsync(cityId, limit: 10);

    var categories = await _businessRepository
        .GetCategoryBreakdownByCityAsync(cityId);

    var foodSpots = await _businessRepository
        .GetByCityAndCategoryAsync(cityId, "Restoran", limit: 5);

    var activities = await _activityRepository
        .GetByCityAsync(cityId);

    return Ok(new CityDiscoveryDto
    {
        CityName = city.Name,
        TotalBusinesses = city.BusinessCount,
        PopularBusinesses = popularBusinesses,
        TopCategories = categories,
        FoodRecommendations = foodSpots,
        SuggestedActivities = activities,
        HasRoute = await _routeRepository.HasCityRouteAsync(cityId)
    });
}
```

---

## 6. Görseller & Medya Yönetimi

### 6.1 İşletme Görselleri

| Görsel Tipi | Boyut | Oran | Zorunlu |
|-------------|-------|------|---------|
| Kapak Fotoğrafı | 1920x1080 | 16:9 | ❌ |
| Profil Fotoğrafı | 800x800 | 1:1 | ❌ |
| Galeri Fotoğrafları | 1920x1080 | 16:9 | ❌ |
| Akış Kartı Görseli | 1200x675 | 16:9 | ❌ (varsa göster) |

### 6.2 Görsel Sıkıştırma Pipeline

```csharp
public async Task<string> ProcessAndUploadImage(IFormFile file)
{
    // 1. Magic number kontrolü
    if (!IsValidImage(file))
        throw new InvalidImageException();

    using var image = await Image.LoadAsync(file.OpenReadStream());

    // 2. Boyutlandırma
    image.Mutate(x => x.Resize(new ResizeOptions
    {
        Size = new Size(1920, 1080),
        Mode = ResizeMode.Crop
    }));

    // 3. Sıkıştırma
    var encoder = new JpegEncoder { Quality = 85 };

    // 4. WebP versiyonu
    var webpEncoder = new WebpEncoder { Quality = 80 };

    // 5. Upload
    var fileName = $"{Guid.NewGuid()}.jpg";
    await _storageService.UploadAsync(image, fileName, encoder);

    return $"{_cdnBaseUrl}/{fileName}";
}
```

---

## 7. Etkileşim Sistemi

### 7.1 Beğeni, Yorum, Kaydet

```csharp
// Beğeni
POST /api/businesses/{id}/like
DELETE /api/businesses/{id}/like

// Yorum
POST /api/businesses/{id}/reviews
{
  "rating": 5,
  "comment": "Harika bir mekan!",
  "images": ["url1", "url2"]
}

// Kaydet
POST /api/businesses/{id}/save
DELETE /api/businesses/{id}/save

// Kullanıcının kaydettikleri
GET /api/users/me/saved
```

### 7.2 Yorum Kartı

```
┌─────────────────────────────────────────────────────────────┐
│  👤 Ahmet Y.              ⭐⭐⭐⭐⭐  • 2 gün önce          │
│  "Balıkları muhteşemdi, manzara eşsiz. Servis biraz         │
│   yavaştı ama lezzet her şeyi affettiriyor."               │
│                                                              │
│  ┌────────────┐ ┌────────────┐                               │
│  │ [Foto 1]   │ │ [Foto 2]   │                               │
│  └────────────┘ └────────────┘                               │
│                                                              │
│  ❤️ 12    💬 3                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Bildirim Sistemi

### 8.1 Push Bildirimleri

| Senaryo | Bildirim |
|---------|----------|
| Yakında yeni işletme açıldı | "Konyaaltı'nda yeni bir restoran açıldı! 🍽️" |
| Kaydettiğin işletme güncellendi | "Konyaaltı Balıkçısı yeni menüsünü ekledi" |
| Rota yaklaştı | "15 dk sonra Etli Ekmekçi'ye varacaksın 🛑" |
| Beğendiğin işletmeye yorum | "Ahmet, Konyaaltı Balıkçısı hakkında yorum yaptı" |

---

## 9. Performans Optimizasyonları

### 9.1 Backend

```csharp
// Spatial Index
CREATE INDEX idx_businesses_location ON Businesses USING GIST(Location);

// Composite Index
CREATE INDEX idx_businesses_city_rating ON Businesses(CityId, AverageRating DESC);

// Redis Cache
- Popüler işletmeler (5 dk cache)
- Şehir bazlı öneriler (10 dk cache)
- Kullanıcı konumuna göre yakındakiler (1 dk cache)
```

### 9.2 Frontend

```javascript
// React Query ile akıllı cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 dk
      cacheTime: 1000 * 60 * 10, // 10 dk
      refetchOnWindowFocus: false,
    }
  }
});

// Lazy loading görseller
<img 
  src={lowQualityPlaceholder} 
  data-src={highQualityUrl}
  className="lazyload"
  alt={business.name}
/>

// Virtualized list (react-window)
<VariableSizeList
  height={window.innerHeight}
  itemCount={businesses.length}
  itemSize={getItemSize}
>
  {({ index, style }) => (
    <BusinessCard 
      business={businesses[index]} 
      style={style}
    />
  )}
</VariableSizeList>
```

---

## 10. API Endpoint Özeti

```
# Keşif Akışı
GET    /api/feed                              → Ana akış
GET    /api/feed/nearby                       → Yakındaki işletmeler
GET    /api/feed/popular                      → Popüler işletmeler
GET    /api/feed/category/{category}          → Kategori bazlı

# İşletmeler
GET    /api/businesses/{id}                   → Detay
GET    /api/businesses/{id}/reviews           → Yorumlar
POST   /api/businesses/{id}/like              → Beğen
POST   /api/businesses/{id}/reviews             → Yorum yap
POST   /api/businesses/{id}/save              → Kaydet

# Rota
POST   /api/routes/plan                       → Rota planla
GET    /api/routes/{id}                       → Rota detayı
POST   /api/routes/{id}/stops                 → Durak ekle
GET    /api/routes/recommendations            → Rota üzeri öneriler

# Şehir & Bölge
GET    /api/cities                            → Şehir listesi
GET    /api/cities/{id}/discover              → Şehir keşfi
GET    /api/cities/{id}/businesses            → Şehir işletmeleri

# Kullanıcı
GET    /api/users/me/saved                    → Kaydedilenler
GET    /api/users/me/history                  → Geçmiş / Ziyaretler
```

---

## 11. Veritabanı Güncellemeleri

### 11.1 Businesses Tablosu (Güncellenmiş)

```sql
ALTER TABLE Businesses ADD COLUMN IF NOT EXISTS
    AverageRating DECIMAL(2,1) DEFAULT 0,
    TotalReviews INT DEFAULT 0,
    TotalLikes INT DEFAULT 0,
    TotalSaves INT DEFAULT 0,
    IsFeatured BOOLEAN DEFAULT FALSE,
    Tags TEXT[],  -- PostgreSQL array
    Location GEOGRAPHY(Point, 4326),  -- PostGIS
    CreatedAt TIMESTAMP DEFAULT NOW(),
    UpdatedAt TIMESTAMP DEFAULT NOW();

-- Full-text search için
ALTER TABLE Businesses ADD COLUMN SearchVector tsvector 
    GENERATED ALWAYS AS (
        setweight(to_tsvector('turkish', coalesce(Name, '')), 'A') ||
        setweight(to_tsvector('turkish', coalesce(Description, '')), 'B') ||
        setweight(to_tsvector('turkish', coalesce(Address, '')), 'C')
    ) STORED;

CREATE INDEX idx_businesses_search ON Businesses USING GIN(SearchVector);
```

### 11.2 Reviews Tablosu (Yeni)

```sql
CREATE TABLE Reviews (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    BusinessId UUID NOT NULL REFERENCES Businesses(Id) ON DELETE CASCADE,
    UserId UUID NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT,
    Images TEXT[],
    LikeCount INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT NOW(),
    UpdatedAt TIMESTAMP DEFAULT NOW(),
    UNIQUE(BusinessId, UserId)  -- Bir kullanıcı bir işletmeye bir yorum
);

CREATE INDEX idx_reviews_business ON Reviews(BusinessId);
CREATE INDEX idx_reviews_user ON Reviews(UserId);
```

### 11.3 SavedBusinesses Tablosu (Yeni)

```sql
CREATE TABLE SavedBusinesses (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    BusinessId UUID NOT NULL REFERENCES Businesses(Id) ON DELETE CASCADE,
    SavedAt TIMESTAMP DEFAULT NOW(),
    UNIQUE(UserId, BusinessId)
);
```

### 11.4 Routes Tablosu (Yeni)

```sql
CREATE TABLE Routes (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    Name VARCHAR(200),
    StartLocation VARCHAR(200) NOT NULL,
    EndLocation VARCHAR(200) NOT NULL,
    StartLat DECIMAL(10,8) NOT NULL,
    StartLng DECIMAL(11,8) NOT NULL,
    EndLat DECIMAL(10,8) NOT NULL,
    EndLng DECIMAL(11,8) NOT NULL,
    TotalDistanceKm DECIMAL(8,2),
    EstimatedDurationMinutes INT,
    RouteGeometry GEOGRAPHY(LineString, 4326),  -- PostGIS
    IsSaved BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE RouteStops (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    RouteId UUID NOT NULL REFERENCES Routes(Id) ON DELETE CASCADE,
    BusinessId UUID REFERENCES Businesses(Id),
    StopName VARCHAR(200),
    Latitude DECIMAL(10,8) NOT NULL,
    Longitude DECIMAL(11,8) NOT NULL,
    StopOrder INT NOT NULL,
    EstimatedArrival TIME,
    StayDurationMinutes INT DEFAULT 0
);
```

---

## 12. React Bileşen Yapısı (Güncellenmiş)

```
src/
├── components/
│   ├── Feed/
│   │   ├── FeedCard.jsx              # Ana akış kartı
│   │   ├── FeedCardCarousel.jsx      # Görsel carousel
│   │   ├── FeedCardActions.jsx       # Beğen/yorum/kaydet
│   │   ├── FeedCardComments.jsx      # Yorum önizlemesi
│   │   ├── FeedList.jsx              # Infinite scroll list
│   │   ├── FeedFilterBar.jsx         # Filtre çubuğu
│   │   └── FeedSkeleton.jsx          # Yükleme skeleton'u
│   ├── Map/
│   │   ├── MapContainer.jsx          # Harita ana bileşeni
│   │   ├── BusinessMarker.jsx        # Özel marker
│   │   ├── MarkerCluster.jsx         # Kümeleme
│   │   ├── MapPopup.jsx              # Tıklama popup'ı
│   │   ├── UserLocationMarker.jsx    # Konum marker'ı
│   │   └── MapFilterPanel.jsx        # Harita filtre paneli
│   ├── Route/
│   │   ├── RoutePlanner.jsx          # Rota planlama formu
│   │   ├── RouteMap.jsx              # Rota haritası
│   │   ├── RouteRecommendations.jsx  # Öneri listesi
│   │   ├── RouteStopCard.jsx         # Durak kartı
│   │   ├── RouteTimeline.jsx         # Rota zaman çizelgesi
│   │   ├── RouteSummary.jsx          # Rota özeti
│   │   └── RouteShare.jsx            # Rota paylaşımı
│   ├── Business/
│   │   ├── BusinessDetail.jsx        # İşletme detay sayfası
│   │   ├── BusinessGallery.jsx       # Galeri görüntüleyici
│   │   ├── BusinessHours.jsx         # Çalışma saatleri
│   │   ├── BusinessReviews.jsx       # Yorumlar listesi
│   │   ├── ReviewForm.jsx            # Yorum formu
│   │   └── BusinessCardCompact.jsx   # Küçük kart (liste için)
│   ├── City/
│   │   ├── CityDiscovery.jsx         # Şehir keşif sayfası
│   │   ├── CityPopular.jsx           # Popüler işletmeler
│   │   ├── CityFoodGuide.jsx         # Yemek önerileri
│   │   └── CityActivities.jsx        # Aktiviteler
│   └── SocialShare/
│       ├── ShareButtons.jsx
│       ├── ShareModal.jsx
│       └── InstagramShareGuide.jsx
├── hooks/
│   ├── useFeed.js
│   ├── useNearbyBusinesses.js
│   ├── useRoutePlanner.js
│   ├── useUserLocation.js
│   └── useInfiniteScroll.js
├── context/
│   ├── AuthContext.jsx
│   └── MapContext.jsx
└── services/
    ├── feedService.js
    ├── businessService.js
    ├── routeService.js
    ├── cityService.js
    └── locationService.js
```

---

## 13. Harita Entegrasyon Detayları

### 13.1 Leaflet.js Kullanımı (Önerilen)

```jsx
// MapContainer.jsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

const DiscoveryMap = ({ businesses, userLocation }) => {
  const map = useMap();

  // Kullanıcı konumuna git
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 14, {
        duration: 1.5
      });
    }
  }, [userLocation]);

  return (
    <MapContainer
      center={[39.0, 35.0]}
      zoom={7}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Kullanıcı konumu */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>Siz buradasınız</Popup>
        </Marker>
      )}

      {/* İşletme marker'ları */}
      <MarkerClusterGroup>
        {businesses.map(business => (
          <Marker
            key={business.id}
            position={[business.latitude, business.longitude]}
            icon={getBusinessIcon(business)}
          >
            <MapPopup business={business} />
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};
```

### 13.2 Google Maps Directions API (Rota)

```javascript
// routeService.js
const planRoute = async (origin, destination, waypoints = []) => {
  const directionsService = new google.maps.DirectionsService();

  const result = await directionsService.route({
    origin: { lat: origin.lat, lng: origin.lng },
    destination: { lat: destination.lat, lng: destination.lng },
    waypoints: waypoints.map(wp => ({
      location: { lat: wp.lat, lng: wp.lng },
      stopover: true
    })),
    travelMode: google.maps.TravelMode.DRIVING,
    optimizeWaypoints: false
  });

  return {
    path: result.routes[0].overview_path.map(p => ({
      lat: p.lat(),
      lng: p.lng()
    })),
    totalDistance: result.routes[0].legs.reduce(
      (sum, leg) => sum + leg.distance.value, 0
    ),
    totalDuration: result.routes[0].legs.reduce(
      (sum, leg) => sum + leg.duration.value, 0
    ),
    steps: result.routes[0].legs.flatMap(leg => leg.steps)
  };
};
```

---

## 14. Geliştirme Aşamaları (Güncellenmiş Roadmap)

### Faz 1: Temel Keşif (MVP)
- [x] Harita entegrasyonu (Leaflet)
- [x] İşletme listesi (basit)
- [ ] **Canlı akış kartları (görsel + etkileşim)**
- [ ] **Infinite scroll**
- [ ] **Beğenme, yorum, kaydetme**
- [ ] **Yakınımdaki işletmeler (konum bazlı)**

### Faz 2: Akıllı Rota
- [ ] **Rota planlama formu**
- [ ] **Google Directions API entegrasyonu**
- [ ] **Rota üzeri işletme önerileri**
- [ ] **Durak ekleme/çıkarma**
- [ ] **Rota paylaşımı**

### Faz 3: Zengin İçerik
- [ ] **İşletme görselleri (galeri, carousel)**
- [ ] **Yorum sistemi (fotoğraflı)**
- [ ] **Şehir bazlı keşif sayfaları**
- [ ] **"Şurada şu var" özelliği**
- [ ] **Bildirim sistemi**

### Faz 4: Optimizasyon
- [ ] Performans (lazy loading, virtualized lists)
- [ ] Offline mod (service workers)
- [ ] SEO (SSR/meta tag'ler)
- [ ] Analytics

---

> **Not:** Bu doküman önceki "Kullanıcı & İşletme Yönetimi" dokümanının devamı niteliğindedir. Her iki doküman birlikte projenin tamamını kapsar.

**Son Güncelleme:** 2026-08-13  
**Versiyon:** 2.0  
**Yazar:** Wayspot Dev Team
