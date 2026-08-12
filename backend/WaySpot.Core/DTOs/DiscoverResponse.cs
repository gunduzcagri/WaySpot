namespace WaySpot.Core.DTOs;

public class DiscoverResponse
{
    public List<PostResponse> Posts { get; set; } = new();
    public double AppliedRadiusKm { get; set; }
    public int TotalCount { get; set; }
    public string Message { get; set; } = string.Empty;
}
