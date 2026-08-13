namespace WaySpot.Core.DTOs;

public class ShareResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public Guid ContentId { get; set; }
    public string Platform { get; set; } = string.Empty;
    public DateTime SharedAt { get; set; }
}
