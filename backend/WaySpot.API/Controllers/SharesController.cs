using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaySpot.Core.DTOs;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/shares")]
[Authorize]
public class SharesController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public SharesController(WaySpotDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateShare([FromBody] ShareRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier)!);

        var share = new WaySpot.Core.Entities.Share
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ContentType = request.ContentType,
            ContentId = request.ContentId,
            Platform = request.Platform,
            IpAddress = Request.HttpContext.Connection.RemoteIpAddress?.ToString()
        };

        _context.Shares.Add(share);
        await _context.SaveChangesAsync();

        var response = new ShareResponse
        {
            Id = share.Id,
            UserId = share.UserId,
            ContentType = share.ContentType,
            ContentId = share.ContentId,
            Platform = share.Platform,
            SharedAt = share.SharedAt
        };

        return Ok(response);
    }

    [HttpGet("stats")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetShareStats()
    {
        var stats = await _context.Shares
            .GroupBy(s => s.Platform)
            .Select(g => new
            {
                Platform = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        var total = await _context.Shares.CountAsync();

        return Ok(new
        {
            Total = total,
            ByPlatform = stats
        });
    }
}
