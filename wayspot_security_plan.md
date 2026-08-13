# 🔒 Wayspot Proje — Kapsamlı Güvenlik Geliştirme ve Düzenleme Planı

**Versiyon:** 1.0 | **Tarih:** Ağustos 2026 | **Stack:** .NET Core 9, React 19, PostgreSQL 16
**Standartlar:** OWASP ASVS 4.0 (Level 2+), OWASP API Top 10 2023, GDPR/KVKK

---

## 📋 İçindekiler

1. Stratejik Güvenlik Çerçevesi
2. Katman 1: Altyapı ve Ağ Güvenliği
3. Katman 2: API Güvenliği (.NET Core 9)
4. Katman 3: Veritabanı Güvenliği (PostgreSQL 16)
5. Katman 4: Frontend Güvenliği (React 19)
6. Katman 5: DevOps ve CI/CD Güvenliği
7. Katman 6: Monitoring ve Incident Response
8. Uyumluluk ve Standartlar
9. Uygulama Fazları (4 Fazlı Yol Haritası)
10. Özet: Kritik Kontrol Listesi

---

## 1. Stratejik Güvenlik Çerçevesi

### 1.1 Threat Modeling (STRIDE)

| Tehdit | Açıklama | Önlem |
|--------|----------|-------|
| **S**poofing | Kimlik doğrulama zafiyetleri | RS256 JWT, MFA, session binding |
| **T**ampering | Veri bütünlüğü ihlalleri | TLS 1.3, request signing, audit log |
| **R**epudiation | Log eksikliği | Immutable audit trail, timestamp |
| **I**nformation Disclosure | Yetkisiz veri erişimi | RLS, response shaping, encryption |
| **D**enial of Service | Rate limiting bypass | Edge rate limiting, circuit breaker |
| **E**levation of Privilege | Yetki yükseltme | RBAC, ABAC, deny-by-default |

**Uygulama:** Her sprint başında 30 dakikalık threat modeling session (OWASP Threat Dragon).

### 1.2 Zero Trust Architecture

- **Never trust, always verify** — İç ağdaki servisler bile birbirini doğrulamalı
- **mTLS** servisler arası iletişimde
- **Her istek** token ve yetki kontrolünden geçmeli
- **Micro-segmentation** — DB, API, Frontend ayrı subnet'lerde

### 1.3 Defense in Depth — 5 Katmanlı Savunma

```
KATMAN 1: Altyapı & Ağ (VPC, WAF, TLS, DDoS)
KATMAN 2: API Güvenliği (Auth, AuthZ, Input Validation)
KATMAN 3: Veritabanı (RLS, SSL, Audit, Encryption)
KATMAN 4: Frontend (XSS, CSP, Dependency, CSRF)
KATMAN 5: DevOps (SAST, DAST, Secret Mgmt, Container)
```

---

## 2. Katman 1: Altyapı ve Ağ Güvenliği

### 2.1 Network Segmentation

```yaml
VPC:
  - Public Subnet:  ALB/WAF (80/443)
  - Private Subnet: API Servers (5000)
  - DB Subnet:      PostgreSQL (5432) — SADECE Private Subnet
  - Management:     Bastion Host (22) — IP whitelist
```

**Kurallar:**
- DB subnet'ten internet çıkışı yasak
- API subnet'ten sadece HTTPS outbound (443)
- Bastion host'a sadece ofis IP'lerinden SSH
- Security Group'larda 0.0.0.0/0 yasak

### 2.2 Web Application Firewall (WAF)

- **OWASP Core Rule Set** kullan
- SQLi, XSS, Path Traversal, RCE filtreleri
- **Rate limiting:** IP başına 100 req/dk (login: 10 req/dk)
- **Geo-blocking** gereksiz ülkelerden gelen trafik
- **Bot management:** Headless browser detection, CAPTCHA

### 2.3 TLS/SSL Hardening (nginx.conf)

```nginx
server {
    listen 443 ssl http2;
    ssl_protocols TLSv1.3;
    ssl_ciphers 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:50m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;

    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "0" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    client_max_body_size 10m;
    client_body_timeout 12s;
    client_header_timeout 12s;

    location / {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2.4 DDoS Koruması

| Katman | Çözüm | Detay |
|--------|-------|-------|
| L3/L4 | Cloudflare Pro / AWS Shield | 100Gbps+ mitigation |
| L7 | Rate limiting + Challenge | WAF kuralları |
| Uygulama | Circuit breaker + Queue | Polly, Redis queue |
| Network | SYN cookies, connection tracking | OS level tuning |

**Nginx rate limiting:**
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=login:10m rate=10r/m;

location /api/auth/ { limit_req zone=login burst=5 nodelay; }
location /api/      { limit_req zone=api burst=20 nodelay; }
```

### 2.5 Reverse Proxy ve Load Balancer

- **Nginx** veya **Traefik** kullan
- **Health checks** ile unhealthy instance'ları otomatik çıkar
- **Request size limit:** 10MB (DoS prevention)
- **IP whitelist** admin paneli gibi hassas endpoint'ler için

---

## 3. Katman 2: API Güvenliği (.NET Core 9)

### 3.1 Kimlik Doğrulama (Authentication)

#### 3.1.1 JWT Best Practices (Program.cs)

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;

var builder = WebApplication.CreateBuilder(args);

