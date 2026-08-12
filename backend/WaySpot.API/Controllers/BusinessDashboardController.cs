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
