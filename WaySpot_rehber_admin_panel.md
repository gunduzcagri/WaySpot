## EK ASAMA: ADMIN PANELI & MODERASYON SISTEMI

### EK.0 - Kabul Kriteri (On Kosul)
- [ ] Asama 6 (Review) tamamen bitmis.
- [ ] Tum onceki endpoint'ler calisiyor.

---

### EK.1 - Admin Rolu Ekleme

**Talimat:** UserRole enum'una Admin ekle. Bu enum daha once olusturuldu, sadece guncelle.

**Dosya:** `backend/WaySpot.Core/Enums/UserRole.cs` (TAMAMEN DEGISTIR)
```csharp
namespace WaySpot.Core.Enums;

public enum UserRole
{
    User = 1,
    Business = 2,
    Admin = 3
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### EK.2 - Admin DTO'lari

**Dosya:** `backend/WaySpot.Core/DTOs/AdminUserListResponse.cs`
```csharp
using WaySpot.Core.Enums;

namespace WaySpot.Core.DTOs;

public class AdminUserListResponse
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool HasBusiness { get; set; }
}
```

**Dosya:** `backend/WaySpot.Core/DTOs/AdminBusinessListResponse.cs`
```csharp
namespace WaySpot.Core.DTOs;

public class AdminBusinessListResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public bool IsActive { get; set; }
    public int PostCount { get; set; }
    public int ReviewCount { get; set; }
    public double AverageRating { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**Dosya:** `backend/WaySpot.Core/DTOs/AdminReviewModerationResponse.cs`
```csharp
namespace WaySpot.Core.DTOs;

public class AdminReviewModerationResponse
{
    public Guid Id { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Username { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsFlagged { get; set; }
}
```

**Dosya:** `backend/WaySpot.Core/DTOs/AdminDashboardStats.cs`
```csharp
namespace WaySpot.Core.DTOs;

public class AdminDashboardStats
{
    public int TotalUsers { get; set; }
    public int TotalBusinesses { get; set; }
    public int TotalPosts { get; set; }
    public int TotalReviews { get; set; }
    public int PendingReviews { get; set; }
    public int ActiveBusinesses { get; set; }
    public int InactiveBusinesses { get; set; }
    public List<DailyStat> Last7Days { get; set; } = new();
}

public class DailyStat
{
    public DateTime Date { get; set; }
    public int NewUsers { get; set; }
    public int NewReviews { get; set; }
    public int NewPosts { get; set; }
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### EK.3 - Review Entity Guncellemesi (Moderasyon Icin)

**Talimat:** Review tablosuna `IsApproved` ve `IsFlagged` alanlari ekle. Migration gerekecek.

**Dosya:** `backend/WaySpot.Core/Entities/Review.cs` (TAMAMEN DEGISTIR)
```csharp
namespace WaySpot.Core.Entities;

public class Review
{
    public Guid Id { get; set; }
    public Guid BusinessId { get; set; }
    public Guid UserId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
    public bool IsApproved { get; set; } = false; // Admin onayi gerekli
    public bool IsFlagged { get; set; } = false; // Sikayet edildi
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Business Business { get; set; } = null!;
    public AppUser User { get; set; } = null!;
}
```

**Migration Komutu:**
```bash
cd backend/WaySpot.API
dotnet ef migrations add AddReviewModeration --project ../WaySpot.Infrastructure --startup-project .
dotnet ef database update --project ../WaySpot.Infrastructure --startup-project .
```

**Kabul Kriteri:** `dotnet build` hatasiz. DB'de yeni kolonlar olusmus.

---

### EK.4 - AdminController

**Talimat:** Tum endpoint'ler `[Authorize(Roles = "Admin")]` ile korunmali.

**Dosya:** `backend/WaySpot.API/Controllers/AdminController.cs`
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaySpot.Core.DTOs;
using WaySpot.Core.Enums;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public AdminController(WaySpotDbContext context)
    {
        _context = context;
    }

    // DASHBOARD ISTATISTIKLERI
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalBusinesses = await _context.Businesses.CountAsync();
        var totalPosts = await _context.Posts.CountAsync();
        var totalReviews = await _context.Reviews.CountAsync();
        var pendingReviews = await _context.Reviews.CountAsync(r => !r.IsApproved);
        var activeBusinesses = await _context.Businesses.CountAsync(b => b.IsActive);

        var last7Days = Enumerable.Range(0, 7)
            .Select(i => DateTime.UtcNow.Date.AddDays(-i))
            .Select(date => new DailyStat
            {
                Date = date,
                NewUsers = _context.Users.Count(u => u.CreatedAt.Date == date),
                NewReviews = _context.Reviews.Count(r => r.CreatedAt.Date == date),
                NewPosts = _context.Posts.Count(p => p.CreatedAt.Date == date)
            })
            .ToList();

        return Ok(new AdminDashboardStats
        {
            TotalUsers = totalUsers,
            TotalBusinesses = totalBusinesses,
            TotalPosts = totalPosts,
            TotalReviews = totalReviews,
            PendingReviews = pendingReviews,
            ActiveBusinesses = activeBusinesses,
            InactiveBusinesses = totalBusinesses - activeBusinesses,
            Last7Days = last7Days
        });
    }

    // KULLANICI YONETIMI
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .Select(u => new AdminUserListResponse
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role,
                CreatedAt = u.CreatedAt,
                HasBusiness = u.Business != null
            })
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        return Ok(users);
    }

    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // ISLETME YONETIMI
    [HttpGet("businesses")]
    public async Task<IActionResult> GetAllBusinesses()
    {
        var businesses = await _context.Businesses
            .Include(b => b.User)
            .Include(b => b.Posts)
            .Include(b => b.Reviews)
            .Select(b => new AdminBusinessListResponse
            {
                Id = b.Id,
                Name = b.Name,
                OwnerEmail = b.User.Email,
                Latitude = b.Location.Y,
                Longitude = b.Location.X,
                IsActive = b.IsActive,
                PostCount = b.Posts.Count,
                ReviewCount = b.Reviews.Count,
                AverageRating = b.Reviews.Any() ? b.Reviews.Average(r => r.Rating) : 0,
                CreatedAt = b.CreatedAt
            })
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return Ok(businesses);
    }

    [HttpPut("businesses/{id:guid}/status")]
    public async Task<IActionResult> ToggleBusinessStatus(Guid id, [FromBody] bool isActive)
    {
        var business = await _context.Businesses.FindAsync(id);
        if (business == null) return NotFound();

        business.IsActive = isActive;
        await _context.SaveChangesAsync();
        return Ok(new { message = $"Isletme durumu {(isActive ? "aktif" : "pasif")} yapildi." });
    }

    // YORUM MODERASYONU
    [HttpGet("reviews/pending")]
    public async Task<IActionResult> GetPendingReviews()
    {
        var reviews = await _context.Reviews
            .Where(r => !r.IsApproved)
            .Include(r => r.User)
            .Include(r => r.Business)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new AdminReviewModerationResponse
            {
                Id = r.Id,
                Comment = r.Comment,
                PhotoUrl = r.PhotoUrl,
                Rating = r.Rating,
                Username = r.User.Username,
                BusinessName = r.Business.Name,
                CreatedAt = r.CreatedAt,
                IsFlagged = r.IsFlagged
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpPut("reviews/{id:guid}/approve")]
    public async Task<IActionResult> ApproveReview(Guid id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null) return NotFound();

        review.IsApproved = true;
        review.IsFlagged = false;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Yorum onaylandi." });
    }

    [HttpPut("reviews/{id:guid}/reject")]
    public async Task<IActionResult> RejectReview(Guid id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null) return NotFound();

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Yorum reddedildi ve silindi." });
    }

    [HttpPut("reviews/{id:guid}/flag")]
    public async Task<IActionResult> FlagReview(Guid id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null) return NotFound();

        review.IsFlagged = true;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Yorum isaretlendi." });
    }
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### EK.5 - ReviewsController Guncellemesi (Onay Kontrolu)

**Talimat:** GetReviews endpoint'i sadece onayli yorumlari donsun. Admin haric.

**Dosya:** `backend/WaySpot.API/Controllers/ReviewsController.cs` (GetReviews metodunu DEGISTIR)
```csharp
[HttpGet]
[AllowAnonymous]
public async Task<IActionResult> GetReviews(Guid businessId)
{
    var reviews = await _context.Reviews
        .Where(r => r.BusinessId == businessId && r.IsApproved) // Sadece onayli yorumlar
        .Include(r => r.User)
        .OrderByDescending(r => r.CreatedAt)
        .ToListAsync();

    return Ok(reviews.Select(r => MapToResponse(r).Result));
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### EK.6 - Admin Seed (Ilk Admin Olusturma)

**Talimat:** Admin hesabi olusturmak icin bir endpoint veya script. Register endpoint'i zaten var, sadece Role=3 (Admin) ile kaydol.

**Test Adimi:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@wayspot.com","password":"Admin123!","role":3}'
```

**Sonra Admin endpoint'lerini test et:**
```bash
# Dashboard istatistikleri
curl http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Tum kullanicilar
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Bekleyen yorumlar
curl http://localhost:5000/api/admin/reviews/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Kabul Kriteri:** Admin token ile tum endpoint'ler calisiyor. User/Business token ile 403 Forbidden donuyor.