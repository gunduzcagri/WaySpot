# WaySpot - Geliştirme Blueprint'i ve AI Komut Seti

**Proje Adı:** WaySpot
**Geliştirici:** Çağrı Gündüz
**Platform:** Web (SPA) ve Mobil Uyumlu Uygulama
**Ana Amacı:** Yolcular (kullanıcılar) ve işletmeler (firmalar) arasında konum tabanlı, dinamik yarıçaplı sosyal etkileşim ve güzergah planlaması.

---

## 1. Mimari ve Teknoloji Yığını (Tech Stack)
Yapay zeka (AI) kodlama yaparken **kesinlikle** bu yığını temel almalıdır. Farklı bir teknoloji veya kütüphane teklif etmemelidir.

*   **Backend:** C# .NET Core Web API (MVC mimarisi)
*   **Veritabanı:** PostgreSQL + **PostGIS** eklentisi (Konum ve mesafe hesaplamaları için zorunlu)
*   **Frontend:** React.js
*   **Harita Servisi:** Leaflet.js + OpenStreetMap (OSM) / OSRM (Açık kaynak yönlendirme)
*   **Konteynerleştirme:** Docker & Docker Compose (Ubuntu / CasaOS yerel sunucu uyumlu yapı)
*   **Önbellekleme/Proxy:** Cloudflare Workers (API yanıtları ve resimler için)
*   **Görünürlük:** Generative Engine Optimization (GEO) için yapılandırılmış veri (JSON-LD) entegrasyonu.
*   **Gelecek AI Entegrasyonu:** Model Context Protocol (MCP) uyumlu API uç noktaları tasarımı.

---

## 2. Temel Kurallar (AI İçin Kesin Talimatlar)
1.  **Varsayım Yok:** Tanımlanmayan hiçbir özelliği kendin ekleme.
2.  **Adım Adım İlerleme:** Sana verilen her "Aşama" (Phase) bitmeden ve kullanıcıdan onay almadan diğer aşamaya geçme.
3.  **Hata Yönetimi:** C# tarafında global exception handler (örneğin IExceptionHandler) kullan. Dinamik nesne hatalarını yakala.
4.  **Multi-tenant Yapı:** Kullanıcılar (`AppUser`) ve İşletmeler (`Business`) mantıksal olarak ayrılmalı. İşletmelerin şubeleri/mekanları olabilir.
5.  **Fotoğraf Zorunluluğu:** Yorum ve değerlendirme (Review) oluşturma endpoint'inde `PhotoUrl` null olamaz.

---

# WaySpot - Ultra-Detayli AI Gelistirme Rehberi
## (Prompt-by-Prompt Kodlama Kilavuzu)

**Versiyon:** 2.0 - Atomik Adimlar
**Proje:** WaySpot
**Gelistirici:** Cagri Gunduz
**Format:** Her baslik altindaki blogu, oldugu gibi (tek seferde) AI asistanina yapistir.
**Kural:** AI, bir blogu bitirmeden ve sen onay vermeden sonraki bloga gecmeyecek.

---

## 0. Proje Klasor Yapisi (Tum Asamalar Icin Sabit)

```
wayspot/
├── docker/
│   ├── docker-compose.yml
│   └── init-scripts/
│       └── 01-create-extensions.sql
├── backend/
│   ├── WaySpot.API/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── appsettings.json
│   │   └── Program.cs
│   ├── WaySpot.Core/
│   │   ├── Entities/
│   │   ├── DTOs/
│   │   ├── Enums/
│   │   └── Interfaces/
│   ├── WaySpot.Infrastructure/
│   │   ├── Data/
│   │   │   ├── WaySpotDbContext.cs
│   │   │   ├── Configurations/
│   │   │   └── Migrations/
│   │   ├── Services/
│   │   └── Repositories/
│   └── WaySpot.sln
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.jsx
│   └── vite.config.js
└── cloudflare/
    └── worker.js
```

---

## ASAMA 1: ALTYAPI & VERITABANI

### 1.0 - Kabul Kriteri (On Kosul)
- [ ] Bilgisayarinda Docker ve Docker Compose kurulu.
- [ ] 5432 portu bos.
- [ ] .NET 8 SDK kurulu (`dotnet --version` calisiyor).

---

### 1.1 - Docker Compose (PostgreSQL + PostGIS + pgAdmin)

**Talimat:** Asagidaki dosyalari olustur. Baska hicbir sey ekleme.

**Dosya:** `docker/docker-compose.yml`
```yaml
version: '3.8'

services:
  wayspot-db:
    image: postgis/postgis:16-3.4
    container_name: wayspot_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: wayspot_admin
      POSTGRES_PASSWORD: wayspot_secret_2024
      POSTGRES_DB: wayspot_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - wayspot_network

  wayspot-pgadmin:
    image: dpage/pgadmin4:latest
    container_name: wayspot_pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@wayspot.local
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      - wayspot-db
    networks:
      - wayspot_network

volumes:
  postgres_data:

networks:
  wayspot_network:
    driver: bridge
```

**Dosya:** `docker/init-scripts/01-create-extensions.sql`
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

**Test Adimi:**
```bash
cd docker
docker-compose up -d
docker exec wayspot_postgres psql -U wayspot_admin -d wayspot_db -c "SELECT PostGIS_Version();"
```
**Beklenen Cikti:** `3.4.x` veya ustu versiyon bilgisi.

**Kabul Kriteri:** pgAdmin http://localhost:5050 adresinde aciliyor ve PostGIS aktif.

---

### 1.2 - .NET Solution ve Proje Yapisi

**Talimat:** Asagidaki komutlari sirasiyla calistir. Sadece bu komutlari ver, baska proje ekleme.

```bash
mkdir -p backend && cd backend
dotnet new sln -n WaySpot

# Core Katmani (Entities, DTOs, Interfaces)
dotnet new classlib -n WaySpot.Core

# Infrastructure Katmani (DbContext, Repositories, Services)
dotnet new classlib -n WaySpot.Infrastructure

# API Katmani (Controllers, Middleware)
dotnet new webapi -n WaySpot.API

dotnet sln add WaySpot.Core/WaySpot.Core.csproj
dotnet sln add WaySpot.Infrastructure/WaySpot.Infrastructure.csproj
dotnet sln add WaySpot.API/WaySpot.API.csproj

# Referanslar
cd WaySpot.API && dotnet add reference ../WaySpot.Core/WaySpot.Core.csproj ../WaySpot.Infrastructure/WaySpot.Infrastructure.csproj && cd ..
cd WaySpot.Infrastructure && dotnet add reference ../WaySpot.Core/WaySpot.Core.csproj && cd ..
```

