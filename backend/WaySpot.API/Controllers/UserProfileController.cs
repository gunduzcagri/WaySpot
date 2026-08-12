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
