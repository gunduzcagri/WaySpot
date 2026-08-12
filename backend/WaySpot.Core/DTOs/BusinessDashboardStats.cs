namespace WaySpot.Core.DTOs;

public class BusinessDashboardStats
{
    public int TotalPosts { get; set; }
    public int ActivePosts { get; set; }
    public int TotalReviews { get; set; }
    public double AverageRating { get; set; }
    public int TotalViews { get; set; }
    public List<PostPerformance> PostPerformances { get; set; } = new();
    public List<RatingDistribution> RatingDistribution { get; set; } = new();
    public List<RecentReview> RecentReviews { get; set; } = new();
}

public class PostPerformance
{
    public Guid PostId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public double TargetRadiusKm { get; set; }
    public int ViewCount { get; set; }
}

public class RatingDistribution
{
    public int Rating { get; set; }
    public int Count { get; set; }
}

public class RecentReview
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
