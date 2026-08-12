using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class CreatePostRequest
{
    [Required, MinLength(5), MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    [Range(1, 150)]
    public double TargetRadiusKm { get; set; } = 20.0;
}
