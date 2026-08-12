using WaySpot.Core.DTOs;

namespace WaySpot.Core.Interfaces;

public interface IGeoJsonLdService
{
    string GenerateLocalBusinessJsonLd(BusinessResponse business);
}
