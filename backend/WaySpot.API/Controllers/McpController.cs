using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using System.Linq;
using WaySpot.Core.DTOs;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/mcp")]
public class McpController : ControllerBase
{
    private readonly WaySpotDbContext _context;
    private readonly GeometryFactory _geometryFactory = new(new PrecisionModel(), 4326);

    public McpController(WaySpotDbContext context)
    {
        _context = context;
    }

    [HttpPost("search-along-route")]
    public async Task<IActionResult> SearchAlongRoute(RouteSearchRequest request)
    {
        if (request.Points.Count < 2)
            return BadRequest(new { message = "En az 2 nokta gerekli." });

        // Guzergahi LineString olarak olustur
        var coordinates = request.Points
            .Select(p => new Coordinate(p.Longitude, p.Latitude))
            .ToArray();

        var routeLine = new LineString(coordinates) { SRID = 4326 };
        var bufferMeters = request.BufferKm * 1000;

        // Guzergaha yakin isletmeleri bul (ST_DWithin)
        var businesses = await _context.Businesses
            .Where(b => b.IsActive &&
                EF.Functions.IsWithinDistance(b.Location, routeLine, bufferMeters, true))
            .Include(b => b.Posts)
            .ToListAsync();

        var result = businesses.Select(b => new BusinessAlongRoute
        {
            Id = b.Id,
            Name = b.Name,
            Description = b.Description,
            Latitude = b.Location.Y,
            Longitude = b.Location.X,
            DistanceFromRouteKm = Math.Round(b.Location.Distance(routeLine) / 1000, 2),
            ActivePosts = b.Posts
                .Where(p => p.ExpiresAt == null || p.ExpiresAt > DateTime.UtcNow)
                .Select(p => new PostResponse
                {
                    Id = p.Id,
                    Content = p.Content,
                    ImageUrl = p.ImageUrl,
                    TargetRadiusKm = p.TargetRadiusKm,
                    CreatedAt = p.CreatedAt,
                    Business = new BusinessResponse
                    {
                        Id = b.Id,
                        Name = b.Name,
                        Description = b.Description,
                        Latitude = b.Location.Y,
                        Longitude = b.Location.X,
                        IsActive = b.IsActive,
                        CreatedAt = b.CreatedAt
                    }
                }).ToList()
        }).ToList();

        return Ok(new RouteSearchResponse
        {
            Businesses = result,
            TotalCount = result.Count(),
            SearchBufferKm = request.BufferKm
        });
    }
}
