using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaySpot.Core.DTOs;
using WaySpot.Core.Entities;
using WaySpot.Core.Enums;
using WaySpot.Core.Interfaces;
using WaySpot.Core.Models;
using WaySpot.Infrastructure.Data;
using WaySpot.Infrastructure.Services;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly WaySpotDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IPasswordService _passwordService;
    private readonly IBruteForceProtectionService _bruteForceProtection;

    public AuthController(WaySpotDbContext context, IJwtService jwtService, IPasswordService passwordService, IBruteForceProtectionService bruteForceProtection)
    {
        _context = context;
        _jwtService = jwtService;
        _passwordService = passwordService;
        _bruteForceProtection = bruteForceProtection;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest(new { message = "Bu e-posta adresi zaten kullaniliyor." });

        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            return BadRequest(new { message = "Bu kullanici adi zaten kullaniliyor." });

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email,
            PasswordHash = _passwordService.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = request.Role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var authResponse = _jwtService.GenerateToken(user);
        return Ok(authResponse);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        if (await _bruteForceProtection.IsBlockedAsync(ip))
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, new { message = "Too many failed login attempts. Please try again later." });
        }

        var user = await _context.Users
            .Where(u => u.Email == request.Email)
            .Select(u => new AppUser
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                PasswordHash = u.PasswordHash,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            await _bruteForceProtection.RecordFailedLoginAsync(ip);
            return Unauthorized(new { message = "E-posta veya sifre hatali." });
        }

        if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
        {
            await _bruteForceProtection.RecordFailedLoginAsync(ip);
            return Unauthorized(new { message = "E-posta veya sifre hatali." });
        }

        await _bruteForceProtection.ResetFailedLoginAsync(ip);

        var authResponse = _jwtService.GenerateToken(user);
        return Ok(authResponse);
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthRequest request)
    {
        var payload = await GoogleAuthService.ValidateAsync(request.IdToken);
        if (payload == null)
            return Unauthorized(new { message = "Gecersiz Google token." });

        var email = payload["email"]!.ToString()!;
        var googleId = payload["sub"]!.ToString()!;
        var firstName = payload.GetValueOrDefault("given_name")?.ToString() ?? string.Empty;
        var lastName = payload.GetValueOrDefault("family_name")?.ToString() ?? string.Empty;

        var user = await _context.Users
            .Where(u => u.GoogleId == googleId)
            .Select(u => new AppUser
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                PasswordHash = u.PasswordHash,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            })
            .FirstOrDefaultAsync();
        if (user == null)
        {
            user = await _context.Users
                .Where(u => u.Email == email)
                .Select(u => new AppUser
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    PasswordHash = u.PasswordHash,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();
            if (user == null)
            {
                var username = $"{firstName}{lastName}{Guid.NewGuid().ToString()[..4]}";
                user = new AppUser
                {
                    Id = Guid.NewGuid(),
                    Username = username,
                    Email = email,
                    FirstName = firstName,
                    LastName = lastName,
                    GoogleId = googleId,
                    EmailConfirmed = true,
                    Role = UserRole.User,
                    PasswordHash = _passwordService.HashPassword(Guid.NewGuid().ToString()),
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else
            {
                user.GoogleId = googleId;
                user.EmailConfirmed = true;
                await _context.SaveChangesAsync();
            }
        }

        return Ok(_jwtService.GenerateToken(user));
    }
}
