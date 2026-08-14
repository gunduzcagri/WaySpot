namespace WaySpot.Core.Entities;

public class Review
{
    public Guid Id { get; set; }
    public Guid BusinessId { get; set; }
    public Guid UserId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
    public string[] Images { get; set; } = Array.Empty<string>();
    public int LikeCount { get; set; } = 0;
    public bool IsApproved { get; set; } = false; // Admin onayi gerekli
    public bool IsFlagged { get; set; } = false; // Sikayet edildi
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;


    public Business Business { get; set; } = null!;
    public AppUser User { get; set; } = null!;
}
