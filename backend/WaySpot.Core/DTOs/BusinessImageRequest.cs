namespace WaySpot.Core.DTOs;

public class BusinessImageRequest
{
    public string ImageUrl { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
}
