using NetTopologySuite.Geometries;

namespace WaySpot.Core.Entities;

public class SavedRoute
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public Point StartPoint { get; set; } = null!;
    public Point EndPoint { get; set; } = null!;
    public string? WaypointsJson { get; set; }
    public double TotalDistanceKm { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AppUser User { get; set; } = null!;
}
