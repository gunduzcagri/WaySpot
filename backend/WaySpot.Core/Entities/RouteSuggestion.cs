namespace WaySpot.Core.Entities;

public class RouteSuggestion
{
    public Guid Id { get; set; }
    public Guid CollaborationId { get; set; }
    public Guid SuggestedByUserId { get; set; }
    public Guid? BusinessId { get; set; }
    public string StopName { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public decimal KmAlongRoute { get; set; } = 0;
    public string? Note { get; set; }
    
    // Status: "Pending" | "Accepted" | "Rejected"
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public RouteCollaboration Collaboration { get; set; } = null!;
    public AppUser SuggestedByUser { get; set; } = null!;
    public Business? Business { get; set; }
}
