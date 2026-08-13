using WaySpot.Core.Enums;

namespace WaySpot.Core.Entities;

public class AppUser
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfileImage { get; set; }
    public string? Bio { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Gender { get; set; }
    public string? Phone { get; set; }
    public string? CityId { get; set; }
    public string? GoogleId { get; set; }
    public bool EmailConfirmed { get; set; } = false;
    public UserRole Role { get; set; } = UserRole.User;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Business? Business { get; set; }
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<SavedRoute> SavedRoutes { get; set; } = new List<SavedRoute>();
    public ICollection<Share> Shares { get; set; } = new List<Share>();
}
