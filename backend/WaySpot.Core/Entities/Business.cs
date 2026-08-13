using NetTopologySuite.Geometries;

namespace WaySpot.Core.Entities;

public class Business
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public Point Location { get; set; } = null!;
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
    public bool IsActive { get; set; } = true;
    public bool IsVerified { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public AppUser User { get; set; } = null!;
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<BusinessHour> BusinessHours { get; set; } = new List<BusinessHour>();
    public ICollection<BusinessImage> BusinessImages { get; set; } = new List<BusinessImage>();
}
