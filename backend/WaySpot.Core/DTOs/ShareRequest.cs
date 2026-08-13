using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class ShareRequest
{
    [Required]
    public string ContentType { get; set; } = string.Empty;

    [Required]
    public Guid ContentId { get; set; }

    [Required]
    public string Platform { get; set; } = string.Empty;
}
