namespace WaySpot.Core.DTOs;

public class AdminDashboardStats
{
    public int TotalUsers { get; set; }
    public int TotalBusinesses { get; set; }
    public int TotalPosts { get; set; }
    public int TotalReviews { get; set; }
    public int PendingReviews { get; set; }
    public int ActiveBusinesses { get; set; }
    public int InactiveBusinesses { get; set; }
    public List<DailyStat> Last7Days { get; set; } = new();
}

public class DailyStat
{
    public DateTime Date { get; set; }
    public int NewUsers { get; set; }
    public int NewReviews { get; set; }
    public int NewPosts { get; set; }
}