var rsaKey = RSA.Create();
rsaKey.ImportFromPem(File.ReadAllText("jwt-key.pem").ToCharArray());

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new RsaSecurityKey(rsaKey), // RS256 — HMAC-SHA256 DEGIL
            ClockSkew = TimeSpan.Zero,
            RequireExpirationTime = true,
            RequireSignedTokens = true
        };

        // Token calinsa bile blacklist kontrolu
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var token = context.SecurityToken as JwtSecurityToken;
                var cache = context.HttpContext.RequestServices
                    .GetRequiredService<IDistributedCache>();
                var isRevoked = await cache.GetStringAsync($"revoked:{token.Id}");
                if (!string.IsNullOrEmpty(isRevoked))
                    context.Fail("Token has been revoked.");
            },
            OnAuthenticationFailed = context =>
            {
                context.NoResult();
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                return context.Response.WriteAsync("{"error":"Authentication failed"}");
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("RequireVerified", policy => policy.RequireClaim("email_verified", "true"));
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build(); // Deny-by-default
});
```

#### 3.1.2 Refresh Token Rotation

```csharp
public class AuthService : IAuthService
{
    private readonly AppDbContext _dbContext;
    private readonly IDistributedCache _cache;
    private readonly ILogger<AuthService> _logger;

    public async Task<TokenPair> RefreshTokenAsync(string refreshToken)
    {
        var stored = await _dbContext.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == refreshToken && !r.IsRevoked);

        if (stored == null)
        {
            _logger.LogWarning("Invalid refresh token attempt");
            throw new SecurityException("Invalid refresh token");
        }

        if (stored.ExpiresAt < DateTime.UtcNow)
        {
            _logger.LogWarning("Expired refresh token for user {UserId}", stored.UserId);
            throw new SecurityException("Refresh token expired");
        }

        // Eski token'i revoke et (Rotation)
        stored.IsRevoked = true;
        stored.RevokedAt = DateTime.UtcNow;

        var newAccessToken = GenerateAccessToken(stored.User);
        var newRefreshToken = GenerateSecureRefreshToken();

        await _dbContext.RefreshTokens.AddAsync(new RefreshToken 
        { 
            Token = newRefreshToken,
            TokenHash = HashToken(newRefreshToken),
            UserId = stored.UserId,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            DeviceInfo = stored.DeviceInfo,
            IpAddress = GetClientIp()
        });

        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("Token rotated for user {UserId}", stored.UserId);

        return new TokenPair(newAccessToken, newRefreshToken);
    }

    private string GenerateSecureRefreshToken()
    {
        var randomBytes = new byte[64];
        using (var rng = RandomNumberGenerator.Create())
            rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    private string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        return Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(token)));
    }
}
```

#### 3.1.3 Brute Force Korumasi (AspNetCoreRateLimit)

```csharp
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule { Endpoint = "POST:/api/auth/login", Limit = 5, Period = "1m" },
        new RateLimitRule { Endpoint = "POST:/api/auth/refresh", Limit = 10, Period = "1m" },
        new RateLimitRule { Endpoint = "POST:/api/auth/forgot-password", Limit = 3, Period = "1h" },
        new RateLimitRule { Endpoint = "*", Limit = 100, Period = "1m" }
    };
    options.RealIpHeader = "X-Real-IP";
});

builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();

app.UseIpRateLimiting();
```

#### 3.1.4 Multi-Factor Authentication (MFA)

```csharp
public class MfaService : IMfaService
{
    public string GenerateTotpSecret()
    {
        var key = new byte[20];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(key);
        return Base32Encoding.ToString(key);
    }

    public bool ValidateTotp(string secret, string code)
    {
        var totp = new Totp(Base32Encoding.ToBytes(secret));
        return totp.VerifyTotp(code, out _, new VerificationWindow(1, 1));
    }

    public async Task<bool> ValidateBackupCodeAsync(int userId, string code)
    {
        var hashedCode = HashCode(code);
        var backupCode = await _dbContext.BackupCodes
            .FirstOrDefaultAsync(b => b.UserId == userId && b.CodeHash == hashedCode && !b.IsUsed);
        if (backupCode == null) return false;

        backupCode.IsUsed = true;
        backupCode.UsedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();
        return true;
    }
}
```

### 3.2 Yetkilendirme (Authorization) — OWASP API1 & API5

#### 3.2.1 Object-Level Authorization (BOLA)

```csharp
// KOTU — Herkes her siparisi gorebilir
[HttpGet("orders/{orderId}")]
[Authorize]
public async Task<IActionResult> GetOrder(int orderId) 
{
    var order = await _dbContext.Orders.FindAsync(orderId);
    return Ok(order);
}

// DOGRU — Ownership kontrolu
[HttpGet("orders/{orderId}")]
[Authorize]
public async Task<IActionResult> GetOrder(int orderId)
{
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                           ?? throw new UnauthorizedAccessException());

    var order = await _dbContext.Orders
        .AsNoTracking()
        .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

    if (order == null) 
        return NotFound(new { error = "Order not found" });

    return Ok(_mapper.Map<OrderDto>(order));
}

// Generic BOLA guard
public static class AuthorizationExtensions
{
    public static async Task<bool> OwnsResourceAsync<T>(
        this DbContext db, int resourceId, int userId) where T : class, IOwnedResource
    {
        return await db.Set<T>().AnyAsync(x => x.Id == resourceId && x.UserId == userId);
    }
}

