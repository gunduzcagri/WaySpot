using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class GoogleAuthRequest
{
    [Required]
    public string IdToken { get; set; } = string.Empty;
}
