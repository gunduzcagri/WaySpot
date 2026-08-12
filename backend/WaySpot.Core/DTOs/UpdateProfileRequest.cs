using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class UpdateProfileRequest
{
    [MinLength(3), MaxLength(50)]
    public string? Username { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    [MinLength(6)]
    public string? NewPassword { get; set; }

    [Required]
    public string CurrentPassword { get; set; } = string.Empty;
}
