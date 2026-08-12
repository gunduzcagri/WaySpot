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