public interface IOwnedResource { int Id { get; } int UserId { get; } }
```

#### 3.2.2 Function-Level Authorization (BFLA)

```csharp
[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    [HttpGet("users")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> ListUsers() { ... }

    [HttpDelete("users/{id}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> DeleteUser(int id) { ... }

    [HttpPost("system/settings")]
    [Authorize(Policy = "RequireSuperAdmin")]
    public async Task<IActionResult> UpdateSystemSettings() { ... }
}
```

### 3.3 Input Validation & Mass Assignment (OWASP API3)

```csharp
// DTO ile whitelist — Sadece izin verilen alanlar
public class UpdateProfileDto
{
    [Required, MaxLength(100)]
    [RegularExpression(@"^[\p{L}\s\-'.]+$", ErrorMessage = "Invalid characters")]
    public string FullName { get; set; }

    [Required, EmailAddress, MaxLength(255)]
    public string Email { get; set; }

    [MaxLength(500)]
    public string Bio { get; set; }

    // IsAdmin, Role, Balance, Id YOK — Mass assignment engeli
}

// FluentValidation
public class UpdateProfileValidator : AbstractValidator<UpdateProfileDto>
{
    public UpdateProfileValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100)
            .Matches(@"^[\p{L}\s\-'.]+$");
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(x => x.Bio).MaximumLength(500)
            .Must(BeSafeHtml).When(x => !string.IsNullOrEmpty(x.Bio));
    }

    private bool BeSafeHtml(string html) => 
        !html.Contains("<script") && !html.Contains("javascript:");
}

// Program.cs
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// Auto-validation pipeline (MediatR)
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (_validators.Any())
        {
            var context = new ValidationContext<TRequest>(request);
            var results = await Task.WhenAll(_validators.Select(v => v.ValidateAsync(context, ct)));
            var failures = results.SelectMany(r => r.Errors).Where(f => f != null).ToList();
            if (failures.Any()) throw new ValidationException(failures);
        }
        return await next();
    }
}
```

### 3.4 Response Shaping (Information Disclosure)

```csharp
public class SecurityMappingProfile : Profile
{
    public SecurityMappingProfile()
    {
        CreateMap<User, UserPublicDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.PublicId))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => MaskEmail(src.Email)))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

        CreateMap<User, UserOwnerDto>()
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email));

        CreateMap<User, UserAdminDto>();
    }

    private string MaskEmail(string email)
    {
        if (string.IsNullOrEmpty(email) || !email.Contains("@")) return "***";
        var parts = email.Split('@');
        var local = parts[0];
        var maskedLocal = local.Length > 2 
            ? $"{local[0]}{new string('*', local.Length - 2)}{local[^1]}" 
            : new string('*', local.Length);
        return $"{maskedLocal}@{parts[1]}";
    }
}

[HttpGet("users/{id}")]
[Authorize]
public async Task<IActionResult> GetUser(int id)
{
    var user = await _dbContext.Users.FindAsync(id);
    if (user == null) return NotFound();

    var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
    if (user.Id == currentUserId) return Ok(_mapper.Map<UserOwnerDto>(user));
    if (User.IsInRole("Admin")) return Ok(_mapper.Map<UserAdminDto>(user));
    return Ok(_mapper.Map<UserPublicDto>(user));
}
```

### 3.5 SSRF Korumasi (OWASP API7)

```csharp
public interface IUrlValidator { bool IsSafeUrl(string url); }

public class UrlValidator : IUrlValidator
{
    private static readonly HashSet<string> AllowedSchemes = new(StringComparer.OrdinalIgnoreCase) { "https" };
    private static readonly HashSet<string> BlockedHosts = new(StringComparer.OrdinalIgnoreCase) 
    { "localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254", "metadata.google.internal" };

    public bool IsSafeUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return false;
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)) return false;
        if (!AllowedSchemes.Contains(uri.Scheme)) return false;

        var host = uri.Host.ToLowerInvariant();
        if (BlockedHosts.Contains(host)) return false;

        if (IPAddress.TryParse(uri.Host, out var ip))
        {
            var b = ip.GetAddressBytes();
            if (b.Length == 4)
            {
                if (b[0] == 10) return false;
                if (b[0] == 172 && b[1] >= 16 && b[1] <= 31) return false;
                if (b[0] == 192 && b[1] == 168) return false;
                if (b[0] == 127) return false;
                if (b[0] == 169 && b[1] == 254) return false;
            }
            if (ip.IsIPv6LinkLocal || ip.IsIPv6SiteLocal || IPAddress.IsLoopback(ip)) return false;
        }

        // DNS rebinding korumasi
        try
        {
            var addresses = Dns.GetHostAddresses(uri.Host);
            foreach (var resolvedIp in addresses)
            {
                if (!IsSafeUrl($"https://{resolvedIp}/")) return false;
            }
        }
        catch { return false; }

        return true;
    }
}
```

### 3.6 Secure Headers Middleware

```csharp
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    public SecurityHeadersMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var h = context.Response.Headers;
        h.Append("X-Frame-Options", "DENY");
        h.Append("X-Content-Type-Options", "nosniff");
        h.Append("X-XSS-Protection", "0");
        h.Append("Referrer-Policy", "strict-origin-when-cross-origin");
        h.Append("Permissions-Policy", "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()");

        var nonce = Convert.ToBase64String(RandomNumberGenerator.GetBytes(16));
        context.Items["CSP-Nonce"] = nonce;

        var csp = $"default-src 'self'; script-src 'self' 'nonce-{nonce}'; style-src 'self' 'nonce-{nonce}'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.wayspot.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content;";
        h.Append("Content-Security-Policy", csp);

        await _next(context);
    }
}

