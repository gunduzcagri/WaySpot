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
