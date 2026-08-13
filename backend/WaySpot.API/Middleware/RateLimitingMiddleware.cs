using System.Net;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WaySpot.Core.Models;

namespace WaySpot.API.Middleware;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RateLimitingMiddleware> _logger;
    private readonly SecuritySettings _settings;
    private static readonly Dictionary<string, Queue<DateTime>> _requestTimestamps = new();
    private static readonly object _lock = new();

    public RateLimitingMiddleware(
        RequestDelegate next,
        ILogger<RateLimitingMiddleware> logger,
        IOptions<SecuritySettings> settings)
    {
        _next = next;
        _logger = logger;
        _settings = settings.Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!_settings.EnableRateLimiting)
        {
            await _next(context);
            return;
        }

        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var path = context.Request.Path.Value ?? "/";
        var key = $"{ip}:{path}";

        var (maxRequests, windowSeconds) = GetRateLimitForKey(path);

        lock (_lock)
        {
            if (!_requestTimestamps.ContainsKey(key))
            {
                _requestTimestamps[key] = new Queue<DateTime>();
            }

            var timestamps = _requestTimestamps[key];
            var now = DateTime.UtcNow;
            var windowStart = now.AddSeconds(-windowSeconds);

            while (timestamps.Count > 0 && timestamps.Peek() < windowStart)
            {
                timestamps.Dequeue();
            }

            if (timestamps.Count >= maxRequests)
            {
                _logger.LogWarning("Rate limit exceeded for IP {Ip} on path {Path}. Requests: {Count}/{Max}",
                    ip, path, timestamps.Count, maxRequests);

                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = windowSeconds.ToString();
                context.Response.ContentType = "application/json";
                context.Response.WriteAsync("{\"error\":\"Too many requests. Please try again later.\"}");
                return;
            }

            timestamps.Enqueue(now);
        }

        await _next(context);
    }

    private (int maxRequests, int windowSeconds) GetRateLimitForKey(string path)
    {
        if (path.Contains("/auth/login", StringComparison.OrdinalIgnoreCase) ||
            path.Contains("/auth/register", StringComparison.OrdinalIgnoreCase))
        {
            return (_settings.LoginRateLimitMaxRequests, _settings.LoginRateLimitWindowSeconds);
        }

        return (_settings.RateLimitMaxRequests, _settings.RateLimitWindowSeconds);
    }
}