// Program.cs
app.UseMiddleware<SecurityHeadersMiddleware>();
```

### 3.7 Exception Handling & Logging

```csharp
public static class ExceptionHandlerExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app)
    {
        app.UseExceptionHandler(errorApp =>
        {
            errorApp.Run(async context =>
            {
                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/json";

                var error = context.Features.Get<IExceptionHandlerFeature>();
                var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
                var traceId = Activity.Current?.Id ?? context.TraceIdentifier;

                logger.LogError(error.Error, "Unhandled exception at {Path}. TraceId: {TraceId}",
                    context.Request.Path, traceId);

                await context.Response.WriteAsJsonAsync(new 
                { 
                    error = "An unexpected error occurred. Please try again later.",
                    traceId = traceId,
                    supportId = Guid.NewGuid().ToString("N")
                });
            });
        });
        return app;
    }
}

// ASLA YAPMA
// _logger.LogInformation("Password: {Password}", password);
// _logger.LogInformation("Token: {Token}", jwtToken);
```

### 3.8 .NET Core 9 Spesifik Optimizasyonlar

```csharp
// HybridCache — Stampede protection
builder.Services.AddHybridCache(options =>
{
    options.DefaultLocalCacheExpiration = TimeSpan.FromMinutes(1);
    options.DefaultExpiration = TimeSpan.FromMinutes(5);
});

public async Task<UserProfile> GetProfileAsync(int userId, CancellationToken ct)
{
    return await _cache.GetOrCreateAsync(
        $"profile:{userId}",
        async cancel => await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancel),
        new HybridCacheEntryOptions
        {
            LocalCacheExpiration = TimeSpan.FromMinutes(1),
            Expiration = TimeSpan.FromMinutes(5)
        }, ct: ct);
}

// Minimal APIs'de security
app.MapPost("/api/orders", async (CreateOrderRequest request, IValidator<CreateOrderRequest> validator, IOrderService service, ClaimsPrincipal user) =>
{
    var validation = await validator.ValidateAsync(request);
    if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());

    var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var order = await service.CreateAsync(userId, request);
    return Results.Created($"/api/orders/{order.Id}", order);
})
.RequireAuthorization()
.AddEndpointFilter<RateLimitFilter>()
.AddEndpointFilter<AuditFilter>();
```

---

## 4. Katman 3: Veritabani Guvenligi (PostgreSQL 16)

### 4.1 Network Hardening

```conf
# postgresql.conf
listen_addresses = '10.0.2.0/24'
port = 5432
max_connections = 200

ssl = on
ssl_min_protocol_version = 'TLSv1.3'
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'
ssl_ca_file = '/etc/ssl/certs/ca.crt'

logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_connections = on
log_disconnections = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_statement = 'ddl'
log_min_duration_statement = 1000
log_checkpoints = on
log_lock_waits = on

shared_preload_libraries = 'pgaudit'
pgaudit.log = 'write, ddl, role'
pgaudit.log_catalog = off
pgaudit.log_parameter = on

max_connections = 200
superuser_reserved_connections = 3
```

```conf
# pg_hba.conf
local   all             postgres                                peer
local   replication     all                                     peer

hostssl all             app_user        10.0.2.0/24             scram-sha-256
hostssl all             readonly_user   10.0.2.0/24             scram-sha-256
hostssl all             migrator        10.0.3.0/24             scram-sha-256
hostssl all             monitor         10.0.4.0/24             scram-sha-256
```

### 4.2 Role Yonetimi

```sql
CREATE ROLE app_user WITH 
    LOGIN PASSWORD '...' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION CONNECTION LIMIT 50;

CREATE ROLE readonly_user WITH 
    LOGIN PASSWORD '...' NOSUPERUSER NOCREATEDB NOCREATEROLE;

GRANT CONNECT ON DATABASE wayspot TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;

GRANT CONNECT ON DATABASE wayspot TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO app_user;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
```

### 4.3 Row Level Security (RLS)

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

ALTER TABLE orders FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON orders
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::int)
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::int);

CREATE POLICY user_order_policy ON orders
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id')::int);

CREATE POLICY admin_all_policy ON orders
    FOR ALL TO admin_role USING (true);
```

### 4.4 Audit ve Loglama

```sql
CREATE EXTENSION IF NOT EXISTS pgaudit;

CREATE TABLE audit.data_changes (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by INT NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION audit.data_change_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit.data_changes (table_name, operation, old_data, changed_by)
        VALUES (TG_TABLE_NAME, 'DELETE', row_to_json(OLD), current_setting('app.current_user_id')::int);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit.data_changes (table_name, operation, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_setting('app.current_user_id')::int);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit.data_changes (table_name, operation, new_data, changed_by)
        VALUES (TG_TABLE_NAME, 'INSERT', row_to_json(NEW), current_setting('app.current_user_id')::int);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER orders_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION audit.data_change_trigger();
```

### 4.5 Veri Sifreleme

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE users ADD COLUMN ssn_encrypted bytea;
ALTER TABLE users ADD COLUMN phone_encrypted bytea;

INSERT INTO users (email, ssn_encrypted) 
VALUES ('user@example.com', pgp_sym_encrypt('12345678901', current_setting('app.encryption_key')));

SELECT email, pgp_sym_decrypt(ssn_encrypted, current_setting('app.encryption_key')) as ssn 
FROM users WHERE id = 1;
```

### 4.6 Connection Pooling (PgBouncer)

```ini
[databases]
wayspot = host=localhost port=5432 dbname=wayspot pool_size=20

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
reserve_pool_size = 5
reserve_pool_timeout = 3
server_idle_timeout = 600
server_lifetime = 3600
server_connect_timeout = 15
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
admin_users = pgbouncer_admin
stats_users = pgbouncer_stats
log_connections = 1
log_disconnections = 1
log_pooler_errors = 1
stats_period = 60
```
---

## 5. Katman 4: Frontend Guvenligi (React 19)

### 5.1 XSS Korumasi

```tsx
// KESINLIKLE YASAK
function DangerousComponent({ html }: { html: string }) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />; 
}

