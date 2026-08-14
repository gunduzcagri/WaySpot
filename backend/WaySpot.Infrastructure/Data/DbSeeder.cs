using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using WaySpot.Core.Entities;
using WaySpot.Core.Enums;
using WaySpot.Core.Interfaces;

namespace WaySpot.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(WaySpotDbContext context, IPasswordService passwordService)
    {
        var adminId = Guid.Parse("550e8400-e29b-41d4-a716-446655440000");
        var cafeUserId = Guid.Parse("550e8400-e29b-41d4-a716-446655440001");
        var ahmetUserId = Guid.Parse("550e8400-e29b-41d4-a716-446655440002");
        var elifUserId = Guid.Parse("550e8400-e29b-41d4-a716-446655440003");
        var gymUserId = Guid.Parse("550e8400-e29b-41d4-a716-446655440004");
        var marketUserId = Guid.Parse("550e8400-e29b-41d4-a716-446655440005");

        var initialUsers = new List<AppUser>
        {
            new AppUser
            {
                Id = adminId,
                Username = "admin",
                Email = "admin@wayspot.com",
                PasswordHash = passwordService.HashPassword("admin123"),
                FirstName = "Admin",
                LastName = "User",
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow
            },
            new AppUser
            {
                Id = cafeUserId,
                Username = "cafebusiness",
                Email = "cafe@wayspot.com",
                PasswordHash = passwordService.HashPassword("business123"),
                FirstName = "Cafe",
                LastName = "Owner",
                Role = UserRole.Business,
                CreatedAt = DateTime.UtcNow
            },
            new AppUser
            {
                Id = ahmetUserId,
                Username = "ahmetyilmaz",
                Email = "ahmet@example.com",
                PasswordHash = passwordService.HashPassword("user123"),
                FirstName = "Ahmet",
                LastName = "Yilmaz",
                Role = UserRole.User,
                CreatedAt = DateTime.UtcNow
            },
            new AppUser
            {
                Id = elifUserId,
                Username = "elifdemir",
                Email = "elif@example.com",
                PasswordHash = passwordService.HashPassword("user456"),
                FirstName = "Elif",
                LastName = "Demir",
                Role = UserRole.User,
                CreatedAt = DateTime.UtcNow
            },
            new AppUser
            {
                Id = gymUserId,
                Username = "gymbusiness",
                Email = "gym@wayspot.com",
                PasswordHash = passwordService.HashPassword("business123"),
                FirstName = "Gym",
                LastName = "Owner",
                Role = UserRole.Business,
                CreatedAt = DateTime.UtcNow
            },
            new AppUser
            {
                Id = marketUserId,
                Username = "marketbusiness",
                Email = "market@wayspot.com",
                PasswordHash = passwordService.HashPassword("business123"),
                FirstName = "Market",
                LastName = "Owner",
                Role = UserRole.Business,
                CreatedAt = DateTime.UtcNow
            }
        };

        foreach (var u in initialUsers)
        {
            if (!await context.Users.AnyAsync(x => x.Id == u.Id || x.Email == u.Email))
            {
                await context.Users.AddAsync(u);
            }
        }
        await context.SaveChangesAsync();

        // 15 Distinct Owner User IDs for 15 Businesses
        var userAnt1 = Guid.Parse("551e8400-e29b-41d4-a716-446655440001");
        var userAnt2 = Guid.Parse("551e8400-e29b-41d4-a716-446655440002");
        var userAnt3 = Guid.Parse("551e8400-e29b-41d4-a716-446655440003");
        var userAnt4 = Guid.Parse("551e8400-e29b-41d4-a716-446655440004");
        var userAnt5 = Guid.Parse("551e8400-e29b-41d4-a716-446655440005");

        var userKon1 = Guid.Parse("552e8400-e29b-41d4-a716-446655440001");
        var userKon2 = Guid.Parse("552e8400-e29b-41d4-a716-446655440002");
        var userKon3 = Guid.Parse("552e8400-e29b-41d4-a716-446655440003");
        var userKon4 = Guid.Parse("552e8400-e29b-41d4-a716-446655440004");
        var userKon5 = Guid.Parse("552e8400-e29b-41d4-a716-446655440005");

        var userIzm1 = Guid.Parse("553e8400-e29b-41d4-a716-446655440001");
        var userIzm2 = Guid.Parse("553e8400-e29b-41d4-a716-446655440002");
        var userIzm3 = Guid.Parse("553e8400-e29b-41d4-a716-446655440003");
        var userIzm4 = Guid.Parse("553e8400-e29b-41d4-a716-446655440004");
        var userIzm5 = Guid.Parse("553e8400-e29b-41d4-a716-446655440005");

        var cityBusinessUsers = new List<AppUser>
        {
            new AppUser { Id = userAnt1, Username = "ant_marina", Email = "marina@antalya.com", PasswordHash = passwordService.HashPassword("business123"), FirstName = "Kaleiçi", LastName = "Marina", Role = UserRole.Business, CreatedAt = DateTime.UtcNow },
            new AppUser { Id = userAnt2, Username = "ant_larabalik", Email = "lara@antalya.com", PasswordHash = passwordService.HashPassword("business123"), FirstName = "Lara", LastName = "Balıkçısı", Role = UserRole.Business, CreatedAt = DateTime.UtcNow },
            new AppUser { Id = userAnt3, Username = "ant_konyaalti", Email = "beach@antalya.com", PasswordHash = passwordService.HashPassword("business123"), FirstName = "Konyaaltı", LastName = "Beach", Role = UserRole.Business, CreatedAt = DateTime.UtcNow },
            new AppUser { Id = userAnt4, Username = "ant_duden", Email = "duden@antalya.com", PasswordHash = passwordService.HashPassword("business123"), FirstName = "Düden", LastName = "Kahvaltı", Role = UserRole.Business, CreatedAt = DateTime.UtcNow },
            new AppUser { Id = userAnt5, Username = "ant_olympos", Email = "olympos@antalya.com", PasswordHash = passwordService.HashPassword("business123"), FirstName = "Olympos", LastName = "Camping", Role = UserRole.Business, CreatedAt = DateTime.UtcNow },

            new AppUser { Id = userKon1, Username = "kon_mevlana", Email = "mevlana@konya.com", PasswordHash = passwordService.HashPassword("business123"), FirstName = "Mevlana", LastName = "Tirit", Role = UserRole.Business, CreatedAt = DateTime.UtcNow },
            new AppUser { Id = userKon2, Username = "kon_alaaddin", Email = "alaaddin@konya.com", PasswordHash = passwordService.HashPassword("business123"), FirstName = "Alaaddin", LastName = "Bahçe", Role = UserRole.Business, CreatedAt = DateTime.UtcNow },
            new AppUser { Id = userKon3, Username = "kon_sille", Email = "sille@konya.com", PasswordHash = passwordService.HashPassword("business123"), FirstName = "Sille", LastName = "Konak", Role = UserRole.Business, CreatedAt = DateTime.UtcNow },
            new AppUser { Id = userKon4, Username = "kon_meram", Email = "meram@konya.com", PasswordHash = passwordService.HashPassword("business123"), FirstName = "Meram", LastName = "Bağları", Role = UserRole.Business, CreatedAt = DateTime.UtcNow },
            new AppUser { Id = userKon5, Username = "kon_kelebek", Email = "kelebek@konya.com", PasswordHash = passwordService.HashPassword("business123"), FirstName = "Kelebek", LastName = "Bistro", Role = UserRole.Business, CreatedAt = DateTime.UtcNow },

            new AppUser { Id = userIzm1, Username = "izm_kordon", Email = "kordon@izmir.com", PasswordHash = passwordService.HashPassword("business123"), FirstName = "Kordon", LastName = "Kahvecisi", Role = UserRole.Business, CreatedAt = DateTime.UtcNow },
            new AppUser { Id = userIzm2, Username = "izm_pasaport", Email = "pasaport@izmir.com", PasswordHash = passwordService.HashPassword("business123"), FirstName = "Kordon", LastName = "Balık", Role = UserRole.Business, CreatedAt = DateTime.UtcNow },
            new AppUser { Id = userIzm3, Username = "izm_alacati", Email = "alacati@izmir.com", PasswordHash = passwordService.HashPassword("business123"), FirstName = "Alaçatı", LastName = "Taş Ev", Role = UserRole.Business, CreatedAt = DateTime.UtcNow },
            new AppUser { Id = userIzm4, Username = "izm_asansor", Email = "asansor@izmir.com", PasswordHash = passwordService.HashPassword("business123"), FirstName = "Tarihi", LastName = "Asansör", Role = UserRole.Business, CreatedAt = DateTime.UtcNow },
            new AppUser { Id = userIzm5, Username = "izm_urla", Email = "urla@izmir.com", PasswordHash = passwordService.HashPassword("business123"), FirstName = "Urla", LastName = "Bağ Evi", Role = UserRole.Business, CreatedAt = DateTime.UtcNow }
        };

        foreach (var u in cityBusinessUsers)
        {
            if (!await context.Users.AnyAsync(x => x.Id == u.Id || x.Email == u.Email))
            {
                await context.Users.AddAsync(u);
            }
        }
        await context.SaveChangesAsync();

        // 15 Businesses
        var antalyaId1 = Guid.Parse("771e8400-e29b-41d4-a716-446655440001");
        var antalyaId2 = Guid.Parse("771e8400-e29b-41d4-a716-446655440002");
        var antalyaId3 = Guid.Parse("771e8400-e29b-41d4-a716-446655440003");
        var antalyaId4 = Guid.Parse("771e8400-e29b-41d4-a716-446655440004");
        var antalyaId5 = Guid.Parse("771e8400-e29b-41d4-a716-446655440005");

        var konyaId1 = Guid.Parse("772e8400-e29b-41d4-a716-446655440001");
        var konyaId2 = Guid.Parse("772e8400-e29b-41d4-a716-446655440002");
        var konyaId3 = Guid.Parse("772e8400-e29b-41d4-a716-446655440003");
        var konyaId4 = Guid.Parse("772e8400-e29b-41d4-a716-446655440004");
        var konyaId5 = Guid.Parse("772e8400-e29b-41d4-a716-446655440005");

        var izmirId1 = Guid.Parse("773e8400-e29b-41d4-a716-446655440001");
        var izmirId2 = Guid.Parse("773e8400-e29b-41d4-a716-446655440002");
        var izmirId3 = Guid.Parse("773e8400-e29b-41d4-a716-446655440003");
        var izmirId4 = Guid.Parse("773e8400-e29b-41d4-a716-446655440004");
        var izmirId5 = Guid.Parse("773e8400-e29b-41d4-a716-446655440005");

        var newBusinesses = new List<Business>
        {
            // === ANTALYA (5 İşletme) ===
            new Business
            {
                Id = antalyaId1,
                UserId = userAnt1,
                Name = "Kaleiçi Marina Cafe & Bistro",
                Type = "Cafe",
                TaxNumber = "TAX-ANT-001",
                Description = "Kaleiçi tarihi yat limanı manzaralı, enfes özel kahveler ve Akdeniz lezzetleri sunan seçkin mekan.",
                Location = new Point(30.7042, 36.8841) { SRID = 4326 },
                Address = "Kaleiçi Yat Limanı No:12",
                CityId = "Antalya",
                DistrictId = "Muratpaşa",
                Phone = "0242 248 11 22",
                Email = "info@kaleicimarina.com",
                CoverImage = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
                IsActive = true,
                IsVerified = true,
                IsFeatured = true,
                AverageRating = 4.9m,
                TotalReviews = 86,
                TotalLikes = 240,
                TotalSaves = 95,
                Tags = new[] { "Kaleiçi", "Deniz Manzarası", "Kahve", "Kokteyl" },
                CreatedAt = DateTime.UtcNow
            },
            new Business
            {
                Id = antalyaId2,
                UserId = userAnt2,
                Name = "Lara Balıkçısı & Restoran",
                Type = "Restaurant",
                TaxNumber = "TAX-ANT-002",
                Description = "Falezler üzerinde Akdeniz manzaralı taze günlük balıklar ve zengin meze çeşitleri.",
                Location = new Point(30.7580, 36.8525) { SRID = 4326 },
                Address = "Şirinyalı Mah. Lara Cad. No:88",
                CityId = "Antalya",
                DistrictId = "Muratpaşa",
                Phone = "0242 316 66 77",
                Email = "rezervasyon@larabalikcisi.com",
                CoverImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
                IsActive = true,
                IsVerified = true,
                IsFeatured = true,
                AverageRating = 4.8m,
                TotalReviews = 112,
                TotalLikes = 310,
                TotalSaves = 120,
                Tags = new[] { "Deniz Ürünleri", "Akdeniz Mutfağı", "Taze Balık", "Manzara" },
                CreatedAt = DateTime.UtcNow
            },
            new Business
            {
                Id = antalyaId3,
                UserId = userAnt3,
                Name = "Konyaaltı Beach Lounge & Cafe",
                Type = "Cafe",
                TaxNumber = "TAX-ANT-003",
                Description = "Konyaaltı sahilinde deniz esintisi, serinletici içecekler ve gün boyu plaj keyfi.",
                Location = new Point(30.6480, 36.8770) { SRID = 4326 },
                Address = "Akdeniz Bulvarı Sahil Parkı No:4",
                CityId = "Antalya",
                DistrictId = "Konyaaltı",
                Phone = "0242 229 44 55",
                Email = "contact@konyaaltibeach.com",
                CoverImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
                IsActive = true,
                IsVerified = true,
                IsFeatured = false,
                AverageRating = 4.7m,
                TotalReviews = 75,
                TotalLikes = 190,
                TotalSaves = 70,
                Tags = new[] { "Plaj", "Soğuk İçecekler", "Deniz Keyfi", "Canlı Müzik" },
                CreatedAt = DateTime.UtcNow
            },
            new Business
            {
                Id = antalyaId4,
                UserId = userAnt4,
                Name = "Düden Şelalesi Kahvaltı Evi",
                Type = "Restaurant",
                TaxNumber = "TAX-ANT-004",
                Description = "Şelale manzaralı, doğanın kalbinde 35 çeşit zengin organik köy kahvaltısı.",
                Location = new Point(30.7250, 36.9650) { SRID = 4326 },
                Address = "Varsak Mah. Düden Şelalesi Yanı",
                CityId = "Antalya",
                DistrictId = "Kepez",
                Phone = "0242 417 33 22",
                Email = "bilgi@dudenkahvalti.com",
                CoverImage = "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800",
                IsActive = true,
                IsVerified = true,
                IsFeatured = false,
                AverageRating = 4.8m,
                TotalReviews = 94,
                TotalLikes = 275,
                TotalSaves = 110,
                Tags = new[] { "Serpme Kahvaltı", "Şelale", "Doğa", "Organik" },
                CreatedAt = DateTime.UtcNow
            },
            new Business
            {
                Id = antalyaId5,
                UserId = userAnt5,
                Name = "Olympos Doğa Camping & Kafe",
                Type = "Cafe",
                TaxNumber = "TAX-ANT-005",
                Description = "Portakal bahçeleri arasında kamp, bungalow ve doğal içecekler eşliğinde dinlenme alanı.",
                Location = new Point(30.4720, 36.3720) { SRID = 4326 },
                Address = "Yazır Köyü Olympos Mevkii",
                CityId = "Antalya",
                DistrictId = "Kumluca",
                Phone = "0242 892 12 34",
                Email = "info@olymposcamping.com",
                CoverImage = "https://images.unsplash.com/photo-1470246973918-29a93221c455?w=800",
                IsActive = true,
                IsVerified = true,
                IsFeatured = false,
                AverageRating = 4.6m,
                TotalReviews = 63,
                TotalLikes = 180,
                TotalSaves = 85,
                Tags = new[] { "Kamp", "Doğa", "Ağaç Evler", "Kamp Ateşi" },
                CreatedAt = DateTime.UtcNow
            },

            // === KONYA (5 İşletme) ===
            new Business
            {
                Id = konyaId1,
                UserId = userKon1,
                Name = "Mevlana Tarihi Tirit Evi",
                Type = "Restaurant",
                TaxNumber = "TAX-KON-001",
                Description = "Mevlana Türbesi yanında asırlık tirit ve fırın kebabı lezzet durağı.",
                Location = new Point(32.5045, 37.8715) { SRID = 4326 },
                Address = "Aziziye Mah. Mevlana Cad. No:24",
                CityId = "Konya",
                DistrictId = "Karatay",
                Phone = "0332 351 11 22",
                Email = "info@mevlanatirit.com",
                CoverImage = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
                IsActive = true,
                IsVerified = true,
                IsFeatured = true,
                AverageRating = 4.9m,
                TotalReviews = 135,
                TotalLikes = 380,
                TotalSaves = 140,
                Tags = new[] { "Tirit", "Fırın Kebap", "Yöresel", "Tarihi" },
                CreatedAt = DateTime.UtcNow
            },
            new Business
            {
                Id = konyaId2,
                UserId = userKon2,
                Name = "Alaaddin Seyir Bahçesi & Kafe",
                Type = "Cafe",
                TaxNumber = "TAX-KON-002",
                Description = "Alaaddin Tepesi üzerinde panoramik şehir manzaralı çay bahçesi ve közde kahve keyfi.",
                Location = new Point(32.4930, 37.8728) { SRID = 4326 },
                Address = "Alaaddin Tepesi Park İçi No:1",
                CityId = "Konya",
                DistrictId = "Selçuklu",
                Phone = "0332 235 55 66",
                Email = "iletisim@alaaddinbahce.com",
                CoverImage = "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800",
                IsActive = true,
                IsVerified = true,
                IsFeatured = false,
                AverageRating = 4.7m,
                TotalReviews = 88,
                TotalLikes = 210,
                TotalSaves = 65,
                Tags = new[] { "Manzara", "Çay Bahçesi", "Salep", "Tarihi Doku" },
                CreatedAt = DateTime.UtcNow
            },
            new Business
            {
                Id = konyaId3,
                UserId = userKon3,
                Name = "Sille Antik Konak Kafe",
                Type = "Cafe",
                TaxNumber = "TAX-KON-003",
                Description = "Tarihi Sille köyünde restore edilmiş taş konakta özel menengiç kahvesi ve ev tatlıları.",
                Location = new Point(32.4200, 37.9150) { SRID = 4326 },
                Address = "Sille Subaşı Mah. Hükümet Cad. No:15",
                CityId = "Konya",
                DistrictId = "Selçuklu",
                Phone = "0332 244 88 99",
                Email = "sillekonak@gmail.com",
                CoverImage = "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800",
                IsActive = true,
                IsVerified = true,
                IsFeatured = true,
                AverageRating = 4.8m,
                TotalReviews = 92,
                TotalLikes = 260,
                TotalSaves = 90,
                Tags = new[] { "Sille", "Taş Konak", "Sanat", "Menengiç Kahvesi" },
                CreatedAt = DateTime.UtcNow
            },
            new Business
            {
                Id = konyaId4,
                UserId = userKon4,
                Name = "Meram Bağları Yöresel Restoran",
                Type = "Restaurant",
                TaxNumber = "TAX-KON-004",
                Description = "Meram Bağları'nda yeşillikler içinde taş fırında çıtır etli ekmek ve bıçakarası.",
                Location = new Point(32.4350, 37.8540) { SRID = 4326 },
                Address = "Yaka Mah. Meram Çayı Kenarı No:30",
                CityId = "Konya",
                DistrictId = "Meram",
                Phone = "0332 323 40 50",
                Email = "merambaglari@restoran.com",
                CoverImage = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
                IsActive = true,
                IsVerified = true,
                IsFeatured = false,
                AverageRating = 4.8m,
                TotalReviews = 79,
                TotalLikes = 225,
                TotalSaves = 78,
                Tags = new[] { "Etli Ekmek", "Bıçakarası", "Meram", "Bahçe" },
                CreatedAt = DateTime.UtcNow
            },
            new Business
            {
                Id = konyaId5,
                UserId = userKon5,
                Name = "Kelebekler Vadisi Botanik Bistro",
                Type = "Cafe",
                TaxNumber = "TAX-KON-005",
                Description = "Tropikal Kelebek Bahçesi yanında taze meyveli waffle, kahve ve organik atıştırmalıklar.",
                Location = new Point(32.4980, 37.9850) { SRID = 4326 },
                Address = "Fatih Mah. Çiçek Bahçesi Cad. No:8",
                CityId = "Konya",
                DistrictId = "Selçuklu",
                Phone = "0332 265 10 20",
                Email = "info@kelebekbistro.com",
                CoverImage = "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800",
                IsActive = true,
                IsVerified = true,
                IsFeatured = false,
                AverageRating = 4.6m,
                TotalReviews = 54,
                TotalLikes = 140,
                TotalSaves = 45,
                Tags = new[] { "Tropikal", "Kelebek Bahçesi", "Doğal", "Tatlı" },
                CreatedAt = DateTime.UtcNow
            },

            // === İZMİR (5 İşletme) ===
            new Business
            {
                Id = izmirId1,
                UserId = userIzm1,
                Name = "Alsancak Kordon Kahvecisi",
                Type = "Cafe",
                TaxNumber = "TAX-IZM-001",
                Description = "Kordon çimlerinde gün batımına karşı 3. nesil nitelikli kahveler ve taze kruvasanlar.",
                Location = new Point(27.1380, 38.4350) { SRID = 4326 },
                Address = "Atatürk Cad. Kordonboyu No:178",
                CityId = "İzmir",
                DistrictId = "Konak",
                Phone = "0232 464 12 34",
                Email = "kordon@kahvecisi.com",
                CoverImage = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
                IsActive = true,
                IsVerified = true,
                IsFeatured = true,
                AverageRating = 4.9m,
                TotalReviews = 145,
                TotalLikes = 420,
                TotalSaves = 160,
                Tags = new[] { "Kordon", "Alsancak", "Deniz Kenarı", "Özel Kahve" },
                CreatedAt = DateTime.UtcNow
            },
            new Business
            {
                Id = izmirId2,
                UserId = userIzm2,
                Name = "Kordon Balıkçısı & Meze Evi",
                Type = "Restaurant",
                TaxNumber = "TAX-IZM-002",
                Description = "Ege'nin taze mezeleri, tereyağlı karides ve günlük taze deniz ürünleri sofrası.",
                Location = new Point(27.1320, 38.4280) { SRID = 4326 },
                Address = "Pasaport İskelesi Karşısı No:45",
                CityId = "İzmir",
                DistrictId = "Konak",
                Phone = "0232 484 55 66",
                Email = "rezervasyon@kordonbalik.com",
                CoverImage = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
                IsActive = true,
                IsVerified = true,
                IsFeatured = true,
                AverageRating = 4.8m,
                TotalReviews = 120,
                TotalLikes = 340,
                TotalSaves = 135,
                Tags = new[] { "Ege Mezeleri", "Deniz Ürünleri", "Kordon", "Kalamar" },
                CreatedAt = DateTime.UtcNow
            },
            new Business
            {
                Id = izmirId3,
                UserId = userIzm3,
                Name = "Alaçatı Taş Ev Cafe & Fırın",
                Type = "Cafe",
                TaxNumber = "TAX-IZM-003",
                Description = "Begonvillerle süslü taş avluda meşhur damla sakızlı Türk kahvesi ve ev yapımı kurabiyeler.",
                Location = new Point(26.3740, 38.2820) { SRID = 4326 },
                Address = "Alaçatı Köyiçi Hacımemiş Cad. No:22",
                CityId = "İzmir",
                DistrictId = "Çeşme",
                Phone = "0232 716 99 88",
                Email = "info@alacatitasev.com",
                CoverImage = "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
                IsActive = true,
                IsVerified = true,
                IsFeatured = true,
                AverageRating = 4.9m,
                TotalReviews = 160,
                TotalLikes = 510,
                TotalSaves = 210,
                Tags = new[] { "Alaçatı", "Sakızlı Kurabiye", "Taş Ev", "Begonvil" },
                CreatedAt = DateTime.UtcNow
            },
            new Business
            {
                Id = izmirId4,
                UserId = userIzm4,
                Name = "Tarihi Asansör Seyir Restoranı",
                Type = "Restaurant",
                TaxNumber = "TAX-IZM-004",
                Description = "Tarihi Asansör tepesinde tüm İzmir Körfezi'ni ayaklar altına seren büyüleyici akşam yemeği.",
                Location = new Point(27.1170, 38.4140) { SRID = 4326 },
                Address = "Mithatpaşa Cad. Tarihi Asansör Üstü",
                CityId = "İzmir",
                DistrictId = "Konak",
                Phone = "0232 293 47 77",
                Email = "asansor@izmirrestoran.com",
                CoverImage = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
                IsActive = true,
                IsVerified = true,
                IsFeatured = false,
                AverageRating = 4.8m,
                TotalReviews = 110,
                TotalLikes = 390,
                TotalSaves = 145,
                Tags = new[] { "İzmir Körfezi", "Panoramik Manzara", "Tarihi", "Romantik" },
                CreatedAt = DateTime.UtcNow
            },
            new Business
            {
                Id = izmirId5,
                UserId = userIzm5,
                Name = "Urla Şarap Bağı & Gastronomi Evi",
                Type = "Restaurant",
                TaxNumber = "TAX-IZM-005",
                Description = "Urla Bağ Yolu'nda tarladan sofraya taze zeytinyağlılar, gurme peynir tabakları ve bağ manzarası.",
                Location = new Point(26.7650, 38.3150) { SRID = 4326 },
                Address = "Kuşçular Köyü Bağ Yolu Mevkii No:5",
                CityId = "İzmir",
                DistrictId = "Urla",
                Phone = "0232 754 11 00",
                Email = "bagyolu@urlagastronomi.com",
                CoverImage = "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800",
                IsActive = true,
                IsVerified = true,
                IsFeatured = false,
                AverageRating = 4.9m,
                TotalReviews = 98,
                TotalLikes = 330,
                TotalSaves = 125,
                Tags = new[] { "Urla Bağ Yolu", "Gurme", "Doğal Tarım", "Ege Otları" },
                CreatedAt = DateTime.UtcNow
            }
        };

        foreach (var b in newBusinesses)
        {
            if (!await context.Businesses.AnyAsync(x => x.Id == b.Id || x.Name == b.Name))
            {
                await context.Businesses.AddAsync(b);
            }
        }
        await context.SaveChangesAsync();

        // 15 Posts
        var posts = new List<Post>
        {
            // Antalya Posts
            new Post
            {
                Id = Guid.NewGuid(),
                UserId = userAnt1,
                BusinessId = antalyaId1,
                Content = "Kaleiçi'nin tarihi sokaklarında gün batımına karşı enfes filtre kahve ve tatlılarımız sizi bekliyor! 🌅☕",
                ImageUrl = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
                TargetRadiusKm = 15,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-1)
            },
            new Post
            {
                Id = Guid.NewGuid(),
                UserId = userAnt2,
                BusinessId = antalyaId2,
                Content = "Günün taze Akdeniz balıkları ve enfes mezelerimizle lezzet dolu bir akşam yemeği için rezervasyonunuzu yapın 🐟🍷",
                ImageUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
                TargetRadiusKm = 20,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-3)
            },
            new Post
            {
                Id = Guid.NewGuid(),
                UserId = userAnt3,
                BusinessId = antalyaId3,
                Content = "Konyaaltı sahilinde deniz esintisi ve serinletici kokteyller eşliğinde yaza özel DJ performansımız bu akşam! 🏖️🍹",
                ImageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
                TargetRadiusKm = 12,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-4)
            },
            new Post
            {
                Id = Guid.NewGuid(),
                UserId = userAnt4,
                BusinessId = antalyaId4,
                Content = "Şelale sesi eşliğinde 35 çeşit organik köy kahvaltımızla hafta sonuna harika bir başlangıç yapın 🍳🧀",
                ImageUrl = "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800",
                TargetRadiusKm = 15,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-6)
            },
            new Post
            {
                Id = Guid.NewGuid(),
                UserId = userAnt5,
                BusinessId = antalyaId5,
                Content = "Portakal bahçeleri arasında, yıldızların altında kamp ateşi ve huzur. Hafta sonu kaçamağı için hazır mısınız? ⛺🔥",
                ImageUrl = "https://images.unsplash.com/photo-1470246973918-29a93221c455?w=800",
                TargetRadiusKm = 30,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-8)
            },

            // Konya Posts
            new Post
            {
                Id = Guid.NewGuid(),
                UserId = userKon1,
                BusinessId = konyaId1,
                Content = "Konya'nın asırlık lezzeti meşhur tirit kebabı ve güveçte fırın kebap deneyimi için Mevlana meydanındayız! 🥩🔥",
                ImageUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
                TargetRadiusKm = 20,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-2)
            },
            new Post
            {
                Id = Guid.NewGuid(),
                UserId = userKon2,
                BusinessId = konyaId2,
                Content = "Konya'nın kalbi Alaaddin Tepesi'nde yeşillikler içinde taze demlenmiş semaver çayı ve közde kahve keyfi ☕🌳",
                ImageUrl = "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800",
                TargetRadiusKm = 15,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-5)
            },
            new Post
            {
                Id = Guid.NewGuid(),
                UserId = userKon3,
                BusinessId = konyaId3,
                Content = "5000 yıllık tarihi Sille köyünde taş konakta özel közde menengiç kahvesi ve ev yapımı tatlı molası 🏛️☕",
                ImageUrl = "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800",
                TargetRadiusKm = 18,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-7)
            },
            new Post
            {
                Id = Guid.NewGuid(),
                UserId = userKon4,
                BusinessId = konyaId4,
                Content = "Taş fırından yeni çıkmış çıtır çıtır metrelik etli ekmek ve bıçakarası lezzeti Meram Bağları'nda sizleri bekliyor! 🥖🍕",
                ImageUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
                TargetRadiusKm = 20,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-9)
            },
            new Post
            {
                Id = Guid.NewGuid(),
                UserId = userKon5,
                BusinessId = konyaId5,
                Content = "Tropikal kelebek bahçesi gezisi sonrası egzotik meyve çayları ve taze waffle ile enerjinizi tazeleyin 🦋🍰",
                ImageUrl = "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800",
                TargetRadiusKm = 15,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-10)
            },

            // İzmir Posts
            new Post
            {
                Id = Guid.NewGuid(),
                UserId = userIzm1,
                BusinessId = izmirId1,
                Content = "Kordon çimlerinde gün batımına karşı 3. nesil soğuk demleme kahvelerimiz ve leziz taze kruvasanlarımız hazır! 🥐☕",
                ImageUrl = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
                TargetRadiusKm = 15,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-1)
            },
            new Post
            {
                Id = Guid.NewGuid(),
                UserId = userIzm2,
                BusinessId = izmirId2,
                Content = "Girit ezmesi, deniz börülcesi, tereyağlı karides ve Ege'nin en taze çipurası ile Kordon'da unutulmaz bir akşam ziyafeti 🦐🍽️",
                ImageUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
                TargetRadiusKm = 20,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-3)
            },
            new Post
            {
                Id = Guid.NewGuid(),
                UserId = userIzm3,
                BusinessId = izmirId3,
                Content = "Begonvillerle süslü taş avlumuzda meşhur damla sakızlı Türk kahvesi ve fırından yeni çıkan kurabiyelerimiz 🌸☕",
                ImageUrl = "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
                TargetRadiusKm = 25,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-4)
            },
            new Post
            {
                Id = Guid.NewGuid(),
                UserId = userIzm4,
                BusinessId = izmirId4,
                Content = "Tarihi Asansör tepesinde tüm İzmir Körfezi'ni ayaklarınızın altına seren panoramik manzara eşliğinde enfes bir akşam yemeği 🍷🌃",
                ImageUrl = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
                TargetRadiusKm = 20,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-6)
            },
            new Post
            {
                Id = Guid.NewGuid(),
                UserId = userIzm5,
                BusinessId = izmirId5,
                Content = "Bağbozumu mevsiminde tarladan sofraya taze Ege enginarı, zeytinyağlılar ve özel şef tadım menümüzle Urla'dayız 🍇🧀",
                ImageUrl = "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800",
                TargetRadiusKm = 30,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-8)
            }
        };

        foreach (var p in posts)
        {
            if (!await context.Posts.AnyAsync(x => x.BusinessId == p.BusinessId && x.Content == p.Content))
            {
                await context.Posts.AddAsync(p);
            }
        }

        await context.SaveChangesAsync();

        // 16. Ensure Tables Exist for UserFollows, RouteCollaborations, RouteSuggestions
        try
        {
            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS ""UserFollows"" (
                    ""Id"" uuid NOT NULL,
                    ""FollowerId"" uuid NOT NULL,
                    ""FollowingId"" uuid NOT NULL,
                    ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT now(),
                    CONSTRAINT ""PK_UserFollows"" PRIMARY KEY (""Id""),
                    CONSTRAINT ""FK_UserFollows_Users_FollowerId"" FOREIGN KEY (""FollowerId"") REFERENCES ""Users"" (""Id"") ON DELETE CASCADE,
                    CONSTRAINT ""FK_UserFollows_Users_FollowingId"" FOREIGN KEY (""FollowingId"") REFERENCES ""Users"" (""Id"") ON DELETE CASCADE
                );
                CREATE UNIQUE INDEX IF NOT EXISTS ""IX_UserFollows_FollowerId_FollowingId"" ON ""UserFollows"" (""FollowerId"", ""FollowingId"");

                CREATE TABLE IF NOT EXISTS ""RouteCollaborations"" (
                    ""Id"" uuid NOT NULL,
                    ""RouteId"" uuid NOT NULL,
                    ""SenderUserId"" uuid NOT NULL,
                    ""RecipientUserId"" uuid NOT NULL,
                    ""Type"" text NOT NULL DEFAULT 'FriendApproval',
                    ""Status"" text NOT NULL DEFAULT 'Pending',
                    ""SenderNote"" text,
                    ""ReviewerNote"" text,
                    ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT now(),
                    ""UpdatedAt"" timestamp with time zone NOT NULL DEFAULT now(),
                    CONSTRAINT ""PK_RouteCollaborations"" PRIMARY KEY (""Id""),
                    CONSTRAINT ""FK_RouteCollaborations_Routes_RouteId"" FOREIGN KEY (""RouteId"") REFERENCES ""Routes"" (""Id"") ON DELETE CASCADE,
                    CONSTRAINT ""FK_RouteCollaborations_Users_SenderUserId"" FOREIGN KEY (""SenderUserId"") REFERENCES ""Users"" (""Id"") ON DELETE CASCADE,
                    CONSTRAINT ""FK_RouteCollaborations_Users_RecipientUserId"" FOREIGN KEY (""RecipientUserId"") REFERENCES ""Users"" (""Id"") ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS ""RouteSuggestions"" (
                    ""Id"" uuid NOT NULL,
                    ""CollaborationId"" uuid NOT NULL,
                    ""SuggestedByUserId"" uuid NOT NULL,
                    ""BusinessId"" uuid,
                    ""StopName"" text NOT NULL,
                    ""Latitude"" numeric NOT NULL,
                    ""Longitude"" numeric NOT NULL,
                    ""KmAlongRoute"" numeric NOT NULL DEFAULT 0,
                    ""Note"" text,
                    ""Status"" text NOT NULL DEFAULT 'Pending',
                    ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT now(),
                    CONSTRAINT ""PK_RouteSuggestions"" PRIMARY KEY (""Id""),
                    CONSTRAINT ""FK_RouteSuggestions_RouteCollaborations_CollaborationId"" FOREIGN KEY (""CollaborationId"") REFERENCES ""RouteCollaborations"" (""Id"") ON DELETE CASCADE,
                    CONSTRAINT ""FK_RouteSuggestions_Users_SuggestedByUserId"" FOREIGN KEY (""SuggestedByUserId"") REFERENCES ""Users"" (""Id"") ON DELETE CASCADE
                );
            ");

            // Seed Initial Follows
            var sampleFollows = new List<UserFollow>
            {
                new UserFollow { Id = Guid.NewGuid(), FollowerId = ahmetUserId, FollowingId = elifUserId, CreatedAt = DateTime.UtcNow },
                new UserFollow { Id = Guid.NewGuid(), FollowerId = elifUserId, FollowingId = ahmetUserId, CreatedAt = DateTime.UtcNow },
                new UserFollow { Id = Guid.NewGuid(), FollowerId = ahmetUserId, FollowingId = cafeUserId, CreatedAt = DateTime.UtcNow },
                new UserFollow { Id = Guid.NewGuid(), FollowerId = elifUserId, FollowingId = cafeUserId, CreatedAt = DateTime.UtcNow },
            };

            foreach (var f in sampleFollows)
            {
                if (!await context.UserFollows.AnyAsync(x => x.FollowerId == f.FollowerId && x.FollowingId == f.FollowingId))
                {
                    await context.UserFollows.AddAsync(f);
                }
            }
            await context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine("Follow & Collaboration DB setup note: " + ex.Message);
        }
    }
}
