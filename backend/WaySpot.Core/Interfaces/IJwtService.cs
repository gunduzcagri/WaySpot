using WaySpot.Core.DTOs;
using WaySpot.Core.Entities;

namespace WaySpot.Core.Interfaces;

public interface IJwtService
{
    AuthResponse GenerateToken(AppUser user);
}
