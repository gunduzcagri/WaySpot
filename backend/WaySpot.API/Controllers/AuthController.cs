using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaySpot.Core.DTOs;
using WaySpot.Core.Entities;
using WaySpot.Core.Enums;
using WaySpot.Core.Interfaces;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly WaySpotDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IPasswordService _passwordService;

    public AuthController(WaySpotDbContext context, IJwtService jwtService, IPasswordService passwordService)
    {
        _context = context;
        _jwtService = jwtService;
        _passwordService = passwordService;
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
            Role = request.Role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(_jwtService.GenerateToken(user));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
            return Unauthorized(new { message = "E-posta veya sifre hatali." });

        if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "E-posta veya sifre hatali." });

        return Ok(_jwtService.GenerateToken(user));
    }
}