// DOMPurify ile sanitize
import DOMPurify from 'dompurify';

function SafeHtml({ html }: { html: string }) {
    const clean = DOMPurify.sanitize(html, { 
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
        FORBID_ATTR: ['style', 'onerror', 'onload'],
        SANITIZE_DOM: true
    });
    return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// React zaten escape ediyor — bu guvenli
function SafeComponent({ userInput }: { userInput: string }) {
    return <div>{userInput}</div>;
}

// URL validasyonu
function SafeLink({ url, children }: { url: string; children: React.ReactNode }) {
    const allowedSchemes = ['http:', 'https:', 'mailto:'];
    try {
        const parsed = new URL(url);
        if (!allowedSchemes.includes(parsed.protocol)) {
            return <span className="error">Invalid link</span>;
        }
        return <a href={url} target="_blank" rel="noopener noreferrer">{children}</a>;
    } catch {
        return <span className="error">Invalid link</span>;
    }
}
```

### 5.2 CSP ve Nonce Entegrasyonu

```tsx
// index.html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Security-Policy" 
          content="default-src 'self'; script-src 'self' 'nonce-%CSP_NONCE%'; style-src 'self' 'nonce-%CSP_NONCE%';" />
    <script nonce="%CSP_NONCE%">
        window.__CONFIG__ = { apiUrl: '/api' };
    </script>
</head>
</html>

// React'te nonce prop'u
function App() {
    const nonce = document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content');
    return (
        <StyleSheetManager nonce={nonce}>
            <Router><Routes /></Router>
        </StyleSheetManager>
    );
}
```

### 5.3 Guvenli State Yonetimi

```tsx
// localStorage'da token saklama YASAK (XSS riski)
localStorage.setItem('token', jwt); 

// httpOnly, Secure, SameSite cookie
// API'den: Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict; Max-Age=900; Path=/

// Axios ile credentials
const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
});

// Request interceptor — CSRF token
api.interceptors.request.use((config) => {
    const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf-token='))
        ?.split('=')[1];
    if (csrfToken) config.headers['X-CSRF-Token'] = csrfToken;
    return config;
}, (error) => Promise.reject(error));

// Response interceptor — token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await api.post('/auth/refresh');
                return api(originalRequest);
            } catch {
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);
```

### 5.4 Dependency Guvenligi

```bash
# CI/CD pipeline'da
npm audit --audit-level=moderate
npx audit-ci --moderate

# Snyk entegrasyonu
npx snyk test --severity-threshold=high
npx snyk monitor --project-name=wayspot-frontend

# SBOM olusturma
npm sbom --format=spdx-json > sbom.json

# Package lock integrity
npm ci --audit
```

### 5.5 CORS ve CSRF

```tsx
// CORS whitelist — wildcard YASAK
const allowedOrigins = [
    'https://app.wayspot.com',
    'https://admin.wayspot.com',
    'https://wayspot.com'
];

// Fetch'te credentials include
fetch('/api/data', {
    method: 'POST',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify(data)
});

// .NET CORS config
builder.Services.AddCors(options =>
{
    options.AddPolicy("WayspotCors", policy =>
    {
        policy.WithOrigins("https://app.wayspot.com", "https://admin.wayspot.com")
            .WithMethods("GET", "POST", "PUT", "DELETE", "PATCH")
            .WithHeaders("Content-Type", "Authorization", "X-CSRF-Token")
            .AllowCredentials()
            .SetPreflightMaxAge(TimeSpan.FromHours(1));
    });
});
```

### 5.6 Subresource Integrity (SRI)

```html
<script src="https://cdn.example.com/lib.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

### 5.7 React 19 Spesifik Guvenlik

```tsx
// Server Components'da sensitive data leak onlemi
// Hassas veriyi client prop olarak gonderme
export default async function Dashboard() {
    const user = await getUser();
    return <ClientComponent user={user} />; // KOTU — tum user objesi client'a gider
}

// Sadece gerekli alanlari gonder
export default async function Dashboard() {
    const user = await getUser();
    return <ClientComponent name={user.name} email={user.email} />;
}

// Server Actions'da authorization
'use server';

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');

    const userId = session.user.id;
    const data = Object.fromEntries(formData);
    const validated = profileSchema.parse(data);
    await db.updateUser(userId, validated);
    revalidatePath('/profile');
}
```

---

## 6. Katman 5: DevOps ve CI/CD Guvenligi

### 6.1 Pipeline Guvenlik Kapilari (GitHub Actions)

```yaml
# .github/workflows/security.yml
name: Security Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * 1'

jobs:
  sast:
    name: Static Application Security Testing
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: '9.0.x' }
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        with:
          args: >
            -Dsonar.projectKey=wayspot
            -Dsonar.qualitygate.wait=true
      - name: Security Code Scan
        run: |
          dotnet tool install --global security-scan
          security-scan Wayspot.sln --excl-proj=**/*Tests*/**

  sca:
    name: Software Composition Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Snyk Test (Backend)
        uses: snyk/actions/dotnet@master
        with:
          args: --severity-threshold=high --file=Wayspot.sln
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      - name: Snyk Test (Frontend)
        uses: snyk/actions/node@master
        with:
          args: --severity-threshold=high --file=package-lock.json
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  secret-scan:
    name: Secret Detection
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - name: GitLeaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}
      - name: TruffleHog
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
          extra_args: --debug --only-verified

  container-scan:
    name: Container Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build API image
        run: docker build -t wayspot-api:${{ github.sha }} -f Dockerfile.api .
      - name: Build Frontend image
        run: docker build -t wayspot-web:${{ github.sha }} -f Dockerfile.web .
      - name: Trivy Scan API
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: wayspot-api:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-api-results.sarif'
          severity: 'HIGH,CRITICAL'
      - name: Trivy Scan Frontend
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: wayspot-web:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-web-results.sarif'
          severity: 'HIGH,CRITICAL'

  dast:
    name: Dynamic Application Security Testing
    runs-on: ubuntu-latest
    needs: [deploy-staging]
    steps:
      - name: ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.12.0
        with:
          target: 'https://staging.wayspot.com'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'
      - name: ZAP Full Scan
        uses: zaproxy/action-full-scan@v0.10.0
        with:
          target: 'https://staging.wayspot.com'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a -j'
```

