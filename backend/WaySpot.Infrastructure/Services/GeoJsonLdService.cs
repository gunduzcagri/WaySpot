using System.Text.Json;
using WaySpot.Core.DTOs;
using WaySpot.Core.Interfaces;

namespace WaySpot.Infrastructure.Services;

public class GeoJsonLdService : IGeoJsonLdService
{
    public string GenerateLocalBusinessJsonLd(BusinessResponse business)
    {
        var schema = new
        {
            context = "https://schema.org",
            type = "LocalBusiness",
            name = business.Name,
            description = business.Description,
            geo = new
            {
                type = "GeoCoordinates",
                latitude = business.Latitude,
                longitude = business.Longitude
            },
            url = $"https://wayspot.app/business/{business.Id}",
            id = $"https://wayspot.app/business/{business.Id}#business"
        };

        return JsonSerializer.Serialize(schema, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        });
    }
}
