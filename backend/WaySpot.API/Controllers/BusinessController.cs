using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using WaySpot.Core.DTOs;
using WaySpot.Core.Entities;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BusinessController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public BusinessController(WaySpotDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    [Authorize(Roles = "Business")]
    public async Task<IActionResult> Create(CreateBusinessRequest request)
    {
        var userId = GetCurrentUserId();

        if (await _context.Businesses.AnyAsync(b => b.UserId == userId))
            return BadRequest(new { message = "Bu hesap zaten bir isletmeye sahip." });

        var business = new Business
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            Description = request.Description,
            Location = new Point(request.Longitude, request.Latitude) { SRID = 4326 }
        };

        _context.Businesses.Add(business);
        await _context.SaveChangesAsync();

        return Ok(MapToResponse(business));
    }

    [HttpGet("my")]
    [Authorize(Roles = "Business")]
    public async Task<IActionResult> GetMyBusiness()
    {
        var userId = GetCurrentUserId();
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == userId);
        if (business == null) return NotFound();
        return Ok(MapToResponse(business));
    }

    [HttpPut("my")]
    [Authorize(Roles = "Business")]
    public async Task<IActionResult> UpdateMyBusiness(CreateBusinessRequest request)
    {
        var userId = GetCurrentUserId();
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == userId);
        if (business == null) return NotFound();

        business.Name = request.Name;
        business.Description = request.Description;
        business.Location = new Point(request.Longitude, request.Latitude) { SRID = 4326 };

        await _context.SaveChangesAsync();
        return Ok(MapToResponse(business));
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var business = await _context.Businesses.FindAsync(id);
        if (business == null) return NotFound();
        return Ok(MapToResponse(business));
    }

    private static BusinessResponse MapToResponse(Business b)
    {
        return new BusinessResponse
        {
            Id = b.Id,
            Name = b.Name,
            Description = b.Description,
            Latitude = b.Location.Y,
            Longitude = b.Location.X,
            IsActive = b.IsActive,
            CreatedAt = b.CreatedAt
        };
    }
}
