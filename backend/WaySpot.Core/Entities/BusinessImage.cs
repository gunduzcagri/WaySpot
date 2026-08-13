namespace WaySpot.Core.Entities;

public class BusinessImage
{
    public Guid Id { get; set; }
    public Guid BusinessId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public Business Business { get; set; } = null!;
}
