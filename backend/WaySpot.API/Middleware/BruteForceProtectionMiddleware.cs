using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WaySpot.Core.Interfaces;
using WaySpot.Core.Models;

namespace WaySpot.API.Middleware;

public class BruteForceProtectionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<BruteForceProtectionMiddleware> _logger;
    private readonly IBruteForceProtectionService _bruteForceProtection;
    private readonly SecuritySettings _settings;

    public BruteForceProtectionMiddleware(
        RequestDelegate next,
        ILogger<BruteForceProtectionMiddleware> logger,
        IBruteForceProtectionService bruteForceProtection,
        IOptions<SecuritySettings> settings)
    {
        _next = next;
        _logger = logger;
        _bruteForceProtection = bruteForceProtection;
        _settings = settings.Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!_settings.EnableBruteForceProtection)
        {
            await _next(context);
            return;
        }

        var path = context.Request.Path.Value ?? "/";

        if (path.Contains("/auth/login", StringComparison.OrdinalIgnoreCase))
        {
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var isBlocked = await _bruteForceProtection.IsBlockedAsync(ip);

            if (isBlocked)
            {
                context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"error\":\"Too many failed login attempts. Please try again later.\"}");
                return;
            }
        }

        await _next(context);
    }
}
