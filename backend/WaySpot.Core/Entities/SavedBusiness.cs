namespace WaySpot.Core.Entities;

public class SavedBusiness
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid BusinessId { get; set; }
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;

    public AppUser User { get; set; } = null!;
    public Business Business { get; set; } = null!;
}
