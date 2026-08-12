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

    public Business Business { get; set; } = null!;
}
