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
[Route("api/saved-routes")]
[Authorize]
public class SavedRoutesController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public SavedRoutesController(WaySpotDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> Create(CreateSavedRouteRequest request)
    {
        var userId = GetCurrentUserId();

        var route = new SavedRoute
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            StartPoint = new Point(request.StartLongitude, request.StartLatitude) { SRID = 4326 },
            EndPoint = new Point(request.EndLongitude, request.EndLatitude) { SRID = 4326 },
            WaypointsJson = request.WaypointsJson,
            TotalDistanceKm = request.TotalDistanceKm
        };

        _context.SavedRoutes.Add(route);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            route.Id,
            route.Name,
            StartLatitude = route.StartPoint.Y,
            StartLongitude = route.StartPoint.X,
            EndLatitude = route.EndPoint.Y,
            EndLongitude = route.EndPoint.X,
            route.TotalDistanceKm,
            route.CreatedAt
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetMyRoutes()
    {
        var userId = GetCurrentUserId();
        var routes = await _context.SavedRoutes
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Name,
                StartLatitude = r.StartPoint.Y,
                StartLongitude = r.StartPoint.X,
                EndLatitude = r.EndPoint.Y,
                EndLongitude = r.EndPoint.X,
                r.WaypointsJson,
                r.TotalDistanceKm,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(routes);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        var route = await _context.SavedRoutes.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
        if (route == null) return NotFound();

        _context.SavedRoutes.Remove(route);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
