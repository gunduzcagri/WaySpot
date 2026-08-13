namespace WaySpot.Core.DTOs;

public class UserProfileResponse
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfileImage { get; set; }
    public string? Bio { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Gender { get; set; }
    public string? Phone { get; set; }
    public string? CityId { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TotalReviews { get; set; }
    public int TotalSavedRoutes { get; set; }
}
