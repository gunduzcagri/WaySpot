using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using WaySpot.Core.DTOs;
using WaySpot.Infrastructure.Data;
using System.Linq;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public FeedController(WaySpotDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetFeed([FromQuery] FeedRequestDto request)
    {
        var query = _context.Businesses.Where(b => b.IsActive);

        if (request.Filter == "category" && !string.IsNullOrEmpty(request.Category))
        {
            query = query.Where(b => b.Type == request.Category);
        }

        if (request.MinRating.HasValue)
        {
            query = query.Where(b => b.AverageRating >= (decimal)request.MinRating.Value);
        }

        if (request.Latitude.HasValue && request.Longitude.HasValue)
        {
            var mapCenterPoint = new Point(request.Longitude.Value, request.Latitude.Value) { SRID = 4326 };

            if (request.Filter == "nearby")
            {
                var maxDistanceMeters = (request.MaxDistanceKm ?? 50) * 1000;
                query = query.Where(b => b.Location.Distance(mapCenterPoint) <= maxDistanceMeters)
                             .OrderBy(b => b.Location.Distance(mapCenterPoint));
            }
            else
            {
                // Order primarily by proximity to map center so the feed updates as the map is panned,
                // then by rating
                query = query.OrderBy(b => b.Location.Distance(mapCenterPoint))
                             .ThenByDescending(b => b.AverageRating);
            }
        }
        else
        {
            if (request.Filter == "popular")
            {
                query = query.OrderByDescending(b => b.AverageRating).ThenByDescending(b => b.TotalReviews);
            }
            else
            {
                query = query.OrderByDescending(b => b.CreatedAt);
            }
        }

        var totalItems = await query.CountAsync();
        
        var businesses = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(b => new 
            {
                b.Id,
                b.Name,
                b.Type,
                b.AverageRating,
                b.TotalReviews,
                b.CoverImage,
                Latitude = b.Location.Y,
                Longitude = b.Location.X,
                b.IsActive,
                b.Address,
                b.CityId,
                b.DistrictId,
                b.Tags,
                b.IsFeatured,
                b.TotalLikes,
                b.TotalSaves
            })
            .ToListAsync();

        return Ok(new 
        {
            Data = businesses,
            Total = totalItems,
            Page = request.Page,
            PageSize = request.PageSize,
            HasMore = totalItems > request.Page * request.PageSize
        });
    }
}
