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
