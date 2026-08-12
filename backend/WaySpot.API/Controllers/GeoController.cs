using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
}
