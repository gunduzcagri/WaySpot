using WaySpot.Core.Enums;

namespace WaySpot.Core.DTOs;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfileImage { get; set; }
    public UserRole Role { get; set; }
    public DateTime ExpiresAt { get; set; }
}
