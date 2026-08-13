using WaySpot.Core.Enums;

namespace WaySpot.Core.DTOs;

public class AdminUserListResponse
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfileImage { get; set; }
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool HasBusiness { get; set; }
    public int TotalReviews { get; set; }
    public int TotalSavedRoutes { get; set; }
}
