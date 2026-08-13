using System.Security.Cryptography;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WaySpot.Core.Models;

namespace WaySpot.API.Middleware;

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SecurityHeadersMiddleware> _logger;
    private readonly SecuritySettings _settings;

    public SecurityHeadersMiddleware(
        RequestDelegate next,
        ILogger<SecurityHeadersMiddleware> logger,
        IOptions<SecuritySettings> settings)
    {
        _next = next;
        _logger = logger;
        _settings = settings.Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!_settings.EnableSecurityHeaders)
        {
            await _next(context);
            return;
        }

        var h = context.Response.Headers;
        h.Append("X-Frame-Options", "DENY");
        h.Append("X-Content-Type-Options", "nosniff");
        h.Append("X-XSS-Protection", "0");
        h.Append("Referrer-Policy", "strict-origin-when-cross-origin");
        h.Append("Permissions-Policy", "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()");

        if (_settings.RequireHttps)
        {
            h.Append("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
        }

        var nonce = Convert.ToBase64String(RandomNumberGenerator.GetBytes(16));
        context.Items["CSP-Nonce"] = nonce;

        var csp = $"default-src 'self'; script-src 'self' 'nonce-{nonce}'; style-src 'self' 'nonce-{nonce}'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content;";
        h.Append("Content-Security-Policy", csp);

        await _next(context);
    }
}
