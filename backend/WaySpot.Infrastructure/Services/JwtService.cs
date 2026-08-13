using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using WaySpot.Core.DTOs;
using WaySpot.Core.Entities;
using WaySpot.Core.Interfaces;
using WaySpot.Core.Models;

namespace WaySpot.Infrastructure.Services;

public class JwtService : IJwtService
{
    private readonly IConfiguration _config;
    private readonly SecuritySettings _securitySettings;

    public JwtService(IConfiguration config, IOptions<SecuritySettings> securitySettings)
    {
        _config = config;
        _securitySettings = securitySettings.Value;
    }

    public AuthResponse GenerateToken(AppUser user)
    {
        SigningCredentials creds;
        
        if (_securitySettings.LocalDevBypass)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        }
        else
        {
            if (!File.Exists("jwt-key.pem"))
            {
                var newRsa = RSA.Create();
                File.WriteAllText("jwt-key.pem", newRsa.ExportRSAPrivateKeyPem());
            }
            var rsaKey = RSA.Create();
            rsaKey.ImportFromPem(File.ReadAllText("jwt-key.pem").ToCharArray());
            var key = new RsaSecurityKey(rsaKey);
            creds = new SigningCredentials(key, SecurityAlgorithms.RsaSha256);
        }

        var expireDays = int.Parse(_config["Jwt:ExpireDays"]!);
        var expires = DateTime.UtcNow.AddDays(expireDays);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return new AuthResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfileImage = user.ProfileImage,
            Role = user.Role,
            ExpiresAt = expires
        };
    }
}
