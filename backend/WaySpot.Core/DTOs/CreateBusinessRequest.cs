using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class CreateBusinessRequest
{
    [Required, MinLength(2), MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public double Latitude { get; set; }

    [Required]
    public double Longitude { get; set; }
}
