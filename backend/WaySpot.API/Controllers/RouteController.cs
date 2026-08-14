using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using WaySpot.Core.Entities;
using WaySpot.Infrastructure.Data;
using System.Linq;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RouteController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public RouteController(WaySpotDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) 
                   ?? User.FindFirstValue("id") 
                   ?? User.FindFirstValue("sub");

        if (Guid.TryParse(idClaim, out var guid))
        {
            return guid;
        }

        // Fallback to first user in DB if testing unauthenticated
        var anyUser = _context.Users.FirstOrDefault();
        return anyUser?.Id ?? Guid.NewGuid();
    }

    [HttpPost("plan")]
    public async Task<IActionResult> PlanRoute([FromBody] RouteRequestDto request)
    {
        var userId = GetCurrentUserId();
        var route = new WaySpot.Core.Entities.Route
        {
            UserId = userId,
            Name = request.Name ?? $"{request.StartLocation} -> {request.EndLocation}",
            StartLocation = request.StartLocation,
            EndLocation = request.EndLocation,
            StartLat = request.StartLat,
            StartLng = request.StartLng,
            EndLat = request.EndLat,
            EndLng = request.EndLng,
            TotalDistanceKm = request.TotalDistanceKm,
            EstimatedDurationMinutes = request.EstimatedDurationMinutes,
            IsSaved = false
        };

        _context.Routes.Add(route);
        await _context.SaveChangesAsync();

        return Ok(route);
    }

    [HttpPost("save-custom-route")]
    public async Task<IActionResult> SaveCustomRoute([FromBody] SaveCustomRouteDto request)
    {
        var userId = GetCurrentUserId();

        var route = new WaySpot.Core.Entities.Route
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = string.IsNullOrWhiteSpace(request.Name) 
                ? $"{request.StartLocation} ➔ {request.EndLocation} Rotası" 
                : request.Name.Trim(),
            StartLocation = request.StartLocation,
            EndLocation = request.EndLocation,
            StartLat = request.StartLat,
            StartLng = request.StartLng,
            EndLat = request.EndLat,
            EndLng = request.EndLng,
            TotalDistanceKm = request.TotalDistanceKm,
            EstimatedDurationMinutes = request.EstimatedDurationMinutes,
            IsSaved = true,
            CreatedAt = DateTime.UtcNow
        };

        int order = 1;
        foreach (var s in request.Stops)
        {
            route.RouteStops.Add(new RouteStop
            {
                Id = Guid.NewGuid(),
                RouteId = route.Id,
                BusinessId = s.BusinessId,
                StopName = s.StopName,
                Latitude = s.Latitude,
                Longitude = s.Longitude,
                StopOrder = s.StopOrder > 0 ? s.StopOrder : order++,
                StayDurationMinutes = s.StayDurationMinutes
            });
        }

        _context.Routes.Add(route);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Güzergah başarıyla hesabınıza kaydedildi.",
            route = new
            {
                route.Id,
                route.Name,
                route.StartLocation,
                route.EndLocation,
                route.StartLat,
                route.StartLng,
                route.EndLat,
                route.EndLng,
                route.TotalDistanceKm,
                route.EstimatedDurationMinutes,
                route.CreatedAt,
                StopCount = route.RouteStops.Count,
                Stops = route.RouteStops.OrderBy(s => s.StopOrder).Select(s => new
                {
                    s.Id,
                    s.BusinessId,
                    s.StopName,
                    s.Latitude,
                    s.Longitude,
                    s.StopOrder
                })
            }
        });
    }

    [HttpGet("my-routes")]
    public async Task<IActionResult> GetMyRoutes()
    {
        var userId = GetCurrentUserId();

        var routes = await _context.Routes
            .Where(r => (r.UserId == userId || userId == Guid.Empty) && r.IsSaved)
            .Include(r => r.RouteStops)
            .ThenInclude(rs => rs.Business)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Name,
                r.StartLocation,
                r.EndLocation,
                r.StartLat,
                r.StartLng,
                r.EndLat,
                r.EndLng,
                r.TotalDistanceKm,
                r.EstimatedDurationMinutes,
                r.CreatedAt,
                StopCount = r.RouteStops.Count,
                Stops = r.RouteStops.OrderBy(s => s.StopOrder).Select(s => new
                {
                    s.Id,
                    s.BusinessId,
                    s.StopName,
                    s.Latitude,
                    s.Longitude,
                    s.StopOrder,
                    BusinessName = s.Business != null ? s.Business.Name : s.StopName,
                    BusinessType = s.Business != null ? s.Business.Type : "Stop",
                    BusinessCoverImage = s.Business != null ? s.Business.CoverImage : null,
                    BusinessRating = s.Business != null ? s.Business.AverageRating : 5.0m,
                    BusinessAddress = s.Business != null ? s.Business.Address : null
                })
            })
            .ToListAsync();

        return Ok(routes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoute(Guid id)
    {
        var route = await _context.Routes
            .Include(r => r.RouteStops)
            .ThenInclude(rs => rs.Business)
            .FirstOrDefaultAsync(r => r.Id == id);
            
        if (route == null) return NotFound();
        return Ok(route);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoute(Guid id)
    {
        var route = await _context.Routes
            .Include(r => r.RouteStops)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (route == null) return NotFound();

        _context.RouteStops.RemoveRange(route.RouteStops);
        _context.Routes.Remove(route);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Rota silindi." });
    }

    [HttpPost("{id}/stops")]
    public async Task<IActionResult> AddStop(Guid id, [FromBody] RouteStopRequestDto request)
    {
        var route = await _context.Routes.FindAsync(id);
        if (route == null) return NotFound();

        var stop = new RouteStop
        {
            RouteId = id,
            BusinessId = request.BusinessId,
            StopName = request.StopName,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            StopOrder = request.StopOrder,
            StayDurationMinutes = request.StayDurationMinutes
        };

        _context.RouteStops.Add(stop);
        await _context.SaveChangesAsync();

        return Ok(stop);
    }

    [HttpPost("stops-along-route")]
    public async Task<IActionResult> GetStopsAlongRoute([FromBody] RouteStopsQueryDto request)
    {
        if (request.Coordinates == null || request.Coordinates.Count < 2)
        {
            return BadRequest(new { message = "En az 2 rota koordinatı gereklidir." });
        }

        var coords = request.Coordinates;
        var cumDistances = new double[coords.Count];
        cumDistances[0] = 0;
        for (int i = 1; i < coords.Count; i++)
        {
            cumDistances[i] = cumDistances[i - 1] + HaversineDistanceKm(coords[i - 1].Lat, coords[i - 1].Lng, coords[i].Lat, coords[i].Lng);
        }

        var query = _context.Businesses.Where(b => b.IsActive);

        if (!string.IsNullOrEmpty(request.Category) && request.Category != "all")
        {
            query = query.Where(b => b.Type.ToLower() == request.Category.ToLower());
        }

        if (request.MinRating.HasValue && request.MinRating > 0)
        {
            query = query.Where(b => b.AverageRating >= request.MinRating.Value);
        }

        if (!string.IsNullOrEmpty(request.SearchQuery))
        {
            var search = request.SearchQuery.Trim().ToLower();
            query = query.Where(b => b.Name.ToLower().Contains(search) || 
                                     b.Description.ToLower().Contains(search) ||
                                     b.Address.ToLower().Contains(search));
        }

        var allBusinesses = await query
            .Select(b => new
            {
                b.Id,
                b.Name,
                b.Type,
                b.Description,
                Latitude = b.Location.Y,
                Longitude = b.Location.X,
                b.Address,
                b.CoverImage,
                b.AverageRating,
                b.TotalReviews,
                b.Tags,
                b.Phone
            })
            .ToListAsync();

        var maxDeviation = request.MaxDeviationKm > 0 ? request.MaxDeviationKm : 25.0;
        var stops = new List<RouteStopItemDto>();

        foreach (var b in allBusinesses)
        {
            double minDistanceToRoute = double.MaxValue;
            double kmAlongRoute = 0;

            for (int i = 0; i < coords.Count - 1; i++)
            {
                var segStart = coords[i];
                var segEnd = coords[i + 1];
                var (distKm, fraction) = DistanceToSegmentKm(b.Latitude, b.Longitude, segStart.Lat, segStart.Lng, segEnd.Lat, segEnd.Lng);

                if (distKm < minDistanceToRoute)
                {
                    minDistanceToRoute = distKm;
                    var segLen = cumDistances[i + 1] - cumDistances[i];
                    kmAlongRoute = cumDistances[i] + (fraction * segLen);
                }
            }

            if (minDistanceToRoute <= maxDeviation)
            {
                stops.Add(new RouteStopItemDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    Type = b.Type,
                    Description = b.Description,
                    Latitude = b.Latitude,
                    Longitude = b.Longitude,
                    Address = b.Address,
                    CoverImage = b.CoverImage,
                    AverageRating = b.AverageRating,
                    TotalReviews = b.TotalReviews,
                    Tags = b.Tags ?? Array.Empty<string>(),
                    Phone = b.Phone,
                    KmAlongRoute = Math.Round(kmAlongRoute, 1),
                    DistanceToRouteKm = Math.Round(minDistanceToRoute, 2)
                });
            }
        }

        // Sort sequentially along the journey!
        var sortedStops = stops.OrderBy(s => s.KmAlongRoute).ToList();

        return Ok(new
        {
            TotalStops = sortedStops.Count,
            TotalRouteKm = Math.Round(cumDistances[^1], 1),
            Stops = sortedStops
        });
    }

    private static double HaversineDistanceKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371.0;
        var dLat = (lat2 - lat1) * Math.PI / 180.0;
        var dLon = (lon2 - lon1) * Math.PI / 180.0;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180.0) * Math.Cos(lat2 * Math.PI / 180.0) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private static (double DistKm, double Fraction) DistanceToSegmentKm(double pLat, double pLng, double aLat, double aLng, double bLat, double bLng)
    {
        var segLenKm = HaversineDistanceKm(aLat, aLng, bLat, bLng);
        if (segLenKm < 0.001)
        {
            return (HaversineDistanceKm(pLat, pLng, aLat, aLng), 0.0);
        }

        var x = (pLng - aLng) * Math.Cos((aLat + bLat) * Math.PI / 360.0);
        var y = pLat - aLat;
        var dx = (bLng - aLng) * Math.Cos((aLat + bLat) * Math.PI / 360.0);
        var dy = bLat - aLat;

        var dot = x * dx + y * dy;
        var lenSq = dx * dx + dy * dy;
        var t = Math.Clamp(dot / (lenSq > 0 ? lenSq : 1e-9), 0.0, 1.0);

        var projLat = aLat + t * (bLat - aLat);
        var projLng = aLng + t * (bLng - aLng);
        var dist = HaversineDistanceKm(pLat, pLng, projLat, projLng);

        return (dist, t);
    }
}

