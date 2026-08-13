namespace WaySpot.Core.Models;

public class SecuritySettings
{
    public bool EnableSecurityHeaders { get; set; } = true;
    public bool EnableRateLimiting { get; set; } = true;
    public bool EnableBruteForceProtection { get; set; } = true;
    public bool EnableCors { get; set; } = true;
    public bool RequireHttps { get; set; } = true;
    public bool EnableSwagger { get; set; } = false;
    public bool EnableDatabaseSecurity { get; set; } = true;
    public bool EnableAuditLogging { get; set; } = true;
    public bool EnableIpBlocking { get; set; } = true;
    public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
    public int RateLimitMaxRequests { get; set; } = 100;
    public int RateLimitWindowSeconds { get; set; } = 60;
    public int LoginRateLimitMaxRequests { get; set; } = 5;
    public int LoginRateLimitWindowSeconds { get; set; } = 60;
    public int MaxFailedLoginAttempts { get; set; } = 5;
    public int LockoutMinutes { get; set; } = 15;
    public bool EnableJwtBlacklist { get; set; } = true;
    public bool LocalDevBypass { get; set; } = false;
}
