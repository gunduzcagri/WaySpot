namespace WaySpot.Core.Entities;

public class RouteStop
{
    public Guid Id { get; set; }
    public Guid RouteId { get; set; }
    public Guid? BusinessId { get; set; }
    public string StopName { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public int StopOrder { get; set; }
    public TimeSpan? EstimatedArrival { get; set; }
    public int StayDurationMinutes { get; set; } = 0;

    public Route Route { get; set; } = null!;
    public Business? Business { get; set; }
}
