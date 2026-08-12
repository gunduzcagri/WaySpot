using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class CreateReviewRequest
{
    [Required]
    public Guid BusinessId { get; set; }

    [Required, Range(1, 5)]
    public int Rating { get; set; }

    [Required, MinLength(10), MaxLength(2000)]
    public string Comment { get; set; } = string.Empty;

    [Required]
    public string PhotoUrl { get; set; } = string.Empty;
}
