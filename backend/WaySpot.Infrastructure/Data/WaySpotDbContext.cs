using Microsoft.EntityFrameworkCore;
using WaySpot.Core.Entities;

namespace WaySpot.Infrastructure.Data;

public class WaySpotDbContext : DbContext
{
    public WaySpotDbContext(DbContextOptions<WaySpotDbContext> options) : base(options) { }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<BusinessHour> BusinessHours => Set<BusinessHour>();
    public DbSet<BusinessImage> BusinessImages => Set<BusinessImage>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<SavedRoute> SavedRoutes => Set<SavedRoute>();
    public DbSet<Share> Shares => Set<Share>();
    public DbSet<SavedBusiness> SavedBusinesses => Set<SavedBusiness>();
    public DbSet<Route> Routes => Set<Route>();
    public DbSet<RouteStop> RouteStops => Set<RouteStop>();
    public DbSet<UserFollow> UserFollows => Set<UserFollow>();
    public DbSet<RouteCollaboration> RouteCollaborations => Set<RouteCollaboration>();
    public DbSet<RouteSuggestion> RouteSuggestions => Set<RouteSuggestion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.HasPostgresExtension("postgis");

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(WaySpotDbContext).Assembly);

        modelBuilder.Entity<Business>(entity =>
        {
            entity.Property(e => e.Location).HasColumnType("geometry(Point, 4326)");
            
            entity.HasIndex(e => e.UserId).IsUnique();

            entity.Property<NpgsqlTypes.NpgsqlTsVector>("SearchVector")
                .HasComputedColumnSql(
                    "setweight(to_tsvector('turkish', coalesce(\"Name\", '')), 'A') || " +
                    "setweight(to_tsvector('turkish', coalesce(\"Description\", '')), 'B') || " +
                    "setweight(to_tsvector('turkish', coalesce(\"Address\", '')), 'C')", 
                    stored: true);

            entity.HasIndex("SearchVector")
                .HasMethod("GIN");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasIndex(e => new { e.BusinessId, e.UserId }).IsUnique();
        });

        modelBuilder.Entity<SavedBusiness>(entity =>
        {
            entity.HasIndex(e => new { e.BusinessId, e.UserId }).IsUnique();
        });

        modelBuilder.Entity<Route>(entity =>
        {
            entity.Property(e => e.RouteGeometry).HasColumnType("geometry(LineString, 4326)");
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
            entity.HasIndex(e => e.GoogleId).IsUnique();
        });

        modelBuilder.Entity<BusinessHour>(entity =>
        {
            entity.HasIndex(e => new { e.BusinessId, e.DayOfWeek }).IsUnique();
        });

        modelBuilder.Entity<Share>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.ContentType, e.ContentId });
        });

        modelBuilder.Entity<UserFollow>(entity =>
        {
            entity.HasIndex(e => new { e.FollowerId, e.FollowingId }).IsUnique();
            entity.HasOne(e => e.Follower)
                  .WithMany()
                  .HasForeignKey(e => e.FollowerId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Following)
                  .WithMany()
                  .HasForeignKey(e => e.FollowingId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RouteCollaboration>(entity =>
        {
            entity.HasOne(e => e.SenderUser)
                  .WithMany()
                  .HasForeignKey(e => e.SenderUserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.RecipientUser)
                  .WithMany()
                  .HasForeignKey(e => e.RecipientUserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Route)
                  .WithMany()
                  .HasForeignKey(e => e.RouteId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RouteSuggestion>(entity =>
        {
            entity.HasOne(e => e.Collaboration)
                  .WithMany(c => c.Suggestions)
                  .HasForeignKey(e => e.CollaborationId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.SuggestedByUser)
                  .WithMany()
                  .HasForeignKey(e => e.SuggestedByUserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
