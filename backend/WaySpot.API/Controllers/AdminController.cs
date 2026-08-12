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