public class SaveCustomRouteDto
{
    public string? Name { get; set; }
    public string StartLocation { get; set; } = string.Empty;
    public string EndLocation { get; set; } = string.Empty;
    public decimal StartLat { get; set; }
    public decimal StartLng { get; set; }
    public decimal EndLat { get; set; }
    public decimal EndLng { get; set; }
    public decimal TotalDistanceKm { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public List<SaveRouteStopDto> Stops { get; set; } = new();
}

public class SaveRouteStopDto
{
    public Guid? BusinessId { get; set; }
    public string StopName { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public int StopOrder { get; set; }
    public double KmAlongRoute { get; set; }
    public int StayDurationMinutes { get; set; }
}

public class RouteStopsQueryDto
{
    public List<RoutePointDto> Coordinates { get; set; } = new();
    public double MaxDeviationKm { get; set; } = 25.0;
    public string? Category { get; set; }
    public decimal? MinRating { get; set; }
    public string? SearchQuery { get; set; }
}

public class RoutePointDto
{
    public double Lat { get; set; }
    public double Lng { get; set; }
}

public class RouteStopItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? CoverImage { get; set; }
    public decimal AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public string[] Tags { get; set; } = Array.Empty<string>();
    public string? Phone { get; set; }
    public double KmAlongRoute { get; set; }
    public double DistanceToRouteKm { get; set; }
}

public class RouteRequestDto
{
    public string? Name { get; set; }
    public string StartLocation { get; set; } = string.Empty;
    public string EndLocation { get; set; } = string.Empty;
    public decimal StartLat { get; set; }
    public decimal StartLng { get; set; }
    public decimal EndLat { get; set; }
    public decimal EndLng { get; set; }
    public decimal TotalDistanceKm { get; set; }
    public int EstimatedDurationMinutes { get; set; }
}

public class RouteStopRequestDto
{
    public Guid? BusinessId { get; set; }
    public string StopName { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public int StopOrder { get; set; }
    public int StayDurationMinutes { get; set; }
}