### 6.2 Dockerfile Hardening

```dockerfile
# .NET API Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS base

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN apk add --no-cache ca-certificates

WORKDIR /app
RUN mkdir -p /tmp && chmod 1777 /tmp

COPY --chown=appuser:appgroup ./publish .

USER appuser

ENV ASPNETCORE_URLS=http://+:5000
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV DOTNET_EnableDiagnostics=0
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

ENTRYPOINT ["dotnet", "Wayspot.Api.dll"]

# React Frontend Dockerfile
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine AS production

RUN addgroup -S nginxgroup && adduser -S nginxuser -G nginxgroup

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

RUN echo 'server_tokens off;' >> /etc/nginx/conf.d/security.conf

USER nginxuser
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1
```

### 6.3 Secret Management

```csharp
// Azure Key Vault
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{builder.Configuration["KeyVault:Name"]}.vault.azure.net/"),
    new DefaultAzureCredential(new DefaultAzureCredentialOptions
    {
        ManagedIdentityClientId = builder.Configuration["KeyVault:ClientId"]
    }));

// HashiCorp Vault
builder.Services.AddVault(options =>
{
    options.Address = "https://vault.internal:8200";
    options.Role = "wayspot-api";
    options.MountPath = "database";
    options.AuthMethod = VaultAuthMethod.Kubernetes;
});

// AWS Secrets Manager
builder.Configuration.AddSecretsManager(
    configurator: options =>
    {
        options.SecretFilter = entry => entry.Name.StartsWith("wayspot/");
        options.KeyGenerator = (entry, key) => key.Replace("wayspot/", "").Replace("/", ":");
    });
```

```bash
# Git pre-commit hook
#!/bin/sh
gitleaks protect --staged --verbose
if [ $? -ne 0 ]; then
    echo "Potential secrets detected in staged files!"
    exit 1
fi
```

### 6.4 Infrastructure as Code Security

```hcl
# Terraform — S3 bucket public access block
resource "aws_s3_bucket_public_access_block" "wayspot_assets" {
  bucket = aws_s3_bucket.assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Security group — least privilege
resource "aws_security_group" "api" {
  name_prefix = "wayspot-api-"
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = [aws_subnet.private.cidr_block]
  }
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "wayspot-api-sg" }
}
```

---

## 7. Katman 6: Monitoring ve Incident Response

### 7.1 SIEM ve Loglama (Serilog + ELK)

```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.WithProperty("Application", "Wayspot")
    .Enrich.WithProperty("Environment", builder.Environment.EnvironmentName)
    .Enrich.WithMachineName()
    .Enrich.WithThreadId()
    .Enrich.WithClientIp()
    .WriteTo.Console(new JsonFormatter())
    .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri("http://elasticsearch:9200"))
    {
        AutoRegisterTemplate = true,
        IndexFormat = "wayspot-logs-{0:yyyy.MM.dd}",
        MinimumLogEventLevel = LogEventLevel.Information,
        CustomFormatter = new EcsTextFormatter()
    })
    .WriteTo.Seq("http://seq:5341")
    .CreateLogger();

// Guvenlik audit logger
public class SecurityAuditLogger : ISecurityAuditLogger
{
    private readonly ILogger<SecurityAuditLogger> _logger;

    public void LogAuthSuccess(int userId, string ip, string userAgent)
    {
        _logger.LogInformation("AUTH_SUCCESS: User {UserId} from {IP} using {UserAgent}", 
            userId, ip, userAgent);
    }

    public void LogAuthFailure(string username, string ip, string reason, int attemptCount)
    {
        _logger.LogWarning("AUTH_FAILURE: User {Username} from {IP}: {Reason} (Attempt {AttemptCount})", 
            MaskUsername(username), ip, reason, attemptCount);
    }

    public void LogAccessDenied(int userId, string resource, string action, string ip)
    {
        _logger.LogWarning("ACCESS_DENIED: User {UserId} attempted {Action} on {Resource} from {IP}", 
            userId, action, resource, ip);
    }

    public void LogDataExport(int userId, string dataType, int recordCount, string ip)
    {
        _logger.LogInformation("DATA_EXPORT: User {UserId} exported {RecordCount} {DataType} records from {IP}",
            userId, recordCount, dataType, ip);
    }

    public void LogPermissionChange(int adminId, int targetUserId, string oldRole, string newRole)
    {
        _logger.LogInformation("PERMISSION_CHANGE: Admin {AdminId} changed User {TargetUserId} from {OldRole} to {NewRole}",
            adminId, targetUserId, oldRole, newRole);
    }

    public void LogSuspiciousActivity(string activity, string details, string ip, int? userId = null)
    {
        _logger.LogError("SUSPICIOUS_ACTIVITY: {Activity} - {Details} from {IP} (User: {UserId})",
            activity, details, ip, userId?.ToString() ?? "anonymous");
    }

    private string MaskUsername(string username)
    {
        if (string.IsNullOrEmpty(username) || username.Length <= 2) return "**";
        return $"{username[0]}{new string('*', username.Length - 2)}{username[^1]}";
    }
}
```

