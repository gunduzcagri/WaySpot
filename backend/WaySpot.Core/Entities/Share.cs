namespace WaySpot.Core.Entities;

public class Share
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public Guid ContentId { get; set; }
    public string Platform { get; set; } = string.Empty;
    public DateTime SharedAt { get; set; } = DateTime.UtcNow;
    public string? IpAddress { get; set; }

    public AppUser User { get; set; } = null!;
}
