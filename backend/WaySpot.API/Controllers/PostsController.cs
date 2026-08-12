using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaySpot.Core.DTOs;
using WaySpot.Core.Entities;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostsController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public PostsController(WaySpotDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    [Authorize(Roles = "Business")]
    public async Task<IActionResult> Create(CreatePostRequest request)
    {
        var userId = GetCurrentUserId();
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == userId);
        if (business == null)
            return BadRequest(new { message = "Once isletme profili olusturmalisiniz." });

        var post = new Post
        {
            Id = Guid.NewGuid(),
            BusinessId = business.Id,
            Content = request.Content,
            ImageUrl = request.ImageUrl,
            TargetRadiusKm = request.TargetRadiusKm
        };

        _context.Posts.Add(post);
        await _context.SaveChangesAsync();

        return Ok(await MapToResponse(post));
    }

    [HttpGet("my")]
    [Authorize(Roles = "Business")]
    public async Task<IActionResult> GetMyPosts()
    {
        var userId = GetCurrentUserId();
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == userId);
        if (business == null) return NotFound();

        var posts = await _context.Posts
            .Where(p => p.BusinessId == business.Id)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(posts.Select(p => MapToResponse(p).Result));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Business")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == userId);
        if (business == null) return NotFound();

        var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == id && p.BusinessId == business.Id);
        if (post == null) return NotFound();

        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private async Task<PostResponse> MapToResponse(Post post)
    {
        var business = await _context.Businesses.FindAsync(post.BusinessId);
        return new PostResponse
        {
            Id = post.Id,
            Content = post.Content,
            ImageUrl = post.ImageUrl,
            TargetRadiusKm = post.TargetRadiusKm,
            CreatedAt = post.CreatedAt,
            Business = new BusinessResponse
            {
                Id = business!.Id,
                Name = business.Name,
                Description = business.Description,
                Latitude = business.Location.Y,
                Longitude = business.Location.X,
                IsActive = business.IsActive,
                CreatedAt = business.CreatedAt
            }
        };
    }
}
