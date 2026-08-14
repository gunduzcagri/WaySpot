using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CitiesController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public CitiesController(WaySpotDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}/discover")]
    public async Task<IActionResult> DiscoverCity(string id)
    {
        var businesses = await _context.Businesses
            .Where(b => b.CityId == id && b.IsActive)
            .ToListAsync();

        var popularBusinesses = businesses
            .OrderByDescending(b => b.AverageRating)
            .ThenByDescending(b => b.TotalReviews)
            .Take(10)
            .Select(b => new { b.Id, b.Name, b.AverageRating, b.CoverImage, b.Type })
            .ToList();

        var foodRecommendations = businesses
            .Where(b => b.Type == "Restoran" || b.Type == "Kafe" || b.Type == "Restaurant" || b.Type == "Cafe")
            .OrderByDescending(b => b.AverageRating)
            .Take(5)
            .Select(b => new { b.Id, b.Name, b.AverageRating, b.CoverImage, b.Type })
            .ToList();

        var topCategories = businesses
            .GroupBy(b => b.Type)
            .OrderByDescending(g => g.Count())
            .Take(5)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .ToList();

        return Ok(new
        {
            CityName = id,
            TotalBusinesses = businesses.Count,
            PopularBusinesses = popularBusinesses,
            TopCategories = topCategories,
            FoodRecommendations = foodRecommendations
        });
    }
}
