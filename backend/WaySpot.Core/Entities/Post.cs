namespace WaySpot.Core.Entities;

public class Post
{
    public Guid Id { get; set; }
    public Guid BusinessId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public double TargetRadiusKm { get; set; } = 20.0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;

    public Guid UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public Business Business { get; set; } = null!;
}
