namespace WaySpot.Core.Entities;

public class UserFollow
{
    public Guid Id { get; set; }
    public Guid FollowerId { get; set; }
    public Guid FollowingId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AppUser Follower { get; set; } = null!;
    public AppUser Following { get; set; } = null!;
}
