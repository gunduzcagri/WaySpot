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

        var radii = new[] { 20000.0, 50000.0, 100000.0, 150000.0 };
        var radiusLabels = new[] { 20.0, 50.0, 100.0, 150.0 };

        List<PostResponse> results = new();
        double appliedRadius = 0;

        for (int i = 0; i < radii.Length; i++)
        {
            var radiusMeters = radii[i];

            var posts = await _context.Posts
                .Include(p => p.Business)
                .Where(p => p.Business.IsActive &&
                    EF.Functions.IsWithinDistance(
                        p.Business.Location,
                        userLocation,
                        radiusMeters,
                        true))
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            if (posts.Count >= 30 || i == radii.Length - 1)
            {
                results = posts.Select(p => new PostResponse
                {
                    Id = p.Id,
                    Content = p.Content,
                    ImageUrl = p.ImageUrl,
                    TargetRadiusKm = p.TargetRadiusKm,
                    CreatedAt = p.CreatedAt,
                    Business = new BusinessResponse
                    {
                        Id = p.Business.Id,
                        Name = p.Business.Name,
                        Description = p.Business.Description,
                        Latitude = p.Business.Location.Y,
                        Longitude = p.Business.Location.X,
                        IsActive = p.Business.IsActive,
                        CreatedAt = p.Business.CreatedAt
                    }
                }).ToList();

                appliedRadius = radiusLabels[i];
                break;
            }
        }

        return Ok(new DiscoverResponse
        {
            Posts = results,
            AppliedRadiusKm = appliedRadius,
            TotalCount = results.Count,
            Message = $"{appliedRadius} km yaricap icinde {results.Count} sonuc bulundu."
        });
    }
}
