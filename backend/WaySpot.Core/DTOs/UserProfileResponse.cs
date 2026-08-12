namespace WaySpot.Core.DTOs;

public class UserProfileResponse
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int TotalReviews { get; set; }
    public int TotalSavedRoutes { get; set; }
}
