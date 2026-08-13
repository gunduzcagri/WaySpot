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
            Type = request.Type,
            TaxNumber = request.TaxNumber,
            Description = request.Description,
            Location = new Point(request.Longitude, request.Latitude) { SRID = 4326 },
            Address = request.Address,
            CityId = request.CityId,
            DistrictId = request.DistrictId,
            PostalCode = request.PostalCode,
            Phone = request.Phone,
            Email = request.Email,
            Website = request.Website,
            Instagram = request.Instagram,
            Facebook = request.Facebook,
            WhatsApp = request.WhatsApp,
            IsActive = true,
            IsVerified = false,
            CreatedAt = DateTime.UtcNow
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
        var business = await _context.Businesses
            .Include(b => b.BusinessHours)
            .Include(b => b.BusinessImages)
            .FirstOrDefaultAsync(b => b.UserId == userId);
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
        business.Type = request.Type;
        business.TaxNumber = request.TaxNumber;
        business.Description = request.Description;
        business.Location = new Point(request.Longitude, request.Latitude) { SRID = 4326 };
        business.Address = request.Address;
        business.CityId = request.CityId;
        business.DistrictId = request.DistrictId;
        business.PostalCode = request.PostalCode;
        business.Phone = request.Phone;
        business.Email = request.Email;
        business.Website = request.Website;
        business.Instagram = request.Instagram;
        business.Facebook = request.Facebook;
        business.WhatsApp = request.WhatsApp;
        business.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(MapToResponse(business));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var business = await _context.Businesses
            .Include(b => b.BusinessHours)
            .Include(b => b.BusinessImages)
            .FirstOrDefaultAsync(b => b.Id == id);
        if (business == null) return NotFound();
        return Ok(MapToResponse(business));
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleStatus(Guid id, [FromBody] bool isActive)
    {
        var business = await _context.Businesses.FindAsync(id);
        if (business == null) return NotFound();

        business.IsActive = isActive;
        business.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok(new { message = $"Isletme durumu {(isActive ? "aktif" : "pasif")} yapildi." });
    }

    [HttpGet("{id:guid}/hours")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBusinessHours(Guid id)
    {
        var hours = await _context.BusinessHours
            .Where(h => h.BusinessId == id)
            .OrderBy(h => h.DayOfWeek)
            .ToListAsync();
        return Ok(hours);
    }

    [HttpPost("{id:guid}/hours")]
    [Authorize(Roles = "Business,Admin")]
    public async Task<IActionResult> AddBusinessHour(Guid id, [FromBody] BusinessHourRequest request)
    {
        var business = await _context.Businesses.FindAsync(id);
        if (business == null) return NotFound();

        var hour = new BusinessHour
        {
            Id = Guid.NewGuid(),
            BusinessId = id,
            DayOfWeek = request.DayOfWeek,
            OpenTime = request.OpenTime,
            CloseTime = request.CloseTime,
            IsOpen = request.IsOpen
        };

        _context.BusinessHours.Add(hour);
        await _context.SaveChangesAsync();
        return Ok(hour);
    }

    [HttpPut("hours/{hourId:guid}")]
    [Authorize(Roles = "Business,Admin")]
    public async Task<IActionResult> UpdateBusinessHour(Guid hourId, [FromBody] BusinessHourRequest request)
    {
        var hour = await _context.BusinessHours.FindAsync(hourId);
        if (hour == null) return NotFound();

        hour.DayOfWeek = request.DayOfWeek;
        hour.OpenTime = request.OpenTime;
        hour.CloseTime = request.CloseTime;
        hour.IsOpen = request.IsOpen;

        await _context.SaveChangesAsync();
        return Ok(hour);
    }

    [HttpDelete("hours/{hourId:guid}")]
    [Authorize(Roles = "Business,Admin")]
    public async Task<IActionResult> DeleteBusinessHour(Guid hourId)
    {
        var hour = await _context.BusinessHours.FindAsync(hourId);
        if (hour == null) return NotFound();

        _context.BusinessHours.Remove(hour);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:guid}/images")]
    [Authorize(Roles = "Business,Admin")]
    public async Task<IActionResult> AddBusinessImage(Guid id, [FromBody] BusinessImageRequest request)
    {
        var business = await _context.Businesses.FindAsync(id);
        if (business == null) return NotFound();

        var image = new BusinessImage
        {
            Id = Guid.NewGuid(),
            BusinessId = id,
            ImageUrl = request.ImageUrl,
            AltText = request.AltText,
            IsPrimary = request.IsPrimary,
            DisplayOrder = request.DisplayOrder
        };

        _context.BusinessImages.Add(image);
        await _context.SaveChangesAsync();
        return Ok(image);
    }

    [HttpDelete("images/{imageId:guid}")]
    [Authorize(Roles = "Business,Admin")]
    public async Task<IActionResult> DeleteBusinessImage(Guid imageId)
    {
        var image = await _context.BusinessImages.FindAsync(imageId);
        if (image == null) return NotFound();

        _context.BusinessImages.Remove(image);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static BusinessResponse MapToResponse(Business b)
    {
        return new BusinessResponse
        {
            Id = b.Id,
            Name = b.Name,
            Type = b.Type,
            TaxNumber = b.TaxNumber,
            Description = b.Description,
            Latitude = b.Location.Y,
            Longitude = b.Location.X,
            CityId = b.CityId,
            IsActive = b.IsActive,
            IsVerified = b.IsVerified,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt
        };
    }
}
