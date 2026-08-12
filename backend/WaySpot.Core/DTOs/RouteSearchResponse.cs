namespace WaySpot.Core.DTOs;

public class RouteSearchResponse
{
    public List<BusinessAlongRoute> Businesses { get; set; } = new();
    public int TotalCount { get; set; }
    public double SearchBufferKm { get; set; }
}

public class BusinessAlongRoute
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double DistanceFromRouteKm { get; set; }
    public List<PostResponse> ActivePosts { get; set; } = new();
}
