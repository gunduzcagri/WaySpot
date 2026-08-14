namespace WaySpot.Core.DTOs;

public class PostResponse
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public double TargetRadiusKm { get; set; }
    public DateTime CreatedAt { get; set; }
    public BusinessResponse Business { get; set; } = null!;
    public UserResponse? User { get; set; }
}