**Kabul Kriteri:** `dotnet build` komutu hatasiz calisiyor.

---

### 1.3 - NuGet Paketleri

**Talimat:** Sadece asagidaki paketleri yukle. Baska paket onerme.

```bash
cd WaySpot.Infrastructure
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.4
dotnet add package NetTopologySuite --version 2.5.0
dotnet add package NetTopologySuite.IO.GeoJSON --version 4.1.0
cd ../WaySpot.API
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.8
dotnet add package Swashbuckle.AspNetCore --version 6.7.3
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.8
cd ..
```

**Kabul Kriteri:** `dotnet restore` hatasiz tamamlaniyor.

---

### 1.4 - Entity Siniflari (Core Katmani)

**Talimat:** Asagidaki dosyalari tam olarak bu isimlerle ve bu property'lerle olustur. Fazla property ekleme.

**Dosya:** `backend/WaySpot.Core/Enums/UserRole.cs`
```csharp
namespace WaySpot.Core.Enums;

public enum UserRole
{
    User = 1,
    Business = 2
}
```

**Dosya:** `backend/WaySpot.Core/Entities/AppUser.cs`
```csharp
using WaySpot.Core.Enums;

namespace WaySpot.Core.Entities;

public class AppUser
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Business? Business { get; set; }
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<SavedRoute> SavedRoutes { get; set; } = new List<SavedRoute>();
}
```

**Dosya:** `backend/WaySpot.Core/Entities/Business.cs`
```csharp
using NetTopologySuite.Geometries;

namespace WaySpot.Core.Entities;

public class Business
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Point Location { get; set; } = null!; // PostGIS Point, 4326
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public AppUser User { get; set; } = null!;
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
```

**Dosya:** `backend/WaySpot.Core/Entities/Post.cs`
```csharp
namespace WaySpot.Core.Entities;

public class Post
{
    public Guid Id { get; set; }
    public Guid BusinessId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public double TargetRadiusKm { get; set; } = 20.0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }

    // Navigation
    public Business Business { get; set; } = null!;
}
```

**Dosya:** `backend/WaySpot.Core/Entities/Review.cs`
```csharp
namespace WaySpot.Core.Entities;

public class Review
{
    public Guid Id { get; set; }
    public Guid BusinessId { get; set; }
    public Guid UserId { get; set; }
    public int Rating { get; set; } // 1-5
    public string Comment { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty; // ZORUNLU
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Business Business { get; set; } = null!;
    public AppUser User { get; set; } = null!;
}
```

**Dosya:** `backend/WaySpot.Core/Entities/SavedRoute.cs`
```csharp
using NetTopologySuite.Geometries;

namespace WaySpot.Core.Entities;

public class SavedRoute
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public Point StartPoint { get; set; } = null!;
    public Point EndPoint { get; set; } = null!;
    public string? WaypointsJson { get; set; }
    public double TotalDistanceKm { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public AppUser User { get; set; } = null!;
}
```

**Kabul Kriteri:** `dotnet build` hatasiz. Entity'lerde fazla property yok.

---

### 1.5 - DbContext ve EF Core Konfigurasyonu

**Talimat:** Asagidaki dosyalari olustur. PostGIS kullanimi icin `UseNetTopologySuite()` cagrisi zorunlu.

**Dosya:** `backend/WaySpot.Infrastructure/Data/WaySpotDbContext.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using WaySpot.Core.Entities;

namespace WaySpot.Infrastructure.Data;

public class WaySpotDbContext : DbContext
{
    public WaySpotDbContext(DbContextOptions<WaySpotDbContext> options) : base(options) { }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<SavedRoute> SavedRoutes => Set<SavedRoute>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(WaySpotDbContext).Assembly);

        modelBuilder.Entity<Business>(entity =>
        {
            entity.Property(e => e.Location).HasColumnType("geometry(Point, 4326)");
        });

        modelBuilder.Entity<SavedRoute>(entity =>
        {
            entity.Property(e => e.StartPoint).HasColumnType("geometry(Point, 4326)");
            entity.Property(e => e.EndPoint).HasColumnType("geometry(Point, 4326)");
        });

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Username).IsUnique();
        });
    }
}
```

**Dosya:** `backend/WaySpot.Infrastructure/Data/Configurations/BusinessConfiguration.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WaySpot.Core.Entities;

namespace WaySpot.Infrastructure.Data.Configurations;

public class BusinessConfiguration : IEntityTypeConfiguration<Business>
{
    public void Configure(EntityTypeBuilder<Business> builder)
    {
        builder.HasOne(b => b.User)
               .WithOne(u => u.Business)
               .HasForeignKey<Business>(b => b.UserId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(b => b.Location);
    }
}
```

**Dosya:** `backend/WaySpot.Infrastructure/Data/Configurations/ReviewConfiguration.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WaySpot.Core.Entities;

namespace WaySpot.Infrastructure.Data.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.Property(r => r.PhotoUrl).IsRequired();
        builder.Property(r => r.Comment).HasMaxLength(2000);

        builder.HasOne(r => r.Business)
               .WithMany(b => b.Reviews)
               .HasForeignKey(r => r.BusinessId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.User)
               .WithMany(u => u.Reviews)
               .HasForeignKey(r => r.UserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### 1.6 - appsettings.json ve Program.cs Guncellemesi

**Talimat:** Sadece bu degisiklikleri yap.

**Dosya:** `backend/WaySpot.API/appsettings.json`
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=wayspot_db;Username=wayspot_admin;Password=wayspot_secret_2024"
  },
  "Jwt": {
    "Key": "wayspot_super_secret_key_2024_must_be_at_least_32_chars!",
    "Issuer": "WaySpotAPI",
    "Audience": "WaySpotClient",
    "ExpireDays": 7
  }
}
```

