using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class BusinessHourRequest
{
    [Required, Range(0, 6)]
    public int DayOfWeek { get; set; }

    [Required]
    public TimeSpan OpenTime { get; set; }

    [Required]
    public TimeSpan CloseTime { get; set; }

    public bool IsOpen { get; set; } = true;
}
