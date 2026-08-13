using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.IdentityModel.Tokens.Jwt;
using WaySpot.API.Middleware;
using WaySpot.Core.Interfaces;
using WaySpot.Core.Models;
using WaySpot.Infrastructure.Data;
using WaySpot.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<WaySpotDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.UseNetTopologySuite()
    ));

builder.Services.AddSingleton(provider =>
    provider.GetRequiredService<IOptions<SecuritySettings>>().Value);

builder.Services.AddMemoryCache();
builder.Services.AddDistributedMemoryCache();

var securitySettings = builder.Configuration.GetSection("Security").Get<SecuritySettings>() ?? new SecuritySettings();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        SecurityKey key;
        if (securitySettings.LocalDevBypass)
        {
            key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!));
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
            key = new RsaSecurityKey(rsaKey);
        }

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = key,
            ClockSkew = TimeSpan.Zero,
            RequireExpirationTime = true,
            RequireSignedTokens = true
        };

        if (securitySettings.EnableJwtBlacklist)
        {
            options.Events = new JwtBearerEvents
            {
                OnTokenValidated = async context =>
                {
                    if (context.SecurityToken is JwtSecurityToken token)
                    {
                        var cache = context.HttpContext.RequestServices.GetRequiredService<IDistributedCache>();
                        var isRevoked = await cache.GetStringAsync($"revoked:{token.Id}");
                        if (!string.IsNullOrEmpty(isRevoked))
                            context.Fail("Token has been revoked.");
                    }
                },
                OnAuthenticationFailed = context =>
                {
                    context.NoResult();
                    context.Response.StatusCode = 401;
                    context.Response.ContentType = "application/json";
                    return context.Response.WriteAsync("{\"error\":\"Authentication failed\"}");
                }
            };
        }
    });

builder.Services.AddAuthorization();

builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IGeoJsonLdService, GeoJsonLdService>();
builder.Services.AddScoped<IBruteForceProtectionService, BruteForceProtectionService>();

if (securitySettings.EnableCors || securitySettings.LocalDevBypass)
{
    var allowedOrigins = securitySettings.AllowedOrigins.Length > 0
        ? securitySettings.AllowedOrigins
        : new[] { "*" };

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("WayspotCors", policy =>
        {
            if (securitySettings.LocalDevBypass || allowedOrigins.Contains("*"))
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            }
            else
            {
                policy.WithOrigins(allowedOrigins)
                      .WithMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                      .WithHeaders("Content-Type", "Authorization")
                      .AllowCredentials();
            }
        });
    });
}

if (securitySettings.EnableRateLimiting)
{
    // MemoryCache already registered above
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

if (securitySettings.EnableSwagger)
{
    builder.Services.AddSwaggerGen();
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    var devSettings = app.Configuration.GetSection("Security").Get<SecuritySettings>() ?? new SecuritySettings();
    if (devSettings.EnableSwagger)
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }
}

if (securitySettings.RequireHttps && !securitySettings.LocalDevBypass)
{
    app.UseHttpsRedirection();
}

if (securitySettings.EnableCors || securitySettings.LocalDevBypass)
{
    app.UseCors("WayspotCors");
}

if (securitySettings.EnableSecurityHeaders && !securitySettings.LocalDevBypass)
{
    app.UseMiddleware<SecurityHeadersMiddleware>();
}

if (securitySettings.EnableRateLimiting && !securitySettings.LocalDevBypass)
{
    app.UseMiddleware<RateLimitingMiddleware>();
}

if (securitySettings.EnableBruteForceProtection && !securitySettings.LocalDevBypass)
{
    app.UseMiddleware<BruteForceProtectionMiddleware>();
}

app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<GlobalExceptionHandler>();
app.MapControllers();

app.Run();
