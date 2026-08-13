namespace WaySpot.Core.Entities;

public class BusinessHour
{
    public Guid Id { get; set; }
    public Guid BusinessId { get; set; }
    public int DayOfWeek { get; set; }
    public TimeSpan OpenTime { get; set; }
    public TimeSpan CloseTime { get; set; }
    public bool IsOpen { get; set; } = true;

    public Business Business { get; set; } = null!;
}
