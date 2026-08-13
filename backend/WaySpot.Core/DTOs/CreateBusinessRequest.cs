using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class CreateBusinessRequest
{
    [Required, MinLength(3), MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MinLength(2), MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    [Required, MinLength(10), MaxLength(11)]
    public string TaxNumber { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public double Latitude { get; set; }

    [Required]
    public double Longitude { get; set; }

    [Required, MinLength(10), MaxLength(200)]
    public string Address { get; set; } = string.Empty;

    [Required]
    public string CityId { get; set; } = string.Empty;

    [Required]
    public string DistrictId { get; set; } = string.Empty;

    public string? PostalCode { get; set; }

    [Required, Phone]
    public string Phone { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Url]
    public string? Website { get; set; }

    public string? Instagram { get; set; }

    [Url]
    public string? Facebook { get; set; }

    public string? WhatsApp { get; set; }
}