**Dosya:** `backend/WaySpot.API/Program.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using WaySpot.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<WaySpotDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.UseNetTopologySuite()
    ));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### 1.7 - EF Core Migration Olusturma

**Talimat:** Asagidaki komutlari calistir. Baska komut ekleme.

```bash
cd backend/WaySpot.API
dotnet ef migrations add InitialCreate --project ../WaySpot.Infrastructure --startup-project .
dotnet ef database update --project ../WaySpot.Infrastructure --startup-project .
```

**Test Adimi:**
```bash
docker exec wayspot_postgres psql -U wayspot_admin -d wayspot_db -c "\dt"
```

**Beklenen Cikti:** `Users`, `Businesses`, `Posts`, `Reviews`, `SavedRoutes` tablolari listeleniyor.

**Kabul Kriteri:** Veritabaninda tum tablolar olusmus ve PostGIS geometry kolonlari dogru tipde.


## ASAMA 2: KIMLIK DOGRULAMA (AUTH)

### 2.0 - Kabul Kriteri (On Kosul)
- [ ] Asama 1 tamamen bitmis ve veritabani hazir.

---

### 2.1 - DTO'lar (Data Transfer Objects)

**Talimat:** Sadece bu DTO'lari olustur. Fazla alan ekleme.

**Dosya:** `backend/WaySpot.Core/DTOs/RegisterRequest.cs`
```csharp
using System.ComponentModel.DataAnnotations;
using WaySpot.Core.Enums;

namespace WaySpot.Core.DTOs;

public class RegisterRequest
{
    [Required, MinLength(3), MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }
}
```

**Dosya:** `backend/WaySpot.Core/DTOs/LoginRequest.cs`
```csharp
using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
```

**Dosya:** `backend/WaySpot.Core/DTOs/AuthResponse.cs`
```csharp
using WaySpot.Core.Enums;

namespace WaySpot.Core.DTOs;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime ExpiresAt { get; set; }
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### 2.2 - JWT Servisi

**Talimat:** Token olusturma servisini yaz. Sadece bu interface ve implementasyon.

**Dosya:** `backend/WaySpot.Core/Interfaces/IJwtService.cs`
```csharp
using WaySpot.Core.DTOs;
using WaySpot.Core.Entities;

namespace WaySpot.Core.Interfaces;

public interface IJwtService
{
    AuthResponse GenerateToken(AppUser user);
}
```

**Dosya:** `backend/WaySpot.Infrastructure/Services/JwtService.cs`
```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WaySpot.Core.DTOs;
using WaySpot.Core.Entities;
using WaySpot.Core.Interfaces;

namespace WaySpot.Infrastructure.Services;

public class JwtService : IJwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    public AuthResponse GenerateToken(AppUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
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
            Role = user.Role,
            ExpiresAt = expires
        };
    }
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### 2.3 - Password Hash Servisi (BCrypt)

**Talimat:** BCrypt.Net-Next paketini yukle ve servisi olustur.

```bash
cd backend/WaySpot.Infrastructure
dotnet add package BCrypt.Net-Next --version 4.0.3
cd ..
```

**Dosya:** `backend/WaySpot.Core/Interfaces/IPasswordService.cs`
```csharp
namespace WaySpot.Core.Interfaces;

public interface IPasswordService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}
```

**Dosya:** `backend/WaySpot.Infrastructure/Services/PasswordService.cs`
```csharp
using WaySpot.Core.Interfaces;

namespace WaySpot.Infrastructure.Services;

public class PasswordService : IPasswordService
{
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### 2.4 - AuthController (Register & Login)

**Talimat:** Controller'i olustur. Hata durumlarinda acik mesaj don.

**Dosya:** `backend/WaySpot.API/Controllers/AuthController.cs`
```csharp
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
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### 2.5 - DI Kayitlari ve JWT Authentication Middleware

**Talimat:** Program.cs'i guncelle. Sadece bu degisiklikleri yap.

**Dosya:** `backend/WaySpot.API/Program.cs` (TAMAMEN DEGISTIR)
```csharp
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WaySpot.Core.Interfaces;
using WaySpot.Infrastructure.Data;
using WaySpot.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<WaySpotDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.UseNetTopologySuite()
    ));

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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### 2.6 - Auth Testi

**Test Adimi (Register):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@wayspot.com","password":"Test123!","role":1}'
```
**Beklenen:** 200 OK, token donmeli.

**Test Adimi (Login):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@wayspot.com","password":"Test123!"}'
```
**Beklenen:** 200 OK, token donmeli.