### 7.2 Anomaly Detection Kurallari

| Event | Threshold | Action | Severity |
|-------|-----------|--------|----------|
| Failed login | 5 dakikada 5+ | IP block 1 saat | Medium |
| Failed login | 1 saatte 20+ | IP block 24 saat + alert | High |
| 403/404 spike | 1 dakikada 50+ | WAF challenge | Medium |
| DB connection spike | Normalin 2x | Alert + auto-scale | Medium |
| Unusual query time | >5 saniye | Slow query log + alert | Low |
| Token reuse | Same JWT, different IP | Revoke + force re-auth | Critical |
| Admin action outside hours | 22:00-06:00 | Alert + require MFA | High |
| Bulk data access | >1000 records/user | Alert + require approval | High |
| New device login | Unknown device | Email notification + MFA | Medium |
| Geographic anomaly | Farkli ulke <1 saat | Block + email notification | High |

### 7.3 Alerting Kurallari (Prometheus)

```yaml
# prometheus-rules.yml
groups:
  - name: wayspot-security
    rules:
      - alert: HighAuthFailureRate
        expr: rate(auth_failures_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High authentication failure rate detected"
          description: "{{ $value }} auth failures per second"

      - alert: SuspiciousTokenReuse
        expr: increase(token_reuse_detected_total[1h]) > 0
        for: 0m
        labels:
          severity: critical
        annotations:
          summary: "Token reuse detected"
          description: "Same JWT used from different IP addresses"

      - alert: DatabaseConnectionSpike
        expr: pg_stat_activity_count > 150
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connection count"
          description: "{{ $value }} active connections"
```

### 7.4 Incident Response Playbook

#### IR-001: Credential Compromise
1. **Tespit:** SIEM alert'i veya kullanici bildirimi
2. **Containment:** Kullanici token'larini Redis'ten sil, session'lari invalidate et
3. **Eradication:** Sifre reseti zorla, MFA enable et
4. **Recovery:** Yeni token cifti uret, kullaniciyi bilgilendir
5. **Lessons:** Log analizi, brute-force IP'si varsa WAF block

#### IR-002: Data Breach
1. **Tespit:** Unauthorized data access log'u
2. **Containment:** Ilgili DB user'inin yetkilerini dusur
3. **Eradication:** RLS policy'lerini gozden gecir, erisim loglarini incele
4. **Recovery:** Etkilenen kullanicilara bildirim (KVKK 72 saat)
5. **Lessons:** Penetration test planla

#### IR-003: Ransomware/Malware
1. **Tespit:** Anomali detection veya AV alert
2. **Containment:** Etkilenen instance'lari isolate et, network segment'ini kapat
3. **Eradication:** Instance'lari terminate et, temiz image'dan yeniden deploy
4. **Recovery:** Backup'tan restore et (immutable backup)
5. **Lessons:** IOC'leri WAF/AV'e ekle

#### IR-004: DDoS Attack
1. **Tespit:** Traffic spike alert
2. **Containment:** WAF challenge mode, rate limiting agresiflestir
3. **Eradication:** Cloudflare/AWS Shield aktiflestir, origin IP gizle
4. **Recovery:** Normal trafige geri don
5. **Lessons:** Capacity planning gozden gecir

### 7.5 Forensics ve Log Retention

| Log Tipi | Retention | Format | Encryption |
|----------|-----------|--------|------------|
| Application logs | 1 yil | JSON (ECS) | Yes (at rest) |
| Audit logs | 7 yil | JSON (immutable) | Yes (HSM key) |
| Access logs | 2 yil | Apache Combined | Yes |
| DB query logs | 90 gun | PostgreSQL CSV | Yes |
| Security events | 7 yil | CEF/LEEF | Yes (WORM) |
| Container logs | 30 gun | JSON | Yes |

---

## 8. Uyumluluk ve Standartlar

| Standart | Kapsam | Dogrulama | Siklik |
|----------|--------|-----------|--------|
| **OWASP ASVS 4.0** | Tum uygulama | Level 2 hedef, Level 3 kritik moduller | Yillik gap analysis |
| **OWASP API Top 10 2023** | REST API | Her sprint'te API security review | Her sprint |
| **OWASP Top 10 2021** | Tum uygulama | SAST/DAST taramalari | Her deploy |
| **GDPR / KVKK** | Kisisel veri | Veri minimizasyonu, RLS, sifreleme, 72 saat bildirim | Surekli |
| **ISO 27001** | Genel ISMS | Yillik audit, risk degerlendirmesi | Yillik |
| **PCI-DSS** | Eger odeme varsa | Ayri CDE network, ASV taramasi | Dort ayda bir |

### 8.1 KVKK Uyumluluk Kontrol Listesi

- [ ] **Veri minimizasyonu:** Sadece gerekli veriler toplaniyor
- [ ] **Aydinlatma metni:** Kullaniciya veri isleme bilgisi veriliyor
- [ ] **Riza yonetimi:** Opt-in, opt-out mekanizmalari calisiyor
- [ ] **Erisim kontrolu:** RLS ile yetkisiz erisim engelleniyor
- [ ] **Sifreleme:** Veri sifreleme (at rest ve in transit)
- [ ] **Loglama:** Veri erisim loglari 7 yil saklaniyor
- [ ] **Ihlal bildirimi:** 72 saat icinde KVKK'ya ve ilgili kisilere bildirim
- [ ] **Veri silme:** Kullanici talebi uzerine veri silme (right to erasure)
- [ ] **Veri tasima:** Kullanici verisini disa aktarma (data portability)

