using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using WaySpot.Core.Entities;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class TestDataController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public TestDataController(WaySpotDbContext context)
    {
        _context = context;
    }

    [HttpPost("seed-businesses")]
    public async Task<IActionResult> SeedBusinesses()
    {
        if (await _context.Businesses.AnyAsync())
            return Ok(new { message = "Zaten isletme var.", count = await _context.Businesses.CountAsync() });

        var anyUser = await _context.Users.FirstOrDefaultAsync();
        if (anyUser == null)
            return BadRequest(new { message = "Oncelikle bir kullanici ile giris yapin." });

        var list = new List<(string Name, string Type, double Lat, double Lng, string City, string Desc, string Phone)>
        {
            ("Sultanahmet Kafe", "Cafe", 41.0055, 28.9768, "Istanbul", "Tarihi yarimada manzarali kafe.", "+90 212 511 1111"),
            ("Kadıköy Kahve", "Cafe", 40.9900, 29.0300, "Istanbul", "Sahil manzarali kahve.", "+90 216 222 2222"),
            ("Beşiktaş Restoran", "Restaurant", 41.0430, 29.0050, "Istanbul", "Bosphorus manzarali restoran.", "+90 212 333 3333"),
            ("Taksim Bar", "Bar", 41.0370, 28.9850, "Istanbul", "Yasam merkezi bar.", "+90 212 444 4444"),
            ("Ankara Kafe", "Cafe", 39.9200, 32.8500, "Ankara", "Kızılay merkez kafe.", "+90 312 555 5555"),
            ("Çankaya Otel", "Hotel", 39.9100, 32.8600, "Ankara", "Merkez otel.", "+90 312 666 6666"),
            ("Konya Restoran", "Restaurant", 37.8746, 32.4932, "Konya", "Mevlana cephesi restoran.", "+90 332 777 7777"),
            ("Bursa Kafe", "Cafe", 40.1885, 29.0610, "Bursa", "Uludag manzarali kafe.", "+90 224 888 8888"),
            ("Gaziantep Restoran", "Restaurant", 37.0662, 37.3833, "Gaziantep", "Zirve restoran.", "+90 342 999 9999"),
            ("Kayseri Kafe", "Cafe", 38.7312, 35.4787, "Kayseri", "Erciyes manzarali kafe.", "+90 352 101 0101"),
            ("Mersin Restoran", "Restaurant", 36.8121, 34.6415, "Mersin", "Marina restoran.", "+90 324 202 0202"),
            ("Diyarbakır Kafe", "Cafe", 37.9144, 40.2306, "Diyarbakır", "Sur kafe.", "+90 412 303 0303"),
            ("Van Restoran", "Restaurant", 38.4891, 43.4089, "Van", "Gol manzarali restoran.", "+90 432 404 0404"),
            ("Erzurum Kafe", "Cafe", 39.9000, 41.2700, "Erzurum", "Dagi manzarali kafe.", "+90 442 505 0505"),
            ("Sivas Kafe", "Cafe", 39.7477, 37.0178, "Sivas", "Kale kafe.", "+90 346 606 0606"),
            ("Eskişehir Restoran", "Restaurant", 39.7667, 30.5256, "Eskisehir", "Saz caddesi restoran.", "+90 222 707 0707"),
            ("Denizli Kafe", "Cafe", 37.7765, 29.0864, "Denizli", "Pamukkale manzarali kafe.", "+90 258 808 0808"),
            ("Aydın Restoran", "Restaurant", 37.8444, 27.8458, "Aydin", "Zeytinyagli restoran.", "+90 256 909 0909"),
            ("Muğla Kafe", "Cafe", 37.2153, 28.3636, "Mugla", "Bodrum kafe.", "+90 252 111 1111"),
            ("Bodrum Otel", "Hotel", 37.0400, 27.4300, "Mugla", "Marina otel.", "+90 252 222 2222")
        };

        foreach (var b in list)
        {
            var business = new Business
            {
                Id = Guid.NewGuid(),
                UserId = anyUser.Id,
                Name = b.Name,
                Type = b.Type,
                TaxNumber = "TEST-" + Guid.NewGuid().ToString("N")[..10],
                Description = b.Desc,
                Location = new Point(b.Lng, b.Lat) { SRID = 4326 },
                Address = $"{b.City} Merkez",
                CityId = b.City,
                IsActive = true,
                IsVerified = true,
                Phone = b.Phone,
                Email = $"info@{b.Name.Replace(" ", "").ToLower()}.com",
                CreatedAt = DateTime.UtcNow
            };
            _context.Businesses.Add(business);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = $"{list.Count} isletme eklendi.", count = list.Count });
    }

    [HttpDelete("clear-businesses")]
    public async Task<IActionResult> ClearBusinesses()
    {
        var count = await _context.Businesses.CountAsync();
        _context.Businesses.RemoveRange(await _context.Businesses.ToListAsync());
        await _context.SaveChangesAsync();
        return Ok(new { message = $"{count} isletme silindi." });
    }

    [HttpPost("seed-posts")]
    public async Task<IActionResult> SeedPosts()
    {
        if (await _context.Posts.AnyAsync())
            return Ok(new { message = "Zaten paylaşım var.", count = await _context.Posts.CountAsync() });

        var anyUser = await _context.Users.FirstOrDefaultAsync();
        if (anyUser == null)
            return BadRequest(new { message = "Öncelikle bir kullanıcı ile giriş yapın." });

        var antalyaBusinesses = await _context.Businesses
            .Where(b => b.CityId == "Antalya" || b.Name.Contains("Antalya") || b.Name.Contains("Kemer") || b.Name.Contains("Alanya") || b.Name.Contains("Side"))
            .ToListAsync();

        if (!antalyaBusinesses.Any())
        {
            return Ok(new { message = "Antalya bölgesinde işletme bulunamadı, önce test işletmelerini ekleyin." });
        }

        var samplePosts = new[]
        {
            ("Antalya'da harika bir deniz keyfi! 🏖️", " Deniz manzarası muhteşem, kesinlikle tekrar geleceğim."),
            ("Kemer'de yeni açılan restoran çok lezzetli 🍽️", " Ambiance ve hizmet mükemmel."),
            ("Alanya kalesi gezisi için en iyi zaman şimdi 🏰", " Tarihi dokusu ve manzarası büyüleyici."),
            ("Side'de antik tiyatro izlenimi ⭐", " Tarihi yerleri görmek için ideal."),
            ("Antalya'da kahve molası ☕", " Sahil kenarında keyifli bir kahve."),
            ("Kemer'de yat turu deneyimi ⛵", " Gün batımıyla birlikte unutulmaz anlar."),
            ("Alanya'da balık ekmek 🐟", " Sahil kenarında taze ve lezzetli."),
            ("Side'de antik kent yürüyüşü 🏛️", " Tarihin kalbinde bir yürüyüş."),
            ("Antalya'da alışveriş caddesi 🛍️", " Markalar ve kafeler dolu canlı bir cadde."),
            ("Kemer'de doğa yürüyüşü 🌲", " Yayla manzarası ve temiz hava."),
        };

        foreach (var postContent in samplePosts)
        {
            var business = antalyaBusinesses[Random.Shared.Next(antalyaBusinesses.Count)];
            var post = new Post
            {
                Id = Guid.NewGuid(),
                UserId = anyUser.Id,
                BusinessId = business.Id,
                Content = postContent.Item1 + postContent.Item2,
                TargetRadiusKm = Random.Shared.Next(1, 10),
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddHours(-Random.Shared.Next(1, 72))
            };
            _context.Posts.Add(post);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = $"{samplePosts.Length} örnek paylaşım eklendi." });
    }
}
