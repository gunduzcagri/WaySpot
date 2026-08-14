namespace WaySpot.Core.DTOs;

public class FeedRequestDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string Filter { get; set; } = "popular"; // popular, nearby, category
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public double? MaxDistanceKm { get; set; } = 10;
    public string? Category { get; set; }
    public bool? IsOpenNow { get; set; }
    public double? MinRating { get; set; }
}
