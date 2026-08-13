using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using WaySpot.Core.DTOs;
using WaySpot.Core.Interfaces;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GeoController : ControllerBase
{
    private readonly WaySpotDbContext _context;
    private readonly IGeoJsonLdService _geoService;

    public GeoController(WaySpotDbContext context, IGeoJsonLdService geoService)
    {
        _context = context;
        _geoService = geoService;
    }

    [HttpGet("business/{id:guid}/json-ld")]
    public async Task<IActionResult> GetBusinessJsonLd(Guid id)
    {
        var business = await _context.Businesses.FindAsync(id);
        if (business == null) return NotFound();

        var response = new
        {
            Id = business.Id,
            Name = business.Name,
            Description = business.Description,
            Latitude = business.Location.Y,
            Longitude = business.Location.X,
            JsonLd = _geoService.GenerateLocalBusinessJsonLd(new()
            {
                Id = business.Id,
                Name = business.Name,
                Description = business.Description,
                Latitude = business.Location.Y,
                Longitude = business.Location.X,
                IsActive = business.IsActive,
                CreatedAt = business.CreatedAt
            })
        };

        return Ok(response);
    }

    [HttpGet("nearby")]
    public async Task<IActionResult> GetNearby([FromQuery] double latitude, [FromQuery] double longitude, [FromQuery] double radius = 10000)
    {
        var userLocation = new Point(longitude, latitude) { SRID = 4326 };

        var businesses = await _context.Businesses
            .Where(b => b.IsActive && b.Location.Distance(userLocation) <= radius)
            .OrderBy(b => b.Location.Distance(userLocation))
            .Select(b => new BusinessResponse
            {
                Id = b.Id,
                Name = b.Name,
                Description = b.Description,
                Latitude = b.Location.Y,
                Longitude = b.Location.X,
                Address = b.Address,
                Phone = b.Phone,
                Email = b.Email,
                Website = b.Website,
                Instagram = b.Instagram,
                Facebook = b.Facebook,
                WhatsApp = b.WhatsApp,
                CoverImage = b.CoverImage,
                LogoImage = b.LogoImage,
                IsActive = b.IsActive,
                IsVerified = b.IsVerified,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt
            })
            .ToListAsync();

        return Ok(new { businesses });
    }
}
