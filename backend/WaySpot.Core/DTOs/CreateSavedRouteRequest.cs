using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class CreateSavedRouteRequest
{
    [Required, MinLength(2), MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public double StartLatitude { get; set; }

    [Required]
    public double StartLongitude { get; set; }

    [Required]
    public double EndLatitude { get; set; }

    [Required]
    public double EndLongitude { get; set; }

    public string? WaypointsJson { get; set; }

    public double TotalDistanceKm { get; set; }
}
