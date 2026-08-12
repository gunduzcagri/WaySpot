## EK ASAMA: BUSINESS DASHBOARD & KULLANICI PANELI

### EK.7 - Business Dashboard DTO'lari

**Dosya:** `backend/WaySpot.Core/DTOs/BusinessDashboardStats.cs`
```csharp
namespace WaySpot.Core.DTOs;

public class BusinessDashboardStats
{
    public int TotalPosts { get; set; }
    public int ActivePosts { get; set; }
    public int TotalReviews { get; set; }
    public double AverageRating { get; set; }
    public int TotalViews { get; set; }
    public List<PostPerformance> PostPerformances { get; set; } = new();
    public List<RatingDistribution> RatingDistribution { get; set; } = new();
    public List<RecentReview> RecentReviews { get; set; } = new();
}

public class PostPerformance
{
    public Guid PostId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public double TargetRadiusKm { get; set; }
    public int ViewCount { get; set; }
}

public class RatingDistribution
{
    public int Rating { get; set; }
    public int Count { get; set; }
}

public class RecentReview
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### EK.8 - BusinessDashboardController

**Dosya:** `backend/WaySpot.API/Controllers/BusinessDashboardController.cs`
```csharp
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaySpot.Core.DTOs;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/business-dashboard")]
[Authorize(Roles = "Business")]
public class BusinessDashboardController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public BusinessDashboardController(WaySpotDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var userId = GetCurrentUserId();
        var business = await _context.Businesses
            .Include(b => b.Posts)
            .Include(b => b.Reviews)
            .FirstOrDefaultAsync(b => b.UserId == userId);

        if (business == null) return NotFound(new { message = "Isletme bulunamadi." });

        var totalPosts = business.Posts.Count;
        var activePosts = business.Posts.Count(p => p.ExpiresAt == null || p.ExpiresAt > DateTime.UtcNow);
        var totalReviews = business.Reviews.Count;
        var avgRating = business.Reviews.Any() ? business.Reviews.Average(r => r.Rating) : 0;

        // Rating dagilimi
        var ratingDist = Enumerable.Range(1, 5)
            .Select(r => new RatingDistribution
            {
                Rating = r,
                Count = business.Reviews.Count(rev => rev.Rating == r)
            })
            .ToList();

        // Son 5 yorum
        var recentReviews = await _context.Reviews
            .Where(r => r.BusinessId == business.Id && r.IsApproved)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .Take(5)
            .Select(r => new RecentReview
            {
                Id = r.Id,
                Username = r.User.Username,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        // Post performanslari (simdilik view count sabit, ileride analytics tablosu eklenebilir)
        var postPerformances = business.Posts
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PostPerformance
            {
                PostId = p.Id,
                Content = p.Content.Length > 50 ? p.Content[..50] + "..." : p.Content,
                CreatedAt = p.CreatedAt,
                TargetRadiusKm = p.TargetRadiusKm,
                ViewCount = 0 // Analytics tablosu sonraki asamada
            })
            .ToList();

        return Ok(new BusinessDashboardStats
        {
            TotalPosts = totalPosts,
            ActivePosts = activePosts,
            TotalReviews = totalReviews,
            AverageRating = Math.Round(avgRating, 1),
            TotalViews = 0,
            PostPerformances = postPerformances,
            RatingDistribution = ratingDist,
            RecentReviews = recentReviews
        });
    }

    [HttpGet("reviews")]
    public async Task<IActionResult> GetMyReviews()
    {
        var userId = GetCurrentUserId();
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == userId);
        if (business == null) return NotFound();

        var reviews = await _context.Reviews
            .Where(r => r.BusinessId == business.Id)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new RecentReview
            {
                Id = r.Id,
                Username = r.User.Username,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(reviews);
    }
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### EK.9 - Kullanici Profil DTO'lari

**Dosya:** `backend/WaySpot.Core/DTOs/UserProfileResponse.cs`
```csharp
namespace WaySpot.Core.DTOs;

public class UserProfileResponse
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int TotalReviews { get; set; }
    public int TotalSavedRoutes { get; set; }
}
```

**Dosya:** `backend/WaySpot.Core/DTOs/UpdateProfileRequest.cs`
```csharp
using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class UpdateProfileRequest
{
    [MinLength(3), MaxLength(50)]
    public string? Username { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    [MinLength(6)]
    public string? NewPassword { get; set; }

    [Required]
    public string CurrentPassword { get; set; } = string.Empty;
}
```

---

### EK.10 - UserProfileController

**Dosya:** `backend/WaySpot.API/Controllers/UserProfileController.cs`
```csharp
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaySpot.Core.DTOs;
using WaySpot.Core.Interfaces;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class UserProfileController : ControllerBase
{
    private readonly WaySpotDbContext _context;
    private readonly IPasswordService _passwordService;

    public UserProfileController(WaySpotDbContext context, IPasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users
            .Include(u => u.Reviews)
            .Include(u => u.SavedRoutes)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound();

        return Ok(new UserProfileResponse
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
            TotalReviews = user.Reviews.Count,
            TotalSavedRoutes = user.SavedRoutes.Count
        });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        // Mevcut sifre kontrolu
        if (!_passwordService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Mevcut sifre hatali." });

        // Kullanici adi guncelleme
        if (!string.IsNullOrWhiteSpace(request.Username) && request.Username != user.Username)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest(new { message = "Bu kullanici adi zaten kullaniliyor." });
            user.Username = request.Username;
        }

        // Email guncelleme
        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new { message = "Bu e-posta zaten kullaniliyor." });
            user.Email = request.Email;
        }

        // Sifre degistirme
        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            user.PasswordHash = _passwordService.HashPassword(request.NewPassword);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Profil guncellendi." });
    }

    [HttpGet("my-reviews")]
    public async Task<IActionResult> GetMyReviews()
    {
        var userId = GetCurrentUserId();
        var reviews = await _context.Reviews
            .Where(r => r.UserId == userId)
            .Include(r => r.Business)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Comment,
                r.PhotoUrl,
                r.CreatedAt,
                BusinessName = r.Business.Name,
                BusinessId = r.Business.Id
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpDelete("my-reviews/{id:guid}")]
    public async Task<IActionResult> DeleteMyReview(Guid id)
    {
        var userId = GetCurrentUserId();
        var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
        if (review == null) return NotFound();

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### EK.11 - Kayitli Rotalar (SavedRoutes) Controller

**Talimat:** Kullanici baslangic-bitis noktalasi girerek rota kaydedebilir. PostGIS Point kullan.

**Dosya:** `backend/WaySpot.Core/DTOs/CreateSavedRouteRequest.cs`
```csharp
using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class CreateSavedRouteRequest
{
    [Required, MinLength(2), MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public double StartLatitude { get; set; }

    [Required]
    public double StartLongitude { get; set; }

    [Required]
    public double EndLatitude { get; set; }

    [Required]
    public double EndLongitude { get; set; }

    public string? WaypointsJson { get; set; }

    public double TotalDistanceKm { get; set; }
}
```

**Dosya:** `backend/WaySpot.API/Controllers/SavedRoutesController.cs`
```csharp
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using WaySpot.Core.DTOs;
using WaySpot.Core.Entities;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/saved-routes")]
[Authorize]
public class SavedRoutesController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public SavedRoutesController(WaySpotDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> Create(CreateSavedRouteRequest request)
    {
        var userId = GetCurrentUserId();

        var route = new SavedRoute
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            StartPoint = new Point(request.StartLongitude, request.StartLatitude) { SRID = 4326 },
            EndPoint = new Point(request.EndLongitude, request.EndLatitude) { SRID = 4326 },
            WaypointsJson = request.WaypointsJson,
            TotalDistanceKm = request.TotalDistanceKm
        };

        _context.SavedRoutes.Add(route);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            route.Id,
            route.Name,
            StartLatitude = route.StartPoint.Y,
            StartLongitude = route.StartPoint.X,
            EndLatitude = route.EndPoint.Y,
            EndLongitude = route.EndPoint.X,
            route.TotalDistanceKm,
            route.CreatedAt
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetMyRoutes()
    {
        var userId = GetCurrentUserId();
        var routes = await _context.SavedRoutes
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Name,
                StartLatitude = r.StartPoint.Y,
                StartLongitude = r.StartPoint.X,
                EndLatitude = r.EndPoint.Y,
                EndLongitude = r.EndPoint.X,
                r.WaypointsJson,
                r.TotalDistanceKm,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(routes);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        var route = await _context.SavedRoutes.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
        if (route == null) return NotFound();

        _context.SavedRoutes.Remove(route);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### EK.12 - Tum Yeni Endpoint'lerin Testi

**Test Adimi (Business Dashboard):**
```bash
curl http://localhost:5000/api/business-dashboard/stats \
  -H "Authorization: Bearer $BUSINESS_TOKEN"
```
**Beklenen:** Isletme istatistikleri JSON olarak.

**Test Adimi (Kullanici Profili):**
```bash
curl http://localhost:5000/api/profile \
  -H "Authorization: Bearer $USER_TOKEN"
```
**Beklenen:** Kullanici bilgileri + review/route sayisi.

**Test Adimi (Rota Kaydetme):**
```bash
curl -X POST http://localhost:5000/api/saved-routes \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ankara-Antalya","startLatitude":39.9334,"startLongitude":32.8597,"endLatitude":36.8969,"endLongitude":30.7133,"totalDistanceKm":480}'
```
**Beklenen:** 200 OK, rota kaydedildi.

**Kabul Kriteri:** Tum yeni endpoint'ler calisiyor.