---

## 9. Uygulama Fazlari (4 Fazli Yol Haritasi)

### Faz 1: Foundation (Hafta 1-4) — "Kapilari Kilitle"

**Hedef:** Temel guvenlik kontrollerini aktif hale getirmek.

- [ ] TLS 1.3 + HSTS aktif
- [ ] PostgreSQL SSL + pg_hba.conf hardening
- [ ] JWT RS256 + refresh token rotation
- [ ] BOLA kontrolu tum endpoint'lere
- [ ] WAF kurulumu + temel kurallar
- [ ] CI/CD pipeline'a secret scan (GitLeaks)
- [ ] React CSP + DOMPurify entegrasyonu
- [ ] Exception handling middleware
- [ ] Rate limiting (login: 5/dk, genel: 100/dk)
- [ ] Security headers (CSP, HSTS, X-Frame-Options)

**Ciktilar:** WAF dashboard aktif, JWT yapisi guncellenmis, tum endpoint'lerde ownership kontrolu, CI pipeline'da gizli anahtar taramasi.

### Faz 2: Hardening (Hafta 5-8) — "Duvarlari Guclendir"

**Hedef:** Derinlemesine guvenlik katmanlari eklemek.

- [ ] RLS tum tenant tablolarina
- [ ] Rate limiting + brute force korumasi (agresif)
- [ ] pgaudit + centralized logging (ELK/Seq)
- [ ] SAST (SonarQube) + DAST (ZAP) pipeline'a
- [ ] Container non-root + read-only FS
- [ ] Input validation (FluentValidation) tum DTO'lara
- [ ] API inventory + versioning stratejisi
- [ ] MFA entegrasyonu (TOTP)
- [ ] Backup encryption (pgBackRest)
- [ ] Dependency monitoring (Snyk/Dependabot)

**Ciktilar:** RLS aktif tum tablolarda, audit loglar merkezi SIEM'e akiyor, her PR'da otomatik guvenlik taramasi, container'lar hardened.

### Faz 3: Monitoring (Hafta 9-12) — "Gozlem Kulesi"

**Hedef:** Surekli gozlem ve olay mudahale yetenegi.

- [ ] SIEM entegrasyonu + anomaly detection
- [ ] Real-time failed login alerting
- [ ] API abuse detection kurallari
- [ ] Health check + readiness probe
- [ ] Incident response playbook'lari
- [ ] Quarterly penetration test plani
- [ ] Geographic anomaly detection
- [ ] Device fingerprinting
- [ ] Session anomaly detection
- [ ] Automated threat response (SOAR)

**Ciktilar:** 7/24 guvenlik monitoring, otomatik IP block/allow mekanizmalari, incident response egitimi tamamlanmis, penetration test sonuclari ve remediation.

### Faz 4: Continuous (Surekli) — "Surekli Iyilestirme"

**Hedef:** Guvenligi kultur haline getirmek.

- [ ] Aylik guvenlik patch cycle
- [ ] Quarterly role privilege review
- [ ] Yillik red team exercise
- [ ] Bug bounty programi degerlendirmesi
- [ ] Security champion programi (takim basina 1 kisi)
- [ ] OWASP ASVS gap analysis (yillik)
- [ ] Tabletop exercise (6 ayda bir)
- [ ] Secure coding training (yillik)
- [ ] Third-party security assessment (yillik)
- [ ] Disaster recovery drill (6 ayda bir)

**Ciktilar:** Guvenlik kulturu yerlesmis, surekli iyilestirme dongusu aktif, proaktif tehdit avciligi (threat hunting) baslamis.

---

## 10. Ozet: Kritik Kontrol Listesi

### API (.NET Core)
- [ ] Tum endpoint'ler [Authorize] ile baslar (deny-by-default)
- [ ] JWT: RS256, 15dk expiry, refresh rotation, blacklist kontrolu
- [ ] Her FindAsync/FirstOrDefault sonrasi ownership kontrolu
- [ ] User.FindFirst kullan, route'dan userId alma
- [ ] Mass assignment engeli — DTO whitelist
- [ ] Rate limiting: Login 5/dk, Genel 100/dk
- [ ] Exception middleware: Stack trace yok, traceId var
- [ ] Security headers: CSP, HSTS, X-Frame-Options

### Veritabani (PostgreSQL)
- [ ] hostssl + scram-sha-256 zorunlu
- [ ] listen_addresses sadece app subnet
- [ ] Superuser sadece DBA, app_user least privilege
- [ ] RLS aktif multi-tenant tablolarda
- [ ] pgaudit + DDL logging aktif
- [ ] Backup encryption (pgBackRest)
- [ ] Connection pooling (PgBouncer)

### Frontend (React)
- [ ] dangerouslySetInnerHTML yasak (veya DOMPurify)
- [ ] Token httpOnly cookie'de, localStorage'da degil
- [ ] withCredentials: true API cagrilarinda
- [ ] npm audit CI pipeline'da
- [ ] CSP nonce ile inline script'ler

### DevOps
- [ ] Secret manager (Vault/Key Vault) — hardcoded secret yok
- [ ] SAST + SCA + Secret scan + Container scan CI'da
- [ ] Non-root container, read-only FS
- [ ] Image signing (Cosign)
- [ ] Infrastructure as Code scan (Checkov)

---

**Hazirlayan:** Kimi AI Security Consultant  
**Son Guncelleme:** Agustos 2026  
**Sonraki Revizyon:** Her 3 ayda bir veya major degisiklik sonrasi
