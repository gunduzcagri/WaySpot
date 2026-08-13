using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using WaySpot.Core.DTOs;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiscoverController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public DiscoverController(WaySpotDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Discover([FromQuery] DiscoverRequest request)
    {
        var userLocation = new Point(request.Longitude, request.Latitude) { SRID = 4326 };

        var posts = await _context.Posts
            .Include(p => p.Business)
            .Include(p => p.User)
            .Where(p => p.IsActive && p.Business.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .Take(50)
            .ToListAsync();

        var results = posts.Select(p => new PostResponse
        {
            Id = p.Id,
            Content = p.Content,
            ImageUrl = p.ImageUrl,
            TargetRadiusKm = p.TargetRadiusKm,
            CreatedAt = p.CreatedAt,
            Business = p.Business != null ? new BusinessResponse
            {
                Id = p.Business.Id,
                Name = p.Business.Name,
                Description = p.Business.Description,
                Latitude = p.Business.Location.Y,
                Longitude = p.Business.Location.X,
                IsActive = p.Business.IsActive,
                CreatedAt = p.Business.CreatedAt
            } : null,
            User = p.User != null ? new UserResponse
            {
                Id = p.User.Id,
                Username = p.User.Username,
                Email = p.User.Email
            } : null
        }).ToList();

        return Ok(new DiscoverResponse
        {
            Posts = results,
            AppliedRadiusKm = 0,
            TotalCount = results.Count,
            Message = $"{results.Count} sonuc bulundu."
        });
    }
}
