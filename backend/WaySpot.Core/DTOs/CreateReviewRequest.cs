using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class CreateReviewRequest
{
    public Guid? BusinessId { get; set; }

    [Required, Range(1, 5)]
    public int Rating { get; set; }

    [Required]
    public string Comment { get; set; } = string.Empty;

    public string? PhotoUrl { get; set; }
}
