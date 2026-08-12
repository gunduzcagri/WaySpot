using WaySpot.Core.Enums;

namespace WaySpot.Core.Entities;

public class AppUser
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Business? Business { get; set; }
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<SavedRoute> SavedRoutes { get; set; } = new List<SavedRoute>();
}
