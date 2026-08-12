namespace WaySpot.Core.DTOs;

public class AdminBusinessListResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public bool IsActive { get; set; }
    public int PostCount { get; set; }
    public int ReviewCount { get; set; }
    public double AverageRating { get; set; }
    public DateTime CreatedAt { get; set; }
}
