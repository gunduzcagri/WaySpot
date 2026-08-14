using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WaySpot.Core.DTOs;
using WaySpot.Core.Entities;
using WaySpot.Core.Interfaces;

namespace WaySpot.Infrastructure.Services;

public class JwtService : IJwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    public AuthResponse GenerateToken(AppUser user)
    {
        var jwtKey = _config["Jwt:Key"] ?? "wayspot_super_secret_key_2024_must_be_at_least_32_chars!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expireDaysStr = _config["Jwt:ExpireDays"];
        var expireDays = int.TryParse(expireDaysStr, out var d) ? d : 7;
        var expires = DateTime.UtcNow.AddDays(expireDays);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "WaySpotAPI",
            audience: _config["Jwt:Audience"] ?? "WaySpotClient",
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return new AuthResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName ?? string.Empty,
            LastName = user.LastName ?? string.Empty,
            ProfileImage = user.ProfileImage,
            Role = user.Role,
            ExpiresAt = expires
        };
    }
}