**Test Adimi (Hatali Login):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@wayspot.com","password":"yanlis"}'
```
**Beklenen:** 401 Unauthorized.

**Kabul Kriteri:** Tum testler beklenen sonucu veriyor.

---

## ASAMA 3: ISLETME YONETIMI (Business CRUD)

### 3.0 - Kabul Kriteri (On Kosul)
- [ ] Asama 2 tamamen bitmis.
- [ ] Auth token alinabiliyor.

---

### 3.1 - Business DTO'lari

**Dosya:** `backend/WaySpot.Core/DTOs/CreateBusinessRequest.cs`
```csharp
using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class CreateBusinessRequest
{
    [Required, MinLength(2), MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public double Latitude { get; set; }

    [Required]
    public double Longitude { get; set; }
}
```

**Dosya:** `backend/WaySpot.Core/DTOs/BusinessResponse.cs`
```csharp
namespace WaySpot.Core.DTOs;

public class BusinessResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### 3.2 - BusinessController (CRUD + [Authorize])

**Talimat:** Sadece Business sahibi (Role=Business) islem yapabilmeli.

**Dosya:** `backend/WaySpot.API/Controllers/BusinessController.cs`
```csharp
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using WaySpot.Core.DTOs;
using WaySpot.Core.Entities;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BusinessController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public BusinessController(WaySpotDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    [Authorize(Roles = "Business")]
    public async Task<IActionResult> Create(CreateBusinessRequest request)
    {
        var userId = GetCurrentUserId();

        if (await _context.Businesses.AnyAsync(b => b.UserId == userId))
            return BadRequest(new { message = "Bu hesap zaten bir isletmeye sahip." });

        var business = new Business
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            Description = request.Description,
            Location = new Point(request.Longitude, request.Latitude) { SRID = 4326 }
        };

        _context.Businesses.Add(business);
        await _context.SaveChangesAsync();

        return Ok(MapToResponse(business));
    }

    [HttpGet("my")]
    [Authorize(Roles = "Business")]
    public async Task<IActionResult> GetMyBusiness()
    {
        var userId = GetCurrentUserId();
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == userId);
        if (business == null) return NotFound();
        return Ok(MapToResponse(business));
    }

    [HttpPut("my")]
    [Authorize(Roles = "Business")]
    public async Task<IActionResult> UpdateMyBusiness(CreateBusinessRequest request)
    {
        var userId = GetCurrentUserId();
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == userId);
        if (business == null) return NotFound();

        business.Name = request.Name;
        business.Description = request.Description;
        business.Location = new Point(request.Longitude, request.Latitude) { SRID = 4326 };

        await _context.SaveChangesAsync();
        return Ok(MapToResponse(business));
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var business = await _context.Businesses.FindAsync(id);
        if (business == null) return NotFound();
        return Ok(MapToResponse(business));
    }

    private static BusinessResponse MapToResponse(Business b)
    {
        return new BusinessResponse
        {
            Id = b.Id,
            Name = b.Name,
            Description = b.Description,
            Latitude = b.Location.Y,
            Longitude = b.Location.X,
            IsActive = b.IsActive,
            CreatedAt = b.CreatedAt
        };
    }
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### 3.3 - Business Testi

**Test Adimi (Business Register):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"bizowner","email":"biz@wayspot.com","password":"Biz123!","role":2}'
```

**Test Adimi (Business Create):**
```bash
curl -X POST http://localhost:5000/api/business \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Cafe","description":"En iyi kahve","latitude":39.9334,"longitude":32.8597}'
```
**Beklenen:** 200 OK, business bilgileri.

**Kabul Kriteri:** Business kaydi olusuyor ve DB'de Location kolonu PostGIS Point olarak gorunuyor.

---

## ASAMA 4: POST (KAMPANYA/DUYURU) YONETIMI

### 4.0 - Kabul Kriteri (On Kosul)
- [ ] Asama 3 tamamen bitmis.

---

### 4.1 - Post DTO'lari

**Dosya:** `backend/WaySpot.Core/DTOs/CreatePostRequest.cs`
```csharp
using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class CreatePostRequest
{
    [Required, MinLength(5), MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    [Range(1, 150)]
    public double TargetRadiusKm { get; set; } = 20.0;
}
```

**Dosya:** `backend/WaySpot.Core/DTOs/PostResponse.cs`
```csharp
namespace WaySpot.Core.DTOs;

public class PostResponse
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public double TargetRadiusKm { get; set; }
    public DateTime CreatedAt { get; set; }
    public BusinessResponse Business { get; set; } = null!;
}
```

---

### 4.2 - PostsController

**Dosya:** `backend/WaySpot.API/Controllers/PostsController.cs`
```csharp
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaySpot.Core.DTOs;
using WaySpot.Core.Entities;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostsController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public PostsController(WaySpotDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    [Authorize(Roles = "Business")]
    public async Task<IActionResult> Create(CreatePostRequest request)
    {
        var userId = GetCurrentUserId();
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == userId);
        if (business == null)
            return BadRequest(new { message = "Once isletme profili olusturmalisiniz." });

        var post = new Post
        {
            Id = Guid.NewGuid(),
            BusinessId = business.Id,
            Content = request.Content,
            ImageUrl = request.ImageUrl,
            TargetRadiusKm = request.TargetRadiusKm
        };

        _context.Posts.Add(post);
        await _context.SaveChangesAsync();

        return Ok(await MapToResponse(post));
    }

    [HttpGet("my")]
    [Authorize(Roles = "Business")]
    public async Task<IActionResult> GetMyPosts()
    {
        var userId = GetCurrentUserId();
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == userId);
        if (business == null) return NotFound();

        var posts = await _context.Posts
            .Where(p => p.BusinessId == business.Id)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(posts.Select(p => MapToResponse(p).Result));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Business")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == userId);
        if (business == null) return NotFound();

        var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == id && p.BusinessId == business.Id);
        if (post == null) return NotFound();

        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private async Task<PostResponse> MapToResponse(Post post)
    {
        var business = await _context.Businesses.FindAsync(post.BusinessId);
        return new PostResponse
        {
            Id = post.Id,
            Content = post.Content,
            ImageUrl = post.ImageUrl,
            TargetRadiusKm = post.TargetRadiusKm,
            CreatedAt = post.CreatedAt,
            Business = new BusinessResponse
            {
                Id = business!.Id,
                Name = business.Name,
                Description = business.Description,
                Latitude = business.Location.Y,
                Longitude = business.Location.X,
                IsActive = business.IsActive,
                CreatedAt = business.CreatedAt
            }
        };
    }
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.


## ASAMA 5: DINAMIK YARICAP ALGORITMASI (KESFET)

### 5.0 - Kabul Kriteri (On Kosul)
- [ ] Asama 4 tamamen bitmis.
- [ ] Veritabaninda en az 3-4 farkli lokasyonda business ve post var.

---

### 5.1 - Discover DTO'lari

**Dosya:** `backend/WaySpot.Core/DTOs/DiscoverRequest.cs`
```csharp
using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class DiscoverRequest
{
    [Required]
    [Range(-90, 90)]
    public double Latitude { get; set; }

    [Required]
    [Range(-180, 180)]
    public double Longitude { get; set; }
}
```

**Dosya:** `backend/WaySpot.Core/DTOs/DiscoverResponse.cs`
```csharp
namespace WaySpot.Core.DTOs;

public class DiscoverResponse
{
    public List<PostResponse> Posts { get; set; } = new();
    public double AppliedRadiusKm { get; set; }
    public int TotalCount { get; set; }
    public string Message { get; set; } = string.Empty;
}
```

---

### 5.2 - DiscoverController (Dinamik Yaricap)

**Talimat:** PostGIS `ST_DWithin` kullan. Kademeli genisletme: 20km -> 50km -> 100km -> 150km (max). Her adimda minimum 30 post var mi kontrol et. Yoksa bir ust kademeye gec. Sonuclari `CreatedAt` DESC sirala.

**Dosya:** `backend/WaySpot.API/Controllers/DiscoverController.cs`
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using WaySpot.Core.DTOs;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiscoverController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public DiscoverController(WaySpotDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Discover([FromQuery] DiscoverRequest request)
    {
        var userLocation = new Point(request.Longitude, request.Latitude) { SRID = 4326 };

        var radii = new[] { 20000.0, 50000.0, 100000.0, 150000.0 };
        var radiusLabels = new[] { 20.0, 50.0, 100.0, 150.0 };

        List<PostResponse> results = new();
        double appliedRadius = 0;

        for (int i = 0; i < radii.Length; i++)
        {
            var radiusMeters = radii[i];

            var posts = await _context.Posts
                .Include(p => p.Business)
                .Where(p => p.Business.IsActive &&
                    EF.Functions.IsWithinDistance(
                        p.Business.Location, 
                        userLocation, 
                        radiusMeters))
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            if (posts.Count >= 30 || i == radii.Length - 1)
            {
                results = posts.Select(p => new PostResponse
                {
                    Id = p.Id,
                    Content = p.Content,
                    ImageUrl = p.ImageUrl,
                    TargetRadiusKm = p.TargetRadiusKm,
                    CreatedAt = p.CreatedAt,
                    Business = new BusinessResponse
                    {
                        Id = p.Business.Id,
                        Name = p.Business.Name,
                        Description = p.Business.Description,
                        Latitude = p.Business.Location.Y,
                        Longitude = p.Business.Location.X,
                        IsActive = p.Business.IsActive,
                        CreatedAt = p.Business.CreatedAt
                    }
                }).ToList();

                appliedRadius = radiusLabels[i];
                break;
            }
        }

        return Ok(new DiscoverResponse
        {
            Posts = results,
            AppliedRadiusKm = appliedRadius,
            TotalCount = results.Count,
            Message = $"{appliedRadius} km yaricap icinde {results.Count} sonuc bulundu."
        });
    }
}
```

**ONEMLI NOT:** `EF.Functions.IsWithinDistance` Npgsql 8.x ile `ST_DWithin` SQL'ini uretir. Eger calismazsa, raw SQL alternatifi:
```csharp
var posts = await _context.Posts
    .FromSqlInterpolated($@"
        SELECT p.* FROM Posts p
        INNER JOIN Businesses b ON p.BusinessId = b.Id
        WHERE b.IsActive = true
        AND ST_DWithin(b.Location, {userLocation}, {radiusMeters})
        ORDER BY p.CreatedAt DESC")
    .Include(p => p.Business)
    .ToListAsync();
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### 5.3 - Discover Testi

**Test Adimi (Seed Data):**
```bash
# Postman veya pgAdmin ile farkli sehirlerde business ve post ekle.
# Ornek: Ankara (39.9334, 32.8597), Istanbul (41.0082, 28.9784), Izmir (38.4192, 27.1287)
```

**Test Adimi (API):**
```bash
curl "http://localhost:5000/api/discover?latitude=39.9334&longitude=32.8597"
```
**Beklenen:** En yakin 30 post veya kademe genisleyerek sonuc.

**Kabul Kriteri:** 20km'de 30'dan az post varsa 50km'ye genisliyor ve response'ta `appliedRadiusKm` degeri degisiyor.

---

## ASAMA 6: YORUM (REVIEW) SISTEMI

### 6.0 - Kabul Kriteri (On Kosul)
- [ ] Asama 5 tamamen bitmis.

---

### 6.1 - Review DTO'lari

**Dosya:** `backend/WaySpot.Core/DTOs/CreateReviewRequest.cs`
```csharp
using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class CreateReviewRequest
{
    [Required]
    public Guid BusinessId { get; set; }

    [Required, Range(1, 5)]
    public int Rating { get; set; }

    [Required, MinLength(10), MaxLength(2000)]
    public string Comment { get; set; } = string.Empty;

    [Required]
    public string PhotoUrl { get; set; } = string.Empty;
}
```

**Dosya:** `backend/WaySpot.Core/DTOs/ReviewResponse.cs`
```csharp
namespace WaySpot.Core.DTOs;

public class ReviewResponse
{
    public Guid Id { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string Username { get; set; } = string.Empty;
}
```

---

### 6.2 - ReviewsController

**Talimat:** `PhotoUrl` null/bos ise kesinlikle `BadRequest` don. Bu zorunlu validasyonu controller seviyesinde de kontrol et.

**Dosya:** `backend/WaySpot.API/Controllers/ReviewsController.cs`
```csharp
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaySpot.Core.DTOs;
using WaySpot.Core.Entities;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/businesses/{businessId:guid}/[controller]")]
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public ReviewsController(WaySpotDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> AddReview(Guid businessId, CreateReviewRequest request)
    {
        // ZORUNLU VALIDASYON: PhotoUrl
        if (string.IsNullOrWhiteSpace(request.PhotoUrl))
            return BadRequest(new { message = "Fotograf URL'si zorunludur. Yorum yapabilmek icin fotograf yuklemelisiniz." });

        if (request.BusinessId != businessId)
            return BadRequest(new { message = "BusinessId uyusmazligi." });

        var business = await _context.Businesses.FindAsync(businessId);
        if (business == null) return NotFound(new { message = "Isletme bulunamadi." });

        var userId = GetCurrentUserId();

        if (await _context.Reviews.AnyAsync(r => r.BusinessId == businessId && r.UserId == userId))
            return BadRequest(new { message = "Bu isletmeye zaten yorum yaptiniz." });

        var review = new Review
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            UserId = userId,
            Rating = request.Rating,
            Comment = request.Comment,
            PhotoUrl = request.PhotoUrl
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok(await MapToResponse(review));
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetReviews(Guid businessId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.BusinessId == businessId)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews.Select(r => MapToResponse(r).Result));
    }

    private async Task<ReviewResponse> MapToResponse(Review review)
    {
        var user = await _context.Users.FindAsync(review.UserId);
        return new ReviewResponse
        {
            Id = review.Id,
            Rating = review.Rating,
            Comment = review.Comment,
            PhotoUrl = review.PhotoUrl,
            CreatedAt = review.CreatedAt,
            Username = user!.Username
        };
    }
}
```

**Kabul Kriteri:** `dotnet build` hatasiz.

---

### 6.3 - Review Testi

**Test Adimi (PhotoUrl Olmadan):**
```bash
curl -X POST http://localhost:5000/api/businesses/{BUSINESS_ID}/reviews \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"businessId":"...","rating":5,"comment":"Harika!","photoUrl":""}'
```
**Beklenen:** 400 BadRequest, "Fotograf URL'si zorunludur..."

**Test Adimi (Basarili Review):**
```bash
curl -X POST http://localhost:5000/api/businesses/{BUSINESS_ID}/reviews \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"businessId":"...","rating":5,"comment":"Harika mekan!","photoUrl":"https://example.com/photo.jpg"}'
```
**Beklenen:** 200 OK.

**Kabul Kriteri:** PhotoUrl olmadan kesinlikle 400 donuyor.

---

## ASAMA 7: GLOBAL HATA YONETIMI

### 7.1 - Global Exception Handler

**Talimat:** Tum controller'lari sarmalayan, detayli log basan middleware.

**Dosya:** `backend/WaySpot.API/Middleware/GlobalExceptionHandler.cs`
```csharp
using System.Net;
using System.Text.Json;

namespace WaySpot.API.Middleware;

public class GlobalExceptionHandler
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(RequestDelegate next, ILogger<GlobalExceptionHandler> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Istek islenirken hata olustu. Path: {Path}, Method: {Method}", 
                context.Request.Path, context.Request.Method);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var response = new
        {
            StatusCode = context.Response.StatusCode,
            Message = "Bir hata olustu. Lutfen daha sonra tekrar deneyin.",
            Detail = exception.Message
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
```

**Dosya:** `backend/WaySpot.API/Program.cs` (Guncelle - app.Run() oncesine ekle)
```csharp
app.UseMiddleware<GlobalExceptionHandler>();
```

**Kabul Kriteri:** Bilinmeyen bir endpoint'e istek atildiginda 500 yerine duzgun JSON hata donuyor.

---

## ASAMA 8: GEO (GENERATIVE ENGINE OPTIMIZATION)

### 8.1 - JSON-LD Schema.org Servisi

**Talimat:** Business detay endpoint'i JSON-LD donecek. Sadece `LocalBusiness` schema.

**Dosya:** `backend/WaySpot.Core/Interfaces/IGeoJsonLdService.cs`
```csharp
using WaySpot.Core.DTOs;

namespace WaySpot.Core.Interfaces;

public interface IGeoJsonLdService
{
    string GenerateLocalBusinessJsonLd(BusinessResponse business);
}
```

**Dosya:** `backend/WaySpot.Infrastructure/Services/GeoJsonLdService.cs`
```csharp
using System.Text.Json;
using WaySpot.Core.DTOs;
using WaySpot.Core.Interfaces;

namespace WaySpot.Infrastructure.Services;

public class GeoJsonLdService : IGeoJsonLdService
{
    public string GenerateLocalBusinessJsonLd(BusinessResponse business)
    {
        var schema = new
        {
            context = "https://schema.org",
            type = "LocalBusiness",
            name = business.Name,
            description = business.Description,
            geo = new
            {
                type = "GeoCoordinates",
                latitude = business.Latitude,
                longitude = business.Longitude
            },
            url = $"https://wayspot.app/business/{business.Id}",
            id = $"https://wayspot.app/business/{business.Id}#business"
        };

        return JsonSerializer.Serialize(schema, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        });
    }
}
```

---

### 8.2 - GeoController

**Dosya:** `backend/WaySpot.API/Controllers/GeoController.cs`
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaySpot.Core.Interfaces;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GeoController : ControllerBase
{
    private readonly WaySpotDbContext _context;
    private readonly IGeoJsonLdService _geoService;

    public GeoController(WaySpotDbContext context, IGeoJsonLdService geoService)
    {
        _context = context;
        _geoService = geoService;
    }

    [HttpGet("business/{id:guid}/json-ld")]
    public async Task<IActionResult> GetBusinessJsonLd(Guid id)
    {
        var business = await _context.Businesses.FindAsync(id);
        if (business == null) return NotFound();

        var response = new
        {
            Id = business.Id,
            Name = business.Name,
            Description = business.Description,
            Latitude = business.Location.Y,
            Longitude = business.Location.X,
            JsonLd = _geoService.GenerateLocalBusinessJsonLd(new()
            {
                Id = business.Id,
                Name = business.Name,
                Description = business.Description,
                Latitude = business.Location.Y,
                Longitude = business.Location.X,
                IsActive = business.IsActive,
                CreatedAt = business.CreatedAt
            })
        };

        return Ok(response);
    }
}
```

**Program.cs Guncellemesi:**
```csharp
builder.Services.AddScoped<IGeoJsonLdService, GeoJsonLdService>();
```

**Kabul Kriteri:** `/api/geo/business/{id}/json-ld` adresine gidildiginde JSON-LD `LocalBusiness` schema donuyor.


## ASAMA 9: CLOUDFLARE WORKERS (PROXY & CACHE)

### 9.1 - Worker Script

**Talimat:** Sadece bu JavaScript dosyasini olustur. CORS headers ekle.

**Dosya:** `cloudflare/worker.js`
```javascript
// Cloudflare Worker: WaySpot API Proxy & Cache

const API_BASE = "https://api.wayspot.app";
const CACHE_TTL = 300;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    const cacheable = request.method === "GET" && 
      (url.pathname.startsWith("/api/discover") || 
       url.pathname.startsWith("/api/businesses/"));

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;

    if (cacheable) {
      const cached = await cache.match(cacheKey);
      if (cached) {
        const response = new Response(cached.body, cached);
        response.headers.set("CF-Cache-Status", "HIT");
        return response;
      }
    }

    const apiUrl = new URL(url.pathname + url.search, API_BASE);
    const modifiedRequest = new Request(apiUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    const response = await fetch(modifiedRequest);

    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        "Access-Control-Allow-Origin": "*"
      }
    });

    if (cacheable && response.status === 200) {
      ctx.waitUntil(cache.put(cacheKey, modifiedResponse.clone()));
      modifiedResponse.headers.set("CF-Cache-Status", "MISS");
    }

    return modifiedResponse;
  }
};
```

**Kabul Kriteri:** Cloudflare dashboard'dan deploy edildiginde istekleri proxy ediyor ve cache header'lari donuyor.

---

## ASAMA 10: FRONTEND (REACT + VITE + LEAFLET)

### 10.0 - Kabul Kriteri (On Kosul)
- [ ] Backend localhost:5000'de calisiyor.
- [ ] Node.js 18+ kurulu.

---

### 10.1 - Vite Projesi ve Paketler

**Talimat:** Sadece bu komutlari calistir.

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install leaflet react-leaflet axios
npm install -D @types/leaflet
```

**Kabul Kriteri:** `npm run dev` calisiyor.

---

### 10.2 - Global CSS (Leaflet icin)

**Dosya:** `frontend/src/index.css` (Uzerine ekle)
```css
@import 'leaflet/dist/leaflet.css';

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, sans-serif;
}

