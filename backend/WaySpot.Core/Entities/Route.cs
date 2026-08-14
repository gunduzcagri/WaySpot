using NetTopologySuite.Geometries;

namespace WaySpot.Core.Entities;

public class Route
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string StartLocation { get; set; } = string.Empty;
    public string EndLocation { get; set; } = string.Empty;
    public decimal StartLat { get; set; }
    public decimal StartLng { get; set; }
    public decimal EndLat { get; set; }
    public decimal EndLng { get; set; }
    public decimal TotalDistanceKm { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public LineString? RouteGeometry { get; set; }
    public bool IsSaved { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AppUser User { get; set; } = null!;
    public ICollection<RouteStop> RouteStops { get; set; } = new List<RouteStop>();
}
