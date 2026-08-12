using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class RouteSearchRequest
{
    [Required]
    public List<RoutePoint> Points { get; set; } = new();

    [Range(0.1, 50)]
    public double BufferKm { get; set; } = 5.0;
}

public class RoutePoint
{
    [Range(-90, 90)]
    public double Latitude { get; set; }

    [Range(-180, 180)]
    public double Longitude { get; set; }
}