#root {
  width: 100vw;
  height: 100vh;
}

.leaflet-container {
  width: 100%;
  height: 100%;
}
```

---

### 10.3 - Harita Bileseni (Tam Sayfa + Konum)

**Talimat:** Kullanicinin tarayici konumunu al. Izin vermezse Ankara'yi varsayilan yap.

**Dosya:** `frontend/src/components/MapView.jsx`
```jsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 13 });

    map.on('locationfound', (e) => {
      setPosition(e.latlng);
    });

    map.on('locationerror', () => {
      setPosition({ lat: 39.9334, lng: 32.8597 });
      map.setView([39.9334, 32.8597], 13);
    });
  }, [map, setPosition]);

  return position ? (
    <Marker position={position}>
      <Popup>Konumunuz</Popup>
    </Marker>
  ) : null;
}

export default function MapView() {
  const [position, setPosition] = useState(null);

  return (
    <MapContainer
      center={[39.9334, 32.8597]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={setPosition} />
    </MapContainer>
  );
}
```

**Dosya:** `frontend/src/App.jsx` (Degistir)
```jsx
import MapView from './components/MapView';

function App() {
  return <MapView />;
}

export default App;
```

**Kabul Kriteri:** `npm run dev` sonrasi harita gorunuyor ve konum marker'i beliriyor.

---

### 10.4 - Rota Planlayici (OSRM)

**Talimat:** Kullanici baslangic ve bitis noktasi girsin. OSRM public API ile rota ciz.

**Dosya:** `frontend/src/components/RoutePlanner.jsx`
```jsx
import { useState } from 'react';
import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function RoutePlanner() {
  const [start, setStart] = useState('Ankara');
  const [end, setEnd] = useState('Antalya');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  const geocode = async (city) => {
    const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
    if (res.data.length === 0) throw new Error(`${city} bulunamadi`);
    return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
  };

  const calculateRoute = async () => {
    setLoading(true);
    try {
      const startCoords = await geocode(start);
      const endCoords = await geocode(end);

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`;
      const res = await axios.get(osrmUrl);

      if (res.data.routes && res.data.routes.length > 0) {
        const coords = res.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        setRoute({
          coords,
          start: startCoords,
          end: endCoords,
          distance: (res.data.routes[0].distance / 1000).toFixed(1)
        });
      }
    } catch (err) {
      alert('Rota hesaplanirken hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{
        position: 'absolute', top: 10, left: 50, zIndex: 1000,
        background: 'white', padding: '15px', borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)', minWidth: '250px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Rota Planlayici</h3>
        <input value={start} onChange={e => setStart(e.target.value)} placeholder="Baslangic" style={{ width: '100%', marginBottom: '8px', padding: '6px' }} />
        <input value={end} onChange={e => setEnd(e.target.value)} placeholder="Bitis" style={{ width: '100%', marginBottom: '8px', padding: '6px' }} />
        <button onClick={calculateRoute} disabled={loading} style={{ width: '100%', padding: '8px', cursor: 'pointer' }}>
          {loading ? 'Hesaplaniyor...' : 'Rotayi Goster'}
        </button>
        {route && <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>Mesafe: {route.distance} km</p>}
      </div>

      {route && (
        <>
          <Marker position={route.start} icon={startIcon}>
            <Popup>Baslangic: {start}</Popup>
          </Marker>
          <Marker position={route.end} icon={endIcon}>
            <Popup>Bitis: {end}</Popup>
          </Marker>
          <Polyline positions={route.coords} color="blue" weight={4} />
        </>
      )}
    </>
  );
}
```

**Dosya:** `frontend/src/App.jsx` (Guncelle)
```jsx
import MapView from './components/MapView';
import RoutePlanner from './components/RoutePlanner';

function App() {
  return (
    <MapView>
      <RoutePlanner />
    </MapView>
  );
}

export default App;
```

**NOT:** MapView.jsx'i de guncellemek gerekir:
```jsx
// MapView.jsx icinde children'i render et
export default function MapView({ children }) {
  const [position, setPosition] = useState(null);

  return (
    <MapContainer center={[39.9334, 32.8597]} zoom={13} scrollWheelZoom={true} style={{ height: '100vh', width: '100%' }}>
      <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker position={position} setPosition={setPosition} />
      {children}
    </MapContainer>
  );
}
```

**Kabul Kriteri:** Ankara -> Antalya rotasi ciziliyor ve mesafe gosteriliyor.

---

### 10.5 - Discover Entegrasyonu (Haritada Post'lari Goster)

**Talimat:** Backend'deki dinamik yaricap endpoint'ine istek at. Gelen Post ve Business lokasyonlarini harita uzerinde farkli ikonlara sahip marker'lar ile goster.

**Dosya:** `frontend/src/components/DiscoverMarkers.jsx`
```jsx
import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

const postIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function DiscoverMarkers({ center }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!center) return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/discover?latitude=${center.lat}&longitude=${center.lng}`);
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error('Discover hatasi:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [center]);

  return (
    <>
      {posts.map(post => (
        <Marker 
          key={post.id} 
          position={[post.business.latitude, post.business.longitude]}
          icon={postIcon}
        >
          <Popup>
            <div style={{ minWidth: '200px' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>{post.business.name}</h4>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}>{post.content}</p>
              {post.imageUrl && <img src={post.imageUrl} alt="" style={{ width: '100%', borderRadius: '4px' }} />}
              <small>Yaricap: {post.targetRadiusKm} km</small>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
```

**Dosya:** `frontend/src/App.jsx` (Final)
```jsx
import { useState } from 'react';
import MapView from './components/MapView';
import RoutePlanner from './components/RoutePlanner';
import DiscoverMarkers from './components/DiscoverMarkers';

function App() {
  const [mapCenter, setMapCenter] = useState({ lat: 39.9334, lng: 32.8597 });

  return (
    <MapView onCenterChange={setMapCenter}>
      <RoutePlanner />
      <DiscoverMarkers center={mapCenter} />
    </MapView>
  );
}

export default App;
```

**Kabul Kriteri:** Haritada post'lar marker olarak beliriyor ve popup'ta icerik + isletme adi gorunuyor.

---

## ASAMA 11: AI AJAN HAZIRLIGI (MCP)

### 11.1 - MCP Uyumlu Route Search Endpoint

**Talimat:** Dis bir LLM'in cagirabilecegi (Tool olarak kullanabilecegi) salt okunur bir endpoint tasarla. Guzergah koordinat dizisini alip, yol ustundeki tum isletmeleri JSON olarak donmeli.

**Dosya:** `backend/WaySpot.Core/DTOs/RouteSearchRequest.cs`
```csharp
using System.ComponentModel.DataAnnotations;

namespace WaySpot.Core.DTOs;

public class RouteSearchRequest
{
    [Required]
    public List<RoutePoint> Points { get; set; } = new();

    [Range(0.1, 50)]
    public double BufferKm { get; set; } = 5.0;
}

public class RoutePoint
{
    [Range(-90, 90)]
    public double Latitude { get; set; }

    [Range(-180, 180)]
    public double Longitude { get; set; }
}
```

**Dosya:** `backend/WaySpot.Core/DTOs/RouteSearchResponse.cs`
```csharp
namespace WaySpot.Core.DTOs;

public class RouteSearchResponse
{
    public List<BusinessAlongRoute> Businesses { get; set; } = new();
    public int TotalCount { get; set; }
    public double SearchBufferKm { get; set; }
}

public class BusinessAlongRoute
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double DistanceFromRouteKm { get; set; }
    public List<PostResponse> ActivePosts { get; set; } = new();
}
```

---

### 11.2 - McpController

**Dosya:** `backend/WaySpot.API/Controllers/McpController.cs`
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using WaySpot.Core.DTOs;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/mcp")]
public class McpController : ControllerBase
{
    private readonly WaySpotDbContext _context;
    private readonly GeometryFactory _geometryFactory = new(new PrecisionModel(), 4326);

    public McpController(WaySpotDbContext context)
    {
        _context = context;
    }

    [HttpPost("search-along-route")]
    public async Task<IActionResult> SearchAlongRoute(RouteSearchRequest request)
    {
        if (request.Points.Count < 2)
            return BadRequest(new { message = "En az 2 nokta gerekli." });

        // Guzergahi LineString olarak olustur
        var coordinates = request.Points
            .Select(p => new Coordinate(p.Longitude, p.Latitude))
            .ToArray();

        var routeLine = new LineString(coordinates) { SRID = 4326 };
        var bufferMeters = request.BufferKm * 1000;

        // Guzergaha yakin isletmeleri bul (ST_DWithin)
        var businesses = await _context.Businesses
            .Where(b => b.IsActive &&
                EF.Functions.IsWithinDistance(b.Location, routeLine, bufferMeters))
            .Include(b => b.Posts)
            .ToListAsync();

        var result = businesses.Select(b => new BusinessAlongRoute
        {
            Id = b.Id,
            Name = b.Name,
            Description = b.Description,
            Latitude = b.Location.Y,
            Longitude = b.Location.X,
            DistanceFromRouteKm = Math.Round(b.Location.Distance(routeLine) / 1000, 2),
            ActivePosts = b.Posts
                .Where(p => p.ExpiresAt == null || p.ExpiresAt > DateTime.UtcNow)
                .Select(p => new PostResponse
                {
                    Id = p.Id,
                    Content = p.Content,
                    ImageUrl = p.ImageUrl,
                    TargetRadiusKm = p.TargetRadiusKm,
                    CreatedAt = p.CreatedAt,
                    Business = new BusinessResponse
                    {
                        Id = b.Id,
                        Name = b.Name,
                        Description = b.Description,
                        Latitude = b.Location.Y,
                        Longitude = b.Location.X,
                        IsActive = b.IsActive,
                        CreatedAt = b.CreatedAt
                    }
                }).ToList()
        }).ToList();

        return Ok(new RouteSearchResponse
        {
            Businesses = result,
            TotalCount = result.Count,
            SearchBufferKm = request.BufferKm
        });
    }
}
```

**Kabul Kriteri:** `dotnet build` hatasiz. Postman ile test edilebilir.

---

## SONUC & KULLANIM KILAVUZU

### AI Asistanina Nasil Kullanilir?

1. **Her Asama Bagimsizdir:** Bir asamayi bitirmeden digerine gecme.
2. **Kabul Kriteri:** Her blog sonundaki "Kabul Kriteri"ni test et. Gecmeden sonraki bloga gecme.
3. **Varsayim Yok:** Bu dokumanda yazmayan hicbir seyi AI eklemesine izin verme.
4. **Hata Alirsan:** Once bir onceki blogu kontrol et. Muhtemelen bir adimi atlamissindir.

### Test Sirasi

```
1. Docker Compose calistir -> PostGIS versiyon kontrolu
2. dotnet build -> Hatasiz
3. Migration -> Tablolar DB'de mi?
4. Register/Login -> Token donuyor mu?
5. Business CRUD -> PostGIS Point kaydediliyor mu?
6. Post CRUD -> Business ile bagli mi?
7. Discover -> Dinamik yaricap calisiyor mu?
8. Review -> PhotoUrl validasyonu calisiyor mu?
9. GEO -> JSON-LD schema donuyor mu?
10. Frontend -> Harita + Rota + Discover marker'lari
11. MCP -> Route search calisiyor mu?
```

### Onemli Hatirlatmalar

- **PostGIS:** `geometry(Point, 4326)` kullan. SRID 4326 zorunlu.
- **JWT:** `UseAuthentication()` `UseAuthorization()`'dan ONCE gelmeli.
- **Review:** `PhotoUrl` bos ise 400 don. Bu zorunlu.
- **Discover:** 20km -> 50km -> 100km -> 150km kademeli. Max 150km.
- **CORS:** Cloudflare Worker CORS header'lari yonetiyor. Backend'te CORS middleware'i gerekli degil (gelistirme icin eklenebilir).

---

**Hazirlayan:** AI Asistan (Kimi)  
**Proje:** WaySpot v2.0  
**Son Guncelleme:** 2026


