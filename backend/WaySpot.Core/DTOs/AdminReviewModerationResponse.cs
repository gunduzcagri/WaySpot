namespace WaySpot.Core.DTOs;

public class AdminReviewModerationResponse
{
    public Guid Id { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Username { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsFlagged { get; set; }
}
