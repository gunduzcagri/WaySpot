using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WaySpot.Core.Interfaces;
using WaySpot.Core.Models;

namespace WaySpot.Infrastructure.Services;

public class BruteForceProtectionService : IBruteForceProtectionService
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<BruteForceProtectionService> _logger;
    private readonly SecuritySettings _settings;

    public BruteForceProtectionService(
        IMemoryCache cache,
        ILogger<BruteForceProtectionService> logger,
        IOptions<SecuritySettings> settings)
    {
        _cache = cache;
        _logger = logger;
        _settings = settings.Value;
    }

    public Task<bool> IsBlockedAsync(string ip)
    {
        if (!_settings.EnableBruteForceProtection)
            return Task.FromResult(false);

        var cacheKey = $"bruteforce:{ip}";
        
        if (_cache.TryGetValue(cacheKey, out int attempts) && attempts >= _settings.MaxFailedLoginAttempts)
        {
            _logger.LogWarning("Brute force detected for IP {Ip}. Attempts: {Attempts}", ip, attempts);
            return Task.FromResult(true);
        }

        return Task.FromResult(false);
    }

    public Task RecordFailedLoginAsync(string ip)
    {
        if (!_settings.EnableBruteForceProtection)
            return Task.CompletedTask;

        var cacheKey = $"bruteforce:{ip}";
        
        var attempts = _cache.TryGetValue(cacheKey, out int existingAttempts) ? existingAttempts + 1 : 1;

        _cache.Set(
            cacheKey,
            attempts,
            new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(_settings.LockoutMinutes)
            });

        _logger.LogWarning("Failed login attempt {Attempts}/{Max} for IP {Ip}",
            attempts, _settings.MaxFailedLoginAttempts, ip);

        return Task.CompletedTask;
    }

    public Task ResetFailedLoginAsync(string ip)
    {
        if (!_settings.EnableBruteForceProtection)
            return Task.CompletedTask;

        var cacheKey = $"bruteforce:{ip}";
        _cache.Remove(cacheKey);

        return Task.CompletedTask;
    }
}
