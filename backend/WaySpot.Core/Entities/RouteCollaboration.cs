namespace WaySpot.Core.Entities;

public class RouteCollaboration
{
    public Guid Id { get; set; }
    public Guid RouteId { get; set; }
    public Guid SenderUserId { get; set; }
    public Guid RecipientUserId { get; set; }
    
    // Type: "FriendApproval" (Arkadaş onay/tavsiye akışı) | "BusinessBroadcast" (Firma takipçilere rota yayını)
    public string Type { get; set; } = "FriendApproval";

    // Status: "Pending" | "ReviewedWithSuggestions" | "Approved" | "Rejected" | "Completed"
    public string Status { get; set; } = "Pending";

    public string? SenderNote { get; set; }
    public string? ReviewerNote { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Route Route { get; set; } = null!;
    public AppUser SenderUser { get; set; } = null!;
    public AppUser RecipientUser { get; set; } = null!;
    public ICollection<RouteSuggestion> Suggestions { get; set; } = new List<RouteSuggestion>();
}
