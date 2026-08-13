namespace WaySpot.Core.DTOs;

public class AdminBusinessListResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string OwnerEmail { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? CityId { get; set; }
    public string? DistrictId { get; set; }
    public string? PostalCode { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Website { get; set; }
    public string? Instagram { get; set; }
    public string? Facebook { get; set; }
    public string? WhatsApp { get; set; }
    public string? CoverImage { get; set; }
    public string? LogoImage { get; set; }
    public bool IsActive { get; set; }
    public bool IsVerified { get; set; }
    public int PostCount { get; set; }
    public int ReviewCount { get; set; }
    public double AverageRating { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
