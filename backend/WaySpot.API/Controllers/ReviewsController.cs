using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaySpot.Core.DTOs;
using WaySpot.Core.Entities;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/businesses/{businessId:guid}/[controller]")]
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public ReviewsController(WaySpotDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> AddReview(Guid businessId, CreateReviewRequest request)
    {
        // ZORUNLU VALIDASYON: PhotoUrl
        if (string.IsNullOrWhiteSpace(request.PhotoUrl))
            return BadRequest(new { message = "Fotograf URL'si zorunludur. Yorum yapabilmek icin fotograf yuklemelisiniz." });

        if (request.BusinessId != businessId)
            return BadRequest(new { message = "BusinessId uyusmazligi." });

        var business = await _context.Businesses.FindAsync(businessId);
        if (business == null) return NotFound(new { message = "Isletme bulunamadi." });

        var userId = GetCurrentUserId();

        if (await _context.Reviews.AnyAsync(r => r.BusinessId == businessId && r.UserId == userId))
            return BadRequest(new { message = "Bu isletmeye zaten yorum yaptiniz." });

        var review = new Review
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            UserId = userId,
            Rating = request.Rating,
            Comment = request.Comment,
            PhotoUrl = request.PhotoUrl
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok(await MapToResponse(review));
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetReviews(Guid businessId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.BusinessId == businessId)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews.Select(r => MapToResponse(r).Result));
    }

    private async Task<ReviewResponse> MapToResponse(Review review)
    {
        var user = await _context.Users.FindAsync(review.UserId);
        return new ReviewResponse
        {
            Id = review.Id,
            Rating = review.Rating,
            Comment = review.Comment,
            PhotoUrl = review.PhotoUrl,
            CreatedAt = review.CreatedAt,
            Username = user!.Username
        };
    }
}
