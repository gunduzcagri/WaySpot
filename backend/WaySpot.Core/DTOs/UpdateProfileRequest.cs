using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class UpdateProfileRequest
{
    [MinLength(2), MaxLength(50)]
    public string? FirstName { get; set; }

    [MinLength(2), MaxLength(50)]
    public string? LastName { get; set; }

    [MinLength(3), MaxLength(50)]
    public string? Username { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    [MaxLength(160)]
    public string? Bio { get; set; }

    public DateTime? BirthDate { get; set; }

    public string? Gender { get; set; }

    [Phone]
    public string? Phone { get; set; }

    public string? CityId { get; set; }

    [MinLength(6)]
    public string? NewPassword { get; set; }

    [Required]
    public string CurrentPassword { get; set; } = string.Empty;
}